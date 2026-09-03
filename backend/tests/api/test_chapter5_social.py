"""
Chapter 5: Gamificación y Retención Interactiva - Integration Tests
===================================================================
Tests de integración para los 3 pilares estratégicos del Capítulo 5:
1. Octalysis (White/Black Hat): AthleteWallet XP, Streak Shields (compra y rescate).
2. Dopamine Domino Effect: Dopamine pulse (<1s), SMART-T 12-day Goal Fragmenter, Empty State 5-min Spanish micro-tasks.
3. Sticky Communities: 5-member limit squads, relative leaderboards, structured group challenges.
"""
import pytest
from httpx import AsyncClient, ASGITransport
import uuid
from datetime import datetime, timedelta, date
from sqlalchemy import select, delete, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.main import app
from app.db.connection import get_db
from app.db.models import (
    Client, Professional, PaymentStatus, AthleteWallet, WalletTransaction,
    Squad, SquadMember, SquadActivity, SquadNotification, MicroMilestone
)
from app.middleware.auth import get_current_user, TokenData
import pytest_asyncio

@pytest_asyncio.fixture(autouse=True)
async def dispose_engine():
    from app.db.connection import engine
    await engine.dispose()
    yield
    await engine.dispose()


@pytest.mark.asyncio
async def test_squad_lifecycle_and_five_member_limit():
    """
    PILAR 3: Sticky Communities
    - Crear un squad con un creador (líder).
    - Unirse a la comunidad relacional.
    - Validar que no se puede exceder el límite estricto de 5 miembros.
    """
    db_gen = get_db()
    db = await anext(db_gen)
    
    # IDs de prueba
    leader_client_id = uuid.uuid4()
    member_ids = [uuid.uuid4() for _ in range(6)]  # Intentaremos meter 6 miembros extra (total 7)
    squad_id = None
    
    try:
        # Get/create mock professional
        prof_res = await db.execute(select(Professional).limit(1))
        pro = prof_res.scalar_one_or_none()
        if not pro:
            pytest.skip("No professional found in DB, skipping")

        # Creador / Líder
        leader_client = Client(
            id=leader_client_id,
            tenant_id=pro.tenant_id,
            professional_id=pro.id,
            first_name="Líder",
            last_name="Squad",
            email=f"ch5leader_{uuid.uuid4().hex[:6]}@example.com",
            phone="+5491100004444",
            payment_status=PaymentStatus.ACTIVE,
            is_active=True,
            extra_data={}
        )
        db.add(leader_client)
        
        # Crear los otros clientes
        for i, mid in enumerate(member_ids):
            m_client = Client(
                id=mid,
                tenant_id=pro.tenant_id,
                professional_id=pro.id,
                first_name=f"Miembro_{i}",
                last_name="Squad",
                email=f"ch5member_{i}_{uuid.uuid4().hex[:6]}@example.com",
                phone=f"+549110000555{i}",
                payment_status=PaymentStatus.ACTIVE,
                is_active=True,
                extra_data={}
            )
            db.add(m_client)
            
        await db.commit()

        # Configurar Auth para el Líder
        async def override_get_current_user():
            return TokenData(user_id=str(leader_client_id), tenant_id=str(pro.tenant_id), role="client")
        app.dependency_overrides[get_current_user] = override_get_current_user

        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            # 1. Crear el Squad
            squad_payload = {
                "name": "Los Gladiadores de la Consistencia",
                "goal_type": "training_consistency",
                "description": "Un squad enfocado en no fallar dos veces y rescatar rachas.",
                "creator_name": "Gino Guerrero"
            }
            resp_create = await ac.post("/api/v1/squads/", json=squad_payload)
            assert resp_create.status_code == 201
            squad_data = resp_create.json()
            squad_id = uuid.UUID(squad_data["id"])
            assert squad_data["name"] == squad_payload["name"]
            assert len(squad_data["members"]) == 1
            assert squad_data["members"][0]["is_leader"] == True

            # 2. Agregar miembros hasta llenar el Squad (total 5 miembros)
            # Ya está el líder (1). Añadimos 4 más.
            for i in range(4):
                join_resp = await ac.post(f"/api/v1/squads/{squad_id}/join", json={
                    "client_id": str(member_ids[i]),
                    "client_name": f"Atleta_{i}"
                })
                assert join_resp.status_code == 200
                assert join_resp.json()["success"] == True

            # 3. Intentar agregar el 5to miembro extra (sería el 6to en total)
            # El límite es estricto de 5 miembros.
            join_resp_fail = await ac.post(f"/api/v1/squads/{squad_id}/join", json={
                "client_id": str(member_ids[4]),
                "client_name": "Atleta_Excedido"
            })
            assert join_resp_fail.status_code == 400
            assert "máx 5 miembros" in join_resp_fail.json()["detail"]

    finally:
        # Cleanup
        app.dependency_overrides.pop(get_current_user, None)
        try:
            await db.rollback()
        except Exception:
            pass
        if squad_id:
            try:
                await db.execute(delete(SquadNotification).where(SquadNotification.squad_id == squad_id))
                await db.execute(delete(SquadActivity).where(SquadActivity.squad_id == squad_id))
                await db.execute(delete(SquadMember).where(SquadMember.squad_id == squad_id))
                await db.execute(delete(Squad).where(Squad.id == squad_id))
                await db.commit()
            except Exception:
                await db.rollback()
        try:
            await db.execute(delete(AthleteWallet).where(AthleteWallet.client_id.in_([leader_client_id] + member_ids)))
            await db.execute(delete(Client).where(Client.id.in_([leader_client_id] + member_ids)))
            await db.commit()
        except Exception:
            await db.rollback()
        await db.close()


