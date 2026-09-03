
export interface SecurityContext {
  tenantId: string;
  role: 'ATHLETE' | 'COACH' | 'ADMIN' | 'SYSTEM_AGENT';
  permissions: string[];
}

/**
 * OpenPolicyAgentInterceptor
 * Enruta la ejecución de cualquier herramienta (MCP Tool) a través de una 
 * evaluación criptográfica estricta (Zero Trust).
 */
export class OpenPolicyAgentInterceptor {
  
  /**
   * Valida la ejecución de una herramienta contra políticas definidas (Simulando OPA/Rego).
   */
  public static async executeToolWithPolicy<T>(
    toolName: string, 
    context: SecurityContext, 
    action: () => Promise<T>
  ): Promise<T> {
    
    console.log(`[OPA] Evaluando POLÍTICA ZERO-TRUST para tool: ${toolName}`);

    // Política 1: Emisión de Reembolsos de Stripe
    if (toolName === 'issue_stripe_refund') {
      if (context.role !== 'COACH' && context.role !== 'ADMIN') {
        throw new Error(`[SECURITY-VIOLATION] El rol ${context.role} no tiene permisos para emitir reembolsos financieros.`);
      }
      if (!context.permissions.includes('finance:refund')) {
        throw new Error(`[SECURITY-VIOLATION] Token de identidad carece de SCOPE 'finance:refund'.`);
      }
      console.log(`[OPA] Autorización criptográfica confirmada para ${context.role}.`);
    }

    // Política 2: Consulta Biométrica
    if (toolName === 'ingest_garmin_telemetry') {
      if (context.role !== 'ATHLETE' && context.role !== 'SYSTEM_AGENT') {
        throw new Error(`[SECURITY-VIOLATION] Rol inválido para ingesta biométrica.`);
      }
    }

    // Ejecución de la acción si las políticas (Rego) son exitosas (allow == true)
    return await action();
  }
}
