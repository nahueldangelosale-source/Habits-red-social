import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { ListToolsRequestSchema, CallToolRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { OpenPolicyAgentInterceptor } from '../../../infrastructure/security/OpenPolicyAgentInterceptor';
import type { SecurityContext } from '../../../infrastructure/security/OpenPolicyAgentInterceptor';

/**
 * BillingMCPServer (Dominio: Enterprise/Coach)
 * Interfaces MCP seguras para interactuar con Finanzas (Stripe / CMS-1500).
 */
export class BillingMCPServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      { name: "enterprise-billing", version: "1.0.0" },
      { capabilities: { tools: {} } }
    );

    this.registerTools();
  }

  private registerTools() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: "issue_stripe_refund",
          description: "Cruza la pasarela de pagos para emitir un reembolso autorizado a un cliente.",
          inputSchema: {
            type: "object",
            properties: {
              chargeId: { type: "string" },
              amount: { type: "number" },
              reason: { type: "string" }
            },
            required: ["chargeId", "amount", "reason"]
          }
        },
        {
          name: "generate_cms_1500",
          description: "Genera formato CMS-1500 (Superbill) para pacientes clínicos.",
          inputSchema: {
            type: "object",
            properties: {
              clientId: { type: "string" },
              cptCode: { type: "string" }
            },
            required: ["clientId", "cptCode"]
          }
        }
      ]
    }));

    // Interceptor OPA crítico para finanzas
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params as any;

      if (name === "issue_stripe_refund") {
        
        // El Manager Extraería este Scope del Token JWT de autenticación o Identidad SPIRE SVID.
        const authContext: SecurityContext = {
          tenantId: "TENANT_B2B_VIP",
          role: "COACH", 
          permissions: ["finance:refund"] // Permiso necesario para proceder
        };

        return await OpenPolicyAgentInterceptor.executeToolWithPolicy(
          name, 
          authContext,
          async () => {
            console.log(`[Stripe API Mock] Procesando REEMBOLSO de $${args.amount} para ${args.chargeId}`);
            return {
              content: [{
                  type: "text",
                  text: JSON.stringify({ status: "REFUNDED", trx_id: `re_123_${Date.now()}` })
              }]
            };
          }
        );
      }

      throw new Error(`[BillingMCP] Acción no implementada o prohibida: ${name}`);
    });
  }

  public getServer() {
    return this.server;
  }
}

export const billingMcp = new BillingMCPServer();
