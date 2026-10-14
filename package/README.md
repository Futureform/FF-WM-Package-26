# FF-WM-Package — Wealth Management Core Template

A clean, deployable sfdx project built from the `dev26` rediscovery analysis in this repo (see root [README.md](../README.md)). This is the scoped, curated subset of the org worth shipping as a reusable Wealth Management template — the AI Fact Find agent, demo cruft and cross-industry sample fields excluded.

Validated with a dry-run deploy against `dev26`: `0` component errors, `1178`/`1178` components.

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

Before deploying into a target org, enable the following in Setup (per the [Wealth Management Template Deployment Guide](https://futureform.atlassian.net/wiki/spaces/FAT/pages/821133313)):

- Enable Account Teams
- Enable Account-Contact Relationships (Account Settings)
- Enable Opportunity Teams
- Enable Person Accounts
- Enable Financial Account Management Standard Objects (Financial Account Settings)
- Enable Financial Summary Rollups for Standard Objects (Financial Summary Rollup Settings)
- Enable Standard Group Membership (Group Membership Settings)
- Enable Interaction Summaries
- Check "Show Closed Statuses in Case Status Field" (Support Settings)
- Enable Country Picklists (State and Country/Territory Picklists)
- Check "Custom Address Fields" (User Interface)
- Check "Enable Middle Names" for Person Names (User Interface)
- Enable On-Demand Record Roll-Ups (Record Rollup Settings)
- Enable Data Pipeline (Data Pipeline settings)

## Deploy

```
sf project deploy start --target-org <alias> --source-dir force-app
```

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
