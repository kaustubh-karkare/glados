/* eslint-disable no-constant-condition */

export default async (app) => {
    const indexSection = await app.getIndexSection();

    if (true) {
        const bulletList = await indexSection.getBulletList(0);
        const adder = await bulletList.getAdder();

        await adder.typeSlowly('You can add structured data to your events.');
        await adder.sendKeys('ENTER');
        await app.waitUntil(async () => await bulletList.getItemCount() === 1);
    }

    if (true) {
        await app.switchToTab('Manage Structures');

        const bulletList0 = await indexSection.getBulletList(0);
        await app.performCreateNew(bulletList0);
        await app.performInputName('Exercise');

        const bulletItem1 = await bulletList0.getItem(0);
        await bulletItem1.perform('Expand');
        await app.waitUntil(async () => !!(await bulletItem1.getSubList()));

        const bulletList1 = await bulletItem1.getSubList();
        const modalDialog = await app.performCreateNew(bulletList1);

        const nameInput = await modalDialog.getTextInput('Name');
        await nameInput.typeSlowly('Running');

        const key1 = await modalDialog.addLogStructureKey();
        const key1type = await key1.getTypeSelector();
        await key1type.pickOption('Number');
        const key1name = await key1.getNameInput();
        await key1name.typeSlowly('Distance (km)');

        const templateInput = await modalDialog.getTextEditor('Title Template');
        await templateInput.typeSlowly(': @D');
        await templateInput.pickSuggestion(0);
        await templateInput.typeSlowly('km / ');

        const key2 = await modalDialog.addLogStructureKey();
        const key2type = await key2.getTypeSelector();
        await key2type.pickOption('Number');
        const key2name = await key2.getNameInput();
        await key2name.typeSlowly('Time (minutes)');

        await templateInput.typeSlowly('@T');
        await templateInput.pickSuggestion(0);
        await templateInput.typeSlowly('minutes');

        await modalDialog.performSave();
    }

    if (true) {
        await app.switchToTab('Manage Events');

        const bulletList = await indexSection.getBulletList(0);
        const adder = await bulletList.getAdder();

        await adder.typeSlowly('@R');
        await adder.pickSuggestion(0);
        await app.waitUntil(async () => !!(await app.getModalDialog(0)));

        const modalDialog = await app.getModalDialog(0);
        const distanceInput = await modalDialog.getTypeahead('Distance (km)');
        await distanceInput.typeSlowly('10');
        const timeInput = await modalDialog.getTypeahead('Time (minutes)');
        await timeInput.typeSlowly('60');

        await modalDialog.performSave();
    }

    if (true) {
        const bulletList = await indexSection.getBulletList(0);
        const adder = await bulletList.getAdder();

        await adder.typeSlowly('You can derive additional information from structured data.');
        await adder.sendKeys('ENTER');
        await app.waitUntil(async () => await bulletList.getItemCount() === 3);

        const topicElement = await app.getTopic('Running', 0);
        await topicElement.moveToAndClick();
        await app.waitUntil(async () => app.isDetailsSectionActive());

        const detailsSection = await app.getDetailsSection(0);
        await detailsSection.perform('Edit');

        const modalDialog = await app.getModalDialog(0);

        const key3 = await modalDialog.addLogStructureKey();
        const key3type = await key3.getTypeSelector();
        await key3type.pickOption('Number');
        const key3name = await key3.getNameInput();
        await key3name.typeSlowly('Speed (kmph)');
        const key3template = await key3.getTemplateInput();
        await key3template.typeSlowly('{( @D');
        await key3template.pickSuggestion(0);
        await key3template.typeSlowly(' * 60 / @T');
        await key3template.pickSuggestion(0);
        await key3template.typeSlowly(').toFixed(2)}');

        const templateInput = await modalDialog.getTextEditor('Title Template');
        await templateInput.sendKeys('BACK_SPACE');
        await templateInput.typeSlowly(' (@S');
        await templateInput.pickSuggestion(0);
        await templateInput.typeSlowly(' kmph)');

        await modalDialog.performSave();
    }

    if (true) {
        const bulletList = await indexSection.getBulletList(0);
        const bulletItem = await bulletList.getItem(1);

        await bulletItem.perform('Edit');
        await app.waitUntil(async () => !!(await app.getModalDialog(0)));

        const modalDialog = await app.getModalDialog(0);
        const timeInput = await modalDialog.getTypeahead('Time (minutes)');
        await timeInput.sendKeys('BACK_SPACE', 'BACK_SPACE');
        await timeInput.typeSlowly('50');

        await modalDialog.performSave();
    }
};
