# Households & Relationships

## What it is
Standard FSC household/party-relationship model: `PartyRelationshipGroup` ties Household Accounts to their members with roles (`PartyRoleRelation`, 28 records), and `BusinessMilestone` exists for tracking milestone events against a party. No bespoke objects — this capability is declarative, carried entirely by FSC standard objects plus permission sets.

## Apps
`FF_Wealth_Management`.

## Record types
PartyRelationshipGroup: 1 record type (unnamed/default). Account: Person Account, FF Person Account.

## Key objects + key custom fields
PartyRelationshipGroup, PartyRoleRelation, BusinessMilestone — all standard FSC objects, no custom fields added.

## Automation
None found — no flows or triggers reference these objects directly. Relationship creation appears to be manual/UI-driven (standard FSC household management components) or handled inside `FF_Lead_Conversion`.

## UI
Standard FSC relationship/household components (no custom LWC/FlexiPage specifically built for this).

## Personas
`FF_Party_Relationship_Group`, `FF_Business_Milestones` permission sets (the latter added this session).

## Integrations
None found.

## Extract potential
**LOW** — this is standard FSC configuration (permission sets granting access to standard objects), not bespoke build; the value is in the permission-set FLS grants, not a transportable component.

## Open questions / looks broken
- **Unresolved sharing-visibility gap, carried from earlier this session**: `PartyRoleRelation` and `BusinessMilestone` sit on Private OWD with zero sharing rules found. Three remediation options were presented earlier (sharing rules, Apex sharing, or OWD change) but never decided. Tracked against Jira `WMT2-171` ("OWD + Sharing Rules", Backlog, empty description) — needs a decision before this capability can be considered complete for a template others will deploy.
- Brain match: Households and Household Teams (WM-203, `WMT2-20`) is a confirmed Full match; its children `WMT2-350` (Party Relationship Group Subtypes, Backlog) and `WMT2-215` (Relationship Diagrams, UAT) both touch this capability and should be checked against actual build state.
