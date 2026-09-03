import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { ListToolsRequestSchema, CallToolRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { z } from 'zod';
import { OpenPolicyAgentInterceptor } from '../../../infrastructure/security/OpenPolicyAgentInterceptor';
import type { SecurityContext } from '../../../infrastructure/security/OpenPolicyAgentInterceptor';

/**
 * 🔒 Esquemas Zero Trust para Validación de Telemetría Biometrica (Zod)
 */
const BiometricTelemetrySchema = z.object({
  athleteId: z.string().uuid(),
  provider: z.enum(['APPLE_HEALTH', 'GARMIN', 'DEXCOM']),
  metrics: z.object({
    heartRateRecovery: z.number().min(0).max(100).optional(),
    sleepScore: z.number().min(0).max(100).optional(),
    glucoseSpike: z.number().optional()
  }),
  timestamp: z.string()
});

/**
 * WearablesMCPServer (Dominio: Athlete)
 * Expone herramientas normalizadas (Garmin, Dexcom, Apple) al enjambre IA.
 */
export class WearablesMCPServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      { name: "athlete-wearables", version: "2.1.0" },
      { capabilities: { tools: {} } }
    );

    this.registerTools();
  }

  private registerTools() {
    // Definimos las capacidades que los Agentes Gen-AI pueden utilizar
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: "ingest_garmin_telemetry",
          description: "Ingesta métricas de HRV y SleepScore para la calibración del ACWR vía IA.",
          inputSchema: {
            type: "object",
            properties: {
              athleteId: { type: "string" }
            },
            required: ["athleteId"]
          }
        }
      ]
    }));

    // Orquestamos la ejecución bajo el interceptor OPA (Zero Trust)
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params as any;

      if (name === "ingest_garmin_telemetry") {
        // En un entorno de streaming SSE, el SecurityContext se extrae del header auth
        const mockContext: SecurityContext = {
          tenantId: "TENANT_1X",
          role: "SYSTEM_AGENT", // Autorizado por la arquitectura Gen-AI Automática
          permissions: ['biometrics:read']
        };

        return await OpenPolicyAgentInterceptor.executeToolWithPolicy(
          name, 
          mockContext,
          async () => {
            const rawData = {
              athleteId: args.athleteId as string,
              provider: 'GARMIN',
              metrics: { heartRateRecovery: 45, sleepScore: 82 },
              timestamp: new Date().toISOString()
            };

            // Schema Parsing Constrictivo
            const validated = BiometricTelemetrySchema.parse(rawData);
            
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify({ status: "SUCCESS", telemetry: validated })
                }
              ]
            };
          }
        );
      }

      throw new Error(`[MCP] Tool no encontrada: ${name}`);
    });
  }

  public getServer() {
    return this.server;
  }
}

export const wearablesMcp = new WearablesMCPServer();
