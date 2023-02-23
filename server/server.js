const WebSocket = require('ws')

const wss = new WebSocket.Server({ port: 4000 }, () => console.log('Server started on port 4000'))

const clients = new Set()

wss.on('connection', (wsClient) => {
  console.log('CONNECTED')
  clients.add(wsClient)

  wsClient.on('message', (message) => {
    const req = JSON.parse(message.toString())
    wsClient.nickname = req.payload.username
    broadcast(req)
  })
})

function broadcast(clientData) {
  let response

  clients.forEach((client) => {
    switch (clientData.event) {
      case 'login':
        response = {type: 'login', payload: clientData.payload}
        const userList = []
        clients.forEach(it => userList.push(it.nickname))
        client.send(JSON.stringify({type: 'userList', payload: userList}))
        console.log(userList)
        break;
    
      case 'message':
        response = {type: 'message', payload: clientData.payload}
        break;
    
      case 'logout':
        response = {type: 'logout', payload: clientData.payload}
        const ms = clientData.payload.userList.payload
        const memberLogout = clientData.payload.username

        for (let i = 0; i < ms.length; i++) {
          if (ms[i] === memberLogout) {
            ms[i] = ''
          }
        }
        console.log(ms)
        client.send(JSON.stringify({type: 'userList', payload: ms}))
        break;
    
      default:
        break;
    }

    client.send(JSON.stringify(response))
  })
}