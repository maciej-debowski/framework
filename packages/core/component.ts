/**
 *
 * @package @Framework/core 
 */

import { FNode, createNodeTree } from './node';
import { Reference } from './ref';

class Component {
    private parentElement: HTMLElement;
    private parentElementId: string;
    private nodeTree: FNode;
    private id: string;
    private $data: any;
    private $childrenComponents: any;

    public methods: any;

    public onBuildStart(): string { return ""; }
    public data(): any {}
    public onMounted(): void {}
    
    constructor() {
        this.id = Math.round(Math.random() * 1e9).toString(36);
        this.$childrenComponents = [];
    }

    public use(name: string, component: any) {
        this.$childrenComponents.push({
            name, component
        });
    }

    public check(): void {
        // Checking if data is valid
    }

    public mountTo(elementId: string): void {
        this.parentElementId = elementId;
        this.parentElement = document.querySelector(`[f-id="${elementId}"]`);
        this.parentElement.innerHTML = `<Component-fMount f-id="${this.id}"></Component-fMount>`;

        this.$data = this.data();

        this.nodeTree = createNodeTree(this.onBuildStart());
        this.render();
    } 

    public setData(name: string, value: any): void {
        this.$data[name] = value;
    }

    public render(): void {
        const sessionId = Math.round(Math.random() * 1e9);
        eval(`window.framework_reload=${sessionId};`);

        const mount: HTMLElement = this.parentElement.querySelector(`[f-id="${this.id}"]`);
        mount.innerHTML = "";
        this.methods.app = this;
        
        this.nodeTree.renderNode(mount, this.$data, this.methods, this);
        this.onMounted();

        if(eval(`window.framework_reload`) == sessionId) eval(`window.framework_reload=false`);
    }

    public createRef(name: string): Reference {
        return new Reference(this, name);
    }
}

export { Component };