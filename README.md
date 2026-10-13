# FF Wealth Management Core Template — Org Analysis

Full rediscovery-lens analysis of **WM Core Dev 2026** (`dev26`), Futureform's hand-built Wealth Management core template org. This repo documents what's actually in the org, maps it to the Bob's Brain product catalogue and Jira (`WMT2`), and identifies what's worth packaging into a standalone, publicly deployable `FF-WM-Package`.

## Org identity

| Field | Value |
| --- | --- |
| Org name | WM Core Dev 2026 |
| Alias | `dev26` |
| Org ID | `00DQH00000LB3Mf2AL` |
| Edition | Developer Edition |
| Instance | GBR58 |
| Created | 2026-03-05 |
| API version at retrieval | 66.0 |
| Namespace | None (unlocked/native org) |

## What's in the org — numbers at a glance

| | Count |
| --- | --- |
| Custom objects | 4 |
| Custom metadata types | 1 |
| Apex classes | 2 (AI Fact Find agent only) |
| LWC bundles | 1 (AI Fact Find agent only) |
| Flows | 22 (20 Active, 2 Draft/other) — all Futureform-built |
| Permission sets | 25 (24 Futureform-built) |
| Permission set groups (custom) | 2 |
| Record types | 15 across 13 objects |
| Custom Lightning apps | 1 (`FF_Wealth_Management`) |
| Quick actions | 29 |
| FlexiPages | 53 |
| Experience Cloud sites | 0 |
| Installed packages | 2 (Sales Insights, Merge Connect — neither Futureform-built) |
| Active users | 15 |

## What this org is

A focused retail wealth-management template built on **native Financial Services Cloud** (standard objects, no managed-package namespace) spanning a consistent five-product mix — Bank Account, Investment, Mortgage, Pension, Protection — modelled identically across Opportunity and FinancialAccount record types. Almost everything custom carries the `FF_` prefix. Ten distinct capabilities were identified (see capability map), plus a separately-scoped AI Fact Find agent that lives in its own `ff-wm-factfind-agent` project and is deliberately excluded from this template's packaging.

## How to navigate this repo

- **[docs/01-overview.md](docs/01-overview.md)** — Pass 1: org identity, licences, metadata/record counts, users, headline observations.
- **[docs/capabilities/](docs/capabilities/)** — Pass 2: one doc per capability, starting from the [capability map](docs/capabilities/00-capability-map.md).
- **[docs/extract-candidates.md](docs/extract-candidates.md)** — Pass 3: everything worth lifting into `FF-WM-Package`, tiered by reuse breadth and effort.
- **[retrieve/](retrieve/)** — the raw retrieved metadata this analysis is built from (sfdx project, batches A–E).

## Capability docs

| # | Capability | Brain product | Match |
| --- | --- | --- | --- |
| 1 | [Prospects & Lead Conversion](docs/capabilities/01-prospects-and-lead-conversion.md) | Prospects (WM-201) / new product proposed | Partial |
| 2 | [Households & Relationships](docs/capabilities/02-households-and-relationships.md) | Households and Household Teams (WM-203) | Full |
| 3 | [Applications & Onboarding](docs/capabilities/03-applications-and-onboarding.md) | Applications (WM-301) | Full |
| 4 | [Financial Accounts & Product Mix](docs/capabilities/04-financial-accounts-and-product-mix.md) | none identified | Gap |
| 5 | [Financial Summaries & Rollups](docs/capabilities/05-financial-summaries-and-rollups.md) | Financial Summaries and Rollups (WM-508) | Full |
| 6 | [Client Servicing & Change of Details](docs/capabilities/06-client-servicing-and-change-of-details.md) | none identified | Gap |
| 7 | [Client Vulnerability Management](docs/capabilities/07-client-vulnerability-management.md) | Client Vulnerability Management (WM-706) | Full — stories need reconciliation |
| 8 | [Reviews](docs/capabilities/08-reviews.md) | none identified | Gap |
| 9 | [Campaigns & Client Engagement](docs/capabilities/09-campaigns-and-client-engagement.md) | none identified | Gap (low priority) |
| 10 | [Access & Security](docs/capabilities/10-access-and-security.md) | Access and Security (WM-2) | Full |
| — | AI Fact Find Agent | n/a | Out of scope for this repo |

## Extract candidates — all tiers

Full detail in [docs/extract-candidates.md](docs/extract-candidates.md). Summary:

**Top tier**

| What | Where | Effort | Why |
| --- | --- | --- | --- |
| Household-aware Lead Conversion | `FF_Lead_Conversion` flow | Low | Core FSC wealth pattern |
| Opportunity → FinancialAccount handoff | `FF_Opportunity_Create_Financial_Account` flow | Medium | Person/Household party resolution + dedupe |
| Scheduled Financial Summaries | 2 flows + Record Aggregation permission sets | Low | No custom Apex rollups |
| Permission-set/PSG access architecture | 25 permission sets, 2 PSGs | Low | Everything else depends on it |
| Client Vulnerability Management object | `FF_Client_Vulnerability__c` | Low | Trackable, multi-record, time-bound |

**Second tier**

| What | Where | Effort | Why |
| --- | --- | --- | --- |
| Applications/Participant data model | 2 custom objects + 3 flows | Medium | Multi-participant tracking |
| Document-checklist auto-expiry | `FF_DocumentChecklistItem_Scheduled` | Low | Simple, reusable |
| Historic Valuation snapshot | `Historic_Valuation__c` | Medium | Point-in-time valuations |
| Regulator propagation | 2 flows | Medium | Compliance sync |
| Change-of-details Case pattern | 9 flows (needs consolidation) | High | Duplicated 4x — fix before lifting |

