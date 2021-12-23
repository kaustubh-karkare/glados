/* eslint-disable max-classes-per-file */

import { By } from 'selenium-webdriver';
import BaseWrapper from './BaseWrapper';
import { TextEditor } from './Inputs';

export default class BulletList extends BaseWrapper {
    static async get(webdriver, index) {
        const elements = await webdriver.findElements(By.className('bullet-list'));
        const element = BaseWrapper.getItemByIndex(elements, index);
        return element ? new this(webdriver, element) : null;
    }

    async getHeader() {
        const element = await this.element.findElement(By.xpath('./div[1]'));
        // eslint-disable-next-line no-use-before-define
        return new BulletListItem(this.webdriver, element);
    }

    async _getItems() {
        return this.element.findElements(By.xpath("./div[2]/div[contains(@class, 'highlightable')]"));
    }

    async getItem(index) {
        const elements = await this._getItems();
        // eslint-disable-next-line no-use-before-define
        return new BulletListItem(this.webdriver, BaseWrapper.getItemByIndex(elements, index));
    }

    async getItemCount() {
        const elements = await this._getItems();
        return elements.length;
    }

    async getAdder() {
        return TextEditor.get(this.webdriver, this.element);
    }
}

class BulletListItem extends BaseWrapper {
    async _getButton(title) {
        await this.moveTo(this.element);
        return this.element.findElement(By.xpath(
            `.//div[contains(@class, 'icon') and @title='${title}']`,
        ));
    }

    async perform(name) {
        await this.moveTo(this.element);
        const button = await this._getButton(name);
        await this.moveToAndClick(button);
    }

    async performAction(name) {
        await this.moveTo(this.element);
        const actionButton = await this._getButton('Actions');
        await this.moveTo(actionButton);
        await this.webdriver.wait(async () => (await actionButton.findElements(By.className('dropdown-item'))).length > 0);
        const actionElement = await actionButton.findElement(
            By.xpath(`.//a[contains(@class, 'dropdown-item') and text() = '${name}']`),
        );
        await this.moveToAndClick(actionElement);
    }

    async getSubList() {
        const items = await this.element.findElements(By.xpath(
            './following-sibling::*[1]'
            + "//div[contains(@class, 'bullet-list')]",
        ));
        return items.length ? new BulletList(this.webdriver, items[0]) : null;
    }
}
