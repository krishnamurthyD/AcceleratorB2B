import { LightningElement, wire, track, api } from 'lwc';
import { publish, MessageContext } from 'lightning/messageService';
import B2B_DEMO_STORE_CHANNEL from '@salesforce/messageChannel/B2BDemoStore__c';

export default class PlpHeader extends LightningElement {
    @api totalProducts = 0;
    @track viewMode = 'grid';
    @track sortBy = 'relevance';
    @track isFilterOpen = false;

    @wire(MessageContext)
    messageContext;

    sortOptions = [
        { label: 'Relevance', value: 'relevance' },
        { label: 'Price: Low to High', value: 'price_asc' },
        { label: 'Price: High to Low', value: 'price_desc' },
        { label: 'Name: A-Z', value: 'name_asc' }
    ];

    get gridVariant() { return this.viewMode === 'grid' ? 'brand' : 'border-filled'; }
    get listVariant() { return this.viewMode === 'list' ? 'brand' : 'border-filled'; }

    handleFilterToggle() {
        this.isFilterOpen = !this.isFilterOpen;
        const payload = { filterStatus: this.isFilterOpen ? 'open' : 'closed' };
        publish(this.messageContext, B2B_DEMO_STORE_CHANNEL, payload);
    }

    setGridView() {
        this.updateViewMode('grid');
    }

    setListView() {
        this.updateViewMode('list');
    }

    updateViewMode(mode) {
        this.viewMode = mode;
        const payload = { viewMode: mode };
        publish(this.messageContext, B2B_DEMO_STORE_CHANNEL, payload);
    }

    handleSortChange(event) {
        this.sortBy = event.detail.value;
        // Dispatch event for parent or LMS if needed. 
    }
}
