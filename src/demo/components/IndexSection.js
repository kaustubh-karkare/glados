import { By } from 'selenium-webdriver';

import BulletList from './BulletList';
import ComponentBase from './ComponentBase';
import { TypeaheadSelector } from './Inputs';

export default class IndexSection extends ComponentBase {
    #webdriver;

    constructor(webdriver, element) {
        super(webdriver, element);
        // Store private reference since the parent's #webdriver is inaccessible.
        this.#webdriver = webdriver;
    }

    static async get(webdriver) {
        const elements = await webdriver.findElements(By.className('index-section'));
        return elements.length ? new this(webdriver, elements[0]) : null;
    }

    async getTypeahead() {
        const inputElement = await this.element.findElement(
            By.xpath("./div[1]//div[contains(@class, 'rbt')]"),
        );
        return new TypeaheadSelector(this.#webdriver, inputElement);
    }

    async getBulletList(index) {
        const items = await this.element.findElements(By.xpath(
            "./div[contains(@class, 'scrollable-section')]"
            + "/div[contains(@class, 'bullet-list')]",
        ));
        const item = ComponentBase.getItemByIndex(items, index);
        return item ? new BulletList(this.#webdriver, item) : null;
    }
}
