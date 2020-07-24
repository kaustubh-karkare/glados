import assert from './assert';

const SERVER_SIDE = 'server_side';
const CLIENT_SIDE = 'client_side';

const GENERAL_REQUEST = 'general-request-';
const GENERAL_RESPONSE = 'general-response-';
const GENERAL_SUBSCRIPTION = 'general-subscription';

const clients = [];

function _remove(list, value) {
    const index = list.indexOf(value);
    if (index !== -1) list.splice(index, 1);
}

class SocketRPC {
    static server(socket, actions) {
        const instance = new SocketRPC(SERVER_SIDE, socket);
        actions.registerBroadcast(instance);
        instance.registerActions(actions);
        return instance;
    }

    static client(socket, errorCallback) {
        const instance = new SocketRPC(CLIENT_SIDE, socket, errorCallback);
        instance.registerSubscriptions();
        return instance;
    }

    constructor(type, socket, errorCallback) {
        this.type = type;
        this.socket = socket;
        if (type === SERVER_SIDE) {
            clients.push(this);
            this.socket.on('disconnect', () => _remove(clients, this));
        } else if (type === CLIENT_SIDE) {
            this.counter = 0;
            this.subscriptions = {};
            this.errorCallback = errorCallback;
        }
    }

    // Normal RPC

    send(name, request) {
        assert(this.type === CLIENT_SIDE);
        const promise = new Promise((resolve, reject) => {
            this.counter += 1;
            const { counter } = this;
            const responseEventName = GENERAL_RESPONSE + counter.toString();
            this.socket.once(responseEventName, (wrapper) => {
                const { response, error } = wrapper;
                if (!error) {
                    resolve(response);
                } else {
                    // eslint-disable-next-line no-console
                    console.error(error);
                    reject(error);
                }
            });
            this.socket.emit(GENERAL_REQUEST, { counter, name, request });
        });
        return promise.catch((error) => this.errorCallback(error));
    }

    registerActions(actions) {
        assert(this.type === SERVER_SIDE);
        this.socket.on(GENERAL_REQUEST, async (wrapper) => {
            const { counter, name, request } = wrapper;
            const complete = false;
            const responseEventName = GENERAL_RESPONSE + counter.toString();
            const resolve = (response) => {
                assert(!complete, 'already completed');
                this.socket.emit(responseEventName, { counter, response });
            };
            const reject = (error) => {
                assert(!complete, 'already completed');
                error = `${name}: ${JSON.stringify(request, null, 4)}\n\n${error}`;
                this.socket.emit(responseEventName, { counter, error });
            };
            if (!actions.has(name)) {
                reject(`Unknown action: ${name}`);
                return;
            }
            try {
                const result = await actions.invoke(name, request);
                resolve(result || null);
            } catch (error) {
                reject(error.stack.toString());
            }
        });
    }

    // Subscriptions

    registerSubscriptions() {
        assert(this.type === CLIENT_SIDE);
        this.socket.on(GENERAL_SUBSCRIPTION, async (wrapper) => {
            const { name, data } = wrapper;
            const futures = this.subscriptions[name];
            if (futures) {
                futures.forEach(({ resolve }) => resolve(data));
            }
            delete this.subscriptions[name];
        });
    }

    subscribe(name) {
        assert(this.type === CLIENT_SIDE);
        if (!(name in this.subscriptions)) {
            this.subscriptions[name] = [];
        }
        let future;
        const promise = new Promise((resolve, reject) => {
            future = { resolve, reject };
            this.subscriptions[name].push(future);
        });
        const cancel = () => _remove(this.subscriptions[name], future);
        return { promise, cancel };
    }

    broadcast(name, data) {
        assert(this.type === SERVER_SIDE);
        clients.forEach((client) => client.socket.emit(GENERAL_SUBSCRIPTION, { name, data }));
    }
}

export default SocketRPC;
