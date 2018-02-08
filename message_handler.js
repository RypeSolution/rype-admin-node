/**
 * Created by anthony on 02/02/2018.
 */
const express = require('express')
const _ = require('lodash')
const EventEmitter = require('events').EventEmitter

class WebSocketHandler extends EventEmitter {
    
    constructor() {
        super()
        this.constructor.HANDLERS[Math.random()] = this
    }
    
    onMessage(connection, message, messageType) {
        console.log('Received Message: ' + message.utf8Data);
        return {test: 'yes'}
    }
    
    topic(connection, callback) {
    
    }
    
    onClose(connection, reasonCode, description) {
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    }
    
    static handlers() {
        return this.HANDLERS
    }
}

WebSocketHandler.HANDLERS = {}

const wsHandler = new WebSocketHandler()

wsHandler.topic('/status', (conn, msg) => {

})

const routeHandler = new express.Router()

routeHandler.get('/', (req, res) => {
    res.render('index')
})

module.exports = {wsHandler, routeHandler}