/* eslint-disable max-classes-per-file */

import assert from 'assert';
import { By } from 'selenium-webdriver';
import BaseWrapper from './BaseWrapper';

export class TypeaheadSelector extends BaseWrapper {
    static async get(webdriver, element) {
        const actual = await BaseWrapper.getElementByClassName(element, 'rbt');
        return actual ? new this(webdriver, actual) : null;
    }

    async getTokens() {
        const items = await this.element.findElements(By.xpath(".//div[contains(@class, 'rbt-token')]"));
        return Promise.all(items.map(async (token) => {
            const names = await token.getText();
            return names.split('\n')[0];
        }));
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
            const inputElement = await wrappers[0].findElement(By.xpath('.//input[1]'));
            return new BaseWrapper(this.webdriver, inputElement);
        }
        // single-selector
        const inputElement = await this.element.findElement(By.xpath('./div[1]/input[1]'));
        return new BaseWrapper(this.webdriver, inputElement);
    }

    async _getSuggestions() {
        const elements = await this.element.findElements(By.xpath(
            ".//div[contains(@class, 'menu-options') or contains(@class, 'rbt-menu')]"
            + "/a[contains(@class, 'dropdown-item')]",
        ));
        const names = await Promise.all(elements.map((token) => token.getText()));
        return { elements, names };
    }

    async pickSuggestion(label) {
        await this.webdriver.wait(async () => {
            const { names } = await this._getSuggestions();
            return names.some((item) => item.startsWith(label));
        });
        const { elements, names } = await this._getSuggestions();
        const index = names.findIndex((item) => item.startsWith(label));
        await this.moveToAndClick(elements[index]);
    }
}

export class TextEditor extends BaseWrapper {
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
        await this.webdriver.wait(async () => (await this.getSuggestions()).length > 0);
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

export class LogStructureKey extends BaseWrapper {
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

export async function getInputComponent(webdriver, element) {
    let item;
    item = await TextEditor.get(webdriver, element);
    if (item) return item;
    item = await TypeaheadSelector.get(webdriver, element);
    if (item) return item;
    return new BaseWrapper(webdriver, element);
}
