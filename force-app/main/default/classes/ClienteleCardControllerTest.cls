@IsTest
private class ClienteleCardControllerTest {
    
    @IsTest
    static void testProcessCollectionItems() {
        List<ConnectApi.ManagedContentCollectionItem> items = new List<ConnectApi.ManagedContentCollectionItem>();

        ConnectApi.ManagedContentCollectionItem item = new ConnectApi.ManagedContentCollectionItem();
        item.Id = '1';
        item.name = 'Test Item';
        Map<String, Object> body = new Map<String, Object>();
        Map<String, Object> contentBody = new Map<String, Object>();
        Map<String, Object> mediaMap = new Map<String, Object>();
        mediaMap.put('url', '/image.png');
        contentBody.put('sfdc_cms:media', mediaMap);
        contentBody.put('altText', 'Test Alt');
        body.put('contentBody', contentBody);
        item.body = body;

        items.add(item);

        List<Map<String,Object>> result = ClienteleCardController.processCollectionItems(items);
        
        System.assertEquals(1, result.size());
        System.assertEquals('Test Item', result[0].get('name'));
        System.assertEquals('/sfsites/c/image.png', result[0].get('imageUrl'));
        System.assertEquals('Test Alt', result[0].get('altText'));
    }
}