@pytest.mark.asyncio
async def test_squad_gamification_streak_rescuing():
    """
    PILAR 1: Octalysis (Aversión a la Pérdida & Streak Shields)
    PILAR 2: Dopamine Domino Effect (Rapid pulse response <1s & XP)
    - Crear squad y miembros.
    - Acumular XP y comprar un Streak Shield.
    - Simular un fallo de racha (gap de 2 días) y validar que el escudo repara la racha automáticamente.
    - Validar feed de notificaciones.
    """
    db_gen = get_db()
    db = await anext(db_gen)
    
    test_client_id = uuid.uuid4()
    squad_id = None
    
    try:
        prof_res = await db.execute(select(Professional).limit(1))
        pro = prof_res.scalar_one_or_none()
        if not pro:
            pytest.skip("No professional found in DB, skipping")

        client = Client(
            id=test_client_id,
            tenant_id=pro.tenant_id,
            professional_id=pro.id,
            first_name="Gino",
            last_name="Dopamine",
            email=f"ch5dopa_{uuid.uuid4().hex[:6]}@example.com",
            phone="+5491100006666",
            payment_status=PaymentStatus.ACTIVE,
            is_active=True,
            extra_data={}
        )
        db.add(client)
        await db.commit()

        # Auth setup
        async def override_get_current_user():
            return TokenData(user_id=str(test_client_id), tenant_id=str(pro.tenant_id), role="client")
        app.dependency_overrides[get_current_user] = override_get_current_user

        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            # 1. Crear el Squad
            resp_create = await ac.post("/api/v1/squads/", json={
                "name": "Dopamine Rush",
                "goal_type": "general_fitness",
                "creator_name": "Gino"
            })
            assert resp_create.status_code == 201
            squad_data = resp_create.json()
            squad_id = uuid.UUID(squad_data["id"])

            # 2. Registrar primera actividad (Racha = 1, gana 20 XP)
            resp_act1 = await ac.post(f"/api/v1/squads/{squad_id}/activity", json={
                "member_id": str(test_client_id),
                "activity_type": "workout_completed",
                "description": "Entrenamiento de Empuje completado con RPE 8"
            })
            assert resp_act1.status_code == 200
            data_act1 = resp_act1.json()
            assert data_act1["xp_gained"] == 20
            assert data_act1["current_streak"] == 1
            assert data_act1["dopamine_animation"] == "streak_fire"

            # 3. Intentar comprar escudo con balance insuficiente (tenemos 20 XP, cuesta 100 XP)
            resp_shield_fail = await ac.post("/api/v1/squads/streak-shield/buy")
            assert resp_shield_fail.status_code == 400
            assert "Saldo insuficiente" in resp_shield_fail.json()["detail"]

            # 4. Inyectar XP a la billetera (simulando acumulación legítima)
            wallet_res = await db.execute(select(AthleteWallet).where(AthleteWallet.client_id == test_client_id))
            wallet = wallet_res.scalars().first()
            assert wallet is not None
            wallet.balance += 200
            await db.commit()

            # 5. Comprar Streak Shield (cuesta 100 XP)
            resp_shield_buy = await ac.post("/api/v1/squads/streak-shield/buy")
            assert resp_shield_buy.status_code == 200
            data_shield = resp_shield_buy.json()
            assert data_shield["success"] == True
            assert "adquirido" in data_shield["message"]
            
            # Verificar en DB que se incrementó el escudo
            stmt_mem = select(SquadMember).where(
                and_(SquadMember.squad_id == squad_id, SquadMember.client_id == test_client_id)
            )
            res_mem = await db.execute(stmt_mem)
            member = res_mem.scalars().first()
            assert member.streak_shields == 1

            # 6. Simular un gap temporal (hace 3 días fue la última actividad)
            member.last_activity_at = datetime.utcnow() - timedelta(days=3)
            await db.commit()

            # 7. Registrar nueva actividad (El Streak Shield rescata la racha de romperse)
            resp_act2 = await ac.post(f"/api/v1/squads/{squad_id}/activity", json={
                "member_id": str(test_client_id),
                "activity_type": "workout_completed",
                "description": "Entrenamiento de Piernas luego de recuperarme"
            })
            assert resp_act2.status_code == 200
            data_act2 = resp_act2.json()
            assert data_act2["streak_saved_by_shield"] == True
            assert data_act2["current_streak"] == 2  # Incrementó en vez de resetearse a 1
            assert data_act2["dopamine_animation"] == "shield_bubble"

            # 8. Verificar que se consumió el escudo en la base de datos
            await db.refresh(member)
            assert member.streak_shields == 0

            # 9. Consultar feed de notificaciones relacionales
            resp_notif = await ac.get(f"/api/v1/squads/{squad_id}/notifications")
            assert resp_notif.status_code == 200
            notifications = resp_notif.json()
            assert len(notifications) > 0
            # Debe incluir el mensaje social de racha salvada
            saved_messages = [n for n in notifications if "salvada por Escudo" in n["message"]]
            assert len(saved_messages) > 0

    finally:
        # Cleanup
        app.dependency_overrides.pop(get_current_user, None)
        try:
            await db.rollback()
        except Exception:
            pass
        if squad_id:
            try:
                await db.execute(delete(SquadNotification).where(SquadNotification.squad_id == squad_id))
                await db.execute(delete(SquadActivity).where(SquadActivity.squad_id == squad_id))
                await db.execute(delete(SquadMember).where(SquadMember.squad_id == squad_id))
                await db.execute(delete(Squad).where(Squad.id == squad_id))
                await db.commit()
            except Exception:
                await db.rollback()
        try:
            await db.execute(delete(WalletTransaction).where(WalletTransaction.wallet_id == AthleteWallet.id))
            await db.execute(delete(AthleteWallet).where(AthleteWallet.client_id == test_client_id))
            await db.execute(delete(Client).where(Client.id == test_client_id))
            await db.commit()
        except Exception:
            await db.rollback()
        await db.close()


