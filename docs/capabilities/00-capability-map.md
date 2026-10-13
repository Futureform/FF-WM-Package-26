# Capability Map — WM Core Dev 2026

Cross-reference of every Futureform-built capability found in `dev26`, derived from flow labels/descriptions, permission sets, record types and the Brain catalogue (`FFProduct__c`). Standard/Industries platform scaffolding (`force__*` apps and permission set groups, standard Salesforce apps) is excluded — it is not Futureform-built.

| # | Capability | Key objects | Automation | Brain product (JIRA_UID) | Brain match |
| --- | --- | --- | --- | --- | --- |
| 1 | [Prospects & Lead Conversion](./01-prospects-and-lead-conversion.md) | Lead, Account (Household/Person) | `FF_Lead_Conversion`, `FF_Closed_Opportunity_Account_Type_Update` | Prospects (WM-201) / gap for conversion itself | Partial |
| 2 | [Households & Relationships](./02-households-and-relationships.md) | PartyRelationshipGroup, PartyRoleRelation, BusinessMilestone | declarative via permission sets only | Households and Household Teams (WM-203) | Full |
| 3 | [Applications & Onboarding](./03-applications-and-onboarding.md) | ApplicationForm, `FF_Application__c`, `FF_Application_Form_Product_Participant__c`, DocumentChecklistItem | `FF_DocumentChecklistItem_*` (3 flows) | Applications (WM-301) | Full |
| 4 | [Financial Accounts & Product Mix](./04-financial-accounts-and-product-mix.md) | FinancialAccount, FinancialAccountParty, Opportunity, Product2, `Historic_Valuation__c` | `FF_Opportunity_Create_Financial_Account`, `FF_Product_Update_Regulator`, `FF_Update_Regulator` | none identified | Gap |
| 5 | [Financial Summaries & Rollups](./05-financial-summaries-and-rollups.md) | AccountFinancialSummary, RecordAggregationAccess/Result | `FF_Scheduled_Account_Financial_Summary`, `FF_Scheduled_Household_Financial_Summary` | Financial Summaries and Rollups (WM-508) | Full |
| 6 | [Client Servicing & Change of Details](./06-client-servicing-and-change-of-details.md) | Case, ActionPlan, DocumentChecklistItem | 9 `FF_Case_*` / `FF_Update_*` / `FF_Action_Plan_*` flows | none identified | Gap |
| 7 | [Client Vulnerability Management](./07-client-vulnerability-management.md) | `FF_Client_Vulnerability__c` | written by `FF_FactFind_SaveResults` | Client Vulnerability Management (WM-706 / WMT2-71) | **Full match, but stories stale — see open questions** |
| 8 | [Reviews](./08-reviews.md) | Case/Opportunity review process, `FF_ReviewWording__mdt` | `FF_Review_Outcome_Builder` | none identified | Gap |
| 9 | [Campaigns & Client Engagement](./09-campaigns-and-client-engagement.md) | Campaign, CampaignMember, InteractionSummary | none (permission-set only) | none identified | Gap |
| 10 | [Access & Security](./10-access-and-security.md) | PermissionSet, PermissionSetGroup, Profile | n/a | Access and Security (WM-2) | Full |
| — | AI Fact Find Agent | InteractionSummary, FinancialGoal, PartyFinancialAsset/Liability | `FF_FactFind_AIExtract`, `FF_FactFind_SaveResults` | n/a | **Out of scope** — lives in separate `ff-wm-factfind-agent` repo, not packaged here |

Open threads from this pass are numbered in the root `README.md` once Pass 4 is written.
