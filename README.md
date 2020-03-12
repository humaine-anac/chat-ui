
# Chat-UI

This web application provides an interface for interacting with the agents through natural language.
Each round is a dialogue and, before chatting, the user needs to first specify the time in seconds for the warm up period (which is the time that the human buyer has to decide on a negotiation strategy), for the round (which is the time duration of the entire dialogue) and for the post-round (which is the time the human buyer has to evaluate the goods in the Human UI tool.
For more details, please see the documentation in https://github.com/humaine-anac/technical-documentation.

## Details

1. This will be shipped to participants
2. There is no celio or ibm dependencies
3. Uses restful api instead of rabbitMQ
4. Creates a chatUI that can send a message directly to agents on POST/receiveMessage
5. Receives and displays messages from agents on POST/relayMessage

## Setup/Startup

How to start chatUI:
- run npm install to ensure dependencies are installed
- cp assistantParams.json.template assistantParams.json
- Optionally, edit assistantParams.json to contain a valid Watson Assistant api key, url, and assistant id. This should be the same file as used in the repository agent-jok.
- start the nodeJS server, index.js
    - node index.js
- open the Chat UI index.html (http://localhost:2500) page in a browser and refresh
    - open the Human UI web page in a browser
    - go to the Chat UI web page and start the round
    - the Chat UI node server should indicate a connection was made and the round was created and the statusCode should be 200
- endpoints can be edited in the ~/data/endpoints.json file

## Contributing

We are open to contributions.

* The software is provided under the [MIT license](LICENSE). Contributions to
this project are accepted under the same license.
* Please also ensure that each commit in the series has at least one
`Signed-off-by:` line, using your real name and email address. The names in
the `Signed-off-by:` and `Author:` lines must match. If anyone else
contributes to the commit, they must also add their own `Signed-off-by:`
line. By adding this line the contributor certifies the contribution is made
under the terms of the
[Developer Certificate of Origin (DCO)](DeveloperCertificateOfOrigin.txt).
* Questions, bug reports, et cetera are raised and discussed on the issues page.
* Please make merge requests into the master branch.
