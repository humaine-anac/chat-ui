// Modules
const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const cors = require('cors');
const WebSocketServer = require('ws').Server;
const output_json = require('./data/output-gate-json.json');
const endpoints = require('./data/endpoints.json')

// initialize API and start listening for requests
var app = express();
app.use(cors());
app.use(bodyParser.json());
app.listen(2500);

// Initialize the websocket server
var sock = new WebSocketServer({ port: 9007 });


/*
Description: Reply to the user with the agents response.
Input: string - agent response JSON
Output: none.
Effects: send json object containing sender and message through websocket
         to the browser.
*/
sock.broadcast = function broadcast(data) {

  // sends the message to all users
  sock.clients.forEach(function each(client) {
    if(client.readyState === 1 ) {

      // send the message/sender to the client
      client.send(JSON.stringify(data));
    }
  });
};


// Manage the connection of a new client
sock.on('connection', function connection(client) {
  console.log("CONNECTION OK...");

  // if the client sends a message, direct it to the agent
  client.on('message', function incoming(data) {

    var message = output_json;
    message.sender = "Human";
    message.transcript = data;
    message.timestamp = Date.now();

    /*
    Description: HTTP post request to send user message.
    Input: string - user message being sent.
    Output: none.
    Effects: send JSON object to agents to be processed.
    */
    request.post(endpoints.user_to_output, {

      // formatted JSON object
      json: message
    
    // Error handler for POST request
    }, (error, res) => {
      if (error) {
        console.error(error);
        return;
      }
      console.log(`statusCode: ${res.statusCode}`);
    });
  });
});


/*
Description: Send the agent response to be displayed.
Input: JSON - example found in README.
Output: JSON - {“msgType” = “submitTranscript”,“Status” = “OK”}, sent to sender
Effects: display agent message to user
*/
app.post('/receiveMessage', function(req, res) {
  var json_content = req.body;

  // Send to broadcast method for displaying in UI
  sock.broadcast(json_content);
  
  // send 'ack'
  res.send('{“msgType” = “submitTranscript”,“Status” = “OK”}');
});


// Psuedo routing api for communication between user and agents
var dummyRoute = express();
dummyRoute.use(cors());
dummyRoute.use(bodyParser.json());
dummyRoute.listen(3500);


// Redirect user/agent messages through dummyRoute and toward destination
dummyRoute.post('/relayMessage', function(req, res) {
  var json_content = req.body;

  // message from user to agents
  if(json_content.sender === "Human") {
    request.post(endpoints.output_to_agent, {

      // formatted JSON object
      json: json_content
    
    // Error handler for POST request
    }, (error, res) => {
      if (error) {
        console.error(error);
        return;
      }
      console.log(`statusCode: ${res.statusCode}`);
    });

  // message from agent to user
  } else {
    request.post(endpoints.output_to_user, {

      // formatted JSON object
      json: json_content
    
    // Error handler for POST request
    }, (error, res) => {
      if (error) {
        console.error(error);
        return;
      }
      console.log(`statusCode: ${res.statusCode}`);
    });
  }

  res.send("OK");
});