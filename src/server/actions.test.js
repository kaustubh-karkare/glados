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

if(0) test("category_update", async () => {
    let cat1 = await invoke("category-update", {
        id: -1,
        name: "Animals",
        lsdKeys: [
            {id: -1, name: "Size", valueType: "string"},
            {id: -2, name: "Legs", valueType: "integer"},
        ],
    });
    let cat2 = await invoke("category-update", {
        id: -1,
        name: "Vehicles",
        lsdKeys: [
            {id: -2, name: "Medium", valueType: "string"},
            {id: -1, name: "Size", valueType: "string"},
        ],
    });
    expect(await invoke("category-list")).toEqual([
        {
            "id": 1,
            "name": "Animals",
            "lsdKeys": [
                {
                    "id": 1,
                    "name": "Size",
                    "valueType": "string"
                },
                {
                    "id": 2,
                    "name": "Legs",
                    "valueType": "integer"
                }
            ]
        },
        {
            "id": 2,
            "name": "Vehicles",
            "lsdKeys": [
                {
                    "id": 3,
                    "name": "Medium",
                    "valueType": "string"
                },
                {
                    "id": 1,
                    "name": "Size",
                    "valueType": "string"
                }
            ]
        }
    ]);

    cat2.name = "Machines";
    cat2.lsdKeys = [{id: -1, name: "Size", valueType: "integer"}];
    cat2 = await invoke("category-update", cat2);
    expect(cat2.name).toEqual("Machines"); // updated
    expect(cat2.lsdKeys[0].id).toEqual(1); // updated
    expect(cat2.lsdKeys[0].valueType).toEqual("string"); // unchanged

    // SequelizeForeignKeyConstraintError
    expect(() => database.delete('LSDKey', {id: 2})).rejects.toThrow();
    await invoke("category-delete", cat1);
    await database.delete('LSDKey', {id: 2});
});

test("test_log_entry", async () => {
    const cat1 = await invoke("category-update", {
        id: -1,
        name: "Animals",
        lsdKeys: [
            {id: -1, name: "Size", valueType: "string"},
            {id: -2, name: "Legs", valueType: "integer"},
        ],
    });
    const log1 = await invoke("log-entry-update", {
        id: -1,
        title: "Cat",
        category: {
            id: cat1.id,
            name: cat1.name,
        },
        lsdValues: [
            {key_name: "Size", key_type: "string", data: "small"},
            {key_name: "Legs", key_type: "integer", data: "4"},
        ],
    });
});
