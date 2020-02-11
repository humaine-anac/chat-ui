1. This will be shipped to participants
2. There is no celio or ibm dependencies
3. Uses restful api instead of rabbitMQ
4. Creates a chatUI that can send a message directly to agents on POST/receiveMessage
5. Receives and displays messages from agents on POST/relayMessage

How to start chatUI:
- run npm install to ensure dependencies are installed
- start the nodeJS server, index.js
    - node index.js
- open the index.html page in a browser and refresh
    - the node server should indicate a connection was made
- endpoints can be edited in the ~/data/endpoints.json file