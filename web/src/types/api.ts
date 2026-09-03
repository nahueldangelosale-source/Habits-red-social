// API Error Types

export interface ConflictSessionPayload {
  session_id: string;
  name: string;
  start_time: string;
  end_time: string;
}

export interface ApiConflictError {
  response?: {
    status: number;
    data: {
      detail: {
        error: string;
        message: string;
        conflict_session: ConflictSessionPayload;
      };
    };
  };
}

export interface ActionCard {
  id: string;
  tenant_id: string;
  athlete_id: string;
  professional_id: string | null;
  metric_name: string;
  score: number;
  title: string;
  body_template: string;
  context_variables: Record<string, any>;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'IGNORED';
  created_at: string;
  updated_at: string;
}
