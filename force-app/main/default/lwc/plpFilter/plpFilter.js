import { LightningElement, api, track } from 'lwc';
// import { createSearchFiltersUpdateAction, dispatchAction } from 'commerce/actionApi';

export default class PlpFilter extends LightningElement {
    @api facets = [];
    @track expandedFacetIds = new Set();

    get processedFacets() {
        return this.facets.map(facet => ({
            ...facet,
            isExpanded: this.expandedFacetIds.has(facet.nameOrId),
            iconClass: this.expandedFacetIds.has(facet.nameOrId) ? 'chevron-expanded' : 'chevron'
        }));
    }

    toggleSection(event) {
        const facetId = event.currentTarget.dataset.id;
        const newSet = new Set(this.expandedFacetIds);
        if (newSet.has(facetId)) {
            newSet.delete(facetId);
        } else {
            newSet.add(facetId);
        }
        this.expandedFacetIds = newSet;
    }

    connectedCallback() {
        console.log('PlpFilter component initialized. Facets:', JSON.stringify(this.facets));
    }

    handleFilterChange(event) {
        const facetId = event.target.name;
        const valueName = event.target.value;
        const isChecked = event.target.checked;
        
        // Construct new refinements based on current facets + change
        let newRefinements = [];

        this.facets.forEach(facet => {
            let selectedValues = [];
            
            // Get currently selected values from the prop
            if (facet.values) {
                facet.values.forEach(val => {
                    if (val.checked) {
                        selectedValues.push(val.name); // Use internal name/value
                    }
                });
            }

            // Apply the change if this is the modified facet
            if (facet.nameOrId === facetId) {
                if (isChecked) {
                    if (!selectedValues.includes(valueName)) {
                        selectedValues.push(valueName);
                    }
                } else {
                    selectedValues = selectedValues.filter(v => v !== valueName);
                }
            }

            if (selectedValues.length > 0) {
                newRefinements.push({
                    nameOrId: facet.nameOrId,
                    type: facet.facetType,
                    attributeType: facet.attributeType,
                    values: selectedValues
                });
            }
        });

        // Dispatch the custom event for parent awareness
        this.dispatchEvent(new CustomEvent('filterchange', {
            detail: { refinements: newRefinements }
        }));
    }
}