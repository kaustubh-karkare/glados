const assert = require('assert');
const { By } = require('selenium-webdriver');
const BaseWrapper = require('./BaseWrapper');
const { getInputComponent, LogStructureKey } = require('./Inputs');
const { waitUntil } = require('../utils');

class ModalDialog extends BaseWrapper {
    static async get(webdriver, index) {
        const elements = await webdriver.findElements(By.className('modal-dialog'));
        const element = BaseWrapper.getItemByIndex(elements, index);
        return element ? new this(webdriver, element) : null;
    }

    async getInput(name) {
        const inputElement = await this.element.findElement(By.xpath(
            '//div[contains(@class, \'modal-content\')]/div[2]'
            + '//div[contains(@class, \'input-group\')]'
            + `/span[contains(@class, 'input-group-text') and text() = '${name}']`
            + '/../*[2]',
        ));
        return getInputComponent(this.webdriver, inputElement);
    }

    async performSave() {
        const buttonElement = this.element.findElement(By.xpath(
            '//div[contains(@class, \'modal-content\')]/div[3]'
            + '//button[text() = \'Save\']',
        ));
        await waitUntil(async () => buttonElement.isEnabled());
        await this.click(buttonElement);
        await waitUntil(async () => {
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
}

module.exports = ModalDialog;
