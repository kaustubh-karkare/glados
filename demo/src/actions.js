const { Key } = require('selenium-webdriver');

/*

This is an event.
Events are used to log what you did throughout the day.

// In the todo list.
Or what you plan to do.
// Then mark it as complete.

Events can be reordered.
// Move this one step above.

You can add details.
// Click on the edit button.
Here are some details.
// Click on the save button.
// Expand the item.

*/

module.exports = async function Actions(api) {
    let bulletList = await api.getBulletList(0);
    let textEditor = await api.getTextEditor(bulletList);

    await api.typeSlowly(textEditor, 'This is an event.');
    await api.sendKeys(textEditor, Key.ENTER);
    await api.waitUntil(async () => await api.getItemCount(bulletList) === 1);

    await api.typeSlowly(textEditor, 'Events are used to log what you did throughout the day.');
    await api.sendKeys(textEditor, Key.ENTER);
    await api.waitUntil(async () => await api.getItemCount(bulletList) === 2);

    bulletList = await api.getBulletList(1);
    textEditor = await api.getTextEditor(bulletList);

    await api.typeSlowly(textEditor, 'Or what you plan to do.');
    await api.sendKeys(textEditor, Key.ENTER);

    let newItem = await api.getLastItem(bulletList);
    await api.performAction(newItem, 'Complete');

    bulletList = await api.getBulletList(0);
    textEditor = await api.getTextEditor(bulletList);

    await api.typeSlowly(textEditor, 'Events can be reordered.');
    await api.sendKeys(textEditor, Key.ENTER);

    // Things are broken after this point.

    bulletList = await api.getBulletList(0);
    await api.moveTo(bulletList);

    newItem = await api.getLastItem(bulletList);
    await api.moveTo(newItem);
    await newItem.sendKeys(Key.chord(Key.SHIFT, Key.UP));
    newItem = await api.getLastItem(bulletList, 2);
    await api.moveTo(newItem);
};
