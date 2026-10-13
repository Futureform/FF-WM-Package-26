# Reviews

## What it is
A periodic client/portfolio review process with pre-defined outcome wording, inferred from `FF_ReviewWording__mdt` (custom metadata type for review outcome text) and the `FF_Review_Outcome_Builder` flow.

## Apps
`FF_Wealth_Management`.

## Record types
None found specific to reviews.

## Key objects + key custom fields
`FF_ReviewWording__mdt` (custom metadata).

## Automation
`FF_Review_Outcome_Builder` (Flow) — label and description were not populated in the retrieved metadata; behaviour not fully confirmed from source alone. **Flagging rather than guessing**: recommend opening the flow directly in Setup/Flow Builder to confirm what it actually does before documenting further.

## UI
`FF_Review_Flow_Access` permission set suggests a flow-launched screen experience, not yet located.

## Personas
`FF_Review_Flow_Access`.

## Integrations
None found.

## Extract potential
**NOT RECOMMENDED** — per the owner, this is a colleague-built flow related to a separate "Meeting Concierge" capability, not part of this WM template's scope. Leaving it out of packaging consideration; not pursuing further confirmation of its internals for now.

## Open questions / looks broken
- `FF_Review_Outcome_Builder.flow-meta.xml` has no `<label>`/`<description>` populated. Resolved (session owner input): this belongs to a colleague's separate "Meeting Concierge" work, not this template — deprioritised, no further action needed here.
