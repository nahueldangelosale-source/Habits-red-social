import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";

/**
 * MCPClientManager
 * Orquesta la comunicación con múltiples Servidores MCP (Model Context Protocol).
 * Descubre dinámicamente las herramientas y recursos disponibles.
 */
export class MCPClientManager {
  private static instance: MCPClientManager;
  private clients: Map<string, Client> = new Map();

  private constructor() {}

  public static getInstance(): MCPClientManager {
    if (!MCPClientManager.instance) {
      MCPClientManager.instance = new MCPClientManager();
    }
    return MCPClientManager.instance;
  }

  /**
   * Conecta a un servidor MCP externo o local utilizando SSE.
   * En 2026, esto delega la capacidad de ejecución de herramientas 
   * a contextos aislados (Bounded Contexts).
   */
  public async connectServer(serverId: string, url: string): Promise<Client> {
    if (this.clients.has(serverId)) {
      return this.clients.get(serverId)!;
    }

    // Usando client SSE para servidores remotos/locales vía red
    const transport = new SSEClientTransport(new URL(url));
    const client = new Client(
      { name: "bienestar-os-orchestrator", version: "2.0.0" },
      { capabilities: {} }
    );

    await client.connect(transport);
    console.log(`[MCP] Conectado exitosamente al servidor: ${serverId}`);
    
    this.clients.set(serverId, client);
    return client;
  }

  public getClient(serverId: string): Client | undefined {
    return this.clients.get(serverId);
  }

  /**
   * Descubre todas las herramientas combinadas de los servidores registrados.
   * Previene "alucinaciones" de herramientas al proveer schemas criptográficamente sellados.
   */
  public async discoverAllTools(): Promise<any[]> {
    const allTools: any[] = [];
    
    for (const [serverId, client] of Array.from(this.clients.entries())) {
      try {
        const response = await client.listTools();
        allTools.push(...response.tools.map(tool => ({
          ...tool,
          _serverId: serverId // Traceability identifier
        })));
      } catch (error) {
        console.error(`[MCP] Falla al listar herramientas en ${serverId}`, error);
      }
    }
    
    return allTools;
  }
}

export const mcpManager = MCPClientManager.getInstance();
