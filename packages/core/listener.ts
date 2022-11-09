/**
 *
 * @package @Framework/core 
 */

export class Listener {
    public eventName: string;
    public callback: string;

    constructor(eventName: string, callback: string) {
        this.eventName = eventName.split("[event.")[1].split("]")[0];
        this.callback = callback.replace(/\@/g, 'methods.');
    } 
}