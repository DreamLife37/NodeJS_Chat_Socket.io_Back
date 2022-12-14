import express from 'express';
import http from 'http'

const {Server} = require("socket.io");
const app = express()
const server = http.createServer(app);

const io = new Server(server);

app.get('/', (req, res) => {
    res.send('<h1>Hello, it"s WS server</h1>');
});

const messages = [
    {id: 'tfguh7yy7gvv', message: 'Hello Dima', user: {name: 'Andrey', id: 'g7ygyvh7v000'}},
    {id: 'tfgb4646gvv', message: 'Hello Andrey', user: {name: 'Dima', id: 'g9ygyddfsdfsd'}},
    {id: 'tfgb4646gvv56', message: 'Hello', user: {name: 'Maks', id: 'g9ygyddfsdfsdfgdfg'}},
]

const usersState = new Map();

io.on('connection', (connection: any) => {

    usersState.set(connection, {name: 'anonym', id: new Date().getTime().toString()})

    io.on('disconnect', ()=>{
        usersState.delete(connection)
    })

    connection.on('client-name-sent', (name: string) => {
        const user = usersState.get(connection)
        user.name = name
    })
    connection.on('client-message-sent', (message: string) => {
        if (typeof message !== 'string') {
            return
        }
        const user = usersState.get(connection)
        let messageItem = {
            id: new Date().getTime().toString(), message,
            user: {name:user.name, id:user.id}
        }
        messages.push(messageItem)
        io.emit('new-message-sent', messageItem)
    })
    console.log('a user connected')


    connection.emit('init-messages-published', messages)
})


const PORT = process.env.PORT || 3009

server.listen(PORT, () => {
    console.log(`listening on *:${PORT}`);
});