@pytest.mark.asyncio
async def test_goal_fragmenter_and_challenges():
    """
    PILAR 2: Dopamine Domino Effect (SMART-T Goal Fragmenter)
    PILAR 3: Sticky Communities (Group Challenges & Relative Leaderboards)
    - Fragmentar meta anual en micro-metas de 12 días con recompensa XP.
    - Activar un desafío grupal con límite de tiempo para cohesión social.
    - Consultar leaderboard del squad.
    """
    db_gen = get_db()
    db = await anext(db_gen)
    
    test_client_id = uuid.uuid4()
    squad_id = None
    
    try:
        prof_res = await db.execute(select(Professional).limit(1))
        pro = prof_res.scalar_one_or_none()
        if not pro:
            pytest.skip("No professional found in DB, skipping")

        client = Client(
            id=test_client_id,
            tenant_id=pro.tenant_id,
            professional_id=pro.id,
            first_name="Carla",
            last_name="Milestones",
            email=f"ch5mile_{uuid.uuid4().hex[:6]}@example.com",
            phone="+5491100007777",
            payment_status=PaymentStatus.ACTIVE,
            is_active=True,
            extra_data={}
        )
        db.add(client)
        await db.commit()

        # Auth setup
        async def override_get_current_user():
            return TokenData(user_id=str(test_client_id), tenant_id=str(pro.tenant_id), role="client")
        app.dependency_overrides[get_current_user] = override_get_current_user

        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            # 1. Crear el Squad
            resp_create = await ac.post("/api/v1/squads/", json={
                "name": "Community Challenges",
                "goal_type": "weight_loss",
                "creator_name": "Carla"
            })
            assert resp_create.status_code == 201
            squad_data = resp_create.json()
            squad_id = uuid.UUID(squad_data["id"])

            # 2. Fragmentar Meta de Largo Plazo en 12-day MicroMilestones
            fragment_payload = {
                "client_id": str(test_client_id),
                "goal_name": "Bajar 10kg en el Año"
            }
            resp_frag = await ac.post("/api/v1/squads/goal-fragmenter", json=fragment_payload)
            assert resp_frag.status_code == 200
            milestones = resp_frag.json()
            assert len(milestones) == 3
            assert "12 días" in milestones[0]["milestone_name"]
            assert "24 días" in milestones[1]["milestone_name"]
            assert "36 días" in milestones[2]["milestone_name"]
            assert milestones[0]["xp_reward"] == 50

            # Validar persistencia
            db_milestones = await db.execute(select(MicroMilestone).where(MicroMilestone.client_id == test_client_id))
            assert len(db_milestones.scalars().all()) == 3

            # 3. Establecer Desafío Grupal
            challenge_payload = {
                "challenge_title": "15,000 Pasos Diarios Colectivos",
                "duration_days": 7
            }
            resp_challenge = await ac.post(f"/api/v1/squads/{squad_id}/challenge", json=challenge_payload)
            assert resp_challenge.status_code == 200
            assert resp_challenge.json()["success"] == True

            # Verificar actualización en DB
            squad_res = await db.execute(select(Squad).where(Squad.id == squad_id))
            db_squad = squad_res.scalars().first()
            assert db_squad.challenge_title == challenge_payload["challenge_title"]
            assert db_squad.challenge_ends_at is not None

            # 4. Obtener Leaderboard del Squad
            resp_leader = await ac.get(f"/api/v1/squads/{squad_id}/leaderboard")
            assert resp_leader.status_code == 200
            leaderboard = resp_leader.json()
            assert len(leaderboard) == 1
            assert leaderboard[0]["member_name"] == "Carla"
            assert leaderboard[0]["rank"] == 1

    finally:
        # Cleanup
        app.dependency_overrides.pop(get_current_user, None)
        try:
            await db.rollback()
        except Exception:
            pass
        if squad_id:
            try:
                await db.execute(delete(SquadNotification).where(SquadNotification.squad_id == squad_id))
                await db.execute(delete(SquadActivity).where(SquadActivity.squad_id == squad_id))
                await db.execute(delete(SquadMember).where(SquadMember.squad_id == squad_id))
                await db.execute(delete(Squad).where(Squad.id == squad_id))
                await db.commit()
            except Exception:
                await db.rollback()
        try:
            await db.execute(delete(MicroMilestone).where(MicroMilestone.client_id == test_client_id))
            await db.execute(delete(AthleteWallet).where(AthleteWallet.client_id == test_client_id))
            await db.execute(delete(Client).where(Client.id == test_client_id))
            await db.commit()
        except Exception:
            await db.rollback()
        await db.close()


