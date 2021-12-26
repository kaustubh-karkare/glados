import { By } from 'selenium-webdriver';
import BaseWrapper from './BaseWrapper';

export default class ReminderItem extends BaseWrapper {
    async getCheckbox() {
        const checkbox = await this.element.findElement(By.xpath(".//input[@type = 'checkbox']"));
        return new BaseWrapper(this.webdriver, checkbox);
    }

    async pickMenuItem(label) {
        await this.moveTo();
        const rightElement = await this.element.findElement(By.xpath(".//div[contains(@class, 'icon')]"));
        await this.moveTo(rightElement);
        await this.wait();
        await this.webdriver.wait(async () => (await this.element.findElements(By.className('dropdown-item'))).length > 0);
        const optionElement = await this.element.findElement(
            By.xpath(`.//a[contains(@class, 'dropdown-item') and text() = '${label}']`),
        );
        await this.moveToAndClick(optionElement);
    }
}
