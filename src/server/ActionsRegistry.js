/* eslint-disable func-names */

const ActionsRegistry = {};
export default ActionsRegistry;


export function enableCache(name) {
    const actualName = `${name}-actual`;
    ActionsRegistry[actualName] = ActionsRegistry[name];
    ActionsRegistry[name] = async function (input = null) {
        const serializedInput = JSON.stringify(input);
        if (!(name in this.memory)) {
            this.memory[name] = {};
            if (!(serializedInput in this.memory[name])) {
                this.memory[name][serializedInput] = new Promise((resolve, reject) => {
                    this.invoke.call(this, actualName, input).then(resolve).catch(reject);
                });
            }
        }
        return this.memory[name][serializedInput];
    };
    ActionsRegistry[`${name}-refresh`] = async function (input = null) {
        const serializedInput = JSON.stringify(input);
        if (name in this.memory) {
            if (serializedInput in this.memory[name]) {
                delete this.memory[name][serializedInput];
            }
        }
    };
}
