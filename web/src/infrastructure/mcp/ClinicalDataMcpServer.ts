import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { SpireClient } from '../security/identity/SpireClient';

// GraphRAG Entity Typings
export type NodeType = 'Pathology' | 'MuscleGroup' | 'ExerciseMechanic';
export interface GraphNode {
    id: string;
    type: NodeType;
    name: string;
}

export type EdgeType = 'CONTRAINDICATES' | 'CAUTIONS' | 'AFFECTS';
export interface GraphEdge {
    source: string;
    target: string;
    type: EdgeType;
}

/**
 * ClinicalDataMcpServer
 * Enterprise 2026 MCP Server for securely exposing biomechanical constraints to A2UI agents.
 * Strict Zero Trust isolation: only exposes tools, never raw db queries.
 */
export class ClinicalDataMcpServer {
    private server: Server;
    
    // In-Memory Graph Simulator
    private nodes: GraphNode[] = [
        { id: 'path_1', type: 'Pathology', name: 'Hernia discal L5-S1' },
        { id: 'path_2', type: 'Pathology', name: 'Tendinopatía manguito rotador derecho' },
        { id: 'path_3', type: 'Pathology', name: 'Condromalacia rotuliana' },
        { id: 'mech_1', type: 'ExerciseMechanic', name: 'Carga Axial de Columna' },
        { id: 'mech_2', type: 'ExerciseMechanic', name: 'Flexión Profunda de Rodilla' },
        { id: 'mech_3', type: 'ExerciseMechanic', name: 'Press por encima de la cabeza' },
        { id: 'musc_1', type: 'MuscleGroup', name: 'Erectores Espinales' },
        { id: 'musc_2', type: 'MuscleGroup', name: 'Cuádriceps' },
    ];

    private edges: GraphEdge[] = [
        { source: 'path_1', target: 'mech_1', type: 'CONTRAINDICATES' },
        { source: 'path_3', target: 'mech_2', type: 'CONTRAINDICATES' },
        { source: 'path_2', target: 'mech_3', type: 'CAUTIONS' },
        { source: 'mech_1', target: 'musc_1', type: 'AFFECTS' },
        { source: 'mech_2', target: 'musc_2', type: 'AFFECTS' },
    ];

    constructor() {
        this.server = new Server(
            {
                name: 'bienestar-clinical-mcp',
                version: '1.0.0',
            },
            {
                capabilities: {
                    tools: {},
                },
            }
        );

        this.setupToolHandlers();
        
        // Error handling
        this.server.onerror = (error) => console.error('[MCP Error]', error);
    }

    private setupToolHandlers() {
        this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
            tools: [
                {
                    name: 'get_biomechanical_constraints',
                    description: 'Get biomechanical and pathological constraints for a specific user to ensure safe exercise adaptation.',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            userId: { type: 'string', description: 'The unique identifier of the user/patient.' },
                            svidToken: { type: 'string', description: 'The injected Spire SVID token.' }
                        },
                        required: ['userId', 'svidToken'],
                    },
                },
                {
                    name: 'query_biomechanical_graph',
                    description: 'GraphRAG Tool: Query the multi-hop clinical graph to extract deterministic relationships (CONTRAINDICATES, CAUTIONS, AFFECTS) for a given connected patient.',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            userId: { type: 'string', description: 'The unique identifier of the user/patient.' },
                            svidToken: { type: 'string', description: 'The injected Spire SVID token.' }
                        },
                        required: ['userId', 'svidToken'],
                    }
                }
            ],
        }));

        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const spireClient = new SpireClient();
            
            if (request.params.name === 'query_biomechanical_graph') {
                const userId = String(request.params.arguments?.userId);
                const svidToken = String(request.params.arguments?.svidToken || '');
                
                // Zero Trust Auth Check
                const isAuthorized = await spireClient.validateSvid(svidToken);
                if (!isAuthorized) {
                    throw new Error("Zero Trust Violation: Invalid or expired SVID token provided to MCP Server.");
                }
                
                // MOCK User Node Mapping
                const userPathologies = userId === 'usr_123' ? ['path_1', 'path_2'] : userId === 'usr_456' ? ['path_3'] : [];
                
                if (userPathologies.length === 0) {
                    return { content: [{ type: 'text', text: 'GRAPH TRAVERSAL RESULT: User has no known pathological nodes.' }] };
                }

                // Execute Multi-Hop Traversal (Pathology -> Mechanic -> MuscleGroup)
                const traversals = userPathologies.map(pathId => {
                    const pathNode = this.nodes.find(n => n.id === pathId);
                    const edgesFromPathology = this.edges.filter(e => e.source === pathId);
                    
                    const relations = edgesFromPathology.map(edge => {
                        const targetNode = this.nodes.find(n => n.id === edge.target);
                        if (!targetNode) return '';
                        
                        // 2nd Hop
                        const secondHopEdges = this.edges.filter(e2 => e2.source === targetNode.id);
                        const multiHopStr = secondHopEdges.map(e2 => {
                            const farTarget = this.nodes.find(n => n.id === e2.target);
                            return farTarget ? ` -> [${e2.type}] -> ${farTarget.type}(${farTarget.name})` : '';
                        }).join('');

                        return `[${edge.type}] -> ${targetNode.type}(${targetNode.name})${multiHopStr}`;
                    }).join(', and ');

                    return `(NODE: ${pathNode?.type}(${pathNode?.name})) ${relations}`;
                });

                return {
                    content: [
                        { type: 'text', text: `MULTI-HOP GRAPH RESULT:\n${traversals.join('\n')}` }
                    ]
                };
            }

            if (request.params.name === 'get_biomechanical_constraints') {
                const userId = String(request.params.arguments?.userId);
                const svidToken = String(request.params.arguments?.svidToken || '');
                
                // Zero Trust Auth Check
                const isAuthorized = await spireClient.validateSvid(svidToken);
                if (!isAuthorized) {
                    throw new Error("Zero Trust Violation: Invalid or expired SVID token provided to MCP flat Server.");
                }
                
                // MOCK DATABASE ACCESS
                // In production, this would securely query the WatermelonDB / Backend
                const mockConstraints: Record<string, string[]> = {
                    'usr_123': ['Hernia discal L5-S1 (Avoid heavy spinal loading)', 'Tendinopatía manguito rotador derecho (Limit overhead pressing)'],
                    'usr_456': ['Condromalacia rotuliana (Limit deep knee flexion load)'],
                };

                const constraints = mockConstraints[userId] || ['No known biomechanical constraints.'];

                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(constraints),
                        },
                    ],
                };
            }

            throw new Error(`Tool not found: ${request.params.name}`);
        });
    }

    // Usually, MCP servers connect via Stdio or SSE.
    // For this local architecture injection inside GraphReasoner, we will 
    // export the server instance so the client can connect via a direct local transport if needed,
    // or we can simulate the interaction for the sake of the client using a direct call if we are 
    // within the same process to avoid complex IPC in the browser/node environment.
    public getServer() {
        return this.server;
    }
}
