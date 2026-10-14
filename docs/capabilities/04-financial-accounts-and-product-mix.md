# Financial Accounts & Product Mix

## What it is
The core sales-to-servicing handoff: when an Opportunity (Bank Account / Investment / Mortgage / Pension / Protection) closes won, a matching FinancialAccount is created or reused, record-typed to match the Opportunity, and the right `FinancialAccountParty` records are built — one party for a Person Account, one per Contact Role for a Household. Regulator changes on a Product propagate down to every FinancialAccount linked to it. `Historic_Valuation__c` captures point-in-time market valuations per FinancialAccount/security holding.

The capability also carries the account's full financial position: Financial Goals (surfaced on the Person Account via an OmniStudio FlexCard), Holdings (`SecuritiesHolding`), Valuations (`Historic_Valuation__c`) and Transactions/Balances (`FinancialAccountTransaction`, `FinancialAccountBalance`), each used as a standard FSC object apart from the three `FF_`-prefixed fields on `SecuritiesHolding`. Confirmed directly against live `dev26` metadata and data on 13 October 2026.

## Apps
`FF_Wealth_Management`.

## Record types
Opportunity: 5 (Bank Account, Investment, Mortgage, Pension, Protection) — mirrored exactly on FinancialAccount's 5 record types.

## Key objects + key custom fields
- FinancialAccount, FinancialAccountParty, Opportunity, Product2.
- `Historic_Valuation__c` (`FF_Financial_Account__c`, `FF_Market_Value__c`, `FF_Market_Value_Date_Time__c`, `FF_Price__c`, `FF_Provider__c`, `FF_Securities_Holding__c`, `Shares__c`, `FF_Status__c`).
- `FinancialGoal` (standard FSC object, no custom fields; 17 live records) — accessed from the Person Account via an OmniStudio FlexCard (`FinancialGoals`) embedded on `FF_Person_Account_Record_Page`.
- `SecuritiesHolding` (standard FSC object; 36 fields, 3 custom — `FF_Historic_Valuation__c` lookup to `Historic_Valuation__c`, `FF_Provider__c`, `FF_Financial_Account_Identifier__c`; 1 live record) — Holdings.
- `FinancialAccountTransaction` (standard FSC object, no customization; 1 live record) — Transactions.
- `FinancialAccountBalance` (standard FSC object, no customization; 8 live records) — Balances.

## Reports
Two FFReports-folder reports, both embedded as report-chart components on `FF_Financial_Account_Record_Page`:
- `Financial_Account_Balance_Uyu` ("Balance Amount Over Time") — line chart on `FinancialAccountBalance.Amount`, grouped by date and type, filtered to the Financial Account.
- `Market_Valuation_nDJ` ("Market Value Over Time") — line chart on `Historic_Valuation__c.FF_Market_Value__c`, grouped by valuation date.

## Automation
- `FF_Opportunity_Create_Financial_Account` (AutoLaunchedFlow, Opportunity Closed Won) — core sales-to-servicing handoff described above.
- `FF_Product_Update_Regulator` (AutoLaunchedFlow) — propagates regulator change from Product2 to related FinancialAccounts.
- `FF_Update_Regulator` (Flow) — screen flow routing by Product vs FinancialAccount origin, based on a record-number prefix check.

## UI
Standard FinancialAccount/Opportunity pages; `FF_Update_Regulator` is launched as an Action Launcher screen flow. `FF_Person_Account_Record_Page` embeds the `FinancialGoals` OmniStudio FlexCard; `FF_Financial_Account_Record_Page` embeds the two report charts above.

## Opportunities
This capability also realises five per-product Brain products: *Bank Account*, *Investment*, *Mortgage*, *Pension* and *Protection — Opportunities, Opportunity Contacts and Teams* (Jira `WMT2-22` through `WMT2-26`). Mortgage is the only one currently marked `Published` in the Brain catalogue; the other four show `Status__c = None` despite the underlying Opportunity record-type and handoff logic being built and shared across all five — a write-back candidate to flag to the Brain owner, not to action directly (agents never write to production Brain records).

## Personas
`FF_Opportunity`, `FF_Products`, `FF_Fund_Switch_Fields` permission sets.

## Integrations
None found.

## Extract potential
**HIGH** — the Opportunity-to-FinancialAccount handoff (with Person-vs-Household party resolution and dedupe-by-account-number) is a strong, broadly-needed FSC pattern.

## Jira
Fully represented despite the Brain gap below — epic `WMT2-50` (Financial Account Opening) with children `WMT2-166` (Financial Account Creation), `WMT2-339` (Financial Account Party Creation), `WMT2-352` (Financial Account Types), `WMT2-353` (Link to Opportunity). All four checked directly against `FF_Opportunity_Create_Financial_Account` this session and confirmed accurate; `WMT2-353` was stuck at Backlog despite the build already meeting it and has been transitioned to UAT to match its siblings.

## Open questions / looks broken
- No Brain product currently names this specific capability (the Opportunity→FinancialAccount handoff). Closest adjacent catalogue entries are Applications (WM-301) and Financial Summaries and Rollups (WM-508), neither of which actually covers it — **flagging as a second catalogue gap**, separate from the Lead Conversion one already proposed. This is a Brain catalogue gap only — the Jira backlog already covers the capability accurately (see Jira section above).
- `FF_Update_Regulator`'s prefix-based routing (reading the first three digits of a record number to decide the path) is a mild cross-object-hack pattern worth a closer look under the antipatterns lens if this gets reused elsewhere.
