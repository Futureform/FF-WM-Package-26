# Pre-deployment log: wmtemplate-new (first template-org deploy)

Org: `futureformwealthtemplate-dev-ed` (Developer Edition, org ID 00Dd300000Az1UTEAZ), alias `wmtemplate-new`.
Run date: 2026-11-15. Baseline: `package/` from `main`, dry-run 1 = Failed, 874/1039 components, 165 errors (settings not enabled).

Source of the step list: Confluence FAT "Wealth Management Template Deployment Guide" (page 821133313, last edited 25 Mar 2026) and `package/README.md`. Both list the same 14 steps.

## Steps

| # | Step (guide wording) | Method | Metadata key / UI path | Status |
|---|---|---|---|---|
| 1 | Enable Account Teams | Metadata (`Settings:Account`) | `enableAccountTeams` | Done |
| 2 | Enable Account-Contact Relationships | Setup UI only. Setting `enableRelateContactToMultipleAccounts` through metadata sets the flag but never creates the `AccountContactRelation` object, and the UI then refuses to disable it. Fix used: set flag false via metadata, then tick and save in Setup > Account Settings | Setup > Account Settings | Done 2026-11-15 |
| 3 | Enable Opportunity Teams | Metadata (`Settings:Opportunity`) | `enableOpportunityTeam` | Done |
| 4 | Enable Person Accounts | Setup UI (permanent, cannot be undone; needs a business Account record type first and the org-impact acknowledgement) | Setup > Person Accounts | Done 2026-11-15 |
| 5 | Enable Financial Account Management standard objects | Metadata (`Settings:Industries`) | `enableFinancialAccountMgmt` | Done |
| 6 | Enable Financial Summary Rollups for standard objects | Metadata (`Settings:Industries`) | `enableFinSummaryRollupMgmt` | Done |
| 7 | Enable Standard Group Membership | Metadata (`Settings:Industries`) | `enableGroupMembershipPref` | Done |
| 8 | Enable Interaction Summaries | Metadata (`Settings:Industries`) | `enableInteractionSummaryPref` | Done |
| 9 | Show Closed Statuses in Case Status Field | Setup UI (no metadata key found) | Support Settings (Setup > CaseSettings) | Done, saved and re-checked |
| 10 | Enable Country Picklists | Setup UI | State and Country/Territory Picklists | Done 2026-11-15 (see detail). Earlier note that it was already on was wrong: dry-run 2 fails with `Account.ShippingCountryCode` does not exist. Needs 3 UI steps: (1) scan standard address data, done 2026-11-15; (2) convert/map text values, auto-mapped 6 countries and many US states, SINGAPORE and UK (one sample record each) mapped to "Unknown value" because no real state matches; (3) last step is Confirm Changes > "Finish and Enable Picklists" (not "Enable Picklists" on the overview, which stays greyed out until then). Clicked with approval; cannot be undone. Salesforce converts in the background; country code fields existed within a minute |
| 11 | Custom Address Fields | Metadata (`Settings:CustomAddressField`) | `enableCustomAddressField` | Done |
| 12 | Enable Middle Names | Metadata (`Settings:Name`) | `enableMiddleName` | Done |
| 13 | Enable On-Demand Record Roll-Ups | Metadata (`Settings:Industries`) | `enableOnDemandRecordRollupPref` | Done |
| 14 | Enable Data Pipeline | Setup UI (no metadata key found) | Setup > Data Pipeline > Getting Started toggle | Done |

## Additional steps found while doing it (not in the Confluence guide)

| Step | Why | Method | Status |
|---|---|---|---|
| Enable Account field history tracking | `FF_Communication_Preferences__c` and `FF_Marital_Status__c` use history tracking; deploy fails with "Account does not have history tracking enabled" | Metadata (`Settings:Account`, `enableAccountHistoryTracking`) | Done |
| Create a business Account record type before enabling Person Accounts | The Person Accounts readiness check requires one. The package's own `FF_Business` record type cannot be deployed first: it references picklist fields and values that are not in the org yet | Deployed a bare `FF_Business` record type (label "FF Business", no picklist values); the package deploy then updates it | Done |

## Package findings (to fix in the repo)

- `Account` record types `FF_Business` and `default` still reference the stripped sample fields `CustomerPriority__c`, `SLA__c`, `UpsellOpportunity__c`, `Active__c`, although the README says they were removed.
- `FF_Business` references `AccountSource` value "Conference", which does not exist in the target org's standard value set.
- No `Account.Person*` or Person Account record type ships; Person Accounts must be on before deploy (step 4).

