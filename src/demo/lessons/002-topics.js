/* eslint-disable no-constant-condition */

export default async (app) => {
    const indexSection = await app.getIndexSection();

    if (true) {
        const bulletList = await indexSection.getBulletList(0);
        const adder = await bulletList.getAdder();

        await adder.typeSlowly('Let us now create some topics.');
        await adder.sendKeys('ENTER');
        await app.waitUntil(async () => await bulletList.getItemCount() === 1);
    }

    if (true) {
        await app.switchToTab('Manage Topics');

        const bulletList0 = await indexSection.getBulletList(0);
        await app.performCreateNew(bulletList0);
        await app.performInputName('Personal Projects');
        await app.waitUntil(async () => await bulletList0.getItemCount() === 1);

        const bulletItem1 = await bulletList0.getItem(0);
        await bulletItem1.perform('Expand');

        const bulletList1 = await bulletItem1.getSubList();
        await app.performCreateNew(bulletList1);
        await app.performInputName('GLADOS');
        await app.waitUntil(async () => await bulletList1.getItemCount() === 1);

        await app.performCreateNew(bulletList0);
        await app.performInputName('People');
        await app.waitUntil(async () => await bulletList0.getItemCount() === 2);

        const bulletItem2 = await bulletList0.getItem(1);
        await bulletItem2.perform('Expand');

        const bulletList2 = await bulletItem2.getSubList();
        await app.performCreateNew(bulletList2);
        await app.performInputName('Kasturi Karkare');
        await app.waitUntil(async () => await bulletList2.getItemCount() === 1);
    }

    if (true) {
        await app.switchToTab('Manage Events');

        const bulletList = await indexSection.getBulletList(0);
        const adder = await bulletList.getAdder();

        await adder.typeSlowly('You can reference topics from events.');
        await adder.sendKeys('ENTER');
        await app.waitUntil(async () => await bulletList.getItemCount() === 2);

        await adder.typeSlowly('Created demo video for @G');
        await adder.pickSuggestion(0);
        await adder.typeSlowly('using Selenium.');
        await adder.sendKeys('ENTER');
        await app.waitUntil(async () => await bulletList.getItemCount() === 3);

        await adder.typeSlowly('Conversation with @K');
        await adder.pickSuggestion(0);
        await adder.typeSlowly('about @G');
        await adder.pickSuggestion(0);
        await adder.sendKeys('BACK_SPACE');
        await adder.typeSlowly('.');
        await adder.sendKeys('ENTER');
        await app.waitUntil(async () => await bulletList.getItemCount() === 4);
    }

    if (true) {
        const bulletList = await indexSection.getBulletList(0);
        const count = await bulletList.getItemCount();
        const adder = await bulletList.getAdder();

        await adder.typeSlowly('You can click on a topic to show details on the right side.');
        await adder.sendKeys('ENTER');
        await app.waitUntil(async () => await bulletList.getItemCount() === count + 1);

        let topicElement = await app.getTopic('GLADOS', 0);
        await topicElement.moveToAndClick();
        await app.waitUntil(async () => app.isDetailsSectionActive());

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
        const typeahead = await indexSection.getTypeahead();
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

        await detailsSection.typeSlowly('It now appears on the right sidebar.');
        await detailsSection.sendKeys('ENTER');

        await detailsSection.perform('Close');
        await app.waitUntil(async () => !(await detailsSection.isActive()));

        topicElement = await app.getTopic('GLADOS', -1);
        topicElement.moveTo();
        topicElement.click();
        await app.waitUntil(async () => detailsSection.isActive());
    }
};
