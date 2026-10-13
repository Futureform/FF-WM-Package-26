# Prospects & Lead Conversion

## What it is
Converts a Lead into a Household (not just an individual Person Account), checking first whether the person already belongs to a household as a "Household Member" before creating a new one, and links the resulting Application Form to the Household Account rather than the individual. Inferred from `FF_Lead_Conversion` flow description and this session's fix (Application Form's `AccountId` corrected to reference `HouseholdAccountId`).

## Apps
`FF_Wealth_Management` (Lightning app).

## Record types
Account: Person Account, FF Person Account, FF Business, default.

## Key objects + key custom fields
Lead, Account (Household/Person), ApplicationForm.AccountId.

## Automation
- `FF_Lead_Conversion` (AutoLaunchedFlow) — household-aware lead conversion, amended this session.
- `FF_Closed_Opportunity_Account_Type_Update` (AutoLaunchedFlow) — on Opportunity Closed/Won, flips Account Type from Prospect/Former Client to Client.

## UI
Standard Lead conversion UI (no bespoke screens found).

## Personas
`FF_Leads` permission set.

## Integrations
None found.

## Extract potential
**HIGH** — household-aware lead conversion is a common FSC wealth-management need and is cleanly scoped to one flow.

## Open questions / looks broken
- No single Brain product covers "lead conversion creates a household + application" specifically. Prospects (WM-201, `WMT2-18`) and Households and Household Teams (WM-203, `WMT2-20`) are adjacent but neither names this behaviour. **A new Brain product has been drafted this session ("Lead Conversion — Household & Application") and is pending your and Barney's approval** — see end of this analysis for the ask.
- Jira: `WMT2-574` ("Lead Conversion (Household + Application)") is the most specific story match for this session's fix; `WMT2-132`/`WMT2-135` under the Prospects epic cover adjacent but distinct ground (prospect account creation, relationship creation) — worth checking for duplication before amending.
