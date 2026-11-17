# FF-WM-Package — Wealth Management Core Template

A clean, deployable sfdx project built from the `dev26` rediscovery analysis in this repo (see root [README.md](../README.md)). This is the scoped, curated subset of the org worth shipping as a reusable Wealth Management template — the AI Fact Find agent, demo cruft and cross-industry sample fields excluded.

Validated 2026-11-15 by real deploy to a fresh Developer Edition org after the pre-deployment steps: pass 1 `1178`/`1178` components, pass 2 `5`/`5`, `0` errors.

## Scope

**Included:**
- 30 objects (Account, AccountContactRelation, Applicant, ApplicationForm, ApplicationFormProduct, Campaign, Case, Contact, DocumentChecklistItem, Event, FF_Application_Form_Product_Participant__c, FF_Client_Vulnerability__c, FinancialAccount, FinancialAccountBalance, FinancialAccountFee, FinancialAccountParty, FinancialAccountTransaction, FinancialGoal, Historic_Valuation__c, Interaction, InteractionSummary, Lead, Opportunity, PartyFinancialAsset, PartyFinancialLiability, PartyRelationshipGroup, Product2, SecuritiesHolding, Task, User)
- 21 flows, 21 permission sets, 2 permission set groups, the `FF Wealth Standard User` profile
- 30 FlexiPages, 70 layouts, the `FF_Wealth_Management` Lightning app, 1 tab, 4 quick actions
- 3 queues, assignment rules, document types, relationship graph definitions, record aggregation definitions, report types/reports, standard value sets (customised ones only), static resources, content assets, 2 workflows

**Explicitly excluded:**
- The AI Fact Find agent in full — Apex, LWC, flows, Genie plugins/prompt templates, permission sets (lives separately in `ff-wm-factfind-agent`)
- `FF_Application__c` — assessed against the simplicity check and excluded in favour of standard `ApplicationForm` with the `FF Application` record type, which is lighter and sufficient. Its object, tab, layout, FlexiPage, dedicated onboarding-approvers queue and application overrides are all excluded with it; `FF_Application_Form_Product_Participant__c` is retained (no standard equivalent — its lookups target `Applicant` and `ApplicationFormProduct`, not `FF_Application__c`). See [docs/capabilities/03-applications-and-onboarding.md](../docs/capabilities/03-applications-and-onboarding.md).
- `FF_Review_Outcome_Builder` flow and its quick action, `FF_ReviewWording__mdt` and its records, `FF_Review_Flow_Access` permission set
- `PartyRoleRelation`, `BusinessMilestone`, `AccountFinancialSummary`, `CampaignMember`, `OpportunityContactRole`, `RecordAggregationResult`
- Salesforce default sample-org fields (`CustomerPriority__c`, `SLA__c`, etc.) and cross-industry demo fields (Real Estate/PE/Life Sciences fields on Opportunity) — stripped from Account, Opportunity, Lead, Case, Contact
- Generic org boilerplate: duplicate rules, empty sharing rules, default roles, default remote site settings
- 5 uncustomised standard value sets (`FiscalYearPeriodName`, `Gender`, `IdeaStatus`, `OpportunityCompetitor`, `OrderType`) carrying zero `standardValue` entries — nothing to ship, and an empty file blocks deploy

See [docs/extract-candidates.md](../docs/extract-candidates.md) for the full tiered rationale behind what's reusable.

## Pre-deployment steps

Run these in order against the target org **before** deploying `force-app/`. Verified on 2026-11-15 against a fresh Developer Edition org with Financial Services Cloud licences. Full log with dates, methods and findings: [../docs/predeploy-log.md](../docs/predeploy-log.md).

**Step A: deploy the settings that can be deployed as metadata.** This covers 10 of the 16 steps below and the placeholder `FF_Business` Account record type that Person Accounts needs.

```
cd pre-deploy
sf project deploy start --target-org <alias> --source-dir force-app
```

**Step B: enable Person Accounts** (Setup > Person Accounts). Run the readiness check, acknowledge the org impacts, click Enable. **This is permanent and cannot be undone.** It only becomes available after Step A has created a business Account record type.

**Step B2: assign the Digital Lending licence and permission set to the deploying user.** Without it the objects `ApplicationFormTerm`, `Term` and `ApplicantApplicantRelation` do not exist for that user, and three layouts (Applicant, FF Applicant, Application Form) fail to deploy. The org must hold the Digital Lending permission set licence (`DigitalLendingPsl`).

```
sf org assign permsetlicense --name DigitalLendingPsl --target-org <alias>
sf org assign permset --name DigitalLending --target-org <alias>
```

