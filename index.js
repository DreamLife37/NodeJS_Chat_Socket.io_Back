"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ALLOWED_ORIGIN = void 0;
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const colors_1 = __importDefault(require("colors"));
exports.ALLOWED_ORIGIN = 'http://localhost:3000';
const { Server } = require("socket.io");
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
colors_1.default.enable();
app.use((0, cors_1.default)({
    origin: exports.ALLOWED_ORIGIN
}));
const io = new Server(server, { cors: exports.ALLOWED_ORIGIN });
app.get('/', (req, res) => {
    res.send('<h1>Hello, it"s WS server by DevAndreyIT</h1>');
});
const messages = [
    { id: 'tfguh7yy7gvv', message: 'Привет друзья ', user: { name: 'Andrey', id: 'g7ygyvh7v000' } },
    { id: 'tfgb4646gvv', message: 'Привет Андрей', user: { name: 'Dima', id: 'g9ygyddfsdfsd' } },
    { id: 'tfgb4646gvv56', message: 'Как дела?', user: { name: 'Maks', id: 'g9ygyddfsdfsdfgdfg' } },
];
const usersState = new Map();
const usersId = new Map();
io.on('connection', (connection) => {
    usersState.set(connection, { name: 'Anonym', id: connection.id });
    // usersState.set(connection, () => {
    //     console.log('---User connected---')
    // })
    usersId.set(connection.id, connection); // add socket to Map object
    let userId = connection.id; // GET USER ID
    connection.on('disconnect', () => {
        console.log(`${connection.id} disconnected`);
        usersState.delete(connection);
    });
    connection.on('client-name-sent', (name, userId) => {
        const user = usersState.get(connection);
        user.name = name;
        user.id = userId;
    });
    connection.on('client-message-sent', (message) => {
        if (typeof message !== 'string') {
            return;
        }
        const user = usersState.get(connection);
        let messageItem = {
            id: new Date().getTime().toString(), message,
            user: { name: user.name, id: user.id }
        };
        messages.push(messageItem);
        connection.broadcast.emit('new-message-sent', messageItem);
    });
    connection.on('list-connected-clients', () => {
        let userId = connection.handshake.query.id; // GET USER ID
        const connected = usersState.get(connection);
        return connected;
    });
    console.log('user connected', usersState.get(connection), userId);
    connection.emit('init-messages-published', messages);
});
const PORT = process.env.PORT || 3009;
server.listen(PORT, () => {
    console.log(`listening on *:${PORT}`.yellow.bold);
});
