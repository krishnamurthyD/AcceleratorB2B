public without sharing class TestimonialsCardController {
    public TestimonialsCardController() {

    }
    @AuraEnabled(cacheable=true)
    public static List<Map<String,Object>> getLatestTestimonials() {
        List<Map<String,Object>> response = new List<Map<String,Object>>();

        List<Testimonial__c> testimonials = [
            SELECT Id, Name, TestimonialHeading__c,TestimonialDescription__c,TestimonialUserDesignation__c, TestimonialUserImage__c, TestimonialReviewRating__c,CreatedDate
            FROM Testimonial__c
            ORDER BY CreatedDate DESC
            LIMIT 100
        ];
        for (Testimonial__c testimonial : testimonials) {
            Map<String,Object> testimonialMap = new Map<String,Object>();
            testimonialMap.put('id', testimonial.Id);
            testimonialMap.put('authorName', testimonial.Name);
            testimonialMap.put('heading', testimonial.TestimonialHeading__c);
            testimonialMap.put('description', testimonial.TestimonialDescription__c);
            testimonialMap.put('authorImage', testimonial.TestimonialUserImage__c);
            testimonialMap.put('createdDate', testimonial.CreatedDate);
            testimonialMap.put('authorRole', testimonial.TestimonialUserDesignation__c);
            testimonialMap.put('rating', testimonial.TestimonialReviewRating__c);
            testimonialMap.put('sequence', response.size());
            response.add(testimonialMap);
        }

        return response;
    }
}