-- =====================================================================
-- RED TEAMING: VAULT CRYPTO AUDIT LOGS
-- Ejecutar estas pruebas en Staging para validar el despliegue de Alembic
-- =====================================================================

-- PRE-REQUISITO: Conectarse como el usuario de la aplicación
-- \c staging_db app_runtime_user

-- ---------------------------------------------------------------------
-- TEST 1: EVASIÓN DE ROL (INSERT ONLY)
-- ---------------------------------------------------------------------
-- Resultado Esperado: EL INSERT debe funcionar. El UPDATE y DELETE deben
-- fallar inmediatamente con "permission denied".
SET LOCAL app.current_tenant_id = '550e8400-e29b-41d4-a716-446655440000';

INSERT INTO audit_logs (tenant_id, professional_id, patient_id, ai_recommendation, professional_decision)
VALUES (
    '550e8400-e29b-41d4-a716-446655440000',
    gen_random_uuid(),
    gen_random_uuid(),
    '{"calories": 2500}',
    'APPROVED'
) RETURNING id;

-- Tomar el ID devuelto e intentar modificarlo (ESTO DEBE FALLAR)
-- UPDATE audit_logs SET professional_decision = 'REJECTED' WHERE id = '<insert_id>';
-- DELETE FROM audit_logs WHERE id = '<insert_id>';


-- ---------------------------------------------------------------------
-- TEST 2: INYECCIÓN DE HASH
-- ---------------------------------------------------------------------
-- Resultado Esperado: Aunque intentemos forzar un 'HACKED_HASH', el
-- trigger pgcrypto DEBE sobreescribirlo con el hash SHA-256 matemático real.
INSERT INTO audit_logs (tenant_id, professional_id, patient_id, ai_recommendation, professional_decision, computed_hash)
VALUES (
    '550e8400-e29b-41d4-a716-446655440000',
    gen_random_uuid(),
    gen_random_uuid(),
    '{"calories": 2500}',
    'APPROVED',
    'HACKED_HASH_12345'
) RETURNING computed_hash;
-- Validar que el valor retornado sea un hash de 64 caracteres (sha256 en hex), no 'HACKED_HASH_12345'.


-- ---------------------------------------------------------------------
-- TEST 3: FUGA RLS (ROW LEVEL SECURITY)
-- ---------------------------------------------------------------------
-- Resultado Esperado: Al quitar la variable de sesión, un SELECT debe devolver
-- 0 rows, demostrando que un error en el código de Python (olvidar el Tenant)
-- no expone los datos clínicos de otros hospitales.

-- Borrar el contexto
RESET app.current_tenant_id;

-- Intentar leer datos
SELECT count(*) FROM audit_logs;
-- El resultado DEBE SER 0.
