const { By } = require('selenium-webdriver');
const BaseWrapper = require('./BaseWrapper');

class ReminderItem extends BaseWrapper {
    async getCheckbox() {
        const checkbox = await this.element.findElement(By.xpath(".//input[@type = 'checkbox']"));
        return new BaseWrapper(this.webdriver, checkbox);
    }

    async pickMenuItem(label) {
        const rightElement = await this.element.findElement(By.xpath(".//span[contains(@class, 'float-right')]"));
        await this.moveTo(rightElement);
        await this.wait();
        const optionElement = await this.element.findElement(
            By.xpath(`.//a[contains(@class, 'dropdown-item') and text() = '${label}']`),
        );
        await this.moveToAndClick(optionElement);
    }
}

module.exports = ReminderItem;
