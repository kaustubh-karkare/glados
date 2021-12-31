/* eslint-disable max-classes-per-file */

import assert from 'assert';
import { By } from 'selenium-webdriver';
import BaseWrapper from './BaseWrapper';

export class Selector extends BaseWrapper {
    static async get(webdriver, element) {
        const actual = await BaseWrapper.getElementByClassName(element, 'selector');
        return actual ? new this(webdriver, actual) : null;
    }

    async pickOption(name) {
        /*
        const optionElements = await this.element.findElements(By.tagName('option'));
        const optionLabels = await Promise.all(optionElements.map(element => element.getText()));
        const index = optionLabels.findIndex(optionLabel => optionLabel === name);
        await this.moveToAndClick(optionElements[index]);
        // Error = [object HTMLOptionElement] has no size and location
        */
        await this.element.sendKeys(name);
        await this.wait();
    }
}

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

    async getTypeSelector() {
        return Selector.get(this.webdriver, this.element, 0);
    }

    async getNameInput() {
        return new BaseWrapper(this.webdriver, await this.element.findElement(By.tagName('input')));
    }

    async getTemplateInput() {
        return new TextEditor(this.webdriver, this.element);
    }
}
