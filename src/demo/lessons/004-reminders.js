/* eslint-disable no-constant-condition */

export default async (app) => {
    const indexSection = await app.getIndexSection();

    if (true) {
        const bulletList = await indexSection.getBulletList(0);
        const adder = await bulletList.getAdder();

        await adder.typeSlowly('You can add "structure" to your day using reminders.');
        await adder.sendKeys('ENTER');
        await app.waitUntil(async () => await bulletList.getItemCount() === 1);
    }

    if (true) {
        await app.switchToTab('Manage Structures');

        const bulletList0 = await indexSection.getBulletList(0);
        await app.performCreateNew(bulletList0);
        await app.performInputName('Daily Routine');

        const bulletItem1 = await bulletList0.getItem(0);
        await bulletItem1.perform('Expand');
        await app.waitUntil(async () => !!(await bulletItem1.getSubList()));

        const bulletList1 = await bulletItem1.getSubList();

        await app.performCreateNew(bulletList1).then(async (modalDialog) => {
            const nameInput = await modalDialog.getTextInput('Name');
            await nameInput.typeSlowly('Woke up');

            const templateInput = await modalDialog.getTextEditor('Title Template');
            await templateInput.typeSlowly(' at ');

            const logLevelSelector = await modalDialog.getSelector('Log Level');
            await logLevelSelector.pickOption('Minor (1)');

            const key1 = await modalDialog.addLogStructureKey();
            const key1type = await key1.getTypeSelector();
            await key1type.pickOption('Time');
            const key1name = await key1.getNameInput();
            await key1name.typeSlowly('Time');

            await templateInput.typeSlowly('@T');
            await templateInput.pickSuggestion(0);
            await templateInput.sendKeys('BACK_SPACE');

            const isPeriodicSelector = await modalDialog.getSelector('Is Periodic?');
            await isPeriodicSelector.pickOption('Yes');

            await modalDialog.performSave();
        });

        await app.performCreateNew(bulletList1).then(async (modalDialog) => {
            const nameInput = await modalDialog.getTextInput('Name');
            await nameInput.typeSlowly('Made Bed');

            const isPeriodicSelector = await modalDialog.getSelector('Is Periodic?');
            await isPeriodicSelector.pickOption('Yes');

            const reminderTextInput = await modalDialog.getTextInput('Reminder Text');
            await reminderTextInput.typeSlowly('Make Bed');

            await modalDialog.performSave();
        });
    }

    if (true) {
        await app.switchToTab('Manage Events');

        const bulletList = await indexSection.getBulletList(0);
        const adder = await bulletList.getAdder();

        await adder.typeSlowly('Reminders appear on the left sidebar.');
        await adder.sendKeys('ENTER');
        await app.waitUntil(async () => await bulletList.getItemCount() === 2);

        const sidebarSection = await app.getSidebarSection('Daily Routine');

        let reminderItems = await sidebarSection.getReminderItems();
        await reminderItems[0].getCheckbox().then(async (checkbox) => {
            await checkbox.moveTo();
            await app.wait();
            await checkbox.click();

            const modalDialog = await app.getModalDialog(0);
            const timeInput = await modalDialog.getTypeahead('Time');
            await timeInput.typeSlowly('07:00');
            await modalDialog.performSave();
        });

        reminderItems = await sidebarSection.getReminderItems();
        await reminderItems[0].pickMenuItem('Mark as Complete');
    }
};
