import { ClinicalDataMcpServer } from '../../infrastructure/mcp/ClinicalDataMcpServer';
import { logger } from '../../shared/lib/telemetry';

export interface AthletePsyche {
  userId: string;
  motivationLevel: string; // e.g. "high", "low"
  communicationStyle: string; // e.g. "drill_sergeant", "empathetic"
}

export interface CoachOffer {
  coachId: string;
  tags: string[]; // e.g. ["rehabilitation", "empathetic_approach", "hypertrophy_specialist"]
}

export class MatchmakerAgent {
  /**
   * Utilizes the GraphRAG System to find intersecting intersections between
   * Athlete psychological constraints/pathologies and Coach capabilities.
   */
  public async findBestMatch(athlete: AthletePsyche, availableCoaches: CoachOffer[]): Promise<string | null> {
    try {
      const graphMcpServer = new ClinicalDataMcpServer();
      
      // 1. Fetch Structural Pathologies from GraphRAG
      const getBiomechanicalMcpReq = {
        params: { name: 'query_biomechanical_graph', arguments: { userId: athlete.userId, svidToken: "system_internal_auth" } }
      };

      // @ts-ignore
      const handler = graphMcpServer.getServer()._requestHandlers['tools/call'];
      let graphContext = "Unknown structural context";
      try {
          const res: any = await handler(getBiomechanicalMcpReq, {});
          graphContext = res.content[0].text;
      } catch (e: any) {
          // Fallback handled silently to avoid interrupting match
          logger.log('warn', `[Matchmaker] GraphRAG unavailable for user ${athlete.userId}`);
      }

      // 2. Inference Matchmaking Logic (Agentic Resolution)
      // Simulating LLM deterministic intersecting
      logger.genAiEvent({
          system: 'matchmaker-agent',
          action: 'evaluate_match',
          status: 'started',
          metadata: { athletePsyche: athlete.communicationStyle, available: availableCoaches.length }
      });

      // Semantic pseudo-match: We intersect the required styles & pathologies with coach tags
      const needsRehab = graphContext.includes("CONTRAINDICATES");
      const requiresToughLove = athlete.communicationStyle === "drill_sergeant";

      let bestCoachId = null;
      let highestScore = -1;

      for (const coach of availableCoaches) {
        let score = 0;
        if (needsRehab && coach.tags.includes("rehabilitation")) score += 5;
        if (requiresToughLove && coach.tags.includes("drill_sergeant")) score += 3;
        if (!requiresToughLove && coach.tags.includes("empathetic_approach")) score += 3;

        if (score > highestScore) {
          highestScore = score;
          bestCoachId = coach.coachId;
        }
      }

      logger.genAiEvent({
          system: 'matchmaker-agent',
          action: 'match_resolved',
          status: 'success',
          metadata: { bestCoachId, highestScore }
      });

      return bestCoachId;
    } catch (error) {
       logger.log('error', `[MatchmakerAgent] Evaluation failed:`, { error });
       return null;
    }
  }
}
