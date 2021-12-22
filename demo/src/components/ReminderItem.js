const { By } = require('selenium-webdriver');
const BaseWrapper = require('./BaseWrapper');
const { waitUntil } = require('../utils');

class ReminderItem extends BaseWrapper {
    async getCheckbox() {
        const checkbox = await this.element.findElement(By.xpath(".//input[@type = 'checkbox']"));
        return new BaseWrapper(this.webdriver, checkbox);
    }

    async pickMenuItem(label) {
        const rightElement = await this.element.findElement(By.xpath(".//span[contains(@class, 'float-right')]"));
        await this.moveTo(rightElement);
        await this.wait();
        await waitUntil(async () => (await this.element.findElements(By.className('dropdown-item'))).length > 0);
        const optionElement = await this.element.findElement(
            By.xpath(`.//a[contains(@class, 'dropdown-item') and text() = '${label}']`),
        );
        await this.moveToAndClick(optionElement);
    }
}

module.exports = ReminderItem;