@pytest.mark.asyncio
async def test_empty_routine_micro_task_injection():
    """
    PILAR 2: Dopamine Domino Effect (Empty Routine State Intervention)
    - Consultar hoy la rutina con simulate_empty=True.
    - Validar que se intercepta el Empty State y se inyecta la micro-tarea de 5 minutos en español.
    - Validar recompensa de XP y tipo de tarea.
    """
    db_gen = get_db()
    db = await anext(db_gen)
    
    test_client_id = uuid.uuid4()
    
    try:
        prof_res = await db.execute(select(Professional).limit(1))
        pro = prof_res.scalar_one_or_none()
        if not pro:
            pytest.skip("No professional found in DB, skipping")

        client = Client(
            id=test_client_id,
            tenant_id=pro.tenant_id,
            professional_id=pro.id,
            first_name="Carlos",
            last_name="EmptyState",
            email=f"ch5empty_{uuid.uuid4().hex[:6]}@example.com",
            phone="+5491100008888",
            payment_status=PaymentStatus.ACTIVE,
            is_active=True,
            extra_data={}
        )
        db.add(client)
        await db.commit()

        # Auth setup
        async def override_get_current_user():
            return TokenData(user_id=str(test_client_id), tenant_id=str(pro.tenant_id), role="client")
        app.dependency_overrides[get_current_user] = override_get_current_user

        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            # Consultar rutina diaria con simulación de vacía
            resp = await ac.get("/api/v1/athlete/routine/today?simulate_empty=True")
            assert resp.status_code == 200
            data = resp.json()
            
            # Verificar la inyección de micro-tarea
            assert data["day_name"] == "Descanso Activo (Sin Rutina Programada)"
            assert len(data["exercises"]) == 0
            assert data["micro_task"] is not None
            
            mt = data["micro_task"]
            assert mt["title"] == "Movilidad Exprés de 5 Minutos"
            assert "cortisol" in mt["steps"][0].lower()
            assert mt["duration_minutes"] == 5
            assert mt["xp_reward"] == 15
            assert mt["type"] == "mobility"

    finally:
        # Cleanup
        app.dependency_overrides.pop(get_current_user, None)
        try:
            await db.rollback()
        except Exception:
            pass
        try:
            await db.execute(delete(Client).where(Client.id == test_client_id))
            await db.commit()
        except Exception:
            await db.rollback()
        await db.close()
