# Financial Summaries & Rollups

## What it is
Scheduled, declarative rollups of a client's or household's financial position, built on the platform's Record Aggregation / Data Processing Engine rather than custom Apex rollups. Results land on `AccountFinancialSummary` and surface via the standard Related Record Detail Display component on the Account page.

## Apps
`FF_Wealth_Management`.

## Record types
None specific to this capability (consumes Account/FinancialAccount data already covered elsewhere).

## Key objects + key custom fields
`AccountFinancialSummary` (FLS added to `FF_Financial_Data` this session, 11 field permissions), `RecordAggregationAccess`, `RecordAggregationResult` (new `FF_Record_Rollups` permission set created this session).

## Automation
- `FF_Scheduled_Account_Financial_Summary` (AutoLaunchedFlow, scheduled) — runs the Client Financial Account Summary Data Processing Engine.
- `FF_Scheduled_Household_Financial_Summary` (AutoLaunchedFlow, scheduled) — household-level equivalent.

## UI
Related Record Detail Display component on the Account page surfacing `AccountFinancialSummary`.

## Personas
`FF_Financial_Data`, `FF_Record_Rollups` (both touched this session).

## Integrations
None found.

## Extract potential
**HIGH** — Data Processing Engine-based rollups avoid custom Apex and are directly portable to any FSC org with the same data shape.

## Open questions / looks broken
- Brain match: Financial Summaries and Rollups (WM-508, `WMT2-305`) is Full. This session's two fixes (AccountFinancialSummary FLS, RecordAggregationAccess/Result permission set) most closely match `WMT2-202`/`WMT2-487` ("Account/Household - Summary of Financial Accounts - Visibility", both Peer Review) — better matches than the earlier-guessed `WMT2-201`/`WMT2-203`.
