@IsTest
private class InsightsResourcesControllerTest {

    @IsTest
    static void testGetCardDataList_MockPath() {
        InsightsResourcesController.useMock = true;
        Test.startTest();
        List<Map<String,Object>> result = InsightsResourcesController.getCardDataList('dummySiteId', 'dummyContentId');
        Test.stopTest();

        System.assertEquals(1, result.size());
        System.assertEquals('Test Title', result[0].get('title'));
        InsightsResourcesController.useMock = false;
    }

    @IsTest
    static void testGetCardDataListInternal_WithMockCollection() {
        // Create fake ManagedContentCollectionItems and ManagedContentCollectionItem
        ConnectApi.ManagedContentCollectionItems collection = new ConnectApi.ManagedContentCollectionItems();
        collection.items = new List<ConnectApi.ManagedContentCollectionItem>();

        ConnectApi.ManagedContentCollectionItem item = new ConnectApi.ManagedContentCollectionItem();

        // Setup 'body' map with nested structures similar to what the method expects
        Map<String, Object> contentBody = new Map<String, Object>{
            'body' => '<div>title:Test Title</div><div>description:Test Description</div>',
            'bannerImage' => new Map<String, Object>{ 'url' => '/testimage.png' }
        };

        Map<String, Object> body = new Map<String, Object>{
            'contentBody' => contentBody,
            'publishedDate' => Date.today(),
            'urlName' => 'test-url',
            'name' => 'testkey'
        };

        item.body = body;

        collection.items.add(item);

        // Call the internal method with the fake data
        List<Map<String,Object>> result = InsightsResourcesController.getCardDataListInternal(collection);

        System.assertNotEquals(null, result);
        System.assertEquals(1, result.size());

        Map<String,Object> firstItem = result[0];
        
    }

    @IsTest
    static void testGetCollectionBodySanitize() {
        String html = '<div>key1:value1</div><div>key2:value2</div>';
        Map<String,Object> result = InsightsResourcesController.getCollectionBodySanitize(html);

        System.assertEquals(2, result.size());
        System.assertEquals('value1', result.get('key1'));
        System.assertEquals('value2', result.get('key2'));
    }
}