**Step C: do the remaining UI-only steps** (no metadata setting exists for these):

| Step | Where |
|---|---|
| Allow users to relate a contact to multiple accounts (Account-Contact Relationships). **Do not set this through metadata**: the flag then shows as ticked but the `AccountContactRelation` object is never created, and the checkbox cannot be unticked in Setup. Tick it in the UI | Setup > Account Settings > Edit |
| Check "Show Closed Statuses in Case Status Field" | Setup > Support Settings |
| Enable Data Pipeline | Setup > Data Pipeline > Getting Started (toggle) |
| Enable State and Country/Territory Picklists | Setup > State and Country/Territory Picklists: (1) scan, (2) convert and map every value, (3) Confirm Changes > Finish and Enable Picklists. **Permanent.** Any value with no valid match (for example a non-state in a state field) can only be mapped to "Unknown value" |

**What each step enables:**

| # | Setting | Done by |
|---|---|---|
| 1 | Account Teams | Step A (`Settings:Account`) |
| 2 | Account-Contact Relationships | Step C (UI only) |
| 3 | Opportunity Teams | Step A (`Settings:Opportunity`) |
| 4 | Person Accounts | Step B |
| 5 | Financial Account Management standard objects | Step A (`Settings:Industries`) |
| 6 | Financial Summary Rollups for standard objects | Step A (`Settings:Industries`) |
| 7 | Standard Group Membership | Step A (`Settings:Industries`) |
| 8 | Interaction Summaries | Step A (`Settings:Industries`) |
| 9 | Show Closed Statuses in Case Status Field | Step C |
| 10 | Country and State picklists | Step C |
| 11 | Custom Address Fields | Step A (`Settings:CustomAddressField`) |
| 12 | Middle Names for Person Names | Step A (`Settings:Name`) |
| 13 | On-Demand Record Roll-Ups | Step A (`Settings:Industries`) |
| 14 | Data Pipeline | Step C |
| 15 | Account field history tracking (not in the original guide; `FF_Communication_Preferences__c` and `FF_Marital_Status__c` need it) | Step A (`Settings:Account`) |
| 16 | Record Rollups (not in the original guide; Record Aggregation Definitions need it) | Step A (`Settings:Industries`) |
| 17 | Digital Lending licence and permission set assigned to the deploying user (not in the original guide) | Step B2 |

## Deploy

Deploy in two passes, in this order. The second pass holds the two record action deployments that depend on flows being active, the two record pages that use them, and the app that points at those pages. It also holds the System Administrator profile, which makes the FF Wealth Management app the admin's default and assigns the FF record types and page layouts; the profile has to come after the app it references. A single-pass deploy fails with "Looks like this flow is inactive", because flows are only activated at the end of a deployment.

```
cd package
sf project deploy start --target-org <alias> --source-dir force-app
sf project deploy start --target-org <alias> --source-dir force-app-late
```

Five flows deploy as Draft by design (`FF_Household_Naming_ACR_Change`, `FF_Household_Naming_ACR_Delete`, `FF_Household_Naming_Recalculate`, `FF_Scheduled_Account_Financial_Summary`, `FF_Scheduled_Household_Financial_Summary`); they are Draft in dev26 too.

## Post-deployment steps

This package now ships its own permission sets, permission set groups and profile (`FF Wealth Standard User`), so the record-type, layout and field-access assignment that the Deployment Guide previously called out as a manual, provisional step is largely covered by assigning users to the shipped permission set groups (`FF_Client_Servicing`, `FF_Wealth_Advisor`) rather than hand-configuring System Admin access. Remaining manual steps:

- Activate Action Plan Templates
- Manually populate picklist-driven type values used by the templates where no default ships with the org: Goal Type, Asset Type, Financial Goal Type, Assessment Type, Financial Account Type, Financial Account Transaction Type, Financial Account Fee Type, Financial Account Frequency
- Import Providers and Regulators reference data
- Sync Record Aggregation Definitions into rollups (Setup → Record Rollups → run on-demand sync) — the definitions deploy as metadata but don't auto-populate historical data
- Confirm Party Relationship Group roles match the client's intended relationship taxonomy

## Related

- Root [README.md](../README.md) — full org analysis this package is scoped from
- [docs/capabilities/](../docs/capabilities/) — capability-by-capability detail
- [docs/extract-candidates.md](../docs/extract-candidates.md) — tiered extraction rationale
- [retrieve/](../retrieve/) — the full rediscovery metadata baseline (superset of this package)
