public with sharing class InsightsResourcesController {

    // Add a flag for test mode
    public static Boolean useMock = false;

    // This method is now testable with injected data
    @TestVisible
    public static List<Map<String,Object>> getCardDataListInternal(ConnectApi.ManagedContentCollectionItems collection) {
        List<Map<String,Object>> response = new List<Map<String,Object>>();

        Integer index = 0;
        for (ConnectApi.ManagedContentCollectionItem item : collection.items) {
            Map<String, Object> unwrappedItem =
                (Map<String, Object>) ConnectApi.ConnectUtilities.unwrapApexWrapper(item.body.get('contentBody'));

            item.body.put('contentBody', unwrappedItem);

            Map<String, Object> contentBody =
                (Map<String, Object>) item.body.get('contentBody');

            String rteBodyHtml = (String) contentBody.get('body');

            Map<String, Object> bannerImage = (Map<String, Object>) contentBody.get('bannerImage');
            String relativeImageUrl = (String) bannerImage.get('url');
            String absoluteImageUrl = '/sfsites/c' + relativeImageUrl;

            Map<String,Object> menuItemInfo = getCollectionBodySanitize(rteBodyHtml);
            menuItemInfo.put('imageUrl', absoluteImageUrl);
            menuItemInfo.put('seqence', index++);
            menuItemInfo.put('publishedDate', item.body.get('publishedDate'));
            menuItemInfo.put('urlName', item.body.get('urlName'));
            menuItemInfo.put('contentKey', item.body.get('name'));
            menuItemInfo.put('buttonUrl', '/news/' + item.body.get('urlName') + '-' + item.body.get('contentKey'));

            response.add(menuItemInfo);
        }

        return response;
    }

    @AuraEnabled(cacheable=true)
    public static List<Map<String,Object>> getCardDataList(String siteId, String contentId) {

        if (Test.isRunningTest() && useMock) {
            // Return mock data for testing (mock path)
            Map<String,Object> mockItem = new Map<String,Object>{
                'title' => 'Test Title',
                'description' => 'Test Description',
                'imageUrl' => '/sfsites/c/testImage.png',
                'seqence' => 0,
                'publishedDate' => Date.today(),
                'urlName' => 'test-url',
                'contentKey' => 'TestKey',
                'buttonUrl' => '/news/test-url-TestKey'
            };
            return new List<Map<String,Object>>{ mockItem };
        }

        // Production - get collection items from ConnectApi
        ConnectApi.ManagedContentCollectionItems collection =
            ConnectApi.ManagedContentDelivery.getCollectionItemsForSite(siteId, contentId, 'en_US');

        // Delegate the processing to the test-visible internal method
        return getCardDataListInternal(collection);
    }

    public static Map<String,Object> getCollectionBodySanitize(String htmlString) {
            String html = htmlString;
        html = html.replaceAll('(?i)<div[^>]*>', '');
        html = html.replaceAll('(?i)</div>', '\n');
        html = html.replace('&lt;', '<')
                   .replace('&gt;', '>')
                   .replace('&amp;', '&')
                   .replace('&#34;', '"')
                   .replace('&#39;', '\'');

        List<String> lines = html.split('\n');
        Map<String,Object> jsonData = new Map<String,Object>();

        for (String line : lines) {
            line = line.trim();
            if (String.isBlank(line)) continue;
            List<String> parts = line.split(':');
            if (parts.size() >= 2) {
                String key = parts[0].trim();
                String value = line.substring(line.indexOf(':') + 1).trim();
                jsonData.put(key, value);
            }
        }
        return jsonData;
    }
    }