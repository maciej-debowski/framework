import { Component, Reference } from 'cokeframework'
import ButtonRate from './ButtonRate'

export default class App extends Component {
    private nameRef: Reference;

    public onBuildStart(): string {
        this.use('ButtonRate', ButtonRate)

        return `<div id="app-root">
            <h1>
                Hello, <span f-class="@getClass">{{ $name }}</span>!
            </h1>

            <input placeholder="Name" [Ref.Value]="name">
            <button [Event.click]="@promptName">Prompt your name</button>

            <br>

            <h1>Data: {{$data}}</h1>

            <br>

            <ButtonRate render></ButtonRate>
        </div>`   
    }

    public styles(): string {
        return ``;
    }

    public data(): any {
        return {
            name: "world",
            data: `${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}`
        }
    }

    public methods: any = {
        promptName() {
            this.app.nameRef.set(prompt("Your name:"));
        },

        getClass(app: any): string {
            return app.nameRef.get().length % 2 == 0 ? "italic" : "";
        }
    }

    public onMounted(): void {
        this.nameRef = this.createRef("name");
    }
}