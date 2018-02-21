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
        return {connectionAlert: $('#connection_alert')}
    }
    
    connect(url, options={}){
        let ws = new WebSocket(url, 'echo-protocol')
        this.retryCount[options.retryCount]++
    
        _.merge(WebSocket.prototype, Object.create(EventEmitter3.prototype))
        EventEmitter3.call(ws)
    
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
            
            let req = {topic:`${topic}?uid=${deferred.id}`, data: data}
            ws.send(JSON.stringify(req))
            return deferred
        }
        
        ws.onmessage = (message) => {
            let msg = JSON.parse(message.data)
    
            let parsed = _.chain(_.last(_.split(msg.topic, '?', 2)))
                .replace('?', '') // a=b454&c=dhjjh&f=g6hksdfjlksd
                .split('&') // ["a=b454","c=dhjjh","f=g6hksdfjlksd"]
                .map(_.partial(_.split, _, '=', 2)) // [["a","b454"],["c","dhjjh"],["f","g6hksdfjlksd"]]
                .fromPairs() // {"a":"b454","c":"dhjjh","f":"g6hksdfjlksd"}
                .value()
            
            let deferredId = parsed.uid
            let deferred = this.deferreds[deferredId]
            
            if(_.isObject(deferred)){
                delete this.deferreds[deferredId]
                deferred.resolve(msg)
            }else{
                console.error('no pending promise', message)
            }
        }
        
        return ws
    }
    
    connectToServer() {
        this.server = this.connect('ws://localhost:26116', {connected:'server_connected', disconnected: 'server_disconnected', retryCount: 'server'})
    }
    
    connectToApi() {
        this.api = this.connect('ws://localhost:9000', {connected:'api_connected', disconnected: 'api_disconnected', retryCount: 'api'})
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

app.on('api_connected', () => console.log('api connected'))

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

let columnDefs = [
    {headerName: "Name", field: "name", filter: 'agTextColumnFilter'},
    {headerName: "Email", field: "email"},
    {headerName: "Phone", field: "phone"},
    {headerName: "Date of Birth", field: "dob"},
    {
        headerName: 'Medals',
        groupId: 'medalsGroup',
        children: [
            // using medal column type
            {headerName: 'Gold', field: 'gold', type: 'string'},
            {headerName: 'Silver', field: 'silver', type: 'string'},
            {headerName: 'Bronze', field: 'bronze', type: 'string'}
        ]
    }
]

// Grid Definition
// let the grid know which columns and what data to use
var gridOptions = {
    medalColumn: {width: 100, columnGroupShow: 'open', suppressFilter: true},
    debug: false,
    //showToolPanel: true,
    enableSorting: true,
    enableColResize: true,
    columnDefs: columnDefs,
    rowData: rowData,
    enableFilter: true,
    floatingFilter: true,
    animateRows: true,
    defaultColDef: {
        // make every column editable
        editable: true,
        // make every column use 'text' filter by default
        filter: 'agTextColumnFilter'
    }
}

// wait for the document to be loaded, otherwise,
// ag-Grid will not find the div in the document.

document.addEventListener("DOMContentLoaded", function () {
    // lookup the container we want the Grid to use
    var eGridDiv = document.querySelector('#myGrid');
    
    // create the grid passing in the div to use together with the columns & data we want to use
    new agGrid.Grid(eGridDiv, gridOptions);
});