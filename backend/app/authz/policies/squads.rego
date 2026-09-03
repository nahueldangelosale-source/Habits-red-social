package bienestar.authz.squads

import rego.v1

# Default policy: deny all (MANDATO ZERO TRUST 2026)
default allow = false

# Helpers
is_leader(user_id, squad) if {
    some member in squad.members
    member.client_id == user_id
    member.is_leader == true
}

is_member(user_id, squad) if {
    some member in squad.members
    member.client_id == user_id
}

# Rules
allow if {
    input.action == "join"
    count(input.squad.members) < 5
    not is_member(input.user_id, input.squad)
}

# Strict Create Rule: Only verified admins or agents with clearance
allow if {
    input.action == "create"
    input.user_role == "admin"
}

allow if {
    input.action == "create"
    input.agent_clearance == "verified"
}

allow if {
    input.action == "log_activity"
    is_member(input.user_id, input.squad)
}
