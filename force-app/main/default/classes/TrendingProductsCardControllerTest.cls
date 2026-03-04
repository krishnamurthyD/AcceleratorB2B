@isTest
public class TrendingProductsCardControllerTest {

    @testSetup
    static void setupData() {

        // Create Account
        Account acc = new Account(Name = 'Test Account');
        insert acc;

        // Create WebStore (B2B Commerce)
        WebStore ws = new WebStore(
            Name = 'Test Web Store'
        );
        insert ws;

        // Create Wishlist
        Wishlist wl = new Wishlist(
            AccountId = acc.Id,
            WebStoreId = ws.Id,
            Name='kv test'
        );
        insert wl;

        // Create Trending Product
        Product2 p = new Product2(
            Name = 'Trending Product A',
            StockKeepingUnit = 'SKU-100',
            isTerndingProduct__c = true,
            IsActive = true
        );
        insert p;

        // Add Testimonials
        Testimonial__c t1 = new Testimonial__c(
            Product__c = p.Id,
            TestimonialReviewRating__c = 4,
            TestimonialHeading__c ='kv test1'
        );
        Testimonial__c t2 = new Testimonial__c(
            Product__c = p.Id,
            TestimonialReviewRating__c = 5,
            TestimonialHeading__c = 'kv testheading'
        );
        insert new List<Testimonial__c>{ t1, t2 };
    }


    @isTest
    static void testGetTrendingProducts() {

        // Fetch setup data
        Account acc = [SELECT Id FROM Account LIMIT 1];
        WebStore ws = [SELECT Id FROM WebStore LIMIT 1];

        Test.startTest();
        Map<String, Object> result = TrendingProductsCardController.getTrendingProducts(acc.Id, ws.Id);
        Test.stopTest();

        System.assertNotEquals(null, result, 'Response should not be null');
        System.assert(result.containsKey('wishlistId'), 'WishlistId should exist');
        System.assert(result.containsKey('trendingProducts'), 'Trending products key should exist');

        // Validate wishlist ID
        String wishlistId = (String) result.get('wishlistId');
        System.assertNotEquals(null, wishlistId, 'WishlistId should not be null');

        // Validate trending products list
        List<Object> products = (List<Object>) result.get('trendingProducts');
        System.assert(products.size() > 0, 'At least one trending product must exist');

        // Validate first product map
        Map<String, Object> p = (Map<String, Object>) products[0];

        System.assertNotEquals(null, p.get('id'), 'Product Id must not be null');
        System.assertEquals(true, p.get('isTrending'), 'Product must be trending');
        System.assertEquals(2, (Integer) p.get('reviewCount'), 'Review count must match');
        System.assertEquals(4.5, (Decimal) p.get('averageRating'), 'Average rating should be 4.5');
    }
}