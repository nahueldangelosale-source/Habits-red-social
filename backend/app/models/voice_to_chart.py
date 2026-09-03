"""
Voice-to-Chart Pydantic Models
The Invisible Scribe - SOAP Format Output for Clinical Charting

These models define the strict JSON schema for AI-processed voice recordings
from health professionals during client consultations.
"""

from datetime import datetime
from enum import Enum
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


class ConsultationType(str, Enum):
    """Type of health consultation."""
    INITIAL = "initial"
    FOLLOW_UP = "follow_up"
    PROGRESS_CHECK = "progress_check"
    ADJUSTMENT = "adjustment"


class Severity(str, Enum):
    """Severity level for symptoms or concerns."""
    MILD = "mild"
    MODERATE = "moderate"
    SEVERE = "severe"


# ============================================================================
# SOAP FORMAT COMPONENTS
# ============================================================================

class SubjectiveData(BaseModel):
    """
    S - Subjective: What the client reports.
    Information gathered from client's self-report during consultation.
    """
    
    chief_complaint: str = Field(
        ...,
        description="Primary reason for the consultation",
        examples=["Fatigue during workouts", "Difficulty maintaining diet"]
    )
    
    symptoms: list[str] = Field(
        default_factory=list,
        description="List of symptoms reported by client",
        examples=[["low energy", "poor sleep", "sugar cravings"]]
    )
    
    symptom_severity: Optional[Severity] = Field(
        default=None,
        description="Overall severity of reported symptoms"
    )
    
    lifestyle_notes: Optional[str] = Field(
        default=None,
        description="Client's reported lifestyle factors (sleep, stress, etc.)"
    )
    
    adherence_self_report: Optional[str] = Field(
        default=None,
        description="Client's self-assessment of protocol adherence"
    )
    
    goals_mentioned: list[str] = Field(
        default_factory=list,
        description="Goals or objectives mentioned by the client"
    )


class ObjectiveData(BaseModel):
    """
    O - Objective: Measurable/observable data.
    Quantifiable measurements and observations from the consultation.
    """
    
    weight_kg: Optional[float] = Field(
        default=None,
        ge=20.0,
        le=300.0,
        description="Client weight in kilograms"
    )
    
    body_fat_percentage: Optional[float] = Field(
        default=None,
        ge=3.0,
        le=60.0,
        description="Body fat percentage if measured"
    )
    
    measurements: Optional[dict[str, float]] = Field(
        default=None,
        description="Body measurements in cm (waist, chest, arms, etc.)"
    )
    
    vital_signs: Optional[dict[str, float]] = Field(
        default=None,
        description="Vital signs if taken (heart_rate, blood_pressure_systolic, etc.)"
    )
    
    performance_metrics: Optional[dict[str, str]] = Field(
        default=None,
        description="Training performance data (max_squat, run_time, etc.)"
    )
    
    photos_taken: bool = Field(
        default=False,
        description="Whether progress photos were taken this session"
    )


class AssessmentData(BaseModel):
    """
    A - Assessment: Professional's clinical judgment.
    The health professional's analysis and interpretation.
    """
    
    progress_evaluation: str = Field(
        ...,
        description="Overall assessment of client's progress",
        examples=["On track", "Plateau detected", "Regression noted"]
    )
    
    barriers_identified: list[str] = Field(
        default_factory=list,
        description="Obstacles to progress identified by professional"
    )
    
    risk_factors: list[str] = Field(
        default_factory=list,
        description="Health or adherence risk factors noted"
    )
    
    clinical_notes: Optional[str] = Field(
        default=None,
        description="Additional clinical observations"
    )


class PlanData(BaseModel):
    """
    P - Plan: Next steps and interventions.
    Action items and protocol adjustments for the client.
    """
    
    protocol_adjustments: list[str] = Field(
        default_factory=list,
        description="Changes to current diet/workout protocol"
    )
    
    new_targets: Optional[dict[str, str]] = Field(
        default=None,
        description="New goals or targets set (calories, workout_frequency, etc.)"
    )
    
    homework: list[str] = Field(
        default_factory=list,
        description="Tasks for client to complete before next session"
    )
    
    follow_up_date: Optional[datetime] = Field(
        default=None,
        description="Scheduled date for next consultation"
    )
    
    referrals: list[str] = Field(
        default_factory=list,
        description="Referrals to other professionals if needed"
    )


# ============================================================================
# COMPLETE CHART RECORD
# ============================================================================

class VoiceToChartOutput(BaseModel):
    """
    Complete Voice-to-Chart output in SOAP format.
    This is the final structured output from the AI transcription pipeline.
    """
    
    # Metadata
    id: Optional[UUID] = Field(
        default=None,
        description="Unique identifier for the chart record"
    )
    
    client_id: UUID = Field(
        ...,
        description="Reference to the client being charted"
    )
    
    professional_id: UUID = Field(
        ...,
        description="Reference to the health professional"
    )
    
    consultation_type: ConsultationType = Field(
        default=ConsultationType.FOLLOW_UP,
        description="Type of consultation"
    )
    
    recorded_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="Timestamp of the original voice recording"
    )
    
    duration_seconds: Optional[int] = Field(
        default=None,
        ge=0,
        description="Duration of the voice recording in seconds"
    )
    
    # SOAP Components
    subjective: SubjectiveData
    objective: ObjectiveData
    assessment: AssessmentData
    plan: PlanData
    
    # AI Processing Metadata
    transcription_confidence: float = Field(
        default=0.0,
        ge=0.0,
        le=1.0,
        description="Whisper transcription confidence score"
    )
    
    extraction_confidence: float = Field(
        default=0.0,
        ge=0.0,
        le=1.0,
        description="GPT-4o data extraction confidence score"
    )
    
    raw_transcription: Optional[str] = Field(
        default=None,
        description="Original transcription text (for audit/review)"
    )
    
    requires_review: bool = Field(
        default=False,
        description="Flag for low-confidence extractions needing manual review"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "client_id": "123e4567-e89b-12d3-a456-426614174000",
                "professional_id": "987fcdeb-51a2-3bc4-d567-426614174999",
                "consultation_type": "follow_up",
                "recorded_at": "2026-02-05T10:30:00Z",
                "duration_seconds": 480,
                "subjective": {
                    "chief_complaint": "Feeling tired during morning workouts",
                    "symptoms": ["fatigue", "poor recovery"],
                    "symptom_severity": "moderate",
                    "adherence_self_report": "80% diet compliance"
                },
                "objective": {
                    "weight_kg": 78.5,
                    "body_fat_percentage": 18.2,
                    "measurements": {"waist": 84.0, "chest": 102.0},
                    "photos_taken": True
                },
                "assessment": {
                    "progress_evaluation": "Slight plateau, needs adjustment",
                    "barriers_identified": ["work stress", "irregular sleep"]
                },
                "plan": {
                    "protocol_adjustments": ["Reduce volume by 20%", "Add rest day"],
                    "homework": ["Track sleep for 7 days"],
                    "follow_up_date": "2026-02-12T10:30:00Z"
                },
                "transcription_confidence": 0.94,
                "extraction_confidence": 0.87,
                "requires_review": False
            }
        }
