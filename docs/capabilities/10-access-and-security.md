# Access & Security

## What it is
The permission architecture carrying almost all access control in this org: two custom Permission Set Groups (`FF_Wealth_Advisor`, `FF_Client_Servicing`) bundling 24 FF-prefixed permission sets, layered on a minimal custom profile (`FF Wealth Standard User`). 25 permission sets in total cover every capability above.

## Apps
`FF_Wealth_Management`.

## Record types
N/A.

## Key objects + key custom fields
PermissionSet, PermissionSetGroup, Profile.

## Automation
N/A (declarative security configuration).

## UI
N/A.

## Personas
- `FF_Wealth_Advisor` (PermissionSetGroup) — full capability set, added `FF_Record_Rollups` and `force__FinancialServicesCloudExtension` this session (the latter flagged in Pass 1 as a stale namespaced reference — this org's FSC is native, not managed-package).
- `FF_Client_Servicing` (PermissionSetGroup).
- Profile: `FF Wealth Standard User` (2 active users) — the only custom profile; everything else layers via permission sets, consistent with FSC best practice.

## Integrations
None found.

## Extract potential
**HIGH** — the permission-set/PSG architecture itself (not any single permission set) is the most directly reusable artefact in the whole org: it's the access model any FF-WM-Package deployment needs to ship with.

## Open questions / looks broken
- Brain match: Access and Security (WM-2, `WMT2-3`) is Full. This session's permission-set additions (PartyRoleRelation, FF_Business_Milestones creation, `force__FinancialServicesCloudExtension` addition, FF_Record_Rollups creation, AccountFinancialSummary FLS) most closely match `WMT2-189`/`WMT2-578`.
- The `force__FinancialServicesCloudExtension` reference inside `FF_Wealth_Advisor` needs resolving given Pass 1's finding that this org has no `force__`-namespaced FSC package — confirm whether this is a dangling reference (safe to remove) or whether it still resolves to something real (e.g. a Permission Set License name rather than a namespaced permission set) before this gets packaged for distribution.
