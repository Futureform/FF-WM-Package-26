# Financial Accounts & Product Mix

## What it is
The core sales-to-servicing handoff: when an Opportunity (Bank Account / Investment / Mortgage / Pension / Protection) closes won, a matching FinancialAccount is created or reused, record-typed to match the Opportunity, and the right `FinancialAccountParty` records are built — one party for a Person Account, one per Contact Role for a Household. Regulator changes on a Product propagate down to every FinancialAccount linked to it. `Historic_Valuation__c` captures point-in-time market valuations per FinancialAccount/security holding.

## Apps
`FF_Wealth_Management`.

## Record types
Opportunity: 5 (Bank Account, Investment, Mortgage, Pension, Protection) — mirrored exactly on FinancialAccount's 5 record types.

## Key objects + key custom fields
FinancialAccount, FinancialAccountParty, Opportunity, Product2, `Historic_Valuation__c` (`FF_Financial_Account__c`, `FF_Market_Value__c`, `FF_Market_Value_Date_Time__c`, `FF_Price__c`, `FF_Provider__c`, `FF_Securities_Holding__c`, `Shares__c`, `FF_Status__c`).

## Automation
- `FF_Opportunity_Create_Financial_Account` (AutoLaunchedFlow, Opportunity Closed Won) — core sales-to-servicing handoff described above.
- `FF_Product_Update_Regulator` (AutoLaunchedFlow) — propagates regulator change from Product2 to related FinancialAccounts.
- `FF_Update_Regulator` (Flow) — screen flow routing by Product vs FinancialAccount origin, based on a record-number prefix check.

## UI
Standard FinancialAccount/Opportunity pages; `FF_Update_Regulator` is launched as an Action Launcher screen flow.

## Personas
`FF_Opportunity`, `FF_Products`, `FF_Fund_Switch_Fields` permission sets.

## Integrations
None found.

## Extract potential
**HIGH** — the Opportunity-to-FinancialAccount handoff (with Person-vs-Household party resolution and dedupe-by-account-number) is a strong, broadly-needed FSC pattern.

## Open questions / looks broken
- No Brain product currently names this specific capability (the Opportunity→FinancialAccount handoff). Closest adjacent catalogue entries are Applications (WM-301) and Financial Summaries and Rollups (WM-508), neither of which actually covers it — **flagging as a second catalogue gap**, separate from the Lead Conversion one already proposed.
- `FF_Update_Regulator`'s prefix-based routing (reading the first three digits of a record number to decide the path) is a mild cross-object-hack pattern worth a closer look under the antipatterns lens if this gets reused elsewhere.
