/**
 *
 * @package @Framework/core 
 */

import { Component } from './component'

class App {
    private rootComponent: Component;
    private elementID: string;

    constructor(elementID: string, component: Component) {
        this.rootComponent = component;
        this.elementID = elementID;

        this.onInit();
    }

    private onInit(): void {
        this.giveFID(document.querySelector(this.elementID), this.elementID);

        this.rootComponent.check();
        this.rootComponent.mountTo(this.elementID);
    }

    private giveFID(element: HTMLElement, id: string): void {
        element.setAttribute("f-id", id);
    }
}

export { App };