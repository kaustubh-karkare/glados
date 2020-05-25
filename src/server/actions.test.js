import Database from './database';
import Actions from './actions';

let actions = null;

beforeAll(async () => {
    const config = {
        "type": "mysql",
        "host": "localhost",
        "username": "productivity_test",
        "password": "productivity_test",
        "name": "productivity_test"
    };
    const database = await Database.init(config)
    actions = new Actions(database);
});

afterAll(async () => {
    await actions.database.close();
});

test("keys_and_categories", async () => {
    const key1 = await actions.genCreateLSDKey({name: "Key1", value_type: "string"});
    const key2 = await actions.genCreateLSDKey({name: "Key2", value_type: "string"});
    const category = await actions.genCreateCategory({name: "Alpha"});
    await actions.genSetCategoryKeys({category_id: category.id, lsd_key_ids: [key1.id, key2.id]});
    await expect(() => key1.destroy()).rejects.toThrow(); // SequelizeForeignKeyConstraintError
    await expect(() => category.destroy()).rejects.toThrow(); // SequelizeForeignKeyConstraintError
});

test("actions_during_development", async () => {
    const cat = await actions.genCreateCategory({name: "Exercise"});
    expect(cat.name).toEqual("Exercise");
    const log = await actions.genCreateLogEntry({title: "Cycling", category_id: cat.id});
    expect(log.category_id).toEqual(cat.id);
    expect(log.title).toEqual("Cycling");
});
