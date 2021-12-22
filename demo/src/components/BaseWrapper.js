const assert = require('assert');
const { By, Key } = require('selenium-webdriver');
const { awaitSequence } = require('../utils');

class BaseWrapper {
    constructor(webdriver, element) {
        assert(element, 'missing element');
        this.webdriver = webdriver;
        this.element = element;
    }

    // eslint-disable-next-line class-methods-use-this
    async getInput() {
        // Override this method to forward actions to the returned element.
        return null;
    }

    async sendKeys(...items) {
        const redirectInput = await this.getInput();
        if (redirectInput) {
            await redirectInput.sendKeys(...items);
            return;
        }
        await awaitSequence(items, async (item) => {
            let keys;
            // Do not require application logic to use Selenium API.
            if (typeof item === 'string') {
                keys = Key[item];
            } else if (Array.isArray(item)) {
                keys = Key.chord(...item.map((key) => Key[key]));
            } else {
                assert(false, `invalid item: ${item}`);
            }
            await this.element.sendKeys(keys);
        });
        await this.wait();
    }

    async typeSlowly(text) {
        const redirectInput = await this.getInput();
        if (redirectInput) {
            await redirectInput.typeSlowly(text);
            return;
        }
        await awaitSequence(Array.from(text), async (char) => {
            await this.element.sendKeys(char);
            // await wait(50); // TODO: Re-enable.
        });
        await this.wait();
    }

    async moveTo(element) {
        await this.webdriver.actions().move({ origin: element || this.element }).perform();
        await this.wait();
    }

    async click(element) {
        await this.webdriver.actions().click(element || this.element).perform();
        await this.wait();
    }

    async moveToAndClick(element) {
        await this.moveTo(element);
        await this.wait();
        await this.click(element);
        await this.wait();
    }

    // eslint-disable-next-line class-methods-use-this
    wait(milliseconds = 250) {
        return new Promise((resolve) => {
            setTimeout(resolve, milliseconds);
        });
    }

    static getItemByIndex(items, index) {
        return items[index < 0 ? items.length + index : index];
    }

    static async getElementByClassName(element, className) {
        const classAttribute = await element.getAttribute('class');
        if (classAttribute.includes(className)) {
            return element;
        }
        const elements = await element.findElements(By.className('text-editor'));
        assert(elements.length <= 1);
        return elements[0] || null;
    }
}

module.exports = BaseWrapper;
