# Extract Candidates — WM Core Dev 2026

This is a small, focused template org (22 flows, 25 permission sets, 4 custom objects) rather than a sprawling demo org — the candidate count below reflects that actual shape rather than padding to a fixed target. Every item here is Futureform-built; platform/Industries scaffolding and third-party packages are called out separately under "Not recommended for extraction".

## Effort scale
`low` = lift and drop. `medium` = needs field/object mapping or decoupling. `high` = tangled with this org's specific data model.

## Top tier — broad reuse, well-scoped

| What | Type | Why | Dependencies | Effort | Capability doc |
| --- | --- | --- | --- | --- | --- |
| Household-aware Lead Conversion | Flow (`FF_Lead_Conversion`) | Converts to Household not just Person Account; checks for existing household membership first — a core FSC wealth pattern most orgs need | Household Account record type, ApplicationForm | Low | [01](./capabilities/01-prospects-and-lead-conversion.md) |
| Opportunity → FinancialAccount handoff | Flow (`FF_Opportunity_Create_Financial_Account`) | Dedupes by account number, resolves Person vs Household party creation automatically on Closed Won | FinancialAccount, FinancialAccountParty, Opportunity record types matching FinancialAccount record types | Medium | [04](./capabilities/04-financial-accounts-and-product-mix.md) |
| Scheduled Financial Summaries (Account + Household) | 2 Flows + permission sets | Uses native Data Processing Engine / Record Aggregation — no custom Apex rollup code to maintain | AccountFinancialSummary, RecordAggregationAccess/Result | Low | [05](./capabilities/05-financial-summaries-and-rollups.md) |
| Permission-set/PSG access architecture | 25 PermissionSets + 2 PermissionSetGroups | The access model itself — nearly every other extract candidate needs this to actually work in a target org | None beyond the objects each set grants access to | Low | [10](./capabilities/10-access-and-security.md) |
| Client Vulnerability Management object | Custom object (`FF_Client_Vulnerability__c`) | Trackable, multi-record, time-bound vulnerability logging — replaces a flow-logged single-event approach | Account | Low | [07](./capabilities/07-client-vulnerability-management.md) |

## Second tier — reusable, needs more scoping

| What | Type | Why | Dependencies | Effort | Capability doc |
| --- | --- | --- | --- | --- | --- |
| Applications/Participant data model | `FF_Application_Form_Product_Participant__c` + 3 flows (excludes `FF_Application__c` — packaging decision: use standard `ApplicationForm` + `FF Application` record type instead) | Multi-participant application tracking with ownership %/contribution amounts | ApplicationForm (`FF Application` record type), DocumentChecklistItem | Medium | [03](./capabilities/03-applications-and-onboarding.md) |
| Document-checklist auto-expiry | Flow (`FF_DocumentChecklistItem_Scheduled`) | Daily scheduled expiry of accepted documents past their date — simple, reusable pattern | DocumentChecklistItem, `FF_Expiration_Date__c` | Low | [03](./capabilities/03-applications-and-onboarding.md) |
| Historic Valuation snapshot object | Custom object (`Historic_Valuation__c`) | Point-in-time market valuation per FinancialAccount/holding | FinancialAccount | Medium | [04](./capabilities/04-financial-accounts-and-product-mix.md) |
| Regulator propagation (Product → FinancialAccount) | 2 Flows | Keeps compliance data in sync automatically | Product2, FinancialAccount | Medium | [04](./capabilities/04-financial-accounts-and-product-mix.md) |
| Change-of-details Case pattern | 9 Flows (needs consolidation first) | Generically useful screen-flow → Case → Action Plan → auto-close pattern, but currently duplicated 4x across near-identical flows — consolidate into one parameterised flow before lifting | Case, ActionPlan, DocumentChecklistItem | High | [06](./capabilities/06-client-servicing-and-change-of-details.md) |

## Third tier — noteworthy, specialised

| What | Type | Effort | Note |
| --- | --- | --- | --- |
| `FF_Case_CloseCase` | Flow | Low | Auto-close logic specific to the change-of-details pattern above; extract together, not alone |
| `FF_Closed_Opportunity_Account_Type_Update` | Flow | Low | Small, standalone Prospect/Former Client → Client flip |
| `FF_Review_Outcome_Builder` + `FF_ReviewWording__mdt` | Flow + custom metadata | Medium | Internals not confirmed from source (no label/description populated) — confirm behaviour before extracting |
| `FF_Action_Plan_Creation_Document_Upload` | Flow | Low | Pairs with change-of-details pattern |
| `FF_CRMA_Integration_FSC_Objects` permission set | PermissionSet | Low | Grants access for CRM Analytics integration against FSC objects; only useful if target also has CRMA |
| `FF_Fund_Switch_Fields` permission set | PermissionSet | Low | Narrow, single-purpose field grant |
| `FF_Update_Regulator` screen flow | Flow | Medium | Prefix-based routing logic (reads first 3 digits of a record number) — a mild cross-object-hack worth reviewing before reuse |
| PartyRelationshipGroup/PartyRoleRelation/BusinessMilestone permission sets | PermissionSets | Low | Declarative FSC access only; sharing-model gap noted in capability doc 02 must be resolved first |

## Fourth tier — integrations + smaller components

| What | Type | Effort | Note |
| --- | --- | --- | --- |
| `FF_Send_Emails` permission set | PermissionSet | Low | Thin, single-purpose |
| `FF_Interaction_Summaries` permission set | PermissionSet | Low | Thin, single-purpose |
| `FF_CampaignsPermissionSet` | PermissionSet | Low | Thin, standard-object access only |
| `FF_Activity_Management` permission set | PermissionSet | Low | Thin, standard-object access only |
| `FF_Accounts` / `FF_Contacts` / `FF_Leads` | PermissionSets | Low | Base CRUD permission sets; needed as dependencies for most other extracts, limited standalone value |

## Not recommended for extraction

- **AI Fact Find Agent** (`ffAiFactFind` LWC, `FF_FactFindController`/`FF_FactFindControllerTest` Apex, `FF_FactFind_AIExtract`/`FF_FactFind_SaveResults` flows, `FF_FactFind_Agent*`/`FF_Wealth_Assistant_Agent*` permission sets) — explicitly out of scope for this template; it lives in the separate `ff-wm-factfind-agent` project.
- **`force__*` permission set groups** (`force__SalesCloudSeller`, `force__ServiceUsers`, `force__CommerceUsers`, etc., 24 total) — standard Industries/Commerce platform scaffolding, not Futureform-built.
- **Standard apps** (`standard__*`, 41 total, including `standard__WealthManagement`/`standard__NextGenWealthManagement`) — platform-provided, not bespoke.
- **Sales Insights (`OIQ`) and Merge Connect (`mergeconnect`)** — third-party AppExchange packages, not Futureform IP.
- **`FF_ReviewWording__mdt` contents** — until `FF_Review_Outcome_Builder`'s actual behaviour is confirmed, the metadata type's extract value is unproven.

## How to extract cleanly

1. Identify the object(s), fields, Apex, LWC and flows needed by cross-referencing the relevant capability doc.
2. Build a fresh `package.xml` listing those members; retrieve into a new sfdx project.
3. Scan the retrieved source for: hard-coded record-type developer-name references (none of this org's code is namespaced, so no `ns__` swap needed), cross-referenced flows/objects not in the extraction list, and the prefix-routing logic in `FF_Update_Regulator` specifically.
4. Recreate permission sets from the relevant capability doc rather than lifting `FF_Wealth_Advisor`/`FF_Client_Servicing` wholesale — they bundle every capability together.
5. Deploy to a scratch org, smoke test, ship.
