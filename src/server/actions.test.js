import Database from './database';
import Actions from './actions';

let actions = null;

beforeAll(() => {
    return Database.init({type: "sqlite"})
        .then(database => { actions = new Actions(database); });
});

test("actions_during_development", async () => {
    const cat = await actions.genCreateCategory({name: "Exercise"});
    expect(cat.name).toEqual("Exercise");
    const log = await actions.genCreateLogEntry({name: "Cycling", category_id: cat.id});
    expect(log.category_id).toEqual(cat.id);
    expect(log.name).toEqual("Cycling");
});
