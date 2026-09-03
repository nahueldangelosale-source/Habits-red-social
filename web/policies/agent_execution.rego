package agent.execution

default allow = false
default deny = false

# Permitir lectura en el ClinicalDataMcpServer a agentes autorizados
allow {
    input.action == "read"
    input.resource == "ClinicalDataMcpServer"
    input.agent_role == "Biomechanics_Agent"
}

allow {
    input.action == "read"
    input.resource == "ClinicalDataMcpServer"
    input.agent_role == "Hypertrophy_Agent"
}

allow {
    input.action == "evaluate_consensus"
    input.resource == "SwarmDebate"
    input.agent_role == "Judge_Orchestrator"
}

# Denegar acceso si intenta modificar archivos o configuraciones restrictivas
deny {
    input.action == "write"
    not startswith(input.resource, "safe_zone/")
}

# Denegar el paso si la identidad SVID no esta validada
deny {
    not input.svid_valid
}
