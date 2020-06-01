import assert from './assert';

const requestSuffix = "-request";
const responseSuffix = "-response-";

class SocketRPC {
    constructor(socket) {
        this.socket = socket;
        this.counter = 0;
    }
    send(name, request) {
        return new Promise((resolve, reject) => {
            const counter = this.counter;
            const requestName = name + requestSuffix;
            const responseName = name + responseSuffix + counter;
            this.socket.emit(requestName, {counter, request});
            this.socket.once(responseName, (wrapper) => {
                const {response, error} = wrapper;
                if (response) resolve(response);
                else reject(error);
            });
        });
    }
    register(name, callback) {
        this.socket.on(name + requestSuffix, async (wrapper) => {
            const {counter, request} = wrapper;
            const responseName = name + responseSuffix + counter;
            let complete = false;
            const resolve = (response) => {
                assert(!complete, 'already completed');
                this.socket.emit(responseName, {response});
            };
            const reject = (error) => {
                assert(!complete, 'already completed');
                this.socket.emit(responseName, {error});
            };
            try {
                const result = await callback(request);
                resolve(result);
            } catch (error) {
                reject(JSON.stringify(request, null, 4) + "\n\n" + error.stack.toString());
            }
        });
    }
}

export default SocketRPC;
