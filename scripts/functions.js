// Global Variables
const a1 = "Celia"
const a2 = "Watson"

$(document).ready(function(e) {
    
    // client side server to connect to NodeJS server
    var sock = new WebSocket("ws://" + location.hostname + ":80/");

    // Listen for the 'enter' key to be pressed, then process
    // the users input
    document.addEventListener('keydown', function(event) {

        // check for enter, 'key 13'
        if(event.keyCode == 13) {

            // stop the enter key from writing into the textarea
            event.preventDefault();
            var message = $($(".user-input-field")[0]).val();

            // If message is not empty
            if(message.length > 0) {

                // display message
                new_message(message, 'user');

                // send node server the user message
                sock.send(data=message);
                $($(".user-input-field")[0]).val('');
            }
        }
    });

    // start round
    $(".start").on("click", function(eve) {
        sock.send(data="START_NEW_ROUND");
        console.log("clicked");
    });


    // debug to check if the browser connects to the server properly
    sock.onopen = function(event) {
        console.log("websocket opened", event);
    };


    // debug to print error object incase of bug
    sock.onerror = function(e) {
        console.log("WebSocket error: ", e);
    }


    // method to parse and display a message from the agent
    sock.onmessage = function(e) {
        console.log(e);
        var content = JSON.parse(e.data);

        // display agent message
        new_message(content.text, content.speaker);
    };
});


/*
Description: Create the message 'posts' displayed to the user. Depending on who sends the message
          decides how it is displayed.
Input: string - message, string - id.
Output: none.
Effects: makes a new div element, 'message-space', containing the senders name and their message.
*/
function new_message(message, id) {

    // Don't display if the message is blank
    if(message.length <= 0) {
        return;
    }

    // Create the elements that will be posted
    var message_space = document.createElement("div");
    var username = document.createElement("div");
    var text = document.createElement("div");

    // depending on the sender, format the message to their specified css. Hardcoded element
    // properties since there can only be a user and two agents.
    if(id === 'user') {
        username.className = "user user-name";
        username.innerHTML = "User";
        text.className = "message user";
    } else if(id === a1) {
        username.className = "agent agent-1-name";
        username.innerHTML = a1;
        text.className = "message agent";
    } else if(id === a2) {
        username.className = "agent agent-2-name";
        username.innerHTML = a2;
        text.className = "message agent";
    
    // don't continue if id is not recognized
    } else {
        console.log("ERROR: unknown id");
        return;
    }

    // finish modifying the elements
    message_space.className = "message-space";
    text.innerHTML = message;

    // append both the 'username' and 'text' as children of the 'message-space'
    message_space.appendChild(username);
    message_space.appendChild(text);

    // Add the container div to the display div
    document.getElementsByClassName("message-display")[0].appendChild(message_space);

    // scroll down to show the most recent messages.
    $(".message-display").scrollTop($(".message-display")[0].scrollHeight);
}
