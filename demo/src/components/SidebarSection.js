const { By } = require('selenium-webdriver');
const BaseWrapper = require('./BaseWrapper');

class SidebarSection extends BaseWrapper {
    static async get(webdriver, name) {
        const element = await webdriver.findElement(By.xpath(
            '//div[contains(@class, \'sidebar-section\')]'
            + '/div[contains(@class, \'cursor\')]'
            + `/div/div[text() = '${name}']`
            + '/../../..',
        ));
        return new this(webdriver, element);
    }

    async getItems() {
        const items = await this.element.findElements(
            By.xpath(".//div[contains(@class, 'highlightable')]//div[contains(@class, 'input-line')]"),
        );
        return Promise.all(items.map((item) => item.getText()));
    }
}

module.exports = SidebarSection;
