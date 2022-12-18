import cors from 'cors';
import express from 'express';
import http from 'http'
import {ALLOWED_ORIGIN} from './config';
import colors from 'colors'

const {Server} = require("socket.io");
const app = express()
const server = http.createServer(app);

colors.enable()

app.use(
    cors({
        origin: ALLOWED_ORIGIN
    })
)

const io = new Server(server, {cors: ALLOWED_ORIGIN});

app.get('/', (req, res) => {
    res.send('<h1>Hello, it"s WS server by DevAndreyIT</h1>');
});

const messages = [
    {id: 'tfguh7yy7gvv', message: 'Привет друзья ', user: {name: 'Andrey', id: 'g7ygyvh7v000'}},
    {id: 'tfgb4646gvv', message: 'Привет Андрей', user: {name: 'Dima', id: 'g9ygyddfsdfsd'}},
    {id: 'tfgb4646gvv56', message: 'Как дела?', user: {name: 'Maks', id: 'g9ygyddfsdfsdfgdfg'}},
]

const usersState = new Map();
const usersId = new Map();

io.on('connection', (connection: any) => {
    usersState.set(connection, {name: 'Anonym', id: connection.id})
    // usersState.set(connection, () => {
    //     console.log('---User connected---')
    // })
    usersId.set(connection.id, connection) // add socket to Map object
    let userId = connection.id; // GET USER ID

    connection.on('disconnect', () => {
        console.log(`${connection.id} disconnected`);
        usersState.delete(connection)
    })

    connection.on('client-name-sent', (name: string, userId: string) => {
        const user = usersState.get(connection)
        user.name = name
        user.id = userId
    })

    connection.on('client-message-sent', (message: string) => {
        if (typeof message !== 'string') {
            return
        }
        const user = usersState.get(connection)
        let messageItem = {
            id: new Date().getTime().toString(), message,
            user: {name: user.name, id: user.id}
        }
        messages.push(messageItem)
        connection.broadcast.emit('new-message-sent', messageItem);
    })

    connection.on('list-connected-clients', () => {
        let userId = connection.handshake.query.id; // GET USER ID
        const connected = usersState.get(connection)
        return connected
    })

    console.log('user connected', usersState.get(connection), userId)

    connection.emit('init-messages-published', messages)
})

const PORT = process.env.PORT || 3009

server.listen(PORT, () => {
    console.log(`listening on *:${PORT}`.yellow.bold);
});