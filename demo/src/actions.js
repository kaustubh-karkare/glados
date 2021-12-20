/* eslint-disable no-console */
/* eslint-disable no-constant-condition */

const { Key } = require('selenium-webdriver');

/*

Dialog
    getInput(name)
    save()

BulletList
    getHeading
    getItem(index)
    getAdder

BulletListItem
    select / move to
    getTitle()
    getButton(Reorder, Expand, Edit, Actions) .click(action_name?)

InputItem
    typeSlowly
    sendKeys

*/

module.exports = async function Actions(api) {
    if (true) {
        const bulletList = await api.getBulletList(0);
        const textEditor = await api.getTextEditor(bulletList);

        await api.typeSlowly(textEditor, 'This is an event.');
        await api.sendKeys(textEditor, Key.ENTER);
        await api.waitUntil(async () => await api.getItemCount(bulletList) === 1);

        await api.typeSlowly(textEditor, 'Events are used to log what you did throughout the day.');
        await api.sendKeys(textEditor, Key.ENTER);
        await api.waitUntil(async () => await api.getItemCount(bulletList) === 2);
    }

    if (false) {
        const bulletList = await api.getBulletList(1);
        const textEditor = await api.getTextEditor(bulletList);

        await api.typeSlowly(textEditor, 'Or what you plan to do.');
        await api.sendKeys(textEditor, Key.ENTER);

        const lastItem = await api.getLastItem(bulletList);
        await api.performAction(lastItem, 'Complete');
    }

    if (false) {
        const bulletList = await api.getBulletList(0);
        const textEditor = await api.getTextEditor(bulletList);

        await api.typeSlowly(textEditor, 'Events can be reordered.');
        await api.sendKeys(textEditor, Key.ENTER);

        await api.sendKeys(textEditor, Key.chord(Key.SHIFT, Key.TAB));
        const lastItem = await api.getLastItem(bulletList);

        await lastItem.sendKeys(Key.chord(Key.SHIFT, Key.UP));
        await api.wait();
    }

    if (true) {
        const bulletList = await api.getBulletList(0);
        const textEditor = await api.getTextEditor(bulletList);

        const count = await api.getItemCount(bulletList);
        await api.typeSlowly(textEditor, 'You can add details to an event.');
        await api.sendKeys(textEditor, Key.ENTER);
        await api.waitUntil(async () => await api.getItemCount(bulletList) === count + 1);

        const lastItem = await api.getLastItem(bulletList);
        await api.performEdit(lastItem);
        await api.waitUntil(async () => (await api.getModalDialogs()).length === 1);

        const modalDialogs = await api.getModalDialogs();
        const modalDialog = modalDialogs[modalDialogs.length - 1];
        const thingy = await api.getInput(modalDialog, 'Details');
        const textEditor2 = await api.getTextEditor(thingy);
        await api.typeSlowly(textEditor2, 'Unlike the event title, ');
        await api.wait();
        await api.typeSlowly(textEditor2, 'the details section is not limited to one line.');
        await api.sendKeys(textEditor2, Key.ENTER);
        await api.typeSlowly(
            textEditor2, 'This is where you can add a lot more context about what happened.',
        );
        await api.saveModalDialog(modalDialog);
        await api.waitUntil(async () => (await api.getModalDialogs()).length === 0);
    }

    if (true) {
        const bulletList = await api.getBulletList(0);
        const lastItem = await api.getLastItem(bulletList);
        console.info(await lastItem.getText());

        // Things break here.
        const expandButton = await api.getIcon(lastItem, 'Expand');
        console.info(expandButton);
        await api.click(expandButton);
    }

    await api.wait(60 * 1000);
};
