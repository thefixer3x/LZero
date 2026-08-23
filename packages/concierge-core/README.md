# Concierge Core

Platform-agnostic core for the LanOnasis persistent-memory concierge.

This package is intended to be shared between chat-platform adapters (Slack, Discord, etc.) and the VortexAI-L0 orchestration layer. It contains:

- Concierge request/response contracts
- Identity-linking abstractions
- Memory adapter interfaces
- Tool classification and approval policy models

## Why

Slack and Discord adapters currently duplicate identity resolution, memory adapter wiring, and project-scope logic. Extracting those into this package keeps each adapter thin and consistent.
