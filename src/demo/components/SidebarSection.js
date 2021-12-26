import { By } from 'selenium-webdriver';
import BaseWrapper from './BaseWrapper';
import ReminderItem from './ReminderItem';

export default class SidebarSection extends BaseWrapper {
    static async get(webdriver, name) {
        const element = await webdriver.findElement(By.xpath(
            '//div[contains(@class, \'sidebar-section\')]'
            + '/div[contains(@class, \'cursor\')]'
            + `/div/div[text() = '${name}']`
            + '/../../..',
        ));
        return new this(webdriver, element);
    }

    async getItems() {
        const items = await this.element.findElements(
            By.xpath(".//div[contains(@class, 'highlightable')]//div[contains(@class, 'input-line')]"),
        );
        return Promise.all(items.map((item) => item.getText()));
    }

    async getReminderItems() {
        const items = await this.element.findElements(By.xpath(".//div[contains(@class, 'reminder-item')]"));
        return items.map((item) => new ReminderItem(this.webdriver, item));
    }
}
