# FF-WM-Package-26: deploying the Wealth Management template

When asked to deploy this package to an org, follow `package/README.md` (Pre-deployment steps, then Deploy). Do not improvise the order.

## How to run it

1. Confirm the target org alias and that it is the org the user means (`sf org display --target-org <alias>`). Never deploy to an org the user has not named.
2. Do the pre-deployment steps in order. Run the CLI steps yourself (settings package in `pre-deploy/`, Digital Lending licence and permission set assignment).
3. For Setup screens that have no metadata setting (contacts to multiple accounts, Show Closed Statuses, Data Pipeline, Person Accounts, State and Country picklists), tell the user exactly where to click and wait for them to confirm. Do not skip a step because it looks already done: check it.
4. Deploy in two passes: `force-app`, then `force-app-late`, both from `package/`. A single pass fails on inactive flows.
5. Report what was deployed and any errors. If a step fails, fix the cause, not the symptom, and say what you changed.

## Ask before

- **Person Accounts** and **State and Country/Territory Picklists**: both are permanent and cannot be undone. Get an explicit yes for each.
- Mapping picklist values to "Unknown value".
- Deleting anything in the org, or resetting it.

## Gotchas

- Never set `enableRelateContactToMultipleAccounts` through metadata. It shows as ticked but the AccountContactRelation object is never created. Tick it in the UI.
- The deploying user needs the Digital Lending permission set licence (`DigitalLendingPsl`) and the `DigitalLending` permission set, or three layouts fail.
- Five flows deploy as Draft by design.
- Details and history of what was tried: `docs/predeploy-log.md`.

## Not yet proven

The steps were verified on one Developer Edition org that already had Discovery Framework and Know Your Customer enabled. A run on a fresh org following only the README is still to do. If you do one, record the result in `docs/predeploy-log.md`.
