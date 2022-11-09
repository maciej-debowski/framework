import { Component, Reference } from 'framework'

export default class ButtonRate extends Component {
    private rateRef: Reference;

    public onBuildStart(): string {
        return `<div id="rate" style="margin-top: 32px;">
            <h3>Rate us ({{$rate}} / 5):</h3>

            <button [Event.click]="(()=>@rate(1))">*</button>
            <button [Event.click]="(()=>@rate(2))">*</button>
            <button [Event.click]="(()=>@rate(3))">*</button>
            <button [Event.click]="(()=>@rate(4))">*</button>
            <button [Event.click]="(()=>@rate(5))">*</button>
        </div>`   
    }

    public styles(): string {
        return ``;
    }

    public data(): any {
        return {
            rate: 4
        }
    }

    public methods: any = {
        rate(rate: number): void {
            console.log(rate)
            this.app.rateRef.set(rate);
        }
    }

    public onMounted(): void {
        this.rateRef = new Reference(this, "rate");
    }
}