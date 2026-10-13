@isTest
private class FF_FactFindControllerTest {

    // ── Test data helpers ──────────────────────────────────────────────────────

    private static Account createTestAccount() {
        // Use person account if available, else standard account
        List<RecordType> paRTs = [
            SELECT Id FROM RecordType
            WHERE SObjectType = 'Account' AND IsPersonType = true
            LIMIT 1
        ];
        Account acc;
        if (!paRTs.isEmpty()) {
            acc = new Account(
                LastName     = 'FactFindTest',
                FirstName    = 'Test',
                RecordTypeId = paRTs[0].Id
            );
        } else {
            acc = new Account(Name = 'FactFindTest Account');
        }
        insert acc;
        return acc;
    }

    private static InteractionSummary createTestIS(Id accountId, Boolean withNotes) {
        InteractionSummary is = new InteractionSummary(
            AccountId = accountId,
            Name      = 'Test Fact Find Meeting'
        );
        if (withNotes) {
            is.MeetingNotes = 'Test meeting notes for fact find extraction.';
        }
        insert is;
        return is;
    }

    // ── getInteractionSummary ──────────────────────────────────────────────────

    @isTest
    static void testGetInteractionSummary_NoIS() {
        Account acc = createTestAccount();

        Test.startTest();
        Map<String, Object> result =
            FF_FactFindController.getInteractionSummary(acc.Id);
        Test.stopTest();

        System.assertEquals(false, result.get('hasMeetingNotes'),
            'Expected hasMeetingNotes=false when no IS exists');
        System.assertNotEquals(null, result, 'Result map should not be null');
    }

    @isTest
    static void testGetInteractionSummary_WithNotes() {
        Account acc = createTestAccount();
        InteractionSummary is = createTestIS(acc.Id, true);

        Test.startTest();
        Map<String, Object> result =
            FF_FactFindController.getInteractionSummary(acc.Id);
        Test.stopTest();

        System.assertEquals(true, result.get('hasMeetingNotes'),
            'Expected hasMeetingNotes=true when IS with notes exists');
        System.assertEquals(
            String.valueOf(is.Id), result.get('isRecordId'),
            'Expected isRecordId to match inserted record'
        );
    }

    @isTest
    static void testGetInteractionSummary_NoNotesField() {
        Account acc = createTestAccount();
        createTestIS(acc.Id, false); // IS exists but MeetingNotes = null

        Test.startTest();
        Map<String, Object> result =
            FF_FactFindController.getInteractionSummary(acc.Id);
        Test.stopTest();

        System.assertEquals(false, result.get('hasMeetingNotes'),
            'Expected hasMeetingNotes=false when IS has no MeetingNotes');
    }

    // ── getCurrentAccountData ──────────────────────────────────────────────────

    @isTest
    static void testGetCurrentAccountData_ReturnsMap() {
        Account acc = createTestAccount();

        Test.startTest();
        Map<String, Object> result =
            FF_FactFindController.getCurrentAccountData(acc.Id);
        Test.stopTest();

        System.assertNotEquals(null, result, 'Result should not be null');
        System.assert(result.containsKey('AccountName'),
            'Result should contain AccountName');
        System.assert(result.containsKey('PersonBirthdate'),
            'Result should contain PersonBirthdate');
        System.assert(result.containsKey('FF_Risk_Tolerance__c'),
            'Result should contain FF_Risk_Tolerance__c');
    }

    @isTest
    static void testGetCurrentAccountData_EmptyStringsForNulls() {
        Account acc = createTestAccount();

        Test.startTest();
        Map<String, Object> result =
            FF_FactFindController.getCurrentAccountData(acc.Id);
        Test.stopTest();

        // Null fields should be returned as empty strings, not null
        System.assertEquals('', result.get('PersonBirthdate'),
            'Null birthdate should be empty string');
        System.assertEquals('', result.get('FF_Gender__c'),
            'Null gender should be empty string');
    }

    // ── saveFactFind ──────────────────────────────────────────────────────────

    @isTest
    static void testSaveFactFind_MinimalData() {
        Account acc = createTestAccount();
        InteractionSummary is = createTestIS(acc.Id, true);

        // Minimal payload — only strings, no dates/numbers that could fail
        Map<String, Object> data = new Map<String, Object>{
            'GENDER'         => 'Female',
            'MARITAL_STATUS' => 'Married',
            'RISK_TOLERANCE' => 'Medium',
            'NARRATIVE'      => 'Test narrative for unit test.'
        };
        String dataJson = JSON.serialize(data);

        Test.startTest();
        String result = FF_FactFindController.saveFactFind(
            acc.Id, is.Id, dataJson
        );
        Test.stopTest();

        System.assertEquals('Success', result, 'Save should return Success');
    }

