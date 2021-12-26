/* eslint-disable no-constant-condition */

export default async (app) => {
    if (true) {
        await app.waitUntil(async () => !!(await app.getBulletList(0)));
        const bulletList = await app.getBulletList(0);
        const adder = await bulletList.getAdder();

        await adder.typeSlowly('You can add "structure" to your day using reminders.');
        await adder.sendKeys('ENTER');
        await app.waitUntil(async () => await bulletList.getItemCount() === 1);
    }

    if (true) {
        await app.switchToTab('Manage Structures');

        const bulletList0 = await app.getBulletList(0);
        await app.performCreateNew(bulletList0);
        await app.performInputName('Daily Routine');

        const bulletItem1 = await bulletList0.getItem(0);
        await bulletItem1.perform('Expand');
        await app.waitUntil(async () => !!(await bulletItem1.getSubList()));

        const bulletList1 = await bulletItem1.getSubList();

        await app.performCreateNew(bulletList1).then(async (modalDialog) => {
            const nameInput = await modalDialog.getInput('Name');
            await nameInput.typeSlowly('Woke up');

            const templateInput = await modalDialog.getInput('Title Template');
            await templateInput.typeSlowly(' at ');

            const key1 = await modalDialog.addLogStructureKey();
            await key1.setType('Time');
            const key1name = await key1.getNameInput();
            await key1name.typeSlowly('Time');

            await templateInput.typeSlowly('@T');
            await templateInput.pickSuggestion(0);
            await templateInput.sendKeys('BACK_SPACE');

            const isPeriodicSelector = await modalDialog.getInput('Is Periodic?');
            await isPeriodicSelector.typeSlowly('Yes');

            await modalDialog.performSave();
        });

        await app.performCreateNew(bulletList1).then(async (modalDialog) => {
            const nameInput = await modalDialog.getInput('Name');
            await nameInput.typeSlowly('Made Bed');

            const isPeriodicSelector = await modalDialog.getInput('Is Periodic?');
            await isPeriodicSelector.typeSlowly('Yes');

            const reminderTextInput = await modalDialog.getInput('Reminder Text');
            await reminderTextInput.typeSlowly('Make Bed');

            await modalDialog.performSave();
        });
    }

    if (true) {
        await app.switchToTab('Manage Events');

        const bulletList = await app.getBulletList(0);
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
            const timeInput = await modalDialog.getInput('Time');
            await timeInput.typeSlowly('07:00');
            await modalDialog.performSave();
        });

        reminderItems = await sidebarSection.getReminderItems();
        await reminderItems[0].pickMenuItem('Mark as Complete');
    }
};
