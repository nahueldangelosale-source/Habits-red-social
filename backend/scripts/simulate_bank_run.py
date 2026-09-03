import random

# ==============================================================================
# 🏦 SIMULADOR DE MONTE CARLO: AUREA TOKENOMICS "BANK RUN"
# ==============================================================================
# Este script modela 90 días de interacción económica de 500 usuarios.
# Compara el Modelo Base (Sin Protección) vs el Modelo Antigravity 2.0
# (Tiers Dinámicos y Time-Gating Cooldowns).
# ==============================================================================

NUM_USERS = 500
DAYS = 90

# Perfiles de Usuario
# 70% Atletas Físicos (Gym): Minan ~10 ET/día por volumen (1000kg)
# 30% Pacientes Nutricionales Remotos: Minan ~4 ET/día por compliance
PROPORTION_PHYSICAL = 0.7

# Parámetros del Bien Físico (El premio que genera pérdida al gym)
# Ej: Batido de Proteína. Costo real para el gym: $2.00 USD.
PHYSICAL_REWARD_BASE_PRICE_ET = 100
PHYSICAL_REWARD_COGS_USD = 2.00

# Parámetros del Gimnasio (Presupuesto de Liquidez Diaria)
DAILY_PHYSICAL_CAP = 50 # El dueño del gym solo quiere regalar máx 50 batidos al día (=$100/día máx)

class User:
    def __init__(self, id, is_physical):
        self.id = id
        self.is_physical = is_physical
        self.et_balance = 0
        self.cooldown_until = 0  # Día en el que termina el cooldown de 72h

    def simulate_daily_mining(self):
        # Aleatoriedad en minado (Proof of Effort)
        if self.is_physical:
            # Minan entre 0 y 15 ET
            self.et_balance += random.randint(0, 15)
        else:
            # Minan entre 0 y 6 ET
            self.et_balance += random.randint(0, 6)

def get_tier_price(redemptions_today, max_cap):
    """
    Tier 1: 0-60% -> Base Price (100)
    Tier 2: 61-90% -> +50% (150)
    Tier 3: 91-100% -> +100% (200)
    """
    utilization = redemptions_today / max_cap
    if utilization <= 0.60:
        return PHYSICAL_REWARD_BASE_PRICE_ET
    elif utilization <= 0.90:
        return int(PHYSICAL_REWARD_BASE_PRICE_ET * 1.5)
    else:
        return PHYSICAL_REWARD_BASE_PRICE_ET * 2

def run_simulation(is_protected=False):
    users = [User(i, random.random() < PROPORTION_PHYSICAL) for i in range(NUM_USERS)]
    
    total_gym_cost_usd = 0
    total_redemptions = 0
    bank_run_days_hit = 0 # Días donde se sobrepasó la liquidez

    for day in range(1, DAYS + 1):
        # 1. Minado de Tokens (Proof of Effort)
        for u in users:
            u.simulate_daily_mining()

        # 2. Intento de Gastar Tokens (Bank Run en Viernes)
        # Asumimos que los viernes (day % 7 == 5), la gente quiere gastar.
        # En días normales, solo un 5% de la gente intenta gastar.
        # Los viernes, un 80% intenta gastar.
        is_friday = (day % 7 == 5)
        spend_probability = 0.80 if is_friday else 0.05
        
        redemptions_today = 0

        # Para simular orden aleatorio de llegada al bar del gym
        random.shuffle(users)

        for u in users:
            if random.random() < spend_probability:
                # El usuario quiere un batido
                if is_protected:
                    # Regla 1: Cooldown (Time-Gating)
                    if day < u.cooldown_until:
                        continue # Bloqueado por cooldown
                    
                    # Regla 2: Topes Diarios (Hard Cap)
                    if redemptions_today >= DAILY_PHYSICAL_CAP:
                        bank_run_days_hit += 1
                        continue # Sold Out

                    # Regla 3: Tiers (Escasez Dinámica)
                    current_price = get_tier_price(redemptions_today, DAILY_PHYSICAL_CAP)
                    
                    if u.et_balance >= current_price:
                        u.et_balance -= current_price
                        redemptions_today += 1
                        u.cooldown_until = day + 3 # Cooldown de 72 horas
                        total_gym_cost_usd += PHYSICAL_REWARD_COGS_USD
                        total_redemptions += 1
                else:
                    # MODELO DESPROTEGIDO (Como está el código actualmente)
                    if u.et_balance >= PHYSICAL_REWARD_BASE_PRICE_ET:
                        u.et_balance -= PHYSICAL_REWARD_BASE_PRICE_ET
                        redemptions_today += 1
                        total_gym_cost_usd += PHYSICAL_REWARD_COGS_USD
                        total_redemptions += 1

    return {
        "total_redemptions": total_redemptions,
        "total_gym_cost_usd": total_gym_cost_usd,
        "bank_run_days_hit": bank_run_days_hit if is_protected else "Infinito (Sin Límites)"
    }

if __name__ == "__main__":
    print(f"Iniciando Simulación Monte Carlo: 90 Días | 500 Usuarios...")
    print("-" * 60)
    
    # 1. Simular Modelo Desprotegido
    res_unprotected = run_simulation(is_protected=False)
    print("[!] MODELO BASE (DESPROTEGIDO - CODIGO ACTUAL)")
    print(f"Batidos Canjeados:   {res_unprotected['total_redemptions']}")
    print(f"Costo Físico (COGS): ${res_unprotected['total_gym_cost_usd']:,.2f} USD")
    print(f"Días de Quiebre:     {res_unprotected['bank_run_days_hit']}")
    print("-" * 60)
    
    # 2. Simular Modelo Protegido (Antigravity 2.0)
    res_protected = run_simulation(is_protected=True)
    print("[OK] MODELO ANTIGRAVITY 2.0 (TIERS + COOLDOWNS + CAPS)")
    print(f"Batidos Canjeados:   {res_protected['total_redemptions']}")
    print(f"Costo Físico (COGS): ${res_protected['total_gym_cost_usd']:,.2f} USD")
    print(f"Días 'Sold Out':     {res_protected['bank_run_days_hit']}")
    
    print("-" * 60)
    savings = res_unprotected['total_gym_cost_usd'] - res_protected['total_gym_cost_usd']
    print(f"[!] AHORRO DE FLUJO DE CAJA PARA EL GIMNASIO: ${savings:,.2f} USD")
    print("CONCLUSIÓN: El modelo de Tiers + Cooldown detiene la corrida bancaria algorítmicamente.")
