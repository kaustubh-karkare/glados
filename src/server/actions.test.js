import Database from './database';
import Actions from './actions';

let database = null;

beforeAll(async () => {
    const config = {
        "type": "sqlite",
        "host": "localhost",
        "username": "productivity_test",
        "password": "productivity_test",
        "name": "productivity_test"
    };
    database = await Database.init(config);
});

afterAll(async () => {
    if (database) await database.close();
});

async function invoke(name, ...args) {
    return await Actions[name].call({database}, ...args);
}

test("test_categories", async () => {
    let cat1 = await invoke("category-upsert", {
        id: -1,
        name: "Animals",
        logKeys: [
            {id: -1, name: "Size", type: "string"},
            {id: -2, name: "Legs", type: "integer"},
        ],
    });
    let cat2 = await invoke("category-upsert", {
        id: -1,
        name: "Vehicles",
        logKeys: [
            {id: -2, name: "Medium", type: "string"},
            {id: -1, name: "Size", type: "string"},
        ],
    });
    expect(await invoke("category-list")).toEqual([
        {
            "id": 1,
            "name": "Animals",
            "logKeys": [
                {"id": 1, "name": "Size", "type": "string"},
                {"id": 2, "name": "Legs", "type": "integer"},
            ]
        },
        {
            "id": 2,
            "name": "Vehicles",
            "logKeys": [
                {"id": 3, "name": "Medium", "type": "string"},
                {"id": 1, "name": "Size", "type": "string"},
            ]
        }
    ]);

    cat2.name = "Machines";
    cat2.logKeys = [{id: -1, name: "Size", type: "integer"}];
    cat2 = await invoke("category-upsert", cat2);
    expect(cat2.name).toEqual("Machines"); // updated
    expect(cat2.logKeys[0].id).toEqual(1); // updated
    expect(cat2.logKeys[0].type).toEqual("string"); // unchanged

    // SequelizeForeignKeyConstraintError
    expect(() => database.delete('LogKey', {id: 2})).rejects.toThrow();
    await invoke("category-delete", cat1);
    await database.delete('LogKey', {id: 2});
});

test("test_entries", async () => {
    const cat1 = await invoke("category-upsert", {
        id: -1,
        name: "Animals",
        logKeys: [
            {id: -1, name: "Size", type: "string"},
            {id: -2, name: "Legs", type: "integer"},
        ],
    });
    const entry1 = await invoke("entry-upsert", {
        id: -1,
        title: "Cat",
        logCategory: {
            id: cat1.id,
            name: cat1.name,
        },
        logValues: [
            {keyName: "Size", keyType: "string", data: "small"},
            {keyName: "Legs", keyType: "integer", data: "4"},
        ],
    });
});
