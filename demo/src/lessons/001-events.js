/* eslint-disable no-constant-condition */

export default async (app) => {
    if (true) {
        await app.waitUntil(async () => !!(await app.getBulletList(0)));
        const bulletList = await app.getBulletList(0);
        const adder = await bulletList.getAdder();

        await adder.typeSlowly('This is an event.');
        await adder.sendKeys('ENTER');
        await app.waitUntil(async () => await bulletList.getItemCount() === 1);

        await adder.typeSlowly('Events are used to log what you did throughout the day.');
        await adder.sendKeys('ENTER');
        await app.waitUntil(async () => await bulletList.getItemCount() === 2);
    }

    if (true) {
        const bulletList = await app.getBulletList(1);
        const adder = await bulletList.getAdder();

        await adder.typeSlowly('Or what you plan to do.');
        await adder.sendKeys('ENTER');
        await app.waitUntil(async () => await bulletList.getItemCount() === 1);

        const bulletItem = await bulletList.getItem(-1);
        await bulletItem.performAction('Complete');
    }

    if (true) {
        const bulletList = await app.getBulletList(0);
        const adder = await bulletList.getAdder();

        await adder.typeSlowly('Events can be reordered.');
        await adder.sendKeys('ENTER');

        await adder.sendKeys(['SHIFT', 'TAB']);
        const bulletItem = await bulletList.getItem(-1);
        await bulletItem.sendKeys(['SHIFT', 'UP']);
        await app.wait();
        await bulletItem.sendKeys(['SHIFT', 'UP']);
        await app.wait();
        // TODO: Drag and drop to better demonstrate this.
    }

    if (true) {
        const bulletList = await app.getBulletList(0);
        const adder = await bulletList.getAdder();

        const count = await bulletList.getItemCount();
        await adder.typeSlowly('You can add details to an event.');
        await adder.sendKeys('ENTER');
        await app.waitUntil(async () => await bulletList.getItemCount() === count + 1);

        const bulletItem = await bulletList.getItem(count);
        await bulletItem.perform('Edit');
        await app.waitUntil(async () => !!(await app.getModalDialog(0)));

        const modalDialog = await app.getModalDialog(0);
        const detailsInput = await modalDialog.getInput('Details');
        await detailsInput.typeSlowly('Unlike the event title, ');
        await detailsInput.typeSlowly('the details section is not limited to one line.');
        await detailsInput.sendKeys('ENTER');
        await detailsInput.typeSlowly('This is where you can add a lot more context about what happened.');
        await modalDialog.performSave();

        await bulletItem.perform('Expand');
    }
};
