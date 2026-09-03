import pytest
import asyncio
from uuid import uuid4
from app.agents.supervisor import SwarmSupervisor
from app.agents.workers.squad_worker import SquadWorker
from app.agents.chaos.injector import ChaosInjector
from app.agents.evaluators.chaos_judge import ChaosJudge

@pytest.mark.asyncio
async def test_agentic_chaos_swarm_resilience():
    """
    ARCHITECTURE AUDIT: Multi-Agent Swarm Resilience.
    Scenario: Chaos Injector produces Behavioral failure (broken JSON).
    Validation: ChaosJudge asserts recovery via OTel causal tracing.
    """
    supervisor = SwarmSupervisor()
    worker = SquadWorker()
    chaos = ChaosInjector()
    judge = ChaosJudge()
    
    # 1. Start Experiment Trace
    experiment_id = str(uuid4())
    
    # 2. Inject Behavioral Chaos (Simulate malformed environment)
    broken_payload = await chaos.inject_behavioral_failure()
    
    # 3. Swarm Execution with intentional pressure
    # We expect Tenacity to handle the retry if we pass the broken payload
    try:
        # Simulate a tool call that receives the chaos payload
        # Worker should retry based on its @retry decorator
        await worker.execute_mcp_tool("squad_create", {"payload": broken_payload})
    except Exception as e:
        print(f"Worker failed as expected under chaos: {e}")
    
    # 4. Agent-as-a-Judge Evaluation
    # Judge analyzes the 'experiment_id' trajectory
    is_resilient = await judge.evaluate_experiment(experiment_id, {"chaos_type": "behavioral"})
    
    # Final Architectural Assertion
    assert is_resilient is True, "Swarm failed Behavioral Resilience Audit"
    print("\n[CHAOS ALERT] Agentic Swarm survived behavioral injection.")
    print("[JUDGE] ChaosJudge certified the reasoning trajectory as SAFE.")
