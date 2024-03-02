const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let monitor;

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Function to send heartbeat to the monitor
// function sendHeartbeat() {
//   if (monitor && monitor.readyState === WebSocket.OPEN) {
//     monitor.send('Heartbeat from server');
//   }
// }

// WebSocket server logic
wss.on('connection', function connection(ws) {
  console.log('Client connected');

  ws.on('message', function incoming(message) {
    let messageText = message.toString('utf-8');

    console.log('Received message:', messageText);

    if (messageText === "MONITOR") {
      monitor = ws;
      console.log('Monitor connected');
      return;
    }

    if(monitor && monitor.readyState === WebSocket.OPEN) {
        console.log('Sending message to monitor');
        monitor.send(messageText);
    } else{
        console.log('No monitor connected');
    }
    ws.send(messageText); // Echo the received message back to the client
  });

  ws.on('close', function close() {
    console.log('Client disconnected');
  });
});

// Periodically send heartbeat to the monitor every 5 seconds
// setInterval(sendHeartbeat, 1000);

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
