const { By } = require('selenium-webdriver');
const BaseWrapper = require('./BaseWrapper');
const BulletList = require('./BulletList');
const DetailsSection = require('./DetailsSection');
const IndexSection = require('./IndexSection');
const ModalDialog = require('./ModalDialog');
const SidebarSection = require('./SidebarSection');

class Application extends BaseWrapper {
    constructor(webdriver) {
        super(webdriver, true);
        this.webdriver = webdriver;
    }

    async switchToTab(name) {
        const element = await this.webdriver.findElement(
            By.xpath(`//div[contains(@class, 'sidebar-section')]/div[text() = '${name}']`),
        );
        await this.moveToAndClick(element);
    }

    async waitForTitle(title) {
        await this.waitUntil(async () => {
            const bulletList = await this.getBulletList(0);
            const headerItem = await bulletList.getHeader();
            return title === await headerItem.element.getText();
        });
    }

    async getSidebarSection(...args) {
        return SidebarSection.get(this.webdriver, ...args);
    }

    async getIndexSection(...args) {
        return IndexSection.get(this.webdriver, ...args);
    }

    async getDetailsSection(...args) {
        return DetailsSection.get(this.webdriver, ...args);
    }

    async getBulletList(...args) {
        return BulletList.get(this.webdriver, ...args);
    }

    async getModalDialog(...args) {
        return ModalDialog.get(this.webdriver, ...args);
    }

    async getTopic(name, index) {
        const elements = await this.webdriver.findElements(By.xpath(`//a[contains(@class, 'topic') and text() = '${name}']`));
        const element = BaseWrapper.getItemByIndex(elements, index);
        return new BaseWrapper(this.webdriver, element);
    }

    // Random Specific Items

    async isDetailsSectionActive() {
        const detailSection = await this.getDetailsSection(0);
        return detailSection.isActive();
    }

    async performCreateNew(bulletList) {
        const headerItem = await bulletList.getHeader();
        await headerItem.perform('Create New');
        await this.waitUntil(async () => !!(await this.getModalDialog(0)));
        return this.getModalDialog(0);
    }

    async performInputName(name) {
        const modalDialog = await this.getModalDialog(0);
        const nameInput = await modalDialog.getInput('Name');
        await nameInput.typeSlowly(name);
        await modalDialog.performSave();
    }

    // General Utility

    async waitUntil(conditionMethod, intervalMs = 50, timeoutMs = 5000) {
        let elapsedMs = -intervalMs;
        return new Promise((resolve, reject) => {
            const timeout = setInterval(() => {
                Promise.resolve(conditionMethod()).then((isDone) => {
                    if (isDone) {
                        clearInterval(timeout);
                        this.wait().then(resolve);
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
}

module.exports = Application;
