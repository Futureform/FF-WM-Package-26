public with sharing class FF_FactFindController {

    /**
     * Find the latest InteractionSummary with MeetingNotes for the given Account.
     */
    @AuraEnabled(cacheable=false)
    public static Map<String, Object> getInteractionSummary(String accountId) {
        try {
            // MeetingNotes is a TEXTAREA — cannot be filtered in SOQL; filter in Apex
            List<InteractionSummary> allIS = [
                SELECT Id, MeetingNotes, CreatedDate, Interaction.StartTime
                FROM InteractionSummary
                WHERE AccountId = :accountId
                ORDER BY CreatedDate DESC
                LIMIT 50
            ];
            InteractionSummary latestWithNotes = null;
            for (InteractionSummary is : allIS) {
                if (String.isNotBlank(is.MeetingNotes)) {
                    latestWithNotes = is;
                    break;
                }
            }
            Map<String, Object> result = new Map<String, Object>();
            if (latestWithNotes == null) {
                result.put('hasMeetingNotes', false);
                result.put('isRecordId', null);
                result.put('meetingDate', null);
            } else {
                Datetime meetingDt = latestWithNotes.Interaction != null && latestWithNotes.Interaction.StartTime != null
                    ? latestWithNotes.Interaction.StartTime
                    : latestWithNotes.CreatedDate;
                result.put('hasMeetingNotes', true);
                result.put('isRecordId', String.valueOf(latestWithNotes.Id));
                result.put('meetingDate', String.valueOf(meetingDt));
            }
            return result;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    /**
     * Call the FactFind_Extraction prompt template and return the raw AI response text.
     * Uses FF_FactFind_AIExtract autolaunched flow (via Flow.Interview) because
     * ConnectApi.EinsteinLLM.generateMessagesForPromptTemplate requires a Flow execution
     * context at runtime to resolve the promptTemplateDevName parameter.
     */
    @AuraEnabled(cacheable=false)
    public static String extractAIData(String isRecordId) {
        try {
            InteractionSummary is = [
                SELECT Id, MeetingNotes
                FROM InteractionSummary
                WHERE Id = :isRecordId
                LIMIT 1
            ];

            // MeetingNotes is a Rich Text Area — Prompt Builder cannot resolve RTA merge
            // fields. Strip HTML and write the plain text into FF_Meeting_Notes_Text__c
            // (a Long Text Area) on the in-memory SObject. The prompt template reads
            // {{{Input:InteractionSummary.FF_Meeting_Notes_Text__c}}}, which Prompt
            // Builder CAN resolve from a Long Text Area field.
            String transcript = String.isNotBlank(is.MeetingNotes)
                ? is.MeetingNotes
                    .replaceAll('<[^>]+>', ' ')
                    .replaceAll('&amp;',  '&')
                    .replaceAll('&lt;',   '<')
                    .replaceAll('&gt;',   '>')
                    .replaceAll('&nbsp;', ' ')
                    .replaceAll('\\s+',   ' ')
                    .trim()
                : '';

            if (String.isBlank(transcript)) {
                throw new AuraHandledException(
                    'No meeting notes found on this record. Please ensure the transcript has been saved.'
                );
            }

            // Persist the plain text so the prompt template can resolve it via DB query.
            is.FF_Meeting_Notes_Text__c = transcript;
            update is;

            Map<String, Object> inputs = new Map<String, Object>{
                'IS_Record' => is
            };

            Flow.Interview interview =
                Flow.Interview.createInterview('FF_FactFind_AIExtract', inputs);
            interview.start();

            String aiText = (String) interview.getVariableValue('AIText');
            if (String.isBlank(aiText)) {
                throw new AuraHandledException(
                    'The AI returned an empty response. Please check the prompt template is active and try again.'
                );
            }
            return aiText;
        } catch (AuraHandledException e) {
            throw e;
        } catch (Exception e) {
            throw new AuraHandledException('AI extraction failed: ' + e.getMessage());
        }
    }

    /**
     * Return current values for all Fact Find fields on the Account record.
     */
    @AuraEnabled(cacheable=true)
    public static Map<String, Object> getCurrentAccountData(String accountId) {
        try {
            Account acc = [
                SELECT Id, Name,
                       PersonBirthdate, FF_Gender__c, FF_Marital_Status__c,
                       FF_Number_of_Dependents__c, BillingStreet, BillingCity,
                       BillingPostalCode, BillingCountry, PersonHomePhone,
                       PersonMobilePhone, PersonEmail, FF_Communication_Preferences__c,
                       FF_Employment_Status__c, FF_Employer_Name__c, FF_Occupation__c,
                       FF_Date_Employment_Commenced__c, FF_Annual_Income__c,
                       FF_Annual_Bonus__c, FF_Other_Income__c, FF_Other_Income_Source__c,
                       FF_Intended_Retirement_Age__c, FF_Risk_Tolerance__c,
                       FF_Capacity_For_Loss__c, FF_Uk_National_Insurance_Number__c,
                       FF_Tax_Identification_Number__c, FF_Environmental__c,
                       FF_Social__c, FF_Will__c, FF_Lasting_Power_Of_Attorney__c,
                       FF_Power_Of_Attorney_Details__c
                FROM Account
                WHERE Id = :accountId
                LIMIT 1
            ];

            Map<String, Object> r = new Map<String, Object>();
            r.put('AccountName', acc.Name);
            r.put('PersonBirthdate',
                acc.PersonBirthdate != null ? String.valueOf(acc.PersonBirthdate) : '');
            r.put('FF_Gender__c',
                acc.FF_Gender__c != null ? acc.FF_Gender__c : '');
            r.put('FF_Marital_Status__c',
                acc.FF_Marital_Status__c != null ? acc.FF_Marital_Status__c : '');
            r.put('FF_Number_of_Dependents__c',
                acc.FF_Number_of_Dependents__c != null
                    ? String.valueOf(acc.FF_Number_of_Dependents__c) : '');
            r.put('BillingStreet',
                acc.BillingStreet != null ? acc.BillingStreet : '');
            r.put('BillingCity',
                acc.BillingCity != null ? acc.BillingCity : '');
            r.put('BillingPostalCode',
                acc.BillingPostalCode != null ? acc.BillingPostalCode : '');
            r.put('BillingCountry',
                acc.BillingCountry != null ? acc.BillingCountry : '');
            r.put('PersonHomePhone',
                acc.PersonHomePhone != null ? acc.PersonHomePhone : '');
            r.put('PersonMobilePhone',
                acc.PersonMobilePhone != null ? acc.PersonMobilePhone : '');
            r.put('PersonEmail',
                acc.PersonEmail != null ? acc.PersonEmail : '');
            r.put('FF_Communication_Preferences__c',
                acc.FF_Communication_Preferences__c != null
                    ? acc.FF_Communication_Preferences__c : '');
            r.put('FF_Employment_Status__c',
                acc.FF_Employment_Status__c != null ? acc.FF_Employment_Status__c : '');
            r.put('FF_Employer_Name__c',
                acc.FF_Employer_Name__c != null ? acc.FF_Employer_Name__c : '');
            r.put('FF_Occupation__c',
                acc.FF_Occupation__c != null ? acc.FF_Occupation__c : '');
            r.put('FF_Date_Employment_Commenced__c',
                acc.FF_Date_Employment_Commenced__c != null
                    ? String.valueOf(acc.FF_Date_Employment_Commenced__c) : '');
            r.put('FF_Annual_Income__c',
                acc.FF_Annual_Income__c != null
                    ? String.valueOf(acc.FF_Annual_Income__c) : '');
            r.put('FF_Annual_Bonus__c',
                acc.FF_Annual_Bonus__c != null
                    ? String.valueOf(acc.FF_Annual_Bonus__c) : '');
            r.put('FF_Other_Income__c',
                acc.FF_Other_Income__c != null
                    ? String.valueOf(acc.FF_Other_Income__c) : '');
            r.put('FF_Other_Income_Source__c',
                acc.FF_Other_Income_Source__c != null ? acc.FF_Other_Income_Source__c : '');
            r.put('FF_Intended_Retirement_Age__c',
                acc.FF_Intended_Retirement_Age__c != null
                    ? String.valueOf(acc.FF_Intended_Retirement_Age__c) : '');
            r.put('FF_Risk_Tolerance__c',
                acc.FF_Risk_Tolerance__c != null ? acc.FF_Risk_Tolerance__c : '');
            r.put('FF_Capacity_For_Loss__c',
                acc.FF_Capacity_For_Loss__c != null ? acc.FF_Capacity_For_Loss__c : '');
            r.put('FF_Uk_National_Insurance_Number__c',
                acc.FF_Uk_National_Insurance_Number__c != null
                    ? acc.FF_Uk_National_Insurance_Number__c : '');
            r.put('FF_Tax_Identification_Number__c',
                acc.FF_Tax_Identification_Number__c != null
                    ? acc.FF_Tax_Identification_Number__c : '');
            r.put('FF_Environmental__c',
                acc.FF_Environmental__c != null ? acc.FF_Environmental__c : '');
            r.put('FF_Social__c',
                acc.FF_Social__c != null ? acc.FF_Social__c : '');
            r.put('FF_Will__c',
                acc.FF_Will__c != null ? String.valueOf(acc.FF_Will__c) : '');
            r.put('FF_Lasting_Power_Of_Attorney__c',
                acc.FF_Lasting_Power_Of_Attorney__c != null
                    ? String.valueOf(acc.FF_Lasting_Power_Of_Attorney__c) : '');
            r.put('FF_Power_Of_Attorney_Details__c',
                acc.FF_Power_Of_Attorney_Details__c != null
                    ? acc.FF_Power_Of_Attorney_Details__c : '');
            return r;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    /**
     * Save approved fact find data by invoking the FF_FactFind_SaveResults autolaunched flow.
     * dataJson contains a flat map of DATA_START keys → approved values.
     */
    @AuraEnabled(cacheable=false)
    public static String saveFactFind(
        String accountId, String isRecordId, String dataJson
    ) {
        try {
            Map<String, Object> data =
                (Map<String, Object>) JSON.deserializeUntyped(dataJson);
            Map<String, Object> flowInputs = new Map<String, Object>();

            flowInputs.put('AccountId', accountId);
            flowInputs.put('InteractionSummaryId', isRecordId);

            // — Strings —
            putStr(flowInputs, data, 'Gender',                'GENDER');
            putStr(flowInputs, data, 'MaritalStatus',         'MARITAL_STATUS');
            putStr(flowInputs, data, 'MailingStreet',         'MAILING_STREET');
            putStr(flowInputs, data, 'MailingCity',           'MAILING_CITY');
            putStr(flowInputs, data, 'MailingPostalCode',     'MAILING_POSTCODE');
            putStr(flowInputs, data, 'MailingCountry',        'MAILING_COUNTRY');
            putStr(flowInputs, data, 'Phone',                 'PHONE');
            putStr(flowInputs, data, 'Mobile',                'MOBILE');
            putStr(flowInputs, data, 'Email',                 'EMAIL');
            putStr(flowInputs, data, 'CommunicationPreference','COMMS_PREF');
            putStr(flowInputs, data, 'EmploymentStatus',      'EMP_STATUS');
            putStr(flowInputs, data, 'EmployerName',          'EMPLOYER_NAME');
            putStr(flowInputs, data, 'Occupation',            'OCCUPATION');
            putStr(flowInputs, data, 'OtherIncomeSource',     'OTHER_INCOME_SRC');
            putStr(flowInputs, data, 'RiskTolerance',         'RISK_TOLERANCE');
            putStr(flowInputs, data, 'CapacityForLoss',       'CAPACITY_FOR_LOSS');
            putStr(flowInputs, data, 'NINumber',              'NI_NUMBER');
            putStr(flowInputs, data, 'TaxIdNumber',           'TAX_ID');
            putStr(flowInputs, data, 'Environmental',         'ENVIRONMENTAL');
            putStr(flowInputs, data, 'Social',                'SOCIAL');
            putStr(flowInputs, data, 'LPADetails',            'LPA_DETAILS');
            putStr(flowInputs, data, 'VulnerabilityDescription','VULN_DESC');
            putStr(flowInputs, data, 'VulnerabilityDuration', 'VULN_DURATION');
            putStr(flowInputs, data, 'Narrative',             'NARRATIVE');

            // — Dates —
            putDt(flowInputs, data, 'Birthdate',               'BIRTHDATE');
            putDt(flowInputs, data, 'DateEmploymentCommenced',  'DATE_EMPLOYED');

            // — Integers —
            putInt(flowInputs, data, 'NumberOfDependents',   'NUM_DEPENDENTS');
            putInt(flowInputs, data, 'IntendedRetirementAge','RETIREMENT_AGE');

            // — Currency / Decimal —
            putDec(flowInputs, data, 'AnnualIncome',  'ANNUAL_INCOME');
            putDec(flowInputs, data, 'AnnualBonus',   'ANNUAL_BONUS');
            putDec(flowInputs, data, 'OtherIncome',   'OTHER_INCOME');

            // — Booleans —
            putBool(flowInputs, data, 'WillInPlace',           'WILL_IN_PLACE');
            putBool(flowInputs, data, 'LPAInPlace',            'LPA_IN_PLACE');
            putBool(flowInputs, data, 'VulnerabilityDetected', 'VULN_DETECTED');

            // — Goals (1–3) —
            for (Integer i = 1; i <= 3; i++) {
                String g = 'G' + i;
                putStr(flowInputs, data, 'Goal' + i + 'Name',        g + '_NAME');
                putStr(flowInputs, data, 'Goal' + i + 'Type',        g + '_TYPE');
                putDec(flowInputs, data, 'Goal' + i + 'Amount',      g + '_AMOUNT');
                putDt (flowInputs, data, 'Goal' + i + 'TargetDate',  g + '_DATE');
                putStr(flowInputs, data, 'Goal' + i + 'Priority',    g + '_PRIORITY');
                putStr(flowInputs, data, 'Goal' + i + 'Description', g + '_DESC');
            }

            // — Assets (1–5) —
            // Only pass an asset to the flow if both Name AND Value are present.
            // A name without a value would cause REQUIRED_FIELD_MISSING on
            // PartyFinancialAsset.ValuationAmount and roll back the entire transaction.
            for (Integer i = 1; i <= 5; i++) {
                String a = 'A' + i;
                Object nameVal  = data.get(a + '_NAME');
                Object valueVal = data.get(a + '_VALUE');
                String nameSv   = nameVal  != null ? String.valueOf(nameVal).trim()  : '';
                String valueSv  = valueVal != null ? String.valueOf(valueVal).trim().replaceAll('[£,\\s]', '') : '';
                if (String.isBlank(nameSv)  || nameSv  == 'NOT_MENTIONED') continue;
                if (String.isBlank(valueSv) || valueSv == 'NOT_MENTIONED') continue;
                putStr(flowInputs, data, 'Asset' + i + 'Name',        a + '_NAME');
                putStr(flowInputs, data, 'Asset' + i + 'Type',        a + '_TYPE');
                putDec(flowInputs, data, 'Asset' + i + 'Value',       a + '_VALUE');
                putStr(flowInputs, data, 'Asset' + i + 'Description', a + '_DESC');
            }

            // — Liabilities (1–5) —
            for (Integer i = 1; i <= 5; i++) {
                String l = 'L' + i;
                putStr(flowInputs, data, 'Liability' + i + 'Name',          l + '_NAME');
                putStr(flowInputs, data, 'Liability' + i + 'Type',          l + '_TYPE');
                putDec(flowInputs, data, 'Liability' + i + 'Balance',       l + '_BALANCE');
                putStr(flowInputs, data, 'Liability' + i + 'Lender',        l + '_LENDER');
                putDec(flowInputs, data, 'Liability' + i + 'InterestRate',  l + '_RATE');
                putDec(flowInputs, data, 'Liability' + i + 'MonthlyPayment',l + '_PAYMENT');
            }

            Flow.Interview interview =
                Flow.Interview.createInterview('FF_FactFind_SaveResults', flowInputs);
            interview.start();

            return 'Success';
        } catch (Exception e) {
            throw new AuraHandledException('Save failed: ' + e.getMessage());
        }
    }

    // ── Private helpers ────────────────────────────────────────────────────────

    private static void putStr(
        Map<String, Object> inputs, Map<String, Object> data,
        String flowVar, String dataKey
    ) {
        Object val = data.get(dataKey);
        if (val == null) return;
        String sv = String.valueOf(val).trim();
        if (String.isBlank(sv) || sv == 'NOT_MENTIONED' || sv == 'Unknown') return;
        inputs.put(flowVar, sv);
    }

    private static void putDt(
        Map<String, Object> inputs, Map<String, Object> data,
        String flowVar, String dataKey
    ) {
        Object val = data.get(dataKey);
        if (val == null) return;
        String sv = String.valueOf(val).trim();
        if (String.isBlank(sv) || sv == 'NOT_MENTIONED') return;
        try { inputs.put(flowVar, Date.valueOf(sv)); } catch (Exception e) { /* skip */ }
    }

    private static void putInt(
        Map<String, Object> inputs, Map<String, Object> data,
        String flowVar, String dataKey
    ) {
        Object val = data.get(dataKey);
        if (val == null) return;
        String sv = String.valueOf(val).trim().replaceAll('[^0-9]', '');
        if (String.isBlank(sv)) return;
        try { inputs.put(flowVar, Integer.valueOf(sv)); } catch (Exception e) { /* skip */ }
    }

    private static void putDec(
        Map<String, Object> inputs, Map<String, Object> data,
        String flowVar, String dataKey
    ) {
        Object val = data.get(dataKey);
        if (val == null) return;
        String sv = String.valueOf(val).trim().replaceAll('[£,\\s]', '');
        if (String.isBlank(sv) || sv == 'NOT_MENTIONED') return;
        try { inputs.put(flowVar, Decimal.valueOf(sv)); } catch (Exception e) { /* skip */ }
    }

    private static void putBool(
        Map<String, Object> inputs, Map<String, Object> data,
        String flowVar, String dataKey
    ) {
        Object val = data.get(dataKey);
        if (val == null) {
            // Boolean flow variables cannot be left null — Salesforce rejects writing
            // null to a Checkbox field. Default to false when not in the payload.
            inputs.put(flowVar, false);
            return;
        }
        String sv = String.valueOf(val).trim().toLowerCase();
        inputs.put(flowVar, (sv == 'true' || sv == 'yes'));
    }
}