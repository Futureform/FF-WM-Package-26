# Applications & Onboarding

## What it is
Tracks a client's product application end-to-end: a standard `ApplicationForm` is extended by two custom objects — `FF_Application__c` (the application header/status) and `FF_Application_Form_Product_Participant__c` (who is participating in a given application product, their role, ownership % and contribution amount). Supporting documents are tracked via standard `DocumentChecklistItem`, with automation keeping the checklist in sync with the application and auto-expiring stale accepted documents.

## Apps
`FF_Wealth_Management`.

## Record types
ApplicationForm: 2 record types — `FF Application` (the template's own) and `Compass Application` (confirmed active, 0 records, unused — left over from other work, being manually deleted from dev26; record types can't be deleted via Metadata API, only through Setup). FF_Application__c: 1 record type.

Packaging decision (this session): `FF_Application__c` is excluded from the template. The packaged pattern is standard `ApplicationForm` with the `FF Application` record type — not the custom object. `FF_Application_Form_Product_Participant__c` is retained (no standard equivalent).

## Key objects + key custom fields
- `FF_Application__c`: `FF_Account__c`, `Secondary_Account__c`, `FF_Application_Status__c`, `FF_Submission_Date__c`, `FF_Completion_Date__c`, `FF_Expiry_Date__c`, `FF_Description__c`.
- `FF_Application_Form_Product_Participant__c`: `FF_Application_Form_Product__c`, `FF_Participant__c`, `FF_Participant_Role__c`, `FF_Participant_Status__c`, `FF_Ownership_Percent__c`, `FF_Contribution_Investment_Amount__c`, `FF_Special_Instructions__c`.
- `ApplicationForm.AccountId` — corrected this session to reference the Household Account (see Prospects & Lead Conversion).
- `FF_Application_Name_Link__c` — FLS added this session to `FF_Application` permission set.

## Automation
- `FF_DocumentChecklistItem_Set_Application` (before-save, AutoLaunchedFlow) — copies `ParentRecordId` into `Application__c` lookup.
- `FF_DocumentChecklistItem_Update_Status` (Flow) — blocks setting status to Accepted without a supporting document.
- `FF_DocumentChecklistItem_Scheduled` (AutoLaunchedFlow, daily midnight UTC) — expires accepted checklist items past their `FF_Expiration_Date__c`.

## UI
Standard record pages plus the `FF_Application_Name_Link__c` field surfaced on `FF_Application` permission set-gated layouts.

## Personas
`FF_Application` permission set.

## Integrations
None found.

## Extract potential
**MEDIUM** — the application/participant data model and document-expiry automation are reusable, but `FF_Application__c` duplicates some of what standard `ApplicationForm` already carries; worth a simplicity-check pass before extracting (could some of this collapse onto standard fields?).

## Open questions / looks broken
- Brain match: Applications (WM-301, `WMT2-38`) is Full; this session's `FF_Application_Name_Link__c` FLS fix most closely matches `WMT2-149`.
- Resolved this session: `FF_Application__c` will not be packaged — standard `ApplicationForm` + `FF Application` record type is the lighter, sufficient mechanism. `ApplicationForm` was a retrieval blind spot in Pass 1 (a standard FSC object not in the batch-C named list), which is why its record types weren't visible in source; confirmed directly against dev26 instead.
