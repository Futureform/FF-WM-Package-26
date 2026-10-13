# Pass 1 — Org Overview: WM Core Dev 2026 (dev26)

Lens: **rediscovery**. This org is the live, hand-built Wealth Management core template — the analysis goal is to understand everything in it, not just what was touched in any one session.

## Org identity

| Field | Value |
| --- | --- |
| Org name | WM Core Dev 2026 |
| Alias | `dev26` |
| Org ID | `00DQH00000LB3Mf2AL` |
| Edition | Developer Edition |
| Instance | GBR58 |
| Created | 2026-03-05 |
| Sandbox | No |
| Trial expiry | None |
| Namespace | None (unlocked/native org — not a managed-package subscriber org) |
| API version (retrieved at) | 66.0 |

## Licences / installed packages

Only two AppExchange-style subscriber packages are installed:

| Package | Namespace | Version |
| --- | --- | --- |
| Sales Insights | `OIQ` | 1.0.0.1 |
| Merge Connect | `mergeconnect` | 1.0.0.1 |

**Open finding:** Financial Services Cloud is present in this org (`FinancialAccount`, `FinancialAccountParty`, `ApplicationForm`, `PartyRelationshipGroup`, `BusinessMilestone`, etc. all exist and are populated), but it does **not** appear as an installed package and its objects carry **no namespace prefix** — these are native/unlocked standard objects, not a `force__`-namespaced managed package. A query for any `force__%` object (`EntityDefinition`) returned zero rows. This means:
- The `force__FinancialServicesCloudExtension` and other `force__*` permission-set-group references found in metadata (e.g. in `FF_Wealth_Advisor`) are **stale references to a managed-package era of FSC that no longer matches how this org actually ships FSC**. This is a **Temporal** divergence per the build-decision ladder — worth a closer look during Pass 2/automation review, not a bug to silently fix.
- Several `force__*`-prefixed PermissionSetGroups (`force__SalesCloudSeller`, `force__ServiceUsers`, `force__CommerceUsers`, etc.) exist in metadata as standard Industries/Commerce platform scaffolding, not Futureform-built — excluded from capability/extract analysis as noise.

## Namespaces in use

`OIQ`, `mergeconnect`. No Futureform-internal namespace (org is unlocked).

## Metadata counts (from retrieved source)

| Type | Count | Notes |
| --- | --- | --- |
| Custom objects (`__c`) | 4 | `FF_Application__c`, `FF_Application_Form_Product_Participant__c`, `FF_Client_Vulnerability__c`, `Historic_Valuation__c` |
| Custom metadata types | 1 | `FF_ReviewWording__mdt` |
| Apex classes | 2 | `FF_FactFindController`, `FF_FactFindControllerTest` (AI Fact Find agent only — confirms almost nothing else is Apex-driven) |
| Apex triggers | 0 | |
| LWC bundles | 1 | `ffAiFactFind` |
| Aura bundles | 0 | |
| Visualforce pages | 0 | |
| Flows (total) | 22 | 20 Active, 2 Draft/other |
| Flows with `FF_` prefix | 22 (all) | Every flow in the org is Futureform-built |
| Permission sets (total) | 25 | |
| Permission sets with `FF_` prefix | 24 of 25 | Fact Find agent-generated sets (`FF_FactFind_Agent...`, `FF_Wealth_Assistant_Agent...`) included |
| Permission set groups (custom) | 2 | `FF_Client_Servicing`, `FF_Wealth_Advisor` |
| Permission set groups (standard/Industries scaffolding) | 24 | `force__*` — not Futureform-built, excluded from capability analysis |
| Record types (total) | 15 across 13 objects | see heat-map below |
| Custom Lightning apps | 1 | `FF_Wealth_Management` |
| Standard/Industries apps present | 41 | not Futureform-built (e.g. `standard__WealthManagement`, `standard__NextGenWealthManagement`) |
| Quick actions | 29 | |
| FlexiPages | 53 | |
| Experience Cloud sites | 0 | `ExperienceBundle`/`Network` metadata types reported "not available in this organization" — this org has no Experience Cloud site at all |

