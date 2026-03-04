/**
 * @description  Controller responsible for handling Newsletter subscription logic.
 *               Provides a method to check for duplicate email subscriptions
 *               and insert a new News_Letter__c record when no duplicate is found.
 *
 *               This class is typically invoked from LWC or Aura components during
 *               newsletter sign-up processes.
 *
 * @author       Krishnaveni
 * @lastModified 2025-12-04
 */
public with sharing class NewsletterController {

    /**
     * @description  Checks if the given email already exists in News_Letter__c.
     *               If 'checkDuplicate' is TRUE and a duplicate is found, returns TRUE.
     *               If no duplicate is found, the method inserts a new News_Letter__c record.
     *
     * @param email            The email address to validate or insert.
     * @param checkDuplicate   If TRUE, performs a duplicate check before inserting.
     *
     * @return Boolean         TRUE if a duplicate email exists, otherwise FALSE.
     */
    @AuraEnabled
    public static Boolean checkDuplicateEmail(String email, Boolean checkDuplicate) {

        Boolean duplicateFound = false;

        // If duplicate checking is requested, count existing records with same email.
        if (checkDuplicate) {
            Integer countExisting = [
                SELECT COUNT()
                FROM News_Letter__c
                WHERE Email__c = :email
            ];

            // If already exists, return TRUE and stop further processing.
            if (countExisting > 0) {
                duplicateFound = true;
                return duplicateFound;
            }
        }

        // No duplicates found → create new subscription record.
        News_Letter__c record = new News_Letter__c();
        record.Email__c = email;

        // Insert new newsletter subscription.
        insert record;

        return duplicateFound;
    }
}