# Reviews

## What it is
A periodic client/portfolio review process. Two artefacts exist in `dev26` today — `FF_ReviewWording__mdt` (custom metadata type holding pre-defined review outcome wording) and the `FF_Review_Outcome_Builder` flow — but per the session owner these belong to a colleague's separate "Meeting Concierge" build, not a completed Reviews capability for this template. **Reviews should be built as its own capability**: it maps to a confirmed, existing FF Product, and is treated here as forward design, not as out of scope.

## Brain match
**Confirmed match**: *Periodic Review Bookings and Preparation* (Jira epic `WMT2-66`). Brain `Status__c` is currently `None` (not yet marked built in the catalogue), and the product's implementation considerations describe an Agentforce-dependent build (scheduling + preparation assisted by an agent). This is a Full match on scope, not yet a Full match on delivery — the template does not yet contain a complete, confirmed build against it.

## Apps
`FF_Wealth_Management`.

## Record types
None found specific to reviews.

## Key objects + key custom fields
`FF_ReviewWording__mdt` (custom metadata) — pre-defined outcome wording, reusable once the review process itself is built.

## Automation
`FF_Review_Outcome_Builder` (Flow) — label and description are not populated in the retrieved metadata, and per the session owner this flow belongs to a colleague's adjacent "Meeting Concierge" work rather than this template's Reviews capability. Confirm ownership and scope before reusing it as the basis for the Reviews build.

## UI
`FF_Review_Flow_Access` permission set suggests a flow-launched screen experience, not yet located or confirmed as part of a completed Reviews build.

## Personas
`FF_Review_Flow_Access`.

## Integrations
None found. The Brain product's Agentforce dependency implies a future integration point once build starts.

## Extract potential
**NOT YET ASSESSED** — extract potential depends on the as-built Reviews capability, which does not yet exist in this template. Re-assess once `WMT2-66` has a confirmed design and build.

## Build status
**Forward design.** Not built in this template today. The existing metadata type and the (separately-owned) `FF_Review_Outcome_Builder` flow are adjacent artefacts, not a completed Reviews capability. Build against `WMT2-66`.

## Open questions / looks broken
- Confirm with the colleague owning `FF_Review_Outcome_Builder` whether any of that flow's logic is reusable for the Reviews capability itself, or whether it is purely Meeting Concierge-scoped.
- No stories currently exist under `WMT2-66` in the dev26-relevant epics checked this session — raise via `derive-jira-backlog` once the design is agreed.
