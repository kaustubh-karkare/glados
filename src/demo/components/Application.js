import { By } from 'selenium-webdriver';

import BaseWrapper from './BaseWrapper';
import DetailsSection from './DetailsSection';
import IndexSection from './IndexSection';
import ModalDialog from './ModalDialog';
import SidebarSection from './SidebarSection';

export default class Application extends BaseWrapper {
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

    async getSidebarSection(...args) {
        return SidebarSection.get(this.webdriver, ...args);
    }

    async getIndexSection() {
        await this.waitUntil(async () => IndexSection.get(this.webdriver));
        return IndexSection.get(this.webdriver);
    }

    async getDetailsSection(...args) {
        return DetailsSection.get(this.webdriver, ...args);
    }

    async getModalDialog(...args) {
        return ModalDialog.get(this.webdriver, ...args);
    }

    async getTopic(name, index) {
        const elements = await this.webdriver.findElements(By.xpath(`//a[contains(@class, 'topic') and text() = '${name}']`));
        const element = BaseWrapper.getItemByIndex(elements, index);
        return new BaseWrapper(this.webdriver, element);
    }

    async getLink(name, index = 0) {
        const elements = await this.webdriver.findElements(By.xpath(`//a[text() = '${name}']`));
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
        const nameInput = await modalDialog.getTextInput('Name');
        await nameInput.typeSlowly(name);
        await modalDialog.performSave();
    }

    async clearDatabase() {
        await this.webdriver.executeScript("return window.api.send('database-clear')");
    }

    // General Utility

    async waitUntil(conditionMethod) {
        await this.webdriver.wait(conditionMethod);
        await this.wait();
    }
}
