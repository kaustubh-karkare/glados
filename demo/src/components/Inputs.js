/* eslint-disable max-classes-per-file */

const assert = require('assert');
const { By } = require('selenium-webdriver');
const BaseWrapper = require('./BaseWrapper');

class TypeaheadSelector extends BaseWrapper {
    static async get(webdriver, element) {
        const elements = await element.findElements(By.className('rbt'));
        assert(elements.length <= 1);
        return elements.length ? new this(webdriver, elements[0]) : null;
    }

    async getTokens() {
        const tokens = await this.element.findElements(By.xpath(".//div[contains(@class, 'rbt-token')]"));
        return Promise.all(tokens.map((token) => token.getText()));
    }

    async removeToken(name) {
        const removeButton = await this.element.findElement(By.xpath(
            `.//div[contains(@class, 'rbt-token') and text() = '${name}']`
            + '/button[contains(@class, \'rbt-close\')]',
        ));
        await this.moveToAndClick(removeButton);
    }

    async getInput() {
        const inputElement = await this.element.findElement(By.xpath('./div[last()]/input[1]'));
        return new BaseWrapper(this.webdriver, inputElement);
    }

    async getSuggestions() {
        const tokens = await this.element.findElements(
            By.xpath(".//div[contains(@class, 'menu-options')]/a[contains(@class, 'dropdown-item')]"),
        );
        return Promise.all(tokens.map((token) => token.getText()));
    }
}

class TextEditor extends BaseWrapper {
    static async get(webdriver, element) {
        const classAttribute = await element.getAttribute('class');
        if (classAttribute.includes('text-editor')) {
            return new this(webdriver, element);
        }
        const elements = await element.findElements(By.className('text-editor'));
        assert(elements.length <= 1);
        return elements.length ? new this(webdriver, elements[0]) : null;
    }

    async _getInput() {
        return new BaseWrapper(this.webdriver, this.element.findElement(
            By.xpath(".//div[contains(@class, 'public-DraftEditor-content')]"),
        ));
    }

    async sendKeys(...args) {
        const element = await this._getInput();
        await element.sendKeys(...args);
    }

    async typeSlowly(...args) {
        const element = await this._getInput();
        await element.typeSlowly(...args);
    }

    async getSuggestions() {
        const tokens = await this.element.findElements(
            By.xpath(".//div[contains(@class, 'mention-suggestions')]/div/div"),
        );
        return Promise.all(tokens.map((token) => token.getText()));
    }
}

async function getInputComponent(webdriver, element) {
    let item;
    item = await TextEditor.get(webdriver, element);
    if (item) return item;
    item = await TypeaheadSelector.get(webdriver, element);
    if (item) return item;
    return new BaseWrapper(webdriver, element);
}

module.exports = { getInputComponent, TextEditor, TypeaheadSelector };
