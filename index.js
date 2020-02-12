// Modules
const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const cors = require('cors');
const WebSocketServer = require('ws').Server;
const output_json = require('./data/output-gate-json.json');
const endpoints = require('./data/endpoints.json');
const sampleRound = require('./data/sample-round.json');

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

  // if the client sends a message, or if the round button was clicked
  client.on('message', function incoming(data) {

    // If the start button was clicked
    if(data === "START_NEW_ROUND") {

      // gather all utility data
      var new_round = sampleRound;
      var agent_data, human_data;

      try {
        agent_data = request.get(endpoints.anac_utility + "/generateUtility/agent");
        human_data = request.get(endpoints.anac_utility + "/generateUtility/human");

        // set the new functions to the correct json objects
        new_round.agents[0].utilityFunction = agent_data;
        new_round.agents[1].utilityFunction = agent_data;
        new_round.human.utilityFunction = human_data;

        // send /startRound request with new json
        request.post(endpoints.event_orch + "/startRound", {

          // formatted JSON object
          json: new_round
        
        // Error handler for POST request
        }, (error, res) => {
          if (error) {
            console.error(error);
            return;
          }
          console.log(`statusCode: ${res.statusCode}`);
        });
      } catch(error) {
        console.log("ERROR: anac-utility not responding", error);
      }
    
    // If just a message to the agents, follow here
    } else {

      // gather format for new message
      var message = output_json;

      // try and set the agents name, if given
      const lower_transcript = data.toLowerCase();
      if (lower_transcript.startsWith('watson') || lower_transcript.startsWith('@watson')) {
        message.addressee = 'Watson';
      }
      else if (lower_transcript.startsWith('celia') || lower_transcript.startsWith('@celia')) {
        message.addressee = 'Celia';
      }
      else {
        message.addressee = '';
      }

      // set all other json data
      message.sender = "Human";
      message.text = data;
      message.timestamp = Date.now();

      /*
      Description: HTTP post request to send user message.
      Input: string - user message being sent.
      Output: none.
      Effects: send JSON object to agents to be processed.
      */
      request.post(endpoints.relay_server + endpoints.output, {

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
    }
  });
});


/*
Description: Send the agent response to be displayed.
Input: JSON - example found in README.
Output: JSON - {“msgType” = “submitTranscript”,“Status” = “OK”}, sent to sender
Effects: display agent message to user
*/
app.post(endpoints.input, function(req, res) {
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
dummyRoute.post(endpoints.output, function(req, res) {
  var json_content = req.body;

  // message from user to agents
  if(json_content.sender === "Human") {
    request.post(endpoints.agent_message + endpoints.input, {

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
    request.post(endpoints.chatUI_server + endpoints.input, {

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
