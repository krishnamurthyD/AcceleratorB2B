@IsTest
private class FeatureCategoriesControllerTest {

    @IsTest
    static void testGetFeatureResponseGuestTrue() {
        Test.startTest();
        List<Map<String,Object>> result = FeatureCategoriesController.getFeatureResponse('dummyNetworkId', true);
        Test.stopTest();

        System.assertNotEquals(null, result, 'Result should not be null');
        System.assertEquals(1, result.size(), 'Should return 1 mock category in test context');
        System.assertEquals('Test Category', result[0].get('categoryName'));
        System.assertEquals(0, result[0].get('categorySequence'));
    }

    @IsTest
    static void testGetFeatureResponseGuestFalse() {
        Test.startTest();
        List<Map<String,Object>> result = FeatureCategoriesController.getFeatureResponse('dummyNetworkId', false);
        Test.stopTest();

        System.assertNotEquals(null, result, 'Result should not be null');
        System.assertEquals(1, result.size(), 'Should return 1 mock category in test context');
        System.assertEquals('Test Category', result[0].get('categoryName'));
    }

    @IsTest
    static void testBuildCategoryMapGuestTrue() {
        ConnectApi.ProductCategoryDetail detail = new ConnectApi.ProductCategoryDetail();
        detail.Id = 'PC001';
        detail.fields = new Map<String,String>{
            'FeatureCategory__c' => 'true',
            'IsFeatureCategoryForGuest__c' => 'true',
            'Name' => 'Category 1',
            'FeatureCategoryHeading__c' => 'Heading 1',
            'FeatureCategoryDescription__c' => 'Description 1',
            'FeatureCategoryTag__c' => 'Tag1',
            'FeatureCategoryButtonLabel__c' => 'Click Here'
        };
        detail.tileImage = new ConnectApi.ProductCategoryMedia();
        detail.tileImage.url = '/image1.png';

        Map<String,Object> result = FeatureCategoriesController.buildCategoryMap(detail, true, 0);

        System.assertEquals('Category 1', result.get('categoryName'));
        System.assertEquals('Heading 1', result.get('categoryHeading'));
        System.assertEquals('Description 1', result.get('categoryDescription'));
        System.assertEquals(0, result.get('categorySequence'));
        System.assertEquals('/category/PC001', result.get('categoryRedirectUrl'));
    }

    @IsTest
    static void testBuildCategoryMapGuestFalse() {
        ConnectApi.ProductCategoryDetail detail = new ConnectApi.ProductCategoryDetail();
        detail.Id = 'PC002';
        detail.fields = new Map<String,String>{
            'FeatureCategory__c' => 'true',
            'Name' => 'Category 2',
            'FeatureCategoryHeading__c' => 'Heading 2',
            'FeatureCategoryDescription__c' => 'Description 2',
            'FeatureCategoryTag__c' => 'Tag2',
            'FeatureCategoryButtonLabel__c' => 'Click Here'
        };
        detail.tileImage = new ConnectApi.ProductCategoryMedia();
        detail.tileImage.url = '/image2.png';

        Map<String,Object> result = FeatureCategoriesController.buildCategoryMap(detail, false, 1);

        System.assertEquals('Category 2', result.get('categoryName'));
        System.assertEquals('Heading 2', result.get('categoryHeading'));
        System.assertEquals('Description 2', result.get('categoryDescription'));
        System.assertEquals(1, result.get('categorySequence'));
        System.assertEquals('/category/PC002', result.get('categoryRedirectUrl'));
    }  

    @IsTest
    static void testBuildCategoryMapEmpty() {
        ConnectApi.ProductCategoryDetail detail = new ConnectApi.ProductCategoryDetail();
        detail.Id = 'PC003';
        detail.fields = new Map<String,String>{
            'FeatureCategory__c' => 'false', // Not a feature category
            'Name' => 'Category 3'
        };

        Map<String,Object> result = FeatureCategoriesController.buildCategoryMap(detail, true, 0);
        System.assertEquals(0, result.size(), 'Map should be empty if conditions not met');
    }
}