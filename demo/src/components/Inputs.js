/* eslint-disable max-classes-per-file */

const assert = require('assert');
const { By } = require('selenium-webdriver');
const BaseWrapper = require('./BaseWrapper');
const { waitUntil } = require('../utils');

class TypeaheadSelector extends BaseWrapper {
    static async get(webdriver, element) {
        const actual = await BaseWrapper.getElementByClassName(element, 'rbt');
        return actual ? new this(webdriver, actual) : null;
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
        const wrappers = await this.element.findElements(By.xpath(".//div[contains(@class, 'rbt-input-wrapper')]"));
        if (wrappers.length) {
            // multi-selector
            const inputElement = await wrappers[0].findElement(By.xpath('./input[1]'));
            return new BaseWrapper(this.webdriver, inputElement);
        }
        // single-selector
        const inputElement = await this.element.findElement(By.xpath('./div[1]/input[1]'));
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
        const actual = await BaseWrapper.getElementByClassName(element, 'text-editor');
        return actual ? new this(webdriver, actual) : null;
    }

    async getInput() {
        return new BaseWrapper(this.webdriver, this.element.findElement(
            By.xpath(".//div[contains(@class, 'public-DraftEditor-content')]"),
        ));
    }

    async getSuggestions() {
        const tokens = await this.element.findElements(
            By.xpath(".//div[contains(@class, 'mention-suggestions')]/div/div"),
        );
        return Promise.all(tokens.map((token) => token.getText()));
    }

    async pickSuggestion(indexOrLabel) {
        await waitUntil(async () => (await this.getSuggestions()).length > 0);
        await this.wait();
        const offset = typeof indexOrLabel === 'number'
            ? indexOrLabel
            : (await this.getSuggestions()).indexOf(indexOrLabel);
        assert(offset !== -1);
        for (let ii = 1; ii < offset; ii += 1) {
            // eslint-disable-next-line no-await-in-loop
            await this.sendKeys('DOWN');
        }
        await this.sendKeys('ENTER');
    }
}

class LogStructureKey extends BaseWrapper {
    static async get(webdriver, element, index) {
        const containers = await element.findElements(By.xpath('.//div[contains(@class, \'log-structure-key\')]'));
        const container = BaseWrapper.getItemByIndex(containers, index);
        return new this(webdriver, container);
    }

    async getNameInput() {
        return new BaseWrapper(this.webdriver, await this.element.findElement(By.tagName('input')));
    }

    async getTemplateInput() {
        return new TextEditor(this.webdriver, this.element);
    }

    async setType(name) {
        const selectors = await this.element.findElements(By.xpath('.//select'));
        const selector = new BaseWrapper(this.webdriver, selectors[0]);
        await selector.typeSlowly(name);
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

module.exports = {
    getInputComponent, LogStructureKey, TextEditor, TypeaheadSelector,
};
