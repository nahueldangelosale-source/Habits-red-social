import asyncio
import json
import logging
from typing import Dict, Any
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

logger = logging.getLogger(__name__)

router = APIRouter()

class BiometricFSM:
    def __init__(self, athlete_id: str):
        self.athlete_id = athlete_id
        self.state = "WARMUP"
        self.current_hr = 90
        self.ticks = 0
        self.fatigue_index = 0.1
        
    def next_payload(self) -> Dict[str, Any]:
        self.ticks += 1
        ui_directive = "STANDARD"
        recovery_rate = 0
        
        if self.state == "WARMUP":
            self.current_hr += 2  # Gradual increase
            if self.current_hr >= 120:
                self.state = "WORKING_SET"
                self.ticks = 0
                
        elif self.state == "WORKING_SET":
            self.current_hr += 5  # Sharp spike
            ui_directive = "FOCUS_MODE"
            if self.current_hr >= 170:
                # Reached peak, start rest
                self.state = "REST"
                self.ticks = 0
                self.fatigue_index = min(0.95, self.fatigue_index + 0.15)
                
        elif self.state == "REST":
            # Free fall
            self.current_hr -= 10
            recovery_rate = -30  # Simulated recovery drop
            ui_directive = "RECOVERY_MODE"
            if self.current_hr <= 110:
                self.state = "WORKING_SET"
                self.ticks = 0
                
        # Determine HR Zone
        if self.current_hr < 110: hr_zone = 1
        elif self.current_hr < 130: hr_zone = 2
        elif self.current_hr < 150: hr_zone = 3
        elif self.current_hr < 165: hr_zone = 4
        else: hr_zone = 5

        return {
            "timestamp": "2026-06-29T14:40:00Z", # Placeholder timestamp
            "athlete_id": self.athlete_id,
            "session_type": "STRENGTH",
            "metrics": {
                "current_hr": max(60, self.current_hr),
                "hr_zone": hr_zone,
                "fatigue_index": round(self.fatigue_index, 2),
                "o2_sat": 96,
                "block_compliance": 0.90,
                "recovery_rate_bpm": recovery_rate
            },
            "ui_state_directive": ui_directive
        }


@router.websocket("/mock-telemetry/{athlete_id}")
async def telemetry_mock_endpoint(websocket: WebSocket, athlete_id: str):
    """
    Simulates high-throughput biometric telemetry using a Finite State Machine.
    """
    await websocket.accept()
    logger.info(f"Vibe Coding Mock: Athlete {athlete_id} connected to telemetry stream.")
    fsm = BiometricFSM(athlete_id)
    
    try:
        while True:
            # Generate FSM payload
            payload = fsm.next_payload()
            
            # Send payload
            await websocket.send_text(json.dumps(payload))
            
            # Wait 3 seconds to simulate telemetry batch intervals
            await asyncio.sleep(3.0)
            
    except WebSocketDisconnect:
        logger.info(f"Vibe Coding Mock: Athlete {athlete_id} disconnected.")
    except Exception as e:
        logger.error(f"Error in telemetry mock: {e}")
        await websocket.close()
