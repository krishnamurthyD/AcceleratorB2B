@isTest
public class TestimonialsCardControllerTest {

    @testSetup
    static void setupData() {

        // Insert 2 sample testimonials
        Testimonial__c t1 = new Testimonial__c(
            Name = 'John Doe',
            TestimonialHeading__c = 'Excellent!',
            TestimonialDescription__c = 'Great experience.',
            TestimonialUserDesignation__c = 'Manager',
            TestimonialUserImage__c = 'img1.png',
            TestimonialReviewRating__c = 5
        );

        Testimonial__c t2 = new Testimonial__c(
            Name = 'Jane Smith',
            TestimonialHeading__c = 'Amazing Service',
            TestimonialDescription__c = 'Highly recommended.',
            TestimonialUserDesignation__c = 'Director',
            TestimonialUserImage__c = 'img2.png',
            TestimonialReviewRating__c = 4
        );

        insert new List<Testimonial__c>{ t1, t2 };
    }

    @isTest
    static void testGetLatestTestimonials() {

        Test.startTest();
        List<Map<String, Object>> result = TestimonialsCardController.getLatestTestimonials();
        Test.stopTest();

        // Basic validations
        System.assertNotEquals(null, result, 'Response should not be null');
        System.assert(result.size() >= 2, 'Should return at least two testimonials');

        // Validate first testimonial structure
        Map<String, Object> first = result[0];

        System.assert(first.containsKey('id'), 'Missing: id');
        System.assert(first.containsKey('authorName'), 'Missing: authorName');
        System.assert(first.containsKey('heading'), 'Missing: heading');
        System.assert(first.containsKey('description'), 'Missing: description');
        System.assert(first.containsKey('authorImage'), 'Missing: authorImage');
        System.assert(first.containsKey('createdDate'), 'Missing: createdDate');
        System.assert(first.containsKey('authorRole'), 'Missing: authorRole');
        System.assert(first.containsKey('rating'), 'Missing: rating');
        System.assert(first.containsKey('sequence'), 'Missing: sequence');
    }
}