**Third tier** — `FF_Case_CloseCase`, `FF_Closed_Opportunity_Account_Type_Update`, `FF_Review_Outcome_Builder`/`FF_ReviewWording__mdt`, `FF_Action_Plan_Creation_Document_Upload`, `FF_CRMA_Integration_FSC_Objects`, `FF_Fund_Switch_Fields`, `FF_Update_Regulator`, Household/Party permission sets.

**Fourth tier** — `FF_Send_Emails`, `FF_Interaction_Summaries`, `FF_CampaignsPermissionSet`, `FF_Activity_Management`, `FF_Accounts`/`FF_Contacts`/`FF_Leads`.

**Not recommended** — AI Fact Find Agent (separate repo), `force__*` Industries PSGs, standard apps, Sales Insights/Merge Connect packages.

## Glossary

| Term | Meaning |
| --- | --- |
| FSC | Financial Services Cloud — native/unlocked in this org, not a managed package |
| WM | This org's Wealth Management vertical |
| `FF_` prefix | Futureform-built metadata, used consistently throughout |
| `WMT2` | The live Jira board for this engagement |
| `JIRA_UID__c` | Brain's own internal product code (looks like a Jira key, e.g. `WM-2` — it is not one) |
| `JIRA_URL__c` | The actual live link from a Brain product to its Jira epic |

## Scope

- **In scope**: full metadata retrieval and capability analysis of `dev26`, Brain catalogue matching, extract-candidate tiering.
- **Out of scope**: the AI Fact Find agent (separate project/repo); Experience Cloud (none exists in this org); detailed FLS/sharing-matrix audit beyond what surfaced incidentally (the PartyRoleRelation/BusinessMilestone OWD gap is flagged, not exhaustively audited).
- Security/FLS was not deprioritised globally, but a full profile-by-profile FLS matrix was not run — flagged where gaps were found, not assumed absent elsewhere.

## How to re-run

Re-run the `analyse-salesforce-org` skill against `dev26` (or any other alias) to refresh this analysis. Retrieval manifests live in `retrieve/manifest/package-a-code.xml` through `package-e-sites-integ-ai.xml`.

## Caveats

- Snapshot date: 2026-10-13 (today). Org is a non-authoritative dev org — low record counts are not evidence of disuse.
- Batch E retrieval reported `ExperienceBundle`/`Network` as "not available in this organization" — confirmed there is no Experience Cloud site, not a retrieval failure.
- `FF_Review_Outcome_Builder` flow has no label/description populated in source — its exact behaviour is unconfirmed pending a direct look in Flow Builder.

## Repo layout

```
.
├── README.md                     # this file
├── docs/
│   ├── 01-overview.md            # Pass 1
│   ├── capabilities/             # Pass 2 — one doc per capability + cross-reference map
│   └── extract-candidates.md     # Pass 3
└── retrieve/                     # raw sfdx project + retrieved metadata + manifests (Setup)
```

## Commit history

1. `chore: raw metadata retrieval baseline from dev26` — Setup
2. `docs: pass 1 — org overview`
3. `docs: pass 2 — capability map`
4. `docs: pass 3 — extract candidates`
5. `docs: pass 4 — index` (this commit)

## Open threads

1. **PartyRoleRelation/BusinessMilestone sharing gap** — Private OWD, no sharing rules found. Three remediation options were presented earlier in this engagement and never decided. Correction: `WMT2-171` ("OWD + Sharing Rules") does **not** actually name these two objects — its description is empty — so this is not yet represented by any specific story; it needs one written, not just a status check. Separately, dev26 holds ~30 live `PartyRoleRelation` records — this is data, not metadata, so it won't travel with any package/retrieval; needs a seed script or a documented manual post-deployment step for target orgs.
2. **Client Vulnerability Management Jira stories are stale** — `WMT2-71`'s child stories describe the old flow-based vulnerability logging that no longer exists; the current build is a trackable custom object. Stories need amending or cancelling — the concrete first case for the Jira reconciliation pass.
3. **Three Brain catalogue gaps found** — these are gaps in the FFProduct__c catalogue only; both (b) and (c) already have accurate, confirmed Jira representation (verified this session): (a) Lead Conversion creating a Household + Application on conversion — new product drafted this session, pending approval; (b) the Opportunity → FinancialAccount handoff capability — Jira epic `WMT2-50` + 4 children, all confirmed against build, one status correction made; (c) the Case-driven change-of-details servicing pattern — Jira epic `WMT2-70` + 14 children, confirmed against build, flow-duplication debt flagged on the epic. Decisions needed on whether (b) and (c) also warrant new/enriched Brain products, independent of the Jira question (which is now closed).
4. **Resolved** — `force__FinancialServicesCloudExtension` (and 4 sibling `force__` permission sets) inside `FF_Wealth_Advisor` are confirmed real, standard Salesforce FSC/Industries permission sets, not dangling references. No change needed; ships as-is. Packaging note: a target org needs FSC provisioned for these to resolve.
5. **Duplicated change-of-details flows** — four near-identical `FF_Case_Update_*` flows (Address/ClientName/DateOfBirth/MaritalStatus) should be consolidated into one parameterised flow before extraction; flagged as an automation-duplication pattern.
6. **Resolved** — `FF_Review_Outcome_Builder` is a colleague-built flow related to a separate "Meeting Concierge" capability, not part of this template. Left out of packaging; not pursuing further.
7. **`FF_Application__c` vs standard `ApplicationForm`** — whether the custom object duplicates fields already available natively is untested; a simplicity-check pass is recommended before this gets packaged as a template others deploy.
