/* eslint-disable */

/*

Sanitize. No logmodes. Always allow reordering.


This is an event.
Events are used to log what you did throughout the day.

// In the todo list.
Or what you plan to do.
// Then mark it as complete.

Events can be reordered.
// Move this one step above.

You can add details.
// Click on the edit button.
Here are some details.
// Click on the save button.
// Expand the item.

----

yarn add selenium-webdriver
brew install chromedriver

https://github.com/SeleniumHQ/selenium/blob/84dd6109ce692788467432ccee55f481fe49f2bc/javascript/node/selenium-webdriver/lib/input.js#L559

*/

const { Builder, By, Key } = require('selenium-webdriver');
// const { awaitSequence } = require('src/data/Utils.js');

function awaitSequence(items, method) {
    if (!items) {
        return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
        let index = 0;
        const results = [];
        const next = () => {
            if (index === items.length) {
                resolve(results);
            } else {
                method(items[index], index, items)
                    .then((result) => {
                        results.push(result);
                        index += 1;
                        next();
                    })
                    .catch((error) => reject(error));
            }
        };
        next();
    });
}

const DELAY_UNIT = 500;

function wait_ms(milliseconds) {
    return new Promise((resolve) => {
        setTimeout(resolve, milliseconds);
    })
}

class Webdriver {
    constructor() {
        this.driver = new Builder().forBrowser('chrome').build();
        this.actions = this.driver.actions();
    }

    // General Utility

    async typeSlowly(element, text) {
        await element.sendKeys(text); return;
        await awaitSequence(Array.from(text), async (char) => {
            await element.sendKeys(char);
            await wait_ms(20);
        });
    }
    async moveTo(element) {
        await this.actions.move({ origin: element }).perform();
        await wait_ms(DELAY_UNIT);
    }
    async sendKeys(element, keys) {
        await element.sendKeys(keys);
        await wait_ms(DELAY_UNIT);
    }
    /*
    async sendKey(element, key) {
        await this.actions.keyDown(key).keyUp(key).perform();
        await wait_ms(DELAY_UNIT);
    }
    */
    async click(element) {
        await this.actions.click(element).perform();
        await wait_ms(DELAY_UNIT);
    }

    // App Specific Utility

    async getBulletList(index) {
        const bulletLists = await this.driver.findElements(By.className('bullet-list'));
        return bulletLists[index];
    }

    async getTextEditor(bulletList) {
        return bulletList.findElement(By.className('public-DraftEditor-content'));
    }

    async getLastItem(bulletList) {
        const lines = await bulletList.findElements(By.className('highlightable'));
        console.info(">>>", await lines[lines.length - 1].getText());
        return lines[lines.length - 1];
    }

    async performAction(bulletListItem, actionName) {
        await this.moveTo(bulletListItem);
        const buttons = await bulletListItem.findElements(By.className('icon'));
        const actionButton = buttons[buttons.length - 1];
        await this.moveTo(actionButton);
        const dropdownItems = await actionButton.findElements(By.className('dropdown-item'));
        const actionNames = await Promise.all(dropdownItems.map(dropdownItem => dropdownItem.getText()));
        const actionIndex = actionNames.indexOf(actionName);
        const selectedItem = dropdownItems[actionIndex];
        await this.moveTo(selectedItem);
        await this.click(selectedItem);
    }
}

async function main() {
    const wrapper = new Webdriver();

    const monitor = { width: 3840, height: 2160 };
    await wrapper.driver.manage().window().setRect({
        width: monitor.width / 2,
        height: monitor.height / 2,
        x: monitor.width * 0,
        y: monitor.height / 2,
    });

    try {
        await wrapper.driver.get('http://localhost:8080');
        await wait_ms(DELAY_UNIT);

        let bulletList = await wrapper.getBulletList(0);
        let textEditor = await wrapper.getTextEditor(bulletList);

        await wrapper.typeSlowly(textEditor, 'This is an event.');
        await wrapper.sendKeys(textEditor, Key.ENTER);

        await wrapper.typeSlowly(textEditor, 'Events are used to log what you did throughout the day.');
        await wrapper.sendKeys(textEditor, Key.ENTER);

        bulletList = await wrapper.getBulletList(1);
        textEditor = await wrapper.getTextEditor(bulletList);

        await wrapper.typeSlowly(textEditor, 'Or what you plan to do.');
        await wrapper.sendKeys(textEditor, Key.ENTER);

        let newItem = await wrapper.getLastItem(bulletList);
        await wrapper.performAction(newItem, "Complete");

        bulletList = await wrapper.getBulletList(0);
        textEditor = await wrapper.getTextEditor(bulletList);

        await wrapper.typeSlowly(textEditor, 'Events can be reordered.');
        await wrapper.sendKeys(textEditor, Key.ENTER);

        bulletList = await wrapper.getBulletList(0);
        await wrapper.moveTo(bulletList);

        /*
        newItem = await wrapper.getLastItem(bulletList);
        await wrapper.moveTo(newItem);
        await newItem.sendKeys(Key.chord(Key.SHIFT, Key.UP));
        newItem = await wrapper.getLastItem(bulletList, 2);
        await wrapper.moveTo(newItem);
        */

        await wait_ms(100 * DELAY_UNIT);
    } catch (error) {
        console.error(error);
    } finally {
        await wrapper.driver.quit();
    }
}

main().catch((error) => console.error(error));
