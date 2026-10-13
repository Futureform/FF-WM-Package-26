# Client Servicing & Change of Details

## What it is
A Case-driven "change of details" service pattern: a client's address, name, date of birth, marital status or general contact details change is captured via a screen flow, attached to a Case, optionally backed by an Action Plan with document upload, and the Case auto-closes once all tasks and document checklist items are resolved. This is the largest single cluster of flows in the org (9 of 22).

## Apps
`FF_Wealth_Management`.

## Record types
Case: 1 record type.

## Key objects + key custom fields
Case, ActionPlan, DocumentChecklistItem. No custom fields beyond `FF_Expiration_Date__c` on DocumentChecklistItem (used by the scheduled expiry flow in Applications & Onboarding).

## Automation
- `FF_Action_Plan_Creation_Document_Upload` — generates an Action Plan + document upload screen for a change-of-details request.
- `FF_Document_Checklist_Item_Change_of_Details_Accepted` — once a change-of-details document checklist item is Accepted, updates the Account's details per whatever changed.
- `FF_Case_Update_Address`, `FF_Case_Update_Client_Name`, `FF_Case_Update_Date_Of_Birth`, `FF_Case_Update_Marital_Status` — four parallel screen flows, one per change type, each writing to the Case.
- `FF_Update_Contact_Details` — launched from the Action Launcher on Case or Account; captures contact-detail changes generally.
- `FF_Update_Communication_Preference` — subflow-aware (skips its own Close Case step when invoked as a subflow).
- `FF_Case_CloseCase` — auto-closes the Case and completes Action Plans once no open tasks/pending checklist items remain.

## UI
Action Launcher-invoked screen flows on Case and Account.

## Personas
`FF_Cases_Full_Access`, `FF_Cases_Read_Create`, `FF_Change_of_Details_Action`, `FF_Action_Plan_and_Action_Plan_Template_Permissions`.

## Integrations
None found.

## Extract potential
**MEDIUM** — the change-of-details pattern (screen flow → Case → Action Plan → document acceptance → auto-close) is generically useful, but the four near-identical per-field-type flows (`FF_Case_Update_Address/ClientName/DateOfBirth/MaritalStatus`) are a **duplication-across-flows** antipattern candidate: four flows doing the same shape of work for four different fields. Worth consolidating into one parameterised flow before extraction.

## Jira
Fully represented despite the Brain gap below — epic `WMT2-70` (Change of Details) with 14 children covering all 9 flows: `WMT2-324/327/330/331` (per-field updates), `WMT2-332` (general contact details), `WMT2-333`/`WMT2-413` (Close Case action + its bug), `WMT2-335` (Case statuses), `WMT2-404` (enforce document upload), `WMT2-372` (marital-status/name cross-prompt), `WMT2-310` (adjustments), plus `WMT2-328/329/376/405` (postcode/county/DOB validation bugs and enhancements). Confirmed via comment on `WMT2-70` this session, including the flow-duplication note below.

## Open questions / looks broken
- No Brain product currently names "change of details" / case-driven servicing as its own capability — a third catalogue gap, distinct from the two already raised (Lead Conversion, Financial Account handoff). Not proposing a product for this one yet — flagging for your call on whether it's in scope for a Brain write-back this round. This is a Brain catalogue gap only — the Jira backlog already covers the capability accurately (see Jira section above).
- The four parallel `FF_Case_Update_*` flows are the clearest **automation-duplication** signal found in this org — recommend reviewing against the record-triggered automation decision guide before anyone copies this pattern into another org.
