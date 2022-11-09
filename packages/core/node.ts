/**
 *
 * @package @Framework/core 
 */

import { stringToElement } from './vdom'
import { Listener } from './listener'
import { Attribute } from './attr'
import { Reference } from './ref'

const RELOAD_MIN_SPEED: number = 0; // miliseconds

class FNode {
    private elementHTML: string;
    private children: Array<FNode>;
    private parent: FNode|null;
    private element: HTMLElement;
    private isText: boolean;
    private text: string;
    private data: any;
    private attributes: Array<Attribute>;
    private inputReference: Reference;
    private focused: boolean;
    private value: string;

    /**
     * 
     * @param elementHTML 
     * @param isText Node is type === 3 (TEXT NODE)
     * @param parent 
     */
    constructor(elementHTML: string, isText: boolean, parent: FNode | null) {
        this.parent = parent;
        this.isText = isText;
        this.elementHTML = elementHTML;
        this.element = stringToElement(elementHTML);
        this.children = [];
        this.attributes = [];
        this.focused = false;

        if(isText) this.text = elementHTML
        
        const children: Node[] = this.element?.childNodes ? Array.from(this.element.childNodes) : [];

        if(children.length > 0) {
            for(const child of children) {
                if(child) this.children.push(new FNode(child.nodeType === 3 ? child.nodeValue as string : child.outerHTML, child.nodeType === 3, this));
            }
        }

        // Attributies
        if(!(this.element instanceof Text)) this.element.getAttributeNames().forEach((name: string): void => {
            this.attributes.push(new Attribute(name, this.element.getAttribute(name)));
        });
    }

    public evaluateDataToString(text: string, data: any): string {
        const dataRE: RegExp = /\{\{((?:.|\n)+?)\}\}/g
        const matches: RegExpMatchArray|null = text.match(dataRE);

        if(!matches) return text;

        matches.forEach((match: string): void => {
            const $inside: string = match.split("{{")[1].split("}}")[0].replace(/\$/g, 'data.');
            const $value: string = eval($inside);

            text = text.replace(match, $value);
        });

        return text;
    }

    private getListeners(element: HTMLElement): Array<Listener> {
        const listeners: Array<Listener> = [];
        const listenerRE: RegExp = /\[event\.[\w]+\]/g

        this.attributes.forEach((attr: Attribute) => {
            if(attr.name.match(listenerRE)) {
                listeners.push(new Listener(attr.name, attr.value));
            }
        });

        return listeners;
    }

    private setReferences(id: string, element: HTMLElement, self: any): void {
        const attrRE: RegExp = /\[ref\.value\]/g;

        this.attributes.forEach((attr: Attribute): void => {
            if(attr.name.match(attrRE)) {
                const ref = new Reference(self, attr.value);

                setTimeout(() => {
                    const _element: HTMLInputElement = document.querySelector(`[f-id="${id}"]`);
                    _element.value = self.$data[attr.value]

                    _element.addEventListener("input", () => {
                        ref.set(_element.value);
                    });
                }, RELOAD_MIN_SPEED)
            }
        });
    }

    private bindAttributes(id: string, methods: any, self: any) {
        setTimeout(() => {
            this.attributes.forEach((attr: Attribute): void => {
                const isBinding: boolean = attr.name.startsWith("f-");
                if(isBinding) {
                    const real: string = attr.name.split("f-")[1];
                    const value: string = attr.value.replace('@', 'methods.');

                    const realValue: string = eval(`${value}`)(self);
                                
                    document.querySelector(`[f-id="${id}"]`).setAttribute(real, realValue);
                }
            });
        }, RELOAD_MIN_SPEED);
    }

    private refreshState(id: string): void {
        // TODO: checked selected

        if(this.focused) {
            setTimeout(() => { 
                eval(`document.querySelector('[f-id="${id}"]').focus()`);
            }, RELOAD_MIN_SPEED);
        }
    }

    private renderAsComponent(id: string, self: any): void {
        const _class: any = self.$childrenComponents.find((component: any) => component.name.toLowerCase() == this.element.tagName.toLowerCase());
        if(!_class) return;

        const component: any = _class.component;
        const instance: any = new component();

        instance.check();
        instance.mountTo(id);
    }

    public renderNode(mountTo: HTMLElement, data: any, methods: any, self: any): void {
        if(!this.element) return;

        if(this.isText) {
            mountTo.innerHTML += this.evaluateDataToString(this.text, data);
        }
        else {
            const element: HTMLElement = document.createElement(this.element.tagName);
            mountTo.append(element);
            
            const id: string = 'ev-' + Math.round(Math.random() * 1e18).toString(36);
            element.setAttribute('f-id', id);

            // Attributes
            this.attributes.forEach((attr: Attribute) => {
                if(attr.name.indexOf('[') != -1) return;

                element.setAttribute(attr.name, attr.value);
            });

            // Events
            const eventListeners: Array<Listener> = this.getListeners(element);
            eventListeners.forEach((listener: Listener): void => {
                setTimeout(() => {
                    const _element: HTMLElement = document.querySelector(`[f-id="${id}"]`);

                    _element.addEventListener(listener.eventName, () => {
                        eval(`(() => ${listener.callback}())();`);
                    });
                }, RELOAD_MIN_SPEED);
            });

            if(this.attributes.find((attr: Attribute): boolean => attr.name === 'render')) {
                this.renderAsComponent(id, self);

                return;
            }
            
            // References
            this.setReferences(id, element, self);

            // Refresh state
            this.refreshState(id);

            // Binding Attributes
            this.bindAttributes(id, methods, self);

            // State Listeners
            setTimeout(() => {
                const _element: HTMLElement = document.querySelector(`[f-id="${id}"]`);

                _element.addEventListener("focus", () => {
                    this.focused = true;
                });

                _element.addEventListener("blur", () => {
                    if(eval("window.framework_reload")) return;

                    this.focused = false;
                });

                _element.addEventListener("input", () => {
                    if(eval("window.framework_reload")) return;

                    this.value = _element instanceof HTMLInputElement ? _element.value : '';
                });
            }, RELOAD_MIN_SPEED);

            // Children rendering
            this.children.forEach((child: FNode): void => {
                child.renderNode(element, data, methods, self);
            });
        }
    }
}

function createNodeTree(htmlString: string): FNode {
    return new FNode(htmlString, false, null);
}

export { FNode, createNodeTree };