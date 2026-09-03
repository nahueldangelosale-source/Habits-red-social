export type ActionExecutionType = 'EXTERNAL_DEEP_LINK' | 'INTERNAL_CHAT';

export interface ActionCardData {
  id: string;
  athlete_id: string;
  athlete_name: string;
  risk_score: number;
  title: string;
  message: string;
  action_execution: {
    type: ActionExecutionType;
    payload: {
      url?: string;
      channel_id?: string;
    };
  };
  trigger_id?: string;
  athlete_snapshot?: {
    acwr_delta: number;
    current_load: string;
    consistency_score: number;
  };
  model_context?: {
    predicted_risk: number;
    model_version: string;
    confidence_score: number;
    reasoning_tag: string;
  };
}

