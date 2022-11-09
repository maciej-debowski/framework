/**
 *
 * @package @Framework/core 
 */

function stringToElement(htmlString: string): HTMLElement {
    const div: HTMLElement = document.createElement('div');
    div.innerHTML = htmlString;

    return div.childNodes[0] as HTMLElement;
}

export { stringToElement }