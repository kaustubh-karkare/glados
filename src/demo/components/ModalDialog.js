import assert from 'assert';
import { By } from 'selenium-webdriver';

import BaseWrapper from './BaseWrapper';
import {
    LogStructureKey, Selector, TextEditor, TypeaheadSelector,
} from './Inputs';

export default class ModalDialog extends BaseWrapper {
    static async get(webdriver, index) {
        const elements = await webdriver.findElements(By.className('modal-dialog'));
        const element = BaseWrapper.getItemByIndex(elements, index);
        return element ? new this(webdriver, element) : null;
    }

    async _clickAndWaitForClose(buttonElement) {
        await this.webdriver.wait(async () => buttonElement.isEnabled());
        await this.click(buttonElement);
        await this.webdriver.wait(async () => {
            try {
                await this.element.isDisplayed();
                return false;
            } catch (error) {
                assert(error.name === 'StaleElementReferenceError');
                return true;
            }
        });
        await this.wait();
    }

    async performClose() {
        const buttonElement = await this.element.findElement(By.xpath(
            '//div[contains(@class, \'modal-content\')]/div[1]'
            + '//button',
        ));
        await this._clickAndWaitForClose(buttonElement);
    }

    async _getElement(name) {
        return this.element.findElement(By.xpath(
            '//div[contains(@class, \'modal-content\')]/div[2]'
            + '//div[contains(@class, \'input-group\')]'
            + `/span[contains(@class, 'input-group-text') and text() = '${name}']`
            + '/../*[2]',
        ));
    }

    async getTextInput(name) {
        const element = await this._getElement(name);
        return new BaseWrapper(this.webdriver, element);
    }

    async getTextEditor(name) {
        const element = await this._getElement(name);
        return TextEditor.get(this.webdriver, element);
    }

    async getTypeahead(name) {
        const element = await this._getElement(name);
        return TypeaheadSelector.get(this.webdriver, element);
    }

    async getSelector(name) {
        const element = await this._getElement(name);
        return Selector.get(this.webdriver, element);
    }

    async performSave() {
        const buttonElement = await this.element.findElement(By.xpath(
            '//div[contains(@class, \'modal-content\')]/div[3]'
            + '//button[text() = \'Save\']',
        ));
        await this._clickAndWaitForClose(buttonElement);
    }

    // Methods specific to Log Structures.

    async addLogStructureKey() {
        const button = await this.element.findElement(By.xpath(
            ".//button[contains(@class, 'log-structure-add-key')]",
        ));
        await this.moveToAndClick(button);
        return this.getLogStructureKey(-1);
    }

    async getLogStructureKey(index) {
        return LogStructureKey.get(this.webdriver, this.element, index);
    }

    // Methods specific to Debug Info

    async getDebugInfo() {
        const element = await this.element.findElement(By.tagName('pre'));
        return element.getText();
    }
}
