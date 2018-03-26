/**
 * Created by anthony on 02/02/2018.
 */

const _ = require('lodash')
const bz = require('bkendz')
const path = require('path')

const app = new bz.Bkendz({
    administerEnabled: true,
    clientEnabled: false,
    apiEnabled: false,
    optsAdmin: {staticPath: path.join(__dirname, './src')}
})

app.admin.on('request', (messageHandler, request, conn) => {
    messageHandler.respond(conn, request)
})

app.admin.messageHandlers.ws.topic('/status', () => {
    return {data: {clients: app.admin.connections.length}}
})

app.admin.messageHandlers.http.get('/', (req, res) => {
    res.render('index')
})

const port = process.env.PORT || 8081
console.log(`starting monitoring server on ${port}...`)
app.listen(port)