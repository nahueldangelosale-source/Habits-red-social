import { v4 as uuidv4 } from 'uuid';

// ============================================================================
// 🏦 AUREA TOKENOMICS ENGINE (MULTI-CURRENCY SYSTEM)
// ============================================================================
// Motor de reglas conductuales y matemáticas para la prevención de hiperinflación
// y la monetización estructurada en un entorno B2B2C.
// ============================================================================

export type CurrencyType = 'ET' | 'CG' | 'CC';

export interface ITransaction {
    id: string;
    userId: string;
    currency: CurrencyType;
    amount: number;
    type: 'MINT' | 'BURN';
    concept: string;
    timestamp: Date;
    metadata?: Record<string, any>;
}

export interface IWallet {
    userId: string;
    role: 'ATHLETE' | 'COACH' | 'GYM_OWNER';
    balances: {
        ET: number; // Effort Tokens (Metaverse/Digital Sinks)
        CG: number; // Consistency Gems (Physical/Gym Rewards - High Value)
        CC: number; // Coach Credits (B2B Commission Reduction)
    };
    transactions: ITransaction[];
    lastPhysicalRedemption?: Date; // NEW: Cooldown tracking (Time-Gating)
}

// NEW: Global Liquidity State for B2B Gym
export interface ILiquidityPool {
    dailyCap: number; // Topes diarios asignados por el Gym
    redeemedToday: number;
    lastReset: number;
}

export class TokenomicsEngine {
    private static instance: TokenomicsEngine;
    private wallets: Map<string, IWallet> = new Map();
    
    // NEW: Liquidity Pool
    private liquidityPool: ILiquidityPool = {
        dailyCap: 50, // Default 50 physical items
        redeemedToday: 0,
        lastReset: new Date().setHours(0,0,0,0)
    };

    private constructor() {}

    public static getInstance(): TokenomicsEngine {
        if (!TokenomicsEngine.instance) {
            TokenomicsEngine.instance = new TokenomicsEngine();
        }
        return TokenomicsEngine.instance;
    }

    // ------------------------------------------------------------------------
    // LIQUIDITY CONTROL B2B (Antigravity 2.0)
    // ------------------------------------------------------------------------

    private _checkDailyReset() {
        const today = new Date().setHours(0,0,0,0);
        if (this.liquidityPool.lastReset !== today) {
            this.liquidityPool.redeemedToday = 0;
            this.liquidityPool.lastReset = today;
        }
    }

    public setDailyPhysicalCap(cap: number) {
        this.liquidityPool.dailyCap = cap;
    }

    public getLiquidityStatus() {
        this._checkDailyReset();
        const utilization = this.liquidityPool.redeemedToday / this.liquidityPool.dailyCap;
        let currentTier = 1;
        if (utilization > 0.90) currentTier = 3;
        else if (utilization > 0.60) currentTier = 2;

        return {
            cap: this.liquidityPool.dailyCap,
            redeemed: this.liquidityPool.redeemedToday,
            remaining: this.liquidityPool.dailyCap - this.liquidityPool.redeemedToday,
            utilizationPercent: utilization * 100,
            currentTier
        };
    }

    // ------------------------------------------------------------------------
    // MINTING (Acuñación Cripto-Conductual)
    // ------------------------------------------------------------------------

    /**
     * Acuña Effort Tokens (ET) basado en Telemetría Física Verificada (Proof of Effort).
     * Regla matemática: 1000 kg de volumen de entrenamiento = 10 ET.
     */
    public mintEffortTokens(userId: string, volumeKg: number): ITransaction {
        const amount = Math.floor((volumeKg / 1000) * 10);
        
        if (amount <= 0) throw new Error("Volumen insuficiente para minar ET.");

        return this.processTransaction({
            id: uuidv4(),
            userId,
            currency: 'ET',
            amount,
            type: 'MINT',
            concept: `Proof of Effort: ${volumeKg}kg levantados`,
            timestamp: new Date()
        });
    }

    /**
     * Acuña Effort Tokens (ET) basado en Puntaje de Cumplimiento (Proof of Compliance).
     * Especialmente diseñado para el Arquetipo Nutricional Remoto.
     * @param complianceScore Porcentaje de 0 a 100 (ej. Adherencia calórica y de hábitos diarios)
     */
    public mintEffortTokensFromCompliance(userId: string, complianceScore: number): ITransaction {
        if (complianceScore < 50) throw new Error("Cumplimiento insuficiente para minar ET.");
        
        // Matematica: Cada 10% por encima de 50 otorga 2 ET (Max 10 ET diarios)
        const amount = Math.floor((complianceScore - 50) / 10) * 2;

        return this.processTransaction({
            id: uuidv4(),
            userId,
            currency: 'ET',
            amount,
            type: 'MINT',
            concept: `Proof of Compliance: ${complianceScore}% adherencia nutricional`,
            timestamp: new Date()
        });
    }

    /**
     * Acuña Consistency Gems (CG) al cerrar rachas de adherencia pura.
     * Esto protege contra el abandono temprano (Leaky Bucket Syndrome).
     */
    public mintConsistencyGems(userId: string, streakDays: number): ITransaction {
        if (streakDays % 7 !== 0) {
            throw new Error("Las CG solo se emiten en hitos de 7 días continuos.");
        }
        
        // Multiplicador compuesto: Mientras más larga la racha, más CG se otorgan (hasta un límite).
        const amount = Math.min(Math.floor(streakDays / 7) * 5, 20);

        return this.processTransaction({
            id: uuidv4(),
            userId,
            currency: 'CG',
            amount,
            type: 'MINT',
            concept: `Hito de Resiliencia: ${streakDays} días de racha`,
            timestamp: new Date()
        });
    }

