/* eslint-disable no-constant-condition */

module.exports = async function topics(app) {
    async function waitForTitle(title) {
        await app.waitUntil(async () => {
            const bulletList = await app.getBulletList(0);
            const headerItem = await bulletList.getHeader();
            return title === await headerItem.element.getText();
        });
    }

    if (true) {
        const bulletList = await app.getBulletList(0);
        const adder = await bulletList.getAdder();

        await adder.typeSlowly('Let us now create some topics.');
        await adder.sendKeys('ENTER');
        await app.waitUntil(async () => await bulletList.getItemCount() === 1);

        await app.switchToTab('Manage Topics');
        await waitForTitle('Topics');
    }

    async function createNewTopic(bulletList) {
        const headerItem = await bulletList.getHeader();
        await headerItem.perform('Create New');
        await app.waitUntil(async () => !!(await app.getModalDialog(0)));
    }

    async function enterTopicName(name) {
        const modalDialog = await app.getModalDialog(0);
        const nameInput = await modalDialog.getInput('Name');
        await nameInput.typeSlowly(name);
        await modalDialog.performSave();
        await app.waitUntil(async () => !(await app.getModalDialog(0)));
    }

    if (true) {
        const bulletList0 = await app.getBulletList(0);
        await createNewTopic(bulletList0);
        await enterTopicName('Personal Projects');
        await app.waitUntil(async () => await bulletList0.getItemCount() === 1);

        const bulletItem1 = await bulletList0.getItem(0);
        await bulletItem1.perform('Expand');
        await app.waitUntil(async () => !!(await app.getBulletList(1)));

        const bulletList1 = await app.getBulletList(1);
        await createNewTopic(bulletList1);
        await enterTopicName('GLADOS');
        await app.waitUntil(async () => await bulletList1.getItemCount() === 1);

        await createNewTopic(bulletList0);
        await enterTopicName('People');
        await app.waitUntil(async () => await bulletList0.getItemCount() === 2);

        const bulletItem2 = await bulletList0.getItem(1);
        await bulletItem2.perform('Expand');
        await app.waitUntil(async () => !!(await app.getBulletList(2)));

        const bulletList2 = await app.getBulletList(2);
        await createNewTopic(bulletList2);
        await enterTopicName('Sayee Basole');
        await app.waitUntil(async () => await bulletList2.getItemCount() === 1);

        await app.switchToTab('Manage Events');
        await waitForTitle('Done (Today)');
    }

    if (true) {
        const bulletList = await app.getBulletList(0);
        const adder = await bulletList.getAdder();

        await adder.typeSlowly('You can reference topics from events.');
        await adder.sendKeys('ENTER');
        await app.waitUntil(async () => await bulletList.getItemCount() === 2);

        await adder.typeSlowly('Created demo video for @G');
        await app.waitUntil(async () => (await adder.getSuggestions()).length === 1);
        await adder.sendKeys('DOWN', 'ENTER');
        await adder.typeSlowly('using Selenium.');
        await adder.sendKeys('ENTER');
        await app.waitUntil(async () => await bulletList.getItemCount() === 3);

        await adder.typeSlowly('Conversation with @S');
        await app.waitUntil(async () => (await adder.getSuggestions()).length === 1);
        await adder.sendKeys('DOWN', 'ENTER');
        await adder.typeSlowly('about @G');
        await app.waitUntil(async () => (await adder.getSuggestions()).length === 1);
        await adder.sendKeys('DOWN', 'ENTER');
        await adder.sendKeys('BACK_SPACE');
        await adder.typeSlowly('.');
        await adder.sendKeys('ENTER');
        await app.waitUntil(async () => await bulletList.getItemCount() === 4);
    }

    if (true) {
        const bulletList = await app.getBulletList(0);
        const count = await bulletList.getItemCount();
        const adder = await bulletList.getAdder();

        await adder.typeSlowly('You can click on a topic to show details on the right side.');
        await adder.sendKeys('ENTER');
        await app.waitUntil(async () => await bulletList.getItemCount() === count + 1);

        let topicElement = await app.getTopic('GLADOS', 0);
        topicElement.moveTo();
        topicElement.click();
        await app.waitUntil(async () => !!(await app.getDetailsSection(0)));

        const detailsSection = await app.getDetailsSection(0);
        await detailsSection.typeSlowly('You can add details about a particular topic.');
        await detailsSection.sendKeys('ENTER');
        await detailsSection.sendKeys('ENTER');

        await detailsSection.typeSlowly('You can search for all events referencing this topic,');
        await detailsSection.sendKeys('ENTER');
        await detailsSection.typeSlowly('by clicking on the magnifying glass icon above!');
        await detailsSection.sendKeys('ENTER');
        await detailsSection.sendKeys('ENTER');

        await detailsSection.perform('Search');
        const indexSection = await app.getIndexSection();
        const typeahead = await indexSection.getTypeaheadSelector();
        await app.waitUntil(async () => (await typeahead.getTokens()).length === 1);

        topicElement = await app.getTopic('GLADOS', 0);
        await topicElement.moveTo();
        topicElement = await app.getTopic('GLADOS', 1);
        await topicElement.moveTo();

        await typeahead.removeToken('GLADOS');
        await app.waitUntil(async () => (await typeahead.getTokens()).length === 0);

        await detailsSection.typeSlowly('You can mark this event as a favorite using the heart icon.');
        await detailsSection.sendKeys('ENTER');

        await detailsSection.perform('Favorite');
        const favoriteTopics = await app.getSidebarSection('Favorite Topics');
        await app.waitUntil(async () => (await favoriteTopics.getItems()).length === 1);

        await detailsSection.typeSlowly('It now appears in the right sidebar.');
        await detailsSection.sendKeys('ENTER');

        await detailsSection.perform('Close');
        await app.waitUntil(async () => !(await detailsSection.isActive()));

        topicElement = await app.getTopic('GLADOS', -1);
        topicElement.moveTo();
        topicElement.click();
        await app.waitUntil(async () => detailsSection.isActive());
    }
};