import { By } from 'selenium-webdriver';
import BaseWrapper from './BaseWrapper';
import { TypeaheadSelector } from './Inputs';

export default class IndexSection extends BaseWrapper {
    static async get(webdriver) {
        const elements = await webdriver.findElements(By.className('index-section'));
        return elements.length ? new this(webdriver, elements[0]) : null;
    }

    async getTypeaheadSelector() {
        const inputElement = await this.element.findElement(
            By.xpath("./div[1]//div[contains(@class, 'rbt')]"),
        );
        return new TypeaheadSelector(this.webdriver, inputElement);
    }
}
