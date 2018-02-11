/**
 * Created by anthony on 02/02/2018.
 */

class RypeAdmin extends EventEmitter3 {
    
    get elems() {
        return {connectionAlert: $('#connection_alert')}
    }
    
    connectToServer() {
        let url = 'ws://localhost:26116'
        let ws = new WebSocket(url, 'echo-protocol')
        
        _.merge(WebSocket.prototype, Object.create(EventEmitter3.prototype))
        EventEmitter3.call(ws)
        
        ws.onopen = () => {
            this.emit('server_connected')
        }
        
        ws.onclose = () => {
            this.emit('server_disconnected')
        }
        
        ws.onerror = (err) => {
            console.error(err)
        }
        
        this.server = ws
    }
}

const app = new RypeAdmin()

app.on('server_disconnected', () => {
    console.log('server disconnected')
    app.elems.connectionAlert.show().slideDown()
})

app.on('server_connected', () => {
    console.log('server connected')
    app.elems.connectionAlert.slideUp().hide()
})

app.connectToServer()

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
            {headerName: 'Gold', field: 'gold', type: 'medalColumn'},
            {headerName: 'Silver', field: 'silver', type: 'medalColumn'},
            {headerName: 'Bronze', field: 'bronze', type: 'medalColumn'}
        ]
    }
]

// Grid Definition
// let the grid know which columns and what data to use
var gridOptions = {
    medalColumn: {width: 100, columnGroupShow: 'open', suppressFilter: true},
    debug: true,
    showToolPanel: true,
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