const { By } = require('selenium-webdriver');
const BaseWrapper = require('./BaseWrapper');
const { getInputComponent } = require('./Inputs');

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
        // TODO: Verify that this is not disabled?
        await this.click(buttonElement);
    }
}

module.exports = ModalDialog;
