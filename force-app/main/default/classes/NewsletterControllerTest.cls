@isTest
public class NewsletterControllerTest {

    @isTest
    static void testDuplicateEmailFound() {
        // Create an existing Newsletter record
        News_letter__c existing = new News_letter__c(Email__c = 'test@example.com');
        insert existing;

        // Call method with duplicate check enabled
        Boolean result = NewsletterController.checkDuplicateEmail('test@example.com', true);

        // Assert that duplicate was found
        System.assertEquals(true, result, 'Duplicate should be found');

        // Ensure no new record was inserted
        Integer countAfter = [
            SELECT COUNT() FROM News_letter__c WHERE Email__c = 'test@example.com'
        ];
        System.assertEquals(1, countAfter, 'Should not insert duplicate record');
    }


    @isTest
    static void testEmailNotDuplicate() {
        // Ensure no existing records
        delete [SELECT Id FROM News_letter__c];

        // Call method with duplicate check enabled
        Boolean result = NewsletterController.checkDuplicateEmail('unique@example.com', true);

        // Assert duplicate NOT found
        System.assertEquals(false, result, 'Duplicate should NOT be found');

        // Check that the record was inserted
        Integer countAfter = [
            SELECT COUNT() FROM News_letter__c WHERE Email__c = 'unique@example.com'
        ];
        System.assertEquals(1, countAfter, 'Record should be inserted');
    }


    @isTest
    static void testCheckDuplicateFalse() {
        // Call method with duplicate check disabled
        Boolean result = NewsletterController.checkDuplicateEmail('nodup@example.com', false);

        // Since duplicate check is false, always insert & return false
        System.assertEquals(false, result, 'Should return false since no duplicate check');

        // Validate insertion
        Integer countAfter = [
            SELECT COUNT() FROM News_letter__c WHERE Email__c = 'nodup@example.com'
        ];
        System.assertEquals(1, countAfter, 'Record should be inserted when duplicate check is disabled');
    }
}