    @isTest
    static void testSaveFactFind_WithDatesAndNumbers() {
        Account acc = createTestAccount();
        InteractionSummary is = createTestIS(acc.Id, true);

        Map<String, Object> data = new Map<String, Object>{
            'BIRTHDATE'      => '1985-06-15',
            'NUM_DEPENDENTS' => '2',
            'ANNUAL_INCOME'  => '75000',
            'RETIREMENT_AGE' => '65',
            'WILL_IN_PLACE'  => 'true',
            'LPA_IN_PLACE'   => 'false',
            'VULN_DETECTED'  => 'false',
            'G1_NAME'        => 'Retirement Fund',
            'G1_TYPE'        => 'Retirement',
            'G1_AMOUNT'      => '500000',
            'G1_PRIORITY'    => 'HIGH',
            'A1_NAME'        => 'Primary Residence',
            'A1_VALUE'       => '450000',
            'L1_NAME'        => 'Mortgage',
            'L1_TYPE'        => 'Mortgage',
            'L1_BALANCE'     => '200000',
            'L1_RATE'        => '3.5',
            'L1_PAYMENT'     => '1200'
        };
        String dataJson = JSON.serialize(data);

        Test.startTest();
        String result = FF_FactFindController.saveFactFind(
            acc.Id, is.Id, dataJson
        );
        Test.stopTest();

        System.assertEquals('Success', result, 'Save with full data should return Success');
    }

    @isTest
    static void testSaveFactFind_NotMentionedSkipped() {
        Account acc = createTestAccount();
        InteractionSummary is = createTestIS(acc.Id, true);

        // NOT_MENTIONED values should be silently skipped
        Map<String, Object> data = new Map<String, Object>{
            'GENDER'         => 'NOT_MENTIONED',
            'ANNUAL_INCOME'  => 'NOT_MENTIONED',
            'BIRTHDATE'      => 'NOT_MENTIONED',
            'NARRATIVE'      => 'A valid narrative summary.'
        };
        String dataJson = JSON.serialize(data);

        Test.startTest();
        String result = FF_FactFindController.saveFactFind(
            acc.Id, is.Id, dataJson
        );
        Test.stopTest();

        System.assertEquals('Success', result,
            'NOT_MENTIONED values should be silently skipped, save should succeed');
    }

    @isTest
    static void testSaveFactFind_InvalidDateSkipped() {
        Account acc = createTestAccount();
        InteractionSummary is = createTestIS(acc.Id, true);

        // Invalid date should not throw — just skipped
        Map<String, Object> data = new Map<String, Object>{
            'BIRTHDATE'  => 'not-a-date',
            'NARRATIVE'  => 'Narrative text.'
        };
        String dataJson = JSON.serialize(data);

        Test.startTest();
        String result = FF_FactFindController.saveFactFind(
            acc.Id, is.Id, dataJson
        );
        Test.stopTest();

        System.assertEquals('Success', result,
            'Invalid date should be silently skipped');
    }

    // ── extractAIData (error path only — ConnectApi unavailable in test) ───────

    @isTest
    static void testExtractAIData_ThrowsWhenNoIS() {
        // Pass a fake IS Id — should throw AuraHandledException
        String fakeId = '0FA000000000001AAA';
        Boolean threw = false;

        Test.startTest();
        try {
            FF_FactFindController.extractAIData(fakeId);
        } catch (AuraHandledException e) {
            threw = true;
        } catch (Exception e) {
            threw = true; // Any exception is acceptable here
        }
        Test.stopTest();

        System.assert(threw, 'extractAIData with invalid IS Id should throw');
    }

    // ── getInteractionSummary error path ──────────────────────────────────────

    @isTest
    static void testGetInteractionSummary_InvalidAccountId() {
        Boolean threw = false;

        Test.startTest();
        try {
            FF_FactFindController.getInteractionSummary('INVALID_ID');
        } catch (AuraHandledException e) {
            threw = true;
        } catch (Exception e) {
            threw = true;
        }
        Test.stopTest();

        System.assert(threw, 'Invalid Account Id should throw');
    }
}