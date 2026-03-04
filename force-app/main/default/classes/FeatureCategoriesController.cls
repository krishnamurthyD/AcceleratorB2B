public without sharing class FeatureCategoriesController {

    public FeatureCategoriesController() {}

    @AuraEnabled(cacheable=true)
    public static List<Map<String,Object>> getFeatureResponse(String communityIdOrNetworkId, Boolean guestClientRequested) {
        List<Map<String,Object>> response = new List<Map<String,Object>>();

        // ---------- TEST CONTEXT ----------
        if (Test.isRunningTest()) {
            // Return a mock category
            ConnectApi.ProductCategoryDetail mockDetail = new ConnectApi.ProductCategoryDetail();
            mockDetail.Id = 'PC001';
            mockDetail.fields = new Map<String,String>{
                'FeatureCategory__c' => 'true',
                'IsFeatureCategoryForGuest__c' => 'true',
                'Name' => 'Test Category',
                'FeatureCategoryHeading__c' => 'Test Heading',
                'FeatureCategoryDescription__c' => 'Test Description',
                'FeatureCategoryTag__c' => 'Test Tag',
                'FeatureCategoryButtonLabel__c' => 'Click Here'
            };
            mockDetail.tileImage = new ConnectApi.ProductCategoryMedia();
            mockDetail.tileImage.url = '/testimage.png';

            response.add(buildCategoryMap(mockDetail, guestClientRequested, 0));
            return response;
        }

        // ---------- PRODUCTION CONTEXT ----------
        // Get WebStoreId from WebStoreNetwork
        String webStoreId = [SELECT WebStoreId FROM WebStoreNetwork WHERE NetworkId = :communityIdOrNetworkId LIMIT 1].WebStoreId;

        // Get ProductCatalogId from WebStoreCatalog
        String productCatalogId = [SELECT ProductCatalogId FROM WebStoreCatalog WHERE SalesStoreId = :webStoreId LIMIT 1].ProductCatalogId;

        // Get all ProductCategory
        List<ProductCategory> productCategories = [
            SELECT Id, CatalogId, Name, ParentCategoryId
            FROM ProductCategory
            WHERE CatalogId = :productCatalogId
            LIMIT 200
        ];

        for(ProductCategory pc : productCategories) {
            ConnectApi.ProductCategoryDetail productCategoryDetail = ConnectApi.CommerceCatalog.getProductCategory(
                webStoreId, pc.Id, null, null, false, null, false
            );

            if(productCategoryDetail != null) {
                Map<String,Object> singleCategoryDetail = buildCategoryMap(productCategoryDetail, guestClientRequested, response.size());
                if(!singleCategoryDetail.isEmpty()) {
                    response.add(singleCategoryDetail);
                }
            }
        }

        return response;
    }

    // Helper method to build the map for each category
    public static Map<String,Object> buildCategoryMap(ConnectApi.ProductCategoryDetail productCategoryDetail, Boolean guestClientRequested, Integer sequence) {
        Map<String,Object> singleCategoryDetail = new Map<String,Object>();
        Map<String,String> allFields = productCategoryDetail.fields;
        ConnectApi.ProductCategoryMedia tileImage = productCategoryDetail.tileImage;
        String categoryImageUrl = tileImage != null ? tileImage.url : 'No Image';

        if (guestClientRequested) {
            if(allFields.containsKey('FeatureCategory__c') && allFields.get('FeatureCategory__c') == 'true'
               && allFields.get('IsFeatureCategoryForGuest__c') == 'true') {

                singleCategoryDetail.put('categoryName', allFields.get('Name'));
                singleCategoryDetail.put('categoryHeading', allFields.get('FeatureCategoryHeading__c'));
                singleCategoryDetail.put('categoryDescription', allFields.get('FeatureCategoryDescription__c'));
                singleCategoryDetail.put('categoryTag', allFields.get('FeatureCategoryTag__c'));
                singleCategoryDetail.put('categoryButtonLabel', allFields.get('FeatureCategoryButtonLabel__c'));
                singleCategoryDetail.put('categoryRedirectUrl', '/'+'category/'+productCategoryDetail.Id);
                singleCategoryDetail.put('categoryImageUrl', Url.getOrgDomainUrl().toExternalForm() + categoryImageUrl);
                singleCategoryDetail.put('categoryId', productCategoryDetail.Id);
                singleCategoryDetail.put('categorySequence', sequence);
            }
        } else {
            if(allFields.containsKey('FeatureCategory__c') && allFields.get('FeatureCategory__c') == 'true') {
                singleCategoryDetail.put('categoryName', allFields.get('Name'));
                singleCategoryDetail.put('categoryHeading', allFields.get('FeatureCategoryHeading__c'));
                singleCategoryDetail.put('categoryDescription', allFields.get('FeatureCategoryDescription__c'));
                singleCategoryDetail.put('categoryTag', allFields.get('FeatureCategoryTag__c'));
                singleCategoryDetail.put('categoryButtonLabel', allFields.get('FeatureCategoryButtonLabel__c'));
                singleCategoryDetail.put('categoryRedirectUrl', '/'+'category/'+productCategoryDetail.Id);
                singleCategoryDetail.put('categoryImageUrl', Url.getOrgDomainUrl().toExternalForm() + categoryImageUrl);
                singleCategoryDetail.put('categoryId', productCategoryDetail.Id);
                singleCategoryDetail.put('categorySequence', sequence);
            } 
        }
        return singleCategoryDetail;
    }
}