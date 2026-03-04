/**
 * @description Controller class for the Clientele Card Component (clienteleCardComponent LWC).
 * Retrieves client/partner logo data from Salesforce CMS (Experience Cloud) for display
 * in a carousel format on the storefront homepage.
 * 
 * @author B2B Commerce Team
 * @date December 4, 2025
 */
public with sharing class ClienteleCardController {

    /**
     * @description Retrieves clientele card data from CMS collection for a specific site.
     * Fetches brand logos, alt text, and image URLs to display partner companies.
     * This method is cacheable to improve performance and reduce API calls.
     * 
     * @param siteId The Experience Cloud site ID where the content is published
     * @param contentId The CMS collection ID containing clientele/partner logo content
     * @return List<Map<String,Object>> List of maps containing logo data (id, name, altText, imageUrl, sequence)
     * 
     * @example
     * List<Map<String,Object>> logos = ClienteleCardController.getClienteleCardData('0DM...', '20Y...');
     */
    @AuraEnabled(cacheable=true)
    public static List<Map<String,Object>> getClienteleCardData(String siteId, String contentId){
        ConnectApi.ManagedContentCollectionItems collection = ConnectApi.ManagedContentDelivery.getCollectionItemsForSite(siteId, contentId, 'en_US');
        return processCollectionItems(collection.items);
    }

    /**
     * @description Helper method to process CMS collection items and extract relevant logo data.
     * Unwraps the Apex wrapper, retrieves media URLs and alt text, and formats the response
     * for consumption by the Lightning Web Component.
     * Made @TestVisible to allow unit testing without making actual CMS API calls.
     * 
     * @param items List of CMS collection items retrieved from ConnectApi
     * @return List<Map<String,Object>> Processed list containing logo metadata (id, name, altText, imageUrl, sequence)
     */
    @TestVisible
    static List<Map<String,Object>> processCollectionItems(List<ConnectApi.ManagedContentCollectionItem> items) {
        List<Map<String,Object>> response = new List<Map<String,Object>>();
        for(ConnectApi.ManagedContentCollectionItem item : items) {
            Map<String,Object> unwrappedItem = (Map<String,Object>)ConnectApi.ConnectUtilities.unwrapApexWrapper(item.body.get('contentBody'));
            item.body.put('contentBody', unwrappedItem);

            Map<String, Object> mediaMap = (Map<String, Object>) unwrappedItem.get('sfdc_cms:media');
            String imageUrl = (String) mediaMap.get('url');

            Map<String, Object> contentBody = (Map<String, Object>) item.body.get('contentBody');
            String altText = (String) contentBody.get('altText');

            Map<String,Object> itemMap = new Map<String,Object>();
            itemMap.put('id', item.Id);
            itemMap.put('name', item.name);
            itemMap.put('altText', altText);
            itemMap.put('imageUrl', '/sfsites/c' + imageUrl);
            itemMap.put('sequence', response.size());
            response.add(itemMap);
        }
        return response; 
    }
}