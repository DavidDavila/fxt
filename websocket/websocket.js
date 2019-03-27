var WebSocketServer = require('websocket').server;
var http = require('http');
import DDBB from '../firebase/firebase'
import { BehaviorSubject } from 'rxjs';

export class WebsocketEmmiter {
  
  constructor() {  
    this.message;
    this.messageObservable = new BehaviorSubject(); 
    this.messageObservable.subscribe( val => {
      if (val) {
        this.message = val;

      } 
    })
    this.server = http.createServer(function(request, response) {
        console.log((new Date()) + ' Received request for ' + request.url);
        response.writeHead(404);
        response.end();
    });
    this.server.listen(8012, function() {
        console.log((new Date()) + ' Server is listening on port 8443');
    });

    this.wsServer = new WebSocketServer({
        httpServer: this.server,
        // You should not use autoAcceptConnections for production
        // applications, as it defeats all standard cross-origin protection
        // facilities built into the protocol and the browser.  You should
        // *always* verify the connection's origin and decide whether or not
        // to accept it.
        autoAcceptConnections: false
    });
    function originIsAllowed(origin) {
      // put logic here to detect whether the specified origin is allowed.
      return true;
    }
    this.wsServer.on('request', ( request => {
      if (!originIsAllowed(request.origin)) {
        // Make sure we only accept requests from an allowed origin
        request.reject();
        console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
        return;
      }
      
      this.connection = request.accept('echo-protocol', request.origin);
      console.log((new Date()) + ' Connection accepted.');
      this.onRecieveData();
       
       this.connection.on('close', function(reasonCode, description) {
         
      });     
    }).bind(this));
  }
  sendToClient(message) {
    this.connection && this.connection.sendUTF(message); 
  }
  onRecieveData() {
    this.connection.on('message', (message => {    
    const signal = JSON.parse(message.utf8Data);
    DDBB.setNewSignal(signal.par, signal)
       this.sendToClient(signal);            
    }).bind(this));
  }

}
const WS = new WebsocketEmmiter();
export default WS;