/* eslint-disable class-methods-use-this */

const assert = require('assert');
const { Builder, By } = require('selenium-webdriver');
const { awaitSequence } = require('./Utils');

class Webdriver {
    constructor() {
        this.webdriver = new Builder().forBrowser('chrome').build();
        this.actions = this.webdriver.actions();
    }

    // General Utility

    async typeSlowly(element, text) {
        await awaitSequence(Array.from(text), async (char) => {
            await element.sendKeys(char);
            // await this.wait(50); // TODO: Re-enable.
        });
    }

    async moveTo(element) {
        await this.actions.move({ origin: element }).perform();
        await this.wait();
    }

    async sendKeys(element, keys) {
        await element.sendKeys(keys);
        await this.wait();
    }

    async getActiveElement() {
        return this.webdriver.switchTo().activeElement();
    }

    /*
    async sendKey(element, key) {
        await this.actions.keyDown(key).keyUp(key).perform();
        await this.wait();
    }
    */

    async click(element) {
        await this.actions.click(element).perform();
        await this.wait();
    }

    wait(milliseconds = 500) {
        return new Promise((resolve) => {
            setTimeout(resolve, milliseconds);
        });
    }

    async waitUntil(conditionMethod, intervalMs = 50, timeoutMs = 1000) {
        let elapsedMs = -intervalMs;
        return new Promise((resolve, reject) => {
            const timeout = setInterval(() => {
                Promise.resolve(conditionMethod()).then((isDone) => {
                    if (isDone) {
                        clearInterval(timeout);
                        resolve();
                    } else if (elapsedMs === timeoutMs) {
                        clearInterval(timeout);
                        reject(new Error(`[timeout] ${conditionMethod.toString()}`));
                    } else {
                        elapsedMs += intervalMs;
                    }
                }).catch((error) => reject(error));
            }, intervalMs);
        });
    }

    // App Specific Utility

    async getBulletList(index) {
        const bulletLists = await this.webdriver.findElements(By.className('bullet-list'));
        return bulletLists[index];
    }

    async getTextEditor(bulletList) {
        return bulletList.findElement(By.className('public-DraftEditor-content'));
    }

    async getItemCount(bulletList) {
        const items = await bulletList.findElements(By.className('highlightable'));
        return items.length - 1;
    }

    async getLastItem(bulletList) {
        const items = await bulletList.findElements(By.className('highlightable'));
        return items[items.length - 1];
    }

    async getIcon(bulletListItem, title) {
        await this.moveTo(bulletListItem);
        const icon = await bulletListItem.findElement(By.xpath(
            `.//div[contains(@class, 'icon') and @title='${title}']`,
        ));
        await this.moveTo(icon);
        return icon;
    }

    async performEdit(bulletListItem) {
        const editButton = await this.getIcon(bulletListItem, 'Edit');
        await this.click(editButton);
    }

    async getModalDialogs() {
        return this.webdriver.findElements(By.className('modal-dialog'));
    }

    async getInput(modalDialog, name) {
        const modalBody = await modalDialog.findElement(By.className('modal-body'));
        // Note: there might be multiple modal-body elements, we want the first.
        return modalBody.findElement(By.xpath(
            './/div[contains(@class, \'input-group\')]'
            + `/span[contains(@class, 'input-group-text') and text() = '${name}']`
            + '/../*[2]', // get sibling, which is the actual input element
        ));
    }

    async saveModalDialog(modalDialog) {
        const modalBodys = await modalDialog.findElements(By.className('modal-body'));
        const saveButton = modalBodys[modalBodys.length - 1].findElement(By.className('btn'));
        assert(await saveButton.getText() === 'Save', await saveButton.getText());
        await this.click(saveButton);
    }

    async performAction(bulletListItem, actionName) {
        const actionButton = await this.getIcon(bulletListItem, 'Actions');
        const dropdownItems = await actionButton.findElements(By.className('dropdown-item'));
        const actionNames = await Promise.all(
            dropdownItems.map((dropdownItem) => dropdownItem.getText()),
        );
        const actionIndex = actionNames.indexOf(actionName);
        const selectedItem = dropdownItems[actionIndex];
        await this.moveTo(selectedItem);
        await this.click(selectedItem);
    }
}


module.exports = Webdriver;
