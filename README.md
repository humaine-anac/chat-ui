## Details

1. This will be shipped to participants
2. There is no celio or ibm dependencies
3. Uses restful api instead of rabbitMQ
4. Creates a chatUI that can send a message directly to agents on POST/receiveMessage
5. Receives and displays messages from agents on POST/relayMessage

## Setup/Startup

How to start chatUI:
- run npm install to ensure dependencies are installed
- start the nodeJS server, index.js
    - node index.js
- open the index.html (http://localhost:2500) page in a browser and refresh
    - the node server should indicate a connection was made
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
