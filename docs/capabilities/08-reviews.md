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
**LOW** — insufficient information to rate confidently; needs the flow internals confirmed first.

## Open questions / looks broken
- `FF_Review_Outcome_Builder.flow-meta.xml` has no `<label>`/`<description>` populated — this is itself a documentation gap in the org, not just in this analysis. No Brain product identified for Reviews as a named capability — a fourth catalogue gap area, lowest confidence of the four given the thin source evidence.
