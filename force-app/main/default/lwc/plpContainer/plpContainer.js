import { LightningElement, track, api } from 'lwc';
import { createSearchSortUpdateAction, createSearchFiltersUpdateAction, createSearchFiltersClearAction, dispatchAction } from 'commerce/actionApi';

export default class PlpContainer extends LightningElement {
    @track processedItems = [];
    @track viewMode = 'grid'; // 'grid' or 'list'
    @track sortBy = 'relevance';
    @track isLoading = true;
    @track totalProducts = 0;
    @track isFilterVisible = false;
    @track facets = [];
    @track selectedProductId;
    @track isQuickViewOpen = false;
    @track isNotifyMeOpen = false;
    @track notifyProductId;

    _searchResults;
    _rawProducts = [];
    _sortRules = [];
    _currentSortRuleId;

    @api
    get sortRules() {
        return this._sortRules;
    }

    set sortRules(value) {
        this._sortRules = value;
        this.updateSortOptions();
    }

    @api
    get currentSortRuleId() {
        return this._currentSortRuleId;
    }

    set currentSortRuleId(value) {
        this._currentSortRuleId = value;
        this.sortBy = value;
    }

    @track sortOptions = [];

    updateSortOptions() {
        console.log('Updating Sort Options. Rules:', JSON.stringify(this._sortRules));
        if (this._sortRules && Array.isArray(this._sortRules)) {
            this.sortOptions = this._sortRules.map(rule => ({
                label: rule.label || rule.name || rule.sortRuleId, 
                value: rule.sortRuleId || rule.id
            }));

            // Auto-select the first option if current sortBy is invalid or not set
            // This prevents the "Select" placeholder from showing
            const isValidOption = this.sortOptions.some(opt => opt.value === this.sortBy);
            if (!isValidOption && this.sortOptions.length > 0) {
                this.sortBy = this.sortOptions[0].value;
            }
        } else {
             this.sortOptions = [];
        }
    }

    @api
    get searchResults() {
        return this._searchResults;
    }

    set searchResults(value) {
        this._searchResults = value;
        this.handleSearchResults(value);
    }

    connectedCallback() {
        setTimeout(() => {
            console.log('search details',JSON.stringify(this._searchResults, null, 2));
            
        }, 2000);
    }
    handleSearchResults(data) {
        if (data) {
            let products = [];
            // Handle if data is the array itself or an object with products property
            if (Array.isArray(data)) {
                products = data;
            } else if (data && Array.isArray(data.products)) {
                products = data.products;
            } else if (data && data.items) {
                 // Sometimes it might be 'items'
                 products = data.items;
            } else if (data && Array.isArray(data.cardCollection)) {
                // Handle B2B Commerce Search Results structure
                products = data.cardCollection;
            }

            // Extract Facets if available
            if (data && data.facets) {
                this.facets = data.facets;
            } else if (data && data.filtersPanel && data.filtersPanel.facets) {
                // Handle B2B Commerce Facets structure
                this.facets = data.filtersPanel.facets;
            }

            this.totalProducts = products.length;
            this._rawProducts = products;
            this.processGrid();
            this.isLoading = false;
        } else {
            this.isLoading = false;
        }
    }

    get filterButtonLabel() {
        return this.isFilterVisible ? 'Hide Filter' : 'Show Filter';
    }

    get mainContentClass() {
        return this.isFilterVisible ? 'slds-col slds-size_1-of-1 slds-medium-size_3-of-4 slds-p-left_medium' : 'slds-col slds-size_1-of-1';
    }

    toggleFilter() {
        this.isFilterVisible = !this.isFilterVisible;
        this.processGrid();
    }

    handleFilterChange(event) {
        console.log('Filter changed:', event.detail);
        const refinements = event.detail.refinements;
        
        try {
            dispatchAction(this, createSearchFiltersUpdateAction({
                refinements: refinements,
                page: 0
            }));
        } catch (error) {
            console.error('Error creating search filter action:', error);
        }
    }

    handleClearFilters() {
        console.log('Clear filters clicked');
        try {
            dispatchAction(this, createSearchFiltersClearAction());
        } catch (error) {
            console.error('Error clearing search filters:', error);
        }
    }

    /**
     * Injects specific components at fixed intervals.
     * Interval depends on view mode and filter visibility.
     */
    processGrid(productsInput) {
        const products = productsInput || this._rawProducts || [];
        const items = [];
        let productCount = 0;

        // Determine injection interval
        // Grid + Filter Open = 6
        // Grid + Filter Closed = 8
        // List = 8 (default)
        let interval = 8;
        if (this.viewMode === 'grid' && this.isFilterVisible) {
            interval = 6;
        }

        products.forEach((product) => {
            // Add Product
            items.push({
                id: product.id,
                isProduct: true,
                data: product
            });
            productCount++;

            // Injection Logic
            if (productCount === interval) {
                items.push({
                    id: 'injection-banner',
                    isInjection: true,
                    isBanner: true
                });
            } else if (productCount === interval * 2) {
                items.push({
                    id: 'injection-conceptual-filter',
                    isInjection: true,
                    isConceptualFilter: true
                });
            } else if (productCount === interval * 3) {
                items.push({
                    id: 'injection-trending',
                    isInjection: true,
                    isTrending: true
                });
            }
        });

        this.processedItems = items;
    }

    // --- VIEW TOGGLE ---

    get gridClass() {
        return `product-grid ${this.viewMode}`;
    }

    get listViewClass() {
        return this.viewMode === 'list' ? 'view-btn active' : 'view-btn';
    }

    get gridViewClass() {
        return this.viewMode === 'grid' ? 'view-btn active' : 'view-btn';
    }

    get gridVariant() {
        return this.viewMode === 'grid' ? 'brand' : 'border-filled';
    }

    get listVariant() {
        return this.viewMode === 'list' ? 'brand' : 'border-filled';
    }

    setGridView() {
        this.viewMode = 'grid';
        this.processGrid();
    }

    setListView() {
        this.viewMode = 'list';
        this.processGrid();
    }

    handleSortChange(event) {
        this.sortBy = event.detail.value;
        dispatchAction(this, createSearchSortUpdateAction(this.sortBy));
    }

    handleQuickView(event) {
        this.selectedProductId = event.detail.productId;
        this.isQuickViewOpen = true;
    }

    handleCloseQuickView() {
        this.isQuickViewOpen = false;
        this.selectedProductId = null;
    }

    handleNotifyMe(event) {
        console.log('plpContainer: handleNotifyMe received', event.detail);
        this.notifyProductId = event.detail.productId;
        this.isNotifyMeOpen = true;
    }

    handleCloseNotifyMe() {
        this.isNotifyMeOpen = false;
        this.notifyProductId = null;
    }

    handleSubmitNotifyMe(event) {
        const { productId, firstName, lastName, email } = event.detail;
        console.log('Notify Me Request:', { productId, firstName, lastName, email });
        // Here you would call an Apex method to save the request
        this.handleCloseNotifyMe();
    }
}
