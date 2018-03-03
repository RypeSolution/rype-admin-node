/**
 * Created by anthony on 02/02/2018.
 */

class Deferred {
    
    constructor(){
        this.id = `${this.constructor._ID++}`
        
        this.promise = new Promise((res, rej) => {
            this.resolve = res
            this.reject = rej
        })
    }
    
    cancel(){
        this.reject('Cancelled!')
    }
    
    then(...args){
        this._promise = (this._promise || this.promise).then(...args)
        return this
    }
}

Deferred._ID = 1

class RypeAdmin extends EventEmitter3 {
    
    constructor(){
        super()
        this.retryCount = {api:0, server: 0}
        this.deferreds = {}
    }
    
    get elems() {
        return {connectionAlert: $('#connection_alert'),
                usersGridDiv: $(document.querySelector('#myGrid'))}
    }
    
    connect(url, options={}){
        let ws = new WebSocket(url, 'echo-protocol')
        this.retryCount[options.retryCount]++
    
        _.merge(WebSocket.prototype, Object.create(EventEmitter3.prototype))
        EventEmitter3.call(ws)
        
        let name = options.retryCount
        
        let subscriptions = ws.subscriptons = {}
        
        ws.on = function (eventName, callback) {
            let topic = `/${eventName}`
            console.log(`${name}: event=${eventName}, topic=${topic}`)
            
            let subscribe = `/subscribe?subject=${eventName}`
            ws.json(subscribe)
                .then((resp) => {
                    subscriptions[resp.data.subscribed] = 0
                    console.log('subscriptions:', subscriptions)
                    
                    EventEmitter3.prototype.on.call(ws, eventName, callback)
                })
        }
    
        ws.onopen = () => {
            this.retryCount[options.retryCount] = 0
            this.emit(options.connected || 'server_connected')
        }
    
        ws.onclose = () => {
            this.emit(options.disconnected || 'server_disconnected')
        }
    
        ws.onerror = (err) => {
            console.error(err)
        }
        
        ws.json = (topic, data) => {
            let deferred = new Deferred()
            this.deferreds[deferred.id] = deferred
            
            let req = {topic:`${topic}${_.includes(topic, '?') ? '&' : '?'}uid=${deferred.id}`, data: data}
            ws.send(JSON.stringify(req))
            return deferred
        }
        
        ws.onmessage = (message) => {
            let msg = JSON.parse(message.data)
            let parts = _.split(msg.topic, '?', 2)
    
            let parsed = _.chain(_.last(parts))
                .replace('?', '') // a=b454&c=dhjjh&f=g6hksdfjlksd
                .split('&') // ["a=b454","c=dhjjh","f=g6hksdfjlksd"]
                .map(_.partial(_.split, _, '=', 2)) // [["a","b454"],["c","dhjjh"],["f","g6hksdfjlksd"]]
                .fromPairs() // {"a":"b454","c":"dhjjh","f":"g6hksdfjlksd"}
                .value()
    
            let deferredId = parsed.uid
            let deferred = this.deferreds[deferredId]
            let topic = _.first(parts)
    
            if (_.isObject(deferred)) {
                delete this.deferreds[deferredId]
                deferred.resolve(msg)
            } else if (topic === '/subscribe' && parsed.subject in subscriptions) {
                subscriptions[parsed.subject]++
                ws.emit(parsed.subject, msg)
            } else {
                console.error('no pending promise', message, topic, parsed)
            }
        }
        
        return ws
    }
    
    connectToServer() {
        let url = `${location.protocol === 'https:' ? 'wss://' : 'ws://'}${location.hostname}`
        this.server = this.connect(url, {connected:'server_connected', disconnected: 'server_disconnected', retryCount: 'server'})
    }
    
    connectToApi() {
        let url = location.hostname.indexOf('localhost') === -1 ? 'wss://rype-api.herokuapp.com' : 'ws://localhost:9000'
        this.api = this.connect(url, {connected:'api_connected', disconnected: 'api_disconnected', retryCount: 'api'})
    }
    
    get usersGridOptions(){
        if(this._usersGridOptions) return this._usersGridOptions
        let columnDefs = [
            {headerName: "Name", field: "name"},
            {headerName: "Email", field: "email"},
            {headerName: "Created At", field: "createdAt"},
            //{headerName: "Date of Birth", field: "dob"}
        ]
    
        this._usersGridOptions = {
            debug: false,
            enableSorting: true,
            enableColResize: true,
            rowData: [],
            columnDefs: columnDefs,
            enableFilter: true,
            floatingFilter: true,
            animateRows: true,
        }
        return this._usersGridOptions
    }
    
    get usersGrid(){
        if(this._usersTable) return this._usersTable
        
        this._usersTable = new agGrid.Grid(this.elems.usersGridDiv.get(0), this.usersGridOptions)
        return this._usersTable
    }
}

window.app = new RypeAdmin()

app.on('server_disconnected', () => {
    console.log('server disconnected')
    app.elems.connectionAlert.show().slideDown()
    setTimeout(() => app.connectToServer(), 1000 * app.retryCount.server)
})

app.on('server_connected', () => {
    console.log('server connected')
    app.elems.connectionAlert.slideUp().hide()
})

app.on('api_disconnected', () => {
    console.log('api disconnected')
    setTimeout(() => app.connectToApi(), 1000 * app.retryCount.api)
})

app.on('api_connected', () => {
    console.log('api connected')
    let usersTable = app.usersGrid // init table

    app.api.on('db_update', (msg) => {
        console.log('db update:', msg)
        
        for(let update of msg.data.updates){
            app.usersGridOptions.api.updateRowData({add: [update.value]})
        }
        
    })
})

app.connectToServer()
app.connectToApi()

let rowData = [
    {
        name: "Obialo Chidiebere", email: "obialo@person.ng", phone: "07545087103", dob: "1990/05/16", gold: 2,
        silver: 0,
        bronze: 0,
    },
    {
        name: "Hannah Montana", email: "hannah@tester.com", phone: "+447545087103", dob: "1989/12/17", gold: 6,
        silver: 0,
        bronze: 2,
    },
    {
        name: "Joseph Whiskey", email: "whiskey@test.co.uk", phone: "08005087103", dob: "1976/08/25", gold: 3,
        silver: 4,
        bronze: 0,
    },
]



document.addEventListener('DOMContentLoaded', function () {
    // lookup the container we want the Grid to use
    console.log('DOM loaded')
});