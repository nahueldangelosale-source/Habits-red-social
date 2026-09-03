from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
import httpx
import structlog
from typing import Optional

logger = structlog.get_logger(__name__)

class SuspendedExecutionException(Exception):
    """Raised when carbon intensity is too high to run heavy tasks."""
    pass

class CarbonAwareScheduler:
    """
    GreenOps Governance Engine.
    Monitors grid carbon intensity and suspends non-critical background tasks.
    """
    
    THRESHOLD_GCO2_KWH = 400.0
    API_URL = "https://api.carbonintensity.org.uk/intensity"
    
    def __init__(self, api_url: Optional[str] = None):
        self.api_url = api_url or self.API_URL

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        retry=retry_if_exception_type(httpx.HTTPError)
    )
    async def get_current_intensity(self) -> float:
        """
        Fetches current grid carbon intensity with Resilience.
        """
        async with httpx.AsyncClient() as client:
            try:
                # Real call to Carbon Intensity API (UK Example)
                response = await client.get(self.api_url, timeout=5.0)
                response.raise_for_status()
                data = response.json()
                return float(data['data'][0]['intensity']['actual'] or data['data'][0]['intensity']['forecast'])
            except Exception as e:
                logger.error("carbon_api_error", error=str(e))
                # FAIL-CLOSED: Assume high intensity if API fails
                return 500.0

    async def check_governance(self, task_name: str):
        """
        Verifies if a task is allowed to run based on carbon intensity.
        """
        intensity = await self.get_current_intensity()
        logger.info("carbon_governance_check", task=task_name, intensity=intensity)
        
        if intensity > self.THRESHOLD_GCO2_KWH:
            logger.warning("execution_suspended_high_carbon", task=task_name, intensity=intensity)
            raise SuspendedExecutionException(
                f"Execution of '{task_name}' suspended. Carbon intensity {intensity} > {self.THRESHOLD_GCO2_KWH} gCO2/kWh"
            )
        
        return True
