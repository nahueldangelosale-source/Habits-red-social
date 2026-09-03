export interface PatientView {
  pedagogical_copy: string;
  education_pill: string;
  actionable_habit: string;
}

export interface ProfessionalView {
  diagnosis: string;
  ui_directive: 'clinical-accent' | 'risk-high' | 'clinical-muted';
}

export interface CognitiveTranslationPayload {
  biomarker: string;
  raw_value: number;
  status: 'High' | 'Low' | 'Optimal';
  professional_view: ProfessionalView;
  patient_view: PatientView;
}
