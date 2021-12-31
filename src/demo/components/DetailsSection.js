import { By } from 'selenium-webdriver';

import BaseWrapper from './BaseWrapper';
import { TextEditor } from './Inputs';

export default class DetailsSection extends BaseWrapper {
    static async get(webdriver, index) {
        const elements = await webdriver.findElements(By.className('details-section'));
        const element = BaseWrapper.getItemByIndex(elements, index);
        return element ? new this(webdriver, element) : null;
    }

    async isActive() {
        const elements = await this.element.findElements(By.xpath('.//input[@placeholder = \'Details ...\']'));
        return elements.length === 0;
    }

    async getInput() {
        return TextEditor.get(this.webdriver, this.element);
    }

    async perform(name) {
        const button = await this.element.findElement(By.xpath(`.//button[@title = '${name}']`));
        await this.moveToAndClick(button);
    }
}