## Record-type heat-map (fastest read of the org's shape)

| SObject | Record types |
| --- | --- |
| Opportunity | 5 — Bank Account, Investment, Mortgage, Pension, Protection |
| FinancialAccount | 5 — Bank Account, Investment, Mortgage, Pension, Protection |
| Account | 4 — default, Person Account, FF Business, FF Person Account |
| Metric | 2 |
| ApplicationForm | 2 |
| Lead, Case, FF_Application__c, Contact, Product2, Campaign, PartyRelationshipGroup, Event | 1 each |

The Opportunity/FinancialAccount pairing on identical record-type names (Bank Account, Investment, Mortgage, Pension, Protection) is the clearest signal of the org's vertical: a retail wealth-management product mix spanning banking, investment, mortgage, pension and protection — mirrored consistently across the sales (Opportunity) and servicing (FinancialAccount) sides.

## Record counts (top objects)

| Object | Count |
| --- | --- |
| Account | 64 |
| Opportunity | 44 |
| Contact | 53 |
| Lead | 33 |
| PartyRoleRelation | 28 |
| FinancialAccount | 12 |
| FF_Application__c | 10 |
| FF_Client_Vulnerability__c | 7 |
| Historic_Valuation__c | 6 |
| BusinessMilestone | 0 |

This is a **non-authoritative dev org** — low counts are expected and are not evidence that anything is unused. `BusinessMilestone` at 0 records is **untraced to a requirement in this org**, not "dead"; its sharing model (Private OWD, no sharing rules) remains an open question regardless of record count (carried over from the permission-set work earlier this engagement, tracked against `WMT2-171`).

## Users

15 active users. Profile breakdown: System Administrator (1), FF Wealth Standard User (2), Einstein Agent User (3), plus a handful of standard Salesforce integration-user profiles (Analytics Cloud Security/Integration User, SalesforceIQ Integration User, Chatter Free User) and 4 users with no readable profile name (likely automated/platform users). Only one genuinely custom profile-driven persona (`FF Wealth Standard User`) — most access control in this org runs through permission sets and permission set groups (`FF_Wealth_Advisor`, `FF_Client_Servicing`) layered on a minimal profile, consistent with FSC/Industries best practice.

## Observations

- This is a **small, focused, hand-built Wealth Management template** — not a sprawling demo org. Almost everything custom carries the `FF_` prefix (all 22 flows, 24 of 25 permission sets); the exceptions worth tracking are the 4 custom objects/metadata type and the native FSC standard objects that ship without a namespace.
- FSC here is **native/unlocked, not a managed package** — this is a material finding for anyone packaging this template or comparing it against older FSC-managed-package builds; `force__*` permission-set-group references in the metadata are leftovers from that older model and should be reviewed (Temporal classification), not assumed broken.
- The product mix (Bank Account / Investment / Mortgage / Pension / Protection) is consistently modelled across Opportunity and FinancialAccount record types — a strong, deliberate design choice, not incidental.
- Three custom objects extend the FSC data model directly: `FF_Application__c` (10 records) and `FF_Application_Form_Product_Participant__c` sit alongside standard `ApplicationForm`; `FF_Client_Vulnerability__c` (7 records) replaces what used to be flow-based vulnerability logging (per this session's discussion) with a proper trackable object; `Historic_Valuation__c` (6 records) is a point-in-time valuation snapshot object.
- No Experience Cloud site exists in this org at all — any client-facing/self-service capability work is out of scope for this template as it stands.
- Two Fact-Find-agent-specific permission sets (`FF_FactFind_Agent...`) and the `ffAiFactFind` LWC/Apex pair are the only non-declarative, Apex-backed capability in the org — this is the AI Fact Find feature that lives separately in the `ff-wm-factfind-agent` project and is explicitly **out of scope** for this template packaging exercise.