    /**
     * B2B: Acuña Coach Credits (CC) basado en métricas de retención clínicas.
     * Premia al Coach por mantener un NPS y una adherencia > 90% en su cohorte.
     */
    public mintCoachCredits(coachId: string, cohortRetentionRate: number): ITransaction {
        if (cohortRetentionRate < 0.90) {
            throw new Error("El Cohorte debe tener >90% de retención para minar CC.");
        }

        const amount = 50; // Flat reward for high retention

        return this.processTransaction({
            id: uuidv4(),
            coachId, // alias for clarity
            userId: coachId,
            currency: 'CC',
            amount,
            type: 'MINT',
            concept: `B2B Reward: Retención de Cohorte al ${(cohortRetentionRate * 100).toFixed(1)}%`,
            timestamp: new Date()
        });
    }

    // ------------------------------------------------------------------------
    // BURNING (Destrucción y Sumideros de Liquidez)
    // ------------------------------------------------------------------------

    /**
     * Quema ET en "Metaverse Sinks" (Cosméticos, personalización de UI, oráculos IA).
     * Esto evita desangrar al dueño del gimnasio físico.
     */
    public burnForDigitalAsset(userId: string, costET: number, assetName: string): ITransaction {
        return this.processTransaction({
            id: uuidv4(),
            userId,
            currency: 'ET',
            amount: costET,
            type: 'BURN',
            concept: `Adquisición Digital: ${assetName}`,
            timestamp: new Date()
        });
    }

    /**
     * ANTIGRAVITY 2.0: Quema ET en un "Zero-Cost Sink" B2B (Ej: Pase de Invitado).
     * Recompensa de alto estatus, pero con Costo Marginal Cero para el gimnasio.
     */
    public burnForZeroCostSink(userId: string, costET: number, sinkType: 'GUEST_PASS' | 'VIP_LOCKER' | 'STATUS_FLEX'): ITransaction {
        return this.processTransaction({
            id: uuidv4(),
            userId,
            currency: 'ET',
            amount: costET,
            type: 'BURN',
            concept: `Zero-Cost B2B Sink: ${sinkType}`,
            timestamp: new Date()
        });
    }

    /**
     * ANTIGRAVITY 2.0: Quema CG en el mundo físico. Protegido por Tiers y Cooldowns.
     */
    public burnForPhysicalReward(userId: string, baseCostCG: number, rewardName: string): ITransaction {
        this._checkDailyReset();
        
        let wallet = this.wallets.get(userId);
        if (!wallet) throw new Error("Wallet not found. Mintea tokens primero.");

        // 1. Time-Gating (Cooldown 72h)
        if (wallet.lastPhysicalRedemption) {
            const hoursSinceLast = (new Date().getTime() - wallet.lastPhysicalRedemption.getTime()) / (1000 * 60 * 60);
            if (hoursSinceLast < 72) {
                throw new Error(`Cooldown activo. Faltan ${Math.ceil(72 - hoursSinceLast)} horas para tu próximo canje físico.`);
            }
        }

        // 2. Liquidity Check (Hard Cap)
        if (this.liquidityPool.redeemedToday >= this.liquidityPool.dailyCap) {
            throw new Error("Sold Out: Se alcanzó el límite de liquidez física del gimnasio por hoy.");
        }

        // 3. Dynamic Tier Pricing (Automated Market Maker B2B)
        const utilization = this.liquidityPool.redeemedToday / this.liquidityPool.dailyCap;
        let finalCost = baseCostCG;
        let tierConcept = "Tier 1 (Precio Base)";
        
        if (utilization > 0.90) {
            finalCost = baseCostCG * 2; // Tier 3
            tierConcept = "Tier 3 (Escasez Crítica)";
        } else if (utilization > 0.60) {
            finalCost = Math.floor(baseCostCG * 1.5); // Tier 2
            tierConcept = "Tier 2 (Alta Demanda)";
        }

        const tx = this.processTransaction({
            id: uuidv4(),
            userId,
            currency: 'CG',
            amount: finalCost,
            type: 'BURN',
            concept: `Redención Física: ${rewardName} - ${tierConcept}`,
            timestamp: new Date()
        });

        // Actualizar liquidez y cooldown
        wallet.lastPhysicalRedemption = new Date();
        this.liquidityPool.redeemedToday += 1;

        return tx;
    }

    // ------------------------------------------------------------------------
    // CORE LEDGER ENGINE
    // ------------------------------------------------------------------------

    private processTransaction(tx: ITransaction): ITransaction {
        let wallet = this.wallets.get(tx.userId);
        
        if (!wallet) {
            wallet = {
                userId: tx.userId,
                role: 'ATHLETE', // Default
                balances: { ET: 0, CG: 0, CC: 0 },
                transactions: []
            };
            this.wallets.set(tx.userId, wallet);
        }

        if (tx.type === 'BURN') {
            if (wallet.balances[tx.currency] < tx.amount) {
                throw new Error(`Saldo insuficiente de ${tx.currency}. Fondos: ${wallet.balances[tx.currency]}, Requerido: ${tx.amount}`);
            }
            wallet.balances[tx.currency] -= tx.amount;
        } else if (tx.type === 'MINT') {
            wallet.balances[tx.currency] += tx.amount;
        }

        wallet.transactions.push(tx);
        return tx;
    }

    public getWallet(userId: string): IWallet | undefined {
        return this.wallets.get(userId);
    }
}

export const tokenomics = TokenomicsEngine.getInstance();
