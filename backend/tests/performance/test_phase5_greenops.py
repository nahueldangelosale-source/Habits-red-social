import pytest
from unittest.mock import patch, AsyncMock
from app.infrastructure.green.carbon_gate import CarbonAwareScheduler, SuspendedExecutionException
from app.agents.maintenance.self_healer import MaintenanceAgent

@pytest.mark.asyncio
async def test_greenops_quality_gate_high_carbon():
    """
    GREENOPS AUDIT: Automated Quality Gate.
    Validation: System must block execution if carbon intensity > 400 gCO2/kWh.
    """
    scheduler = CarbonAwareScheduler()
    
    # Mocking high carbon intensity (500 gCO2/kWh)
    with patch.object(CarbonAwareScheduler, 'get_current_intensity', return_value=500.0):
        with pytest.raises(SuspendedExecutionException) as excinfo:
            await scheduler.check_governance("Background Refactor")
        
        assert "suspended" in str(excinfo.value).lower()
        print(f"\n[GREENOPS] Blocked execution as expected: {excinfo.value}")

@pytest.mark.asyncio
async def test_self_healing_energy_certification():
    """
    SELF-HEALING AUDIT: Energy Certification.
    Validation: MaintenanceAgent must measure Joules using CodeCarbon.
    """
    agent = MaintenanceAgent()
    
    # Mocking low carbon to allow execution
    with patch.object(CarbonAwareScheduler, 'get_current_intensity', return_value=200.0):
        # Mocking EmissionsTracker to avoid hardware-specific errors (pynvml/GPU/Intel)
        with patch('app.agents.maintenance.self_healer.EmissionsTracker') as MockTracker:
            mock_tracker_inst = MockTracker.return_value
            mock_tracker_inst.final_emissions_data.energy_consumed = 0.0001 # 0.0001 kWh
            
            result = await agent.run_healing_cycle()
            assert "Joules" in result
            print(f"\n[SELF-HEALING] {result}")
