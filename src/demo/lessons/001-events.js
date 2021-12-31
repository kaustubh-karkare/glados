/* eslint-disable no-constant-condition */

export default async (app) => {
    const indexSection = await app.getIndexSection();

    if (true) {
        const bulletList = await indexSection.getBulletList(0);
        const adder = await bulletList.getAdder();

        await adder.typeSlowly('This is an event.');
        await adder.sendKeys('ENTER');
        await app.waitUntil(async () => await bulletList.getItemCount() === 1);

        await adder.typeSlowly('Events are used to log what you did throughout the day.');
        await adder.sendKeys('ENTER');
        await app.waitUntil(async () => await bulletList.getItemCount() === 2);
    }

    if (true) {
        const bulletList = await indexSection.getBulletList(1);
        const adder = await bulletList.getAdder();

        await adder.typeSlowly('Or what you plan to do.');
        await adder.sendKeys('ENTER');
        await app.waitUntil(async () => await bulletList.getItemCount() === 1);

        const bulletItem = await bulletList.getItem(-1);
        await bulletItem.performAction('Complete');
    }

    if (true) {
        const bulletList = await indexSection.getBulletList(0);
        const adder = await bulletList.getAdder();

        const count = await bulletList.getItemCount();
        await adder.typeSlowly('You can add details to an event.');
        await adder.sendKeys('ENTER');
        await app.waitUntil(async () => await bulletList.getItemCount() === count + 1);

        const bulletItem = await bulletList.getItem(count);
        await bulletItem.perform('Edit');
        await app.waitUntil(async () => !!(await app.getModalDialog(0)));

        const modalDialog = await app.getModalDialog(0);
        const detailsInput = await modalDialog.getTextEditor('Details');
        await detailsInput.typeSlowly('Unlike the event title, ');
        await detailsInput.typeSlowly('the details section is not limited to one line.');
        await detailsInput.sendKeys('ENTER');
        await detailsInput.typeSlowly('This is where you can add a lot more context about what happened.');
        await modalDialog.performSave();

        await bulletItem.perform('Expand');
        await bulletItem.perform('Collapse');
    }

    if (true) {
        const bulletList = await indexSection.getBulletList(0);
        const adder = await bulletList.getAdder();
        const count = await bulletList.getItemCount();

        await adder.typeSlowly('Some events could be more important than others.');
        await adder.sendKeys('ENTER');
        await app.waitUntil(async () => await bulletList.getItemCount() === count + 1);

        const minorItem = await bulletList.getItem(-1);
        await minorItem.perform('Edit');
        await app.waitUntil(async () => !!(await app.getModalDialog(0)));

        const modalDialog = await app.getModalDialog(0);
        const logLevelSelector = await modalDialog.getSelector('Log Level');
        await logLevelSelector.pickOption('Minor (1)');
        const detailTextEditor = await modalDialog.getTextEditor('Details');
        await detailTextEditor.typeSlowly('Minor events are not displayed by default.');

        await modalDialog.performSave();
        await app.waitUntil(async () => await bulletList.getItemCount() === count);

        const typeaheadSelector = await indexSection.getTypeahead();
        await typeaheadSelector.typeSlowly('L');
        const name = 'Log Level: Minor+';
        await typeaheadSelector.pickSuggestion(name);
        await app.waitUntil(async () => (await typeaheadSelector.getTokens())[0] === name);
        await app.waitUntil(async () => await bulletList.getItemCount() === count + 1);

        await adder.typeSlowly('While viewing all events, you can reorder them.');
        await adder.sendKeys('ENTER');
        await app.waitUntil(async () => await bulletList.getItemCount() === count + 2);

        const bulletItem = await bulletList.getItem(-1);
        await bulletItem.move('UP');
        await bulletItem.move('UP');
    }
};