## Dry-run 2 (after all pre-deploy steps)

Result: Failed, 1144/1185 components, 41 errors (down from 165). 

| Cause | Count | Components | Kind |
|---|---|---|---|
| Country/State picklists not enabled (step 10) | 3 | Flow `FF_Document_Checklist_Item_Change_of_Details_Accepted` (`ShippingCountryCode`); list views `Account.Business_List_View`, `Account.Clients` (`ADDRESS1_STATE_CODE`) | Pre-deploy step missed |
| Org-specific user in assignment rules | 2 | `Case.Standard`, `Lead.Standard` assign to `wmcoredev26@futureform.uk` | Package bug |
| Content assets belong to `CustomerInsights` library, not in target org | 6 | `arrows`, `background`, `crm_analytics_icon`, `crm_analytics_icon_small`, `expand_icon`, `help_centerpng` | Package bug (CRM Analytics images, likely not needed) |
| Opportunity record types reference stripped `Clinical_Stage__c` | 5 | `FF_Bank_Account`, `FF_Investment`, `FF_Mortgage`, `FF_Pension`, `FF_Protection` | Package bug |
| `AccountContactRelation` not accessible / related-list fields invalid | 9 | Flows `FF_Household_Naming_*` (3), `FF_Lead_Conversion`; layouts Account, Contact, Applicant (2), ApplicationForm; Contact FlexiPage | Cause not yet known; to investigate |
| Record Aggregation Definitions need `BatchCalcJobDefinition RECORD_AGGREGATION_DEFINITION` | 2 + 3 dependants | `Financial_Accounts`, `Household_Financial_Accounts`; flows `FF_Scheduled_*_Financial_Summary` (2); FlexiPage `FF_Party_Relationship_Group_Record_Page` | Possibly a missing pre-deploy setting (`enableRecordRollup` is still false); to test |
| Action Launcher deployments not in package | 5 | FlexiPages Case, Document Checklist Item, Financial Account, Lead, Product (`CaseChangeofDetails`, `UpdateStatus`, `UpdateRegulator`, `LeadChangeOfDetails`) | Package gap |
| References to excluded items | 4 | FlexiPage `FF_Person_Account_Record_Page` (`c:ffAiFactFind`); FlexiPage `FF_Business_Account_Record_Page` (quick action `ApplicationForm.FF_Complete_Review_Form`); Workflow `FF_Application__c`; CustomApplication `FF_Wealth_Management` (RecordType) | Package bug |
| Person Account record type `PersonAccount.FF_Person_Acount` not shipped | 1 | PermissionSet `FF_Accounts` | Package gap (note the spelling) |

Full list is in the scratchpad `remaining.txt`.

## Dry-run 3 (after country picklists enabled)

Result: Failed, 1146/1185 components, 39 errors. All 14 guide steps plus the two extra steps are now done. The 3 country-picklist errors are gone; the rest are unchanged from dry-run 2, except `Account.Clients` list view now reports the missing person record type `PersonAccount.FF_Person_Acount` (same cause as `FF_Accounts`). Next work is in the package, not the org.

## Findings after dry-run 3 (package fixes and org comparison with dev26)

- Added step: Record Rollups (`Settings:Industries` `enableRecordRollup`). dev26 has it on, the new org did not. Done via metadata.
- The package was missing 3 `BatchCalcJobDefinition` (`RECORD_AGGREGATION_DEFINITION`, `FF_Client_Financial_Account_Summary`, `FF_Household_Financial_Account_Summary`), 6 `RecordActionDeployment` and 1 `ActionLauncherItemDef`, all referenced by pages and flows. Retrieved from dev26 and added.
- `Case.Standard` (active) and `Lead.Standard` (inactive) assignment rules were Salesforce sample rules assigning to the dev26 user by US country and the removed `SLA__c` field. Removed; Case file deleted because it held only that rule.
- Blocker: `AccountContactRelation` is in the org's metadata but is not queryable or describable (dev26 has 91 records). Setting `enableRelateContactToMultipleAccounts` through metadata, and re-saving Account Settings in the UI, did not activate it. About 17 of the remaining 20 dry-run errors follow from this. The next thing to try is switching the setting off and on again in Setup, which Salesforce warns permanently deletes extra contact-account relationships (there are none); waiting for the owner's approval.

## Dry-run 10 (after ACR activation and package additions)

