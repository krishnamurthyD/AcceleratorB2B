import { LightningElement } from 'lwc';

export default class PlpConceptualFilter extends LightningElement {
    categories = [
        { id: '1', label: 'Tools', icon: 'utility:tools' },
        { id: '2', label: 'Safety', icon: 'utility:shield' },
        { id: '3', label: 'Electrical', icon: 'utility:flash' },
        { id: '4', label: 'Plumbing', icon: 'utility:water' }
    ];

    handleCategoryClick(event) {
        const categoryId = event.currentTarget.dataset.id;
        console.log('Category clicked:', categoryId);
    }
}