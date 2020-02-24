// Global Variables
const a1 = "Celia";
const a2 = "Watson";
var written = 0;

$(document).ready(function(e) {
    
    // client side server to connect to NodeJS server
    var sock = new WebSocket("ws://" + location.hostname + ":2501/");

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
                new_message(message, 'user', 'buyer');

                // send node server the user message
                var json = {purpose:"message", data:message};
                sock.send(data=JSON.stringify(json));
                $($(".user-input-field")[0]).val('');
            }
        }
    });

    // start round
    $(".start").on("click", function(eve) {

        // get duration data
        var round = $("#timer_2")[0].value;
        var post = $("#timer_3")[0].value;
        var warmup = $("#timer_1")[0].value;

        // send to node server
        var json = {purpose:"newRound", data:{start:round, end:post, pre:warmup}};
        sock.send(data=JSON.stringify(json));

        // set the timer to the given time
        $(".roundTimer")[0].innerHTML = round;

        // Wait until the warmup time has ended
        setTimeout(() => {

            // count down round time
            var timer = setInterval(function() {
                $(".roundTimer")[0].innerHTML -= 1;

                // end when it reaches 0
                if($(".roundTimer")[0].innerHTML <= 0) {
                    clearInterval(timer);
                }
            }, 1000);
        }, warmup * 1000);
    });

    // if the display_popup button is pressed, show or remove div depending on state
    $(".display_popup").on("click", function(eve) {
        if($(".popup")[0].style.display === "block") {
            $(".display_popup")[0].innerHTML = "Show Resuluts";
            $(".popup")[0].style.display = "none";
        } else {
            $(".display_popup")[0].innerHTML = "Hide Resuluts";
            $(".popup")[0].style.display = "block";
        }
    });

    // if the show_ingredient_display button is pressed, show or remove div depending on state
    $(".show_ingredient_display").on("click", function(eve) {
        if($(".ingredient_display")[0].style.display === "block") {
            $(".show_ingredient_display")[0].innerHTML = "Show Ingredients";
            $(".ingredient_display")[0].style.display = "none";
        } else {
            $(".show_ingredient_display")[0].innerHTML = "Hide Ingredients";
            $(".ingredient_display")[0].style.display = "block";
        }
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
        var content = JSON.parse(e.data);

        // if updateIngredients, then overwrite div with current information
        if(content.purpose === "updateIngredients") {
            $(".ingredient_display")[0].textContent = "Ingredients:\t";
            if(content.data !== "newRound" && content.data.Human !== undefined) {
                for(key in content.data.Human.quantity) {
                    $(".ingredient_display")[0].textContent += "\n\t"
                    + key + " (" + content.data.Human.quantity[key] + ")";
                }
            }
        // if data contains round results
        } else if(content.purpose == "roundTotal") {
            // if this is a new round, overwrite old data
            if(content.newRound == true) {
                written = 0;
                $("#Celia")[0].textContent = "  Celia: ";
                $("#Watson")[0].textContent = "  Watson: ";
                $("#Human")[0].textContent = "  Human: ";
                $(".popup")[0].style.display = "none";
            
            // if not a new round and all data hasn't been displayed
            } else if(written < 3 && content.data !== undefined){
                written += 1;

                // display value and unit
                $("#" + content.id)[0].textContent += content.data.utility.value
                + " " + content.data.utility.currencyUnit;

                // if human data, show cost, else revenue
                if(content.id === "Human") {
                    $("#" + content.id)[0].textContent += "\n\tCost: " + content.data.cost;
                } else {
                    $("#" + content.id)[0].textContent += "\n\tRevenue: " + content.data.revenue;
                }

                $("#" + content.id)[0].textContent += "\n\tQuantity:";

                // show quantity of each good
                for(key in content.data.quantity) {
                    $("#" + content.id)[0].textContent += " " + key;
                    $("#" + content.id)[0].textContent += " (" + content.data.quantity[key] + ")";
                };

                // display div
                $("#" + content.id)[0].textContent += "\n ";
                $(".display_popup")[0].innerHTML = "Hide Resuluts";
                $(".popup")[0].style.display = "block";
            }

        // if data contains message
        } else {
            // display agent message
            var json = {purpose:"updateIngredients"};
            sock.send(data=JSON.stringify(json));
            new_message(content.text, content.speaker, content.role);
        }
    };
});


/*
Description: Create the message 'posts' displayed to the user. Depending on who sends the message
          decides how it is displayed.
Input: string - message, string - id.
Output: none.
Effects: makes a new div element, 'message-space', containing the senders name and their message.
*/
function new_message(message, id, role) {

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
