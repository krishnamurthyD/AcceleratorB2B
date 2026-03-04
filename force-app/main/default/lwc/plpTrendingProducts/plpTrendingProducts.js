import { LightningElement } from 'lwc';

export default class PlpTrendingProducts extends LightningElement {
    products = [
        { id: 't1', name: 'Power Drill X200', price: '$129.99' },
        { id: 't2', name: 'Safety Helmet Pro', price: '$45.50' },
        { id: 't3', name: 'Work Gloves (Pack)', price: '$12.99' },
        { id: 't4', name: 'Toolbox Heavy Duty', price: '$89.00' }
    ];
}