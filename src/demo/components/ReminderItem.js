import { By } from 'selenium-webdriver';

import ComponentBase from './ComponentBase';

export default class ReminderItem extends ComponentBase {
    #webdriver;

    constructor(webdriver, element) {
        super(webdriver, element);
        // Store private reference since the parent's #webdriver is inaccessible.
        this.#webdriver = webdriver;
    }

    async getCheckbox() {
        const checkbox = await this.element.findElement(By.xpath(".//input[@type = 'checkbox']"));
        return new ComponentBase(this.#webdriver, checkbox);
    }

    async pickMenuItem(label) {
        await this.moveTo();
        const rightElement = await this.element.findElement(By.xpath(".//div[contains(@class, 'icon')]"));
        await this.moveTo(rightElement);
        await this.wait();
        await this.#webdriver.wait(async () => (await this.element.findElements(By.className('dropdown-item'))).length > 0);
        const optionElement = await this.element.findElement(
            By.xpath(`.//a[contains(@class, 'dropdown-item') and text() = '${label}']`),
        );
        await this.moveToAndClick(optionElement);
    }
}
