// Global Variables
const colors = {"Celia": "blue", "Watson": "green", "User": "red"};
var quantities_set = 0;

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
            var buyer_message = $("#user-input-field-right").val();
            var seller_message = $("#user-input-field-left").val();

            // If buyer message
            if(buyer_message.length > 0) {

                // display message
                new_message(buyer_message, 'User', 'buyer');
                // send node server the user message
                var json = {purpose:"message", data:buyer_message, role:"buyer"};
                sock.send(data=JSON.stringify(json));
                $("#user-input-field-right").val('');
            }

            // if seller message
            if(seller_message.length > 0) {

                // display message
                new_message(seller_message, 'User', 'seller');
                // send node server the user message
                var json = {purpose:"message", data:seller_message, role:"seller"};
                sock.send(data=JSON.stringify(json));
                $("#user-input-field-left").val('');
            }
        }
    });

    // start round
    $("#start").on("click", function(eve) {
        // get duration data
        var round = $("#timer_2")[0].value;
        var post = $("#timer_3")[0].value;
        var warmup = $("#timer_1")[0].value;

        // send to node server
        var json = {purpose:"newRound", data:{start:round, end:post, pre:warmup}};
        sock.send(data=JSON.stringify(json));

        // WARMUP TIMER
        $("#roundTimerHeader")[0].innerHTML = "Warmup Time:";
        $("#roundTimer")[0].innerHTML = warmup;
        var timer1 = setInterval(function(){
            $("#roundTimer")[0].innerHTML -= 1;

            if($("#roundTimer")[0].innerHTML <= 0) {
                clearInterval(timer1);

                // ROUND TIMER
                $("#roundTimerHeader")[0].innerHTML = "Negotiation Time:";
                $("#roundTimer")[0].innerHTML = round;
                var timer2 = setInterval(function() {
                    $("#roundTimer")[0].innerHTML -= 1;
        
                    if($("#roundTimer")[0].innerHTML <= 0) {
                        clearInterval(timer2);


                        // ALLOCATION TIMER
                        $("#roundTimerHeader")[0].innerHTML = "Allocation Time:";
                        $("#roundTimer")[0].innerHTML = post;
                        var timer3 = setInterval(function() {
                            $("#roundTimer")[0].innerHTML -= 1;

                            if($("#roundTimer")[0].innerHTML <= 0) {
                                $("#roundTimerHeader")[0].innerHTML = "Post-game:";
                                clearInterval(timer3);
                            }
                        }, 1000);

                    }
                }, 1000);
            }
        }, 1000);
    });

    // if the display_popup button is pressed, show or remove div depending on state
    $("#display_popup").on("click", function(eve) {
        if($("#popup")[0].style.display === "block") {
            $("#display_popup")[0].innerHTML = "Show Results";
            $("#popup")[0].style.display = "none";
        } else {
            $("#display_popup")[0].innerHTML = "Hide Results";
            $("#popup")[0].style.display = "block";
        }
    });

    // if the show_ingredient_display button is pressed, show or remove div depending on state
    $("#show_ingredient_display").on("click", function(eve) {
        if($("#ingredient_display")[0].style.display === "block") {
            $("#show_ingredient_display")[0].innerHTML = "Show Ingredients";
            $("#ingredient_display")[0].style.display = "none";
        } else {
            $("#show_ingredient_display")[0].innerHTML = "Hide Ingredients";
            $("#ingredient_display")[0].style.display = "block";
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
            $("#ingredient_display")[0].textContent = "Ingredients:\t";
            if(content.data !== "newRound" && content.data.Human !== undefined) {
                for(key in content.data.Human.quantity) {
                    $("#ingredient_display")[0].textContent += "\n\t"
                    + key + " (" + content.data.Human.quantity[key] + ")";
                }
            }
        // if data contains round results
        } else if(content.purpose == "roundTotal") {
            // if this is a new round, overwrite old data
            if(content.newRound == true) {
                quantities_set = 0;
                $("#Celia")[0].textContent = "  Celia: ";
                $("#Watson")[0].textContent = "  Watson: ";
                $("#Human")[0].textContent = "  Human: ";
                $("#popup")[0].style.display = "none";
                //$("#roundTimerHeader")[0].innerHTML = "Pre-Game:";
            
            // if not a new round and all data hasn't been displayed
            } else if(quantities_set < 3 && content.data !== undefined){
                quantities_set += 1;

                // display value and unit
                $("#" + content.id)[0].textContent += "\n\tProfit: " + content.data.utility.value
                + " " + content.data.utility.currencyUnit;

                // if human data, show cost, else revenue
                if(content.id === "Human") {
                    $("#" + content.id)[0].textContent += "\n\tCost: "
                    + content.data.cost + " " + content.data.utility.currencyUnit;
                } else {
                    $("#" + content.id)[0].textContent += "\n\tRevenue: "
                    + content.data.revenue + " " + content.data.utility.currencyUnit;
                }

                $("#" + content.id)[0].textContent += "\n\tQuantity:";

                // show quantity of each good
                for(key in content.data.quantity) {
                    $("#" + content.id)[0].textContent += " " + key;
                    $("#" + content.id)[0].textContent += " (" + content.data.quantity[key] + ")";
                };

                // display div
                $("#" + content.id)[0].textContent += "\n ";
                $("#display_popup")[0].innerHTML = "Hide Results";
                $("#popup")[0].style.display = "block";
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

    // if buyer
    if(role == 'buyer') {
        username.className = "buyer";
        username.style.fontSize = "24px";
        username.innerHTML = id;
        username.style.color = colors[id];
        text.className = "message buyer";
    
    // if seller
    } else if(role == "seller") {
        username.className = "seller";
        username.style.fontSize = "24px";
        username.innerHTML = id;
        username.style.color = colors[id];
        text.className = "message seller";
    }
    // don't continue if id is not recognized
    else {
        console.log("ERROR: unknown role");
        return;
    }

    // finish modifying the elements
    message_space.className = "message-space";
    text.innerHTML = message;

    // append both the 'username' and 'text' as children of the 'message-space'
    message_space.appendChild(username);
    message_space.appendChild(text);

    // Add the container div to the display div
    $("#message-display")[0].appendChild(message_space);

    // scroll down to show the most recent messages.
    $("#message-display").scrollTop($("#message-display")[0].scrollHeight);
}