Result: Failed, 1178/1183 components, 5 errors (down from 165).
- 3 layouts (`Applicant-Applicant Layout`, `Applicant-FF Applicant Page Layout`, `ApplicationForm-Application Form Layout`): related lists use objects that exist in dev26 but not in the new org (`ApplicantApplicantRelation`, `ApplicationFormTerm`, `Term`, plus the `PartyProfile` family). dev26 has `enableIndustriesKYC`, `enableIndustriesAssessment` on; the new org has both off. Not yet enabled: could not confirm whether the KYC setting can be turned off again.
- 2 record action deployments (`AccountChangeofDetails`, `CaseChangeofDetails`) say their flow is inactive. All referenced flows are Active in the package, so this may be a check-only artifact; confirm with a real deploy.

## Discovery Framework (tested, not the cause)

Enabled Setup > Discovery Framework > General Settings > Discovery Framework on 2026-11-15 with approval (permanent; Salesforce says it cannot be disabled). Enhanced Questions switched on with it. Result: `Assessment` and `AssessmentQuestion` appeared, but `ApplicationFormTerm`, `Term` and `ApplicantApplicantRelation` did not, and dry-run stayed at 5 errors. Discovery Framework is therefore NOT required to deploy the package and is not on the pre-deploy list. Next candidate: Setup > Financial Services > General Settings > Know Your Customer (currently Disabled; Record Rollup Optimization is Enabled).

## Digital Lending licence (the actual cause of the 3 layout errors)

`ApplicationFormTerm`, `Term` and `ApplicantApplicantRelation` only exist for a user with the Digital Lending permission set licence. dev26's admin has `DigitalLendingPsl` assigned; the new org had 70 licences and 0 used. Fixed 2026-11-15 with `sf org assign permsetlicense --name DigitalLendingPsl` and `sf org assign permset --name DigitalLending` for `wealthtemplate@futureform.uk`. Dry-run went from 5 errors to 2. Added as README Step B2 and table row 17.

Enabled while investigating, NOT required by the package: Discovery Framework (permanent) and Know Your Customer (enabled by the owner; created `PartyProfile`). Neither is on the pre-deploy list. Both are now on in this org, so a clean-org run would not exercise them.

Dry-run 13: Failed, 1181/1183, 2 errors: `AccountChangeofDetails` and `CaseChangeofDetails` record action deployments say their flow is inactive, although every flow they reference is Active in the package. Likely a check-only artifact; needs a real deploy to confirm.

## Real deploy 2026-11-15

A single-pass real deploy failed on the same 2 errors (record action deployments `AccountChangeofDetails` and `CaseChangeofDetails`: "flow is inactive"); the org rolled back. Cause: flows are activated at the end of a deployment, so deployments that depend on active flows fail in the same transaction. Fix: moved those 2 deployments, the 2 pages that use them (`FF_Case_Record_Page`, `FF_Person_Account_Record_Page`) and the app `FF_Wealth_Management` into `package/force-app-late` and deploy in two passes.

- Pass 1 (`force-app`): Succeeded, 1178/1178, 0 errors (id 0Afd3000005TxEjCAK).
- Pass 2 (`force-app-late`): Succeeded, 5/5, 0 errors (id 0Afd3000005TxHxCAK).
- 5 flows are Draft after deploy, matching dev26 and the package.

Not a clean-reset proof: this org already had Discovery Framework and Know Your Customer enabled, and a hand-run settings sequence rather than the `pre-deploy/` package. A run on a second fresh org following only the README is still needed.

## Notes

- Settings metadata used for steps 1-3, 5-8, 11-13 lives in the scratchpad project `pre/enable` and deployed 5/5 components (Account, Opportunity, CustomAddressField, Name, Industries).
- Org licences already present: FSC Comprehensive/Sales/Service PSLs, Action Plans PSL, Financial Services Cloud Extension.
- Person Accounts cannot be turned off once enabled.

## Path (found 2026-11-24)

Path (Setup > Path Settings) is an org-wide setting and was never part of the pre-deploy steps. With it off, a deployed path does nothing and the Path component falls back to the standard Stage path. Added `pre-deploy/force-app/main/default/settings/PathAssistant.settings-meta.xml` (`pathAssistantEnabled` true) to Step A and README row 17. Dry-run validated against wmtemplate-new, where Path had been enabled by hand. Not yet run on a fresh org where Path is off. The package also ships no paths other than the periodic review path (WMT2-807); the dev26 paths are listed in the WMT2-807 follow-up.
