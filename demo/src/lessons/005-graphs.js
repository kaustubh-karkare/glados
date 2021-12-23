/* eslint-disable no-constant-condition */

export default async (app) => {
    if (true) {
        const bulletList = await app.getBulletList(0);
        const adder = await bulletList.getAdder();

        await adder.typeSlowly('You can view graphs of your events.');
        await adder.sendKeys('ENTER');
        await app.waitUntil(async () => await bulletList.getItemCount() === 1);

        await adder.typeSlowly('Let us create a number of mock events to demonstrate that.');
        await adder.sendKeys('ENTER');
        await app.waitUntil(async () => await bulletList.getItemCount() === 2);
    }

    if (true) {
        await app.switchToTab('Manage Structures');

        const bulletList0 = await app.getBulletList(0);
        await app.performCreateNew(bulletList0);
        await app.performInputName('Exercise');

        const bulletItem1 = await bulletList0.getItem(0);
        await bulletItem1.perform('Expand');
        await app.waitUntil(async () => !!(await bulletItem1.getSubList()));

        const bulletList1 = await bulletItem1.getSubList();

        await app.performCreateNew(bulletList1).then(async (modalDialog) => {
            const nameInput = await modalDialog.getInput('Name');
            await nameInput.typeSlowly('Push Ups');

            const templateInput = await modalDialog.getInput('Title Template');
            await templateInput.typeSlowly(': ');

            const key1 = await modalDialog.addLogStructureKey();
            await key1.setType('Integer');
            const key1name = await key1.getNameInput();
            await key1name.typeSlowly('Count');

            await templateInput.typeSlowly('@C');
            await templateInput.pickSuggestion(0);
            await templateInput.sendKeys('BACK_SPACE');

            await modalDialog.performSave();
        });
    }

    let logEventTemplate;
    if (true) {
        await app.switchToTab('Manage Events');

        const bulletList = await app.getBulletList(0);
        const adder = await bulletList.getAdder();

        await adder.typeSlowly('@P');
        await adder.pickSuggestion(0);
        await app.waitUntil(async () => !!(await app.getModalDialog(0)));

        await app.getModalDialog(0).then(async (modalDialog) => {
            const countInput = await modalDialog.getInput('Count');
            await countInput.typeSlowly('50');
            await modalDialog.performSave();
        });

        const indexSection = await app.getIndexSection();
        const typeaheadSelector = await indexSection.getTypeaheadSelector();
        await typeaheadSelector.typeSlowly('P');
        await typeaheadSelector.pickSuggestion('Push Ups');
        await app.waitUntil(async () => (await typeaheadSelector.getTokens())[0] === 'Push Ups');
    }

    if (true) {
        const topicElement = await app.getTopic('Push Ups', 0);
        await topicElement.moveToAndClick();
        await app.waitUntil(async () => app.isDetailsSectionActive());

        const detailsSection = await app.getDetailsSection(0);
        await detailsSection.typeSlowly('Using RPCs to create similar events.');
        await detailsSection.sendKeys('ENTER');

        const bulletList = await app.getBulletList(0);
        const bulletItem = await bulletList.getItem(0);
        await bulletItem.click();
        await bulletItem.performAction('Debug Info');
        await app.waitUntil(async () => !!(await app.getModalDialog(0)));

        await app.getModalDialog(0).then(async (modalDialog) => {
            logEventTemplate = JSON.parse(await modalDialog.getDebugInfo());
            await modalDialog.performClose();
        });

        await detailsSection.typeSlowly('Note that weekends are being skipped.');
        await detailsSection.sendKeys('ENTER');
        await detailsSection.sendKeys('ENTER');

        const timestamp = new Date(logEventTemplate.date).valueOf();
        const msInDay = 24 * 60 * 60 * 1000;
        const totalEvents = 30; // to avoid exceeding page size.
        const initialValue = 10;
        const finalValue = parseInt(logEventTemplate.logStructure.logKeys[0].value, 10);
        let count = await bulletList.getItemCount();
        for (let index = 1; index < totalEvents; index += 1) {
            count += 1;
            logEventTemplate.id = -count;

            const newDate = new Date(timestamp - msInDay * index);
            // eslint-disable-next-line prefer-destructuring
            logEventTemplate.date = newDate.toISOString().split('T')[0];
            // Skip weekends to avoid a straight line.
            if ([0, 6].includes(newDate.getDay())) {
                count -= 1;
                // eslint-disable-next-line no-continue
                continue;
            }
            // Extrapolating events using a linear equation.
            // Options explored using https://www.desmos.com/calculator
            let value = initialValue + Math.floor(
                ((finalValue - initialValue) * (totalEvents - index - 1)) / totalEvents,
            );
            // Add some randomness.
            if (index < totalEvents - 1) {
                const variation = Math.ceil(10 / 4);
                value += Math.ceil(Math.random() * variation) - Math.ceil(variation / 2);
            }
            logEventTemplate.logStructure.logKeys[0].value = value.toString();
            // eslint-disable-next-line no-await-in-loop
            await app.webdriver.executeScript(`window.api.send('log-event-upsert', ${JSON.stringify(logEventTemplate)})`);
            // eslint-disable-next-line no-await-in-loop, no-loop-func
            await app.waitUntil(async () => await bulletList.getItemCount() === count);
        }
        await app.wait();
    }

    if (true) {
        await app.switchToTab('Explore Graphs');

        const detailsSection = await app.getDetailsSection(0);
        await detailsSection.typeSlowly("The 'Event Count' graph is an indicator of your consistency.");
        await detailsSection.sendKeys('ENTER');
        await detailsSection.typeSlowly('Additional graphs are generated for each numerical key of your structure,');
        await detailsSection.sendKeys('ENTER');
        await detailsSection.typeSlowly('and can help see patterns in those values.');
        await detailsSection.sendKeys('ENTER');

        await app.wait(2000);

        await detailsSection.sendKeys('ENTER');
        await detailsSection.typeSlowly('Let us change the layout for better visibility.');
        await detailsSection.sendKeys('ENTER');

        const linkElement = await app.getLink('Left');
        await linkElement.moveToAndClick();

        await app.wait(2000);
    }
};
