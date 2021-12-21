/* eslint-disable max-classes-per-file */

const { By } = require('selenium-webdriver');
const BaseWrapper = require('./BaseWrapper');
const { TextEditor } = require('./Inputs');

class BulletListItem extends BaseWrapper {
    async _getIcon(title) {
        await this.moveTo(this.element);
        return this.element.findElement(By.xpath(
            `.//div[contains(@class, 'icon') and @title='${title}']`,
        ));
    }

    async perform(name) {
        await this.moveTo(this.element);
        const button = await this._getIcon(name);
        await this.moveToAndClick(button);
    }

    async performAction(name) {
        await this.moveTo(this.element);
        const actionButton = await this._getIcon('Actions');
        await this.moveTo(actionButton);
        const actionElement = await actionButton.findElement(
            By.xpath(`.//a[contains(@class, 'dropdown-item') and text() = '${name}']`),
        );
        await this.moveToAndClick(actionElement);
    }
}

class BulletList extends BaseWrapper {
    static async get(webdriver, index) {
        const elements = await webdriver.findElements(By.className('bullet-list'));
        const element = BaseWrapper.getItemByIndex(elements, index);
        return element ? new this(webdriver, element) : null;
    }

    async getHeader() {
        const element = await this.element.findElement(By.xpath('./div[1]'));
        return new BulletListItem(this.webdriver, element);
    }

    async _getItems() {
        return this.element.findElements(By.xpath("./div[2]/div[contains(@class, 'highlightable')]"));
    }

    async getItem(index) {
        const elements = await this._getItems();
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

module.exports = BulletList;
