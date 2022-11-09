/**
 *
 * @package @Framework/core 
 */

export class Reference {
    private self: any;
    private name: string;

    constructor(self: any, name: string) {
        this.self = self;
        this.name = name;

    }

    public get(): any {
        return this.self.$data[this.name];
    }

    public set(value: any): any {
        const old: any = this.get();

        this.self.setData(this.name, value);
        if(old !== value) this.self.render();   // Re-Rendering Component if data are changed
    }
}