public without sharing class TrendingProductsCardController {
    public TrendingProductsCardController() {}

    @AuraEnabled(cacheable=true)
    public static Map<String, Object> getTrendingProducts(Id effectiveAccountId, Id webStoreId) {
        try {
            // ----------------------------
            // Fetch Wishlist ID only when effectiveAccountId is NOT NULL
            // ----------------------------
            String wishlistId = null;

            if (effectiveAccountId != null) {
                List<Wishlist> wl = [
                    SELECT Id 
                    FROM Wishlist 
                    WHERE AccountId = :effectiveAccountId 
                      AND WebStoreId = :webStoreId 
                    LIMIT 1
                ];

                if (!wl.isEmpty()) {
                    wishlistId = wl[0].Id;
                }
            }

            // ----------------------------
            // Fetch trending products + testimonials
            // ----------------------------
            List<Product2> productList = [
                SELECT Id, Name, StockKeepingUnit, isTerndingProduct__c,
                       (SELECT Id, TestimonialReviewRating__c FROM Testimonials__r)
                FROM Product2
                WHERE isTerndingProduct__c = TRUE
                LIMIT 100
            ];

            List<Map<String, Object>> finalProducts = new List<Map<String, Object>>();

            for (Product2 p : productList) {
                Integer reviewCount = 0;
                Decimal ratingTotal = 0;
                Decimal averageRating = 0;

                if (p.Testimonials__r != null && !p.Testimonials__r.isEmpty()) {
                    reviewCount = p.Testimonials__r.size();

                    for (Testimonial__c t : p.Testimonials__r) {
                        ratingTotal += t.TestimonialReviewRating__c;
                    }

                    averageRating = ratingTotal / reviewCount;
                }

                Map<String, Object> productMap = new Map<String, Object>();
                productMap.put('id', p.Id);
                productMap.put('name', p.Name);
                productMap.put('sku', p.StockKeepingUnit);
                productMap.put('isTrending', p.isTerndingProduct__c);
                productMap.put('reviewCount', reviewCount);
                productMap.put('averageRating', averageRating);

                finalProducts.add(productMap);
            }

            // ----------------------------
            // Build final response
            // ----------------------------
            Map<String, Object> response = new Map<String, Object>();
            response.put('wishlistId', wishlistId);
            response.put('trendingProducts', finalProducts);

            System.debug('FINAL RESPONSE => ' + response);
            return response;
        }
        catch (Exception e) {
            throw new AuraHandledException(
                'Error fetching trending products: ' + e.getMessage()
            );
        }
    }
}