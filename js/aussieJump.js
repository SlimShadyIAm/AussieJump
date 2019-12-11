var canvas = document.getElementById("canvas", { alpha: false }),
    ctx = canvas.getContext("2d"),
    bg = new Image(),
    fg = new Image(),
    info = new Image(),
    title = new Image(),
    kang = new Image(),
    kangFlipped = new Image(),
    cactus_1 = new Image(),
    cactus_2 = new Image(),
    cactus_3 = new Image(),
    cactus_4 = new Image(),
    cactus_5 = new Image(),
    cactus_6 = new Image(),
    cactus_7 = new Image(),
    lost = new Image(),
    high_score = new Image(),
    collisionSound = new Audio(),
    state,
    leaderboard,
    assetCounter,
    objectTypeArray = [];

const Gpio = require("onoff").Gpio;

// This will iniialize the state of the game. The state contains information about every cactus, visible and invisible
// as well as the state of the kangaroo (x and y position, velocity, whether it is jumping), the score of the current game,
// whether the game is ongoing and when it is over.
// Also initialized is the leaderboard object, which is stored in the cache of the browser. If no leaderboard is found, it
// is initialized, otherwise we just get the existing leaderborad
function init() {
    if (!localStorage.getItem("leaderboard")) {
        // is there a leaderboard in the cache?
        localStorage.setItem("leaderboard", JSON.stringify([])); // no, create it in the cache
        // [
        // 		{
        // 			name: "AAA", 				an example of how a leaderboard object looks.
        // 			score: 20					there is a maximum of 5 entries in the leaderboard
        // 		},
        // 		{
        // 			name: "BBB",
        // 			score: 10
        // 		}
        // 	]
    }
    leaderboard = JSON.parse(localStorage.getItem("leaderboard")); // set local leaderboard object
    leaderboard.sort(compare); // sort leaderboard, highest score on top
    updateLeaderboardView();

    // load all the image assets beforehand. the "ready" counter is used to ensure that all the assets have loaded before
    // allowing the game to commence.
    assetCounter = 16; // this should be the number of images below here

    bg.src = "assets/img/sky_2.png";
    bg.onload = function() {
        state.ready++;
    };
    fg.src = "assets/img/ground_1.png";
    fg.onload = function() {
        state.ready++;
    };
    kang.src = "assets/img/kangaroo.png";
    kang.onload = function() {
        state.ready++;
    };
    title.src = "assets/img/title.png";
    title.onload = function() {
        state.ready++;
    };
    info.src = "assets/img/information_screen.png";
    info.onload = function() {
        state.ready++;
    };
    cactus_1.src = "assets/img/cactus_1.png";
    cactus_1.onload = function() {
        state.ready++;
    };
    cactus_2.src = "assets/img/cactus_2.png";
    cactus_2.onload = function() {
        state.ready++;
    };
    cactus_3.src = "assets/img/cactus_3.png";
    cactus_3.onload = function() {
        state.ready++;
    };
    cactus_4.src = "assets/img/cactus_4.png";
    cactus_4.onload = function() {
        state.ready++;
    };
    cactus_5.src = "assets/img/cactus_5.png";
    cactus_5.onload = function() {
        state.ready++;
    };
    cactus_6.src = "assets/img/cactus_6.png";
    cactus_6.onload = function() {
        state.ready++;
    };
    cactus_7.src = "assets/img/cactus_7.png";
    cactus_7.onload = function() {
        state.ready++;
    };
    lost.src = "assets/img/you_lost.png";
    lost.onload = function() {
        state.ready++;
    };
    high_score.src = "assets/img/high_score.png";
    high_score.onload = function() {
        state.ready++;
    };

    collisionSound.src = "assets/audio/hit.wav";
    collisionSound.oncanplaythrough = function() {
        state.ready++;
    };
    kangFlipped.src = "assets/img/kangaroo_flipped.png";
    kangFlipped.onload = function() {
        state.ready++;
    };
    //Push all object images into array to generate a random one later
    objectTypeArray = [];
    objectTypeArray.push(
        cactus_1,
        cactus_2,
        cactus_3,
        cactus_4,
        cactus_5,
        cactus_6,
        cactus_7
    );
    state = {
        objectsArray: [],
        kangState: {
            jumping: false,
            posX: 200,
            posY: 450,
            velX: 0,
            velY: 0
        },
        ready: 0,
        score: 0,
        pause: false,
        gameOver: false,
        startGame: false,
        cactiCleared: 0
    };

    // this is the first cactus that is always visible when the game is launched.
    state.objectsArray[0] = {
        type: objectTypeArray[0],
        posX: canvas.width,
        posY: bg.height - fg.height - objectTypeArray[0].height,
        objHeight: objectTypeArray[0].height,
        objWidth: objectTypeArray[0].width,
        speed: -4
    };
}

// the controller object contains information about the keys being pressed and also has a handler for controls
// if a game is ongoing, we store the state of the left, right and up arrow keys which are used to control the kangaroo
// if a game is not ongoing, we only allow the space bar to start or restart a new game.
controller = {
    left: false,
    right: false,
    up: false,
    upSensor: false,
    leftSensor: false,
    rightSensor: false,
    keyListener: function(e) {
        // interpret the game's controls
        var keyDown = event.type == "keydown" ? true : false; // store whether a key has been pressed or released
        if ([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
            // stop default behavior of the keys. stops random scrolling which is done by default
            e.preventDefault();
        }
        if (state.startGame) {
            // is a game currently ongoing? (enable controls)
            switch (e.keyCode) {
                case 37: // left arrow key
                    controller.left = keyDown;
                    break;
                case 39: // right arrow key
                    controller.right = keyDown;
                    break;
                case 38: // up arrow key
                    controller.up = keyDown;
                    break;
            }
        } else {
            // a is not ongoing, waiting to start (disable controls other than space bar)
            if (e.keyCode == 32) {
                // spacebar arrow key
                init(); // reset the game state and start the game
                state.startGame = true;
            }
        }
    },
    sensorListener: function(e) {
        var sensorVal = e.detail.value;
        switch (e.detail.type) {
            case "left":
                controller.leftSensor = sensorVal;
                setTimeout(() => {
                    controller.leftSensor = false;
                }, 50);
                break;
            case "right":
                controller.rightSensor = sensorVal;
                setTimeout(() => {
                    controller.rightSensor = false;
                }, 50);
                break;
            case "up":
                controller.upSensor = sensorVal;
                setTimeout(() => {
                    controller.upSensor = false;
                }, 50);
        }
    }
};

// define our event listener for the game controls
document.addEventListener("keydown", controller.keyListener);
document.addEventListener("keyup", controller.keyListener);
document.addEventListener("sensorValue", controller.sensorListener);

// this function is the loop which draws the game when we are waiting for a new game to start
// or when a game has just ended and we are waiting to restart.
function drawStart() {
    var newHighCheck = false;
    if (!state.startGame) {
        // a game is not ongoing. we don't want to draw anything unless a game isn't ongoing
        if (state.ready == assetCounter) {
            ctx.drawImage(bg, 0, 0); // draw background
            ctx.drawImage(
                title,
                canvas.width / 2 - title.width / 2,
                title.height / 2 - 20
            ); //title
            ctx.drawImage(info, canvas.width / 2 - info.width / 2, 100);
            if (state.gameOver) {
                // this is a game that has just ended, we dont want everything to disappear
                for (i = 0; i < state.objectsArray.length; i++) {
                    // draw all the objects
                    ctx.drawImage(
                        state.objectsArray[i].type,
                        state.objectsArray[i].posX,
                        state.objectsArray[i].posY,
                        state.objectsArray[i].objWidth,
                        state.objectsArray[i].objHeight
                    );
                }
                ctx.drawImage(fg, 0, canvas.height - fg.height); // draw foreground
                ctx.fillText(
                    `Score: ${state.score}`,
                    canvas.width - 150,
                    canvas.height - 300
                );
                newHighCheck = isNewHighScore(state.score);
                ctx.drawImage(lost, canvas.width / 2 - 350 / 2, 600, 350, 350);
            } else {
                // the game has just been opened, only draw the initial object
                ctx.drawImage(fg, 0, canvas.height - fg.height); // draw foreground
                ctx.drawImage(info, canvas.width / 2 - info.width / 2, 100); //draw info screen
            }

            // draw the kangaroo with the x,y position from the state. if a game has just ended, it will be drawn
            // where the kangaroo collided with an object.
            ctx.drawImage(kang, state.kangState.posX, state.kangState.posY);

            // some font stuff
            ctx.fillStyle = "#000";
            ctx.font = "25px Verdana";
            ctx.fill(); // draw the text
            if (newHighCheck) {
                ctx.drawImage(high_score, canvas.width - 300, 50, 200, 200);
                ctx.fill();
            }
        }
    }
    // the loop which will continuously draw frames
    requestAnimationFrame(drawStart);
}

// this function draws the state of a currently ongoing game. it draws the objects, kangaroo, velocity and position of the kangaroo
// can be controlled, new objects are added, collisions are detected
function draw() {
    if (state.startGame) {
        // only call this function when a game is ongoing, otherwise drawStart() should be rendering

        // jump with arrow up
        if (
            (controller.up || controller.upSensor) && // keyboard arrow up or biggest flick to sensor
            !state.kangState.jumping
        ) {
            // only allow jumping if on the ground
            state.kangState.velY -= 100; //jump height. lower means bigger jump
        }

        if (controller.leftSensor) {
            // move left, level 3 tilt
            state.kangState.velX -= 30;
        } else if (controller.left) {
            state.kangState.velX -= 3;
        }

        if (controller.rightSensor) {
            // move right, level 3 tilt
            state.kangState.velX += 30;
        } else if (controller.right) {
            state.kangState.velX += 3;
        }

        // settings for physics of the game, such as easing, speed of moving left/right, jump speed
        state.kangState.velY += 1.5;
        state.kangState.posY += 2;
        state.kangState.posX += state.kangState.velX;
        state.kangState.posY += state.kangState.velY;
        state.kangState.velX *= 0.9;
        state.kangState.velY *= 0.9;

        // update state of kangaroo so that kangaroo is only allowed to single jump
        if (state.kangState.posY < bg.height - fg.height - kang.height) {
            // is kangaroo's Y position above the floor?
            state.kangState.jumping = true;
        } else {
            // kangaroo is on the floor. don't let it go below the floor
            state.kangState.posY = bg.height - fg.height - kang.height;
            state.kangState.jumping = false;
            state.kangState.velY = 0;
        }

        // don't let the kangaroo go off the canvas on the left
        if (state.kangState.posX <= 10) {
            state.kangState.posX = 10;
        }

        // don't let the kangaroo go off the canvas  on the right
        if (state.kangState.posX >= canvas.width - 50) {
            state.kangState.posX = canvas.width - 50;
        }

        // if all the images are loaded
        if (state.ready == assetCounter) {
            ctx.drawImage(bg, 0, 0); // draw background

            for (i = 0; i < state.objectsArray.length; i++) {
                // draw the object
                ctx.drawImage(
                    state.objectsArray[i].type,
                    state.objectsArray[i].posX,
                    state.objectsArray[i].posY,
                    state.objectsArray[i].objWidth,
                    state.objectsArray[i].objHeight
                );

                state.objectsArray[i].posX += state.objectsArray[i].speed; // change the objects's x position to the left by 2,
                // next loop the object will appear shifted to the left, etc. for sidescrolling.
            }
            var nextObject =
                state.objectsArray[state.score - state.cactiCleared];

            if (nextObject.speed < 0) {
                // coming from the right
                if (
                    state.kangState.posX >
                    state.objectsArray[state.score - state.cactiCleared].posX +
                        50
                ) {
                    state.score++; // if kangaroo's X position is greater than the NEXT object, increment score counter.
                }
            } else {
                if (
                    state.kangState.posX <
                    state.objectsArray[state.score - state.cactiCleared].posX -
                        50
                ) {
                    state.score++; // if kangaroo's X position is greater than the NEXT object, increment score counter.
                }
            }

            var objToConsider =
                state.objectsArray[state.score - state.cactiCleared];
            if (objToConsider.speed < 0) {
                if (
                    objToConsider.posX < canvas.width + 400 &&
                    !state.objectsArray[state.score - state.cactiCleared + 1]
                ) {
                    generateRandomObject();
                }
            } else {
                if (
                    objToConsider.posX > -800 &&
                    !state.objectsArray[state.score - state.cactiCleared + 1]
                ) {
                    generateRandomObject();
                }
            }
            // generateRandomObject(cactus);

            // if (state.score > 3) {
            //     // clear old pipes that are no longer on screen. we don't need em!
            //     state.cactiCleared++;
            //     state.objectsArray.splice(1);
            // }
            if (
                // gameover conditions
                detectCollision(state.kangState, state.objectsArray)
            ) {
                collisionSound.play();

                // reset state
                state.startGame = false;
                state.pause = true;
                state.gameOver = true;

                // leaderboard
                leaderboardStuff(state.score);

                // reset controller state
                controller.left = false;
                controller.right = false;
                controller.up = false;
                cancelAnimationFrame(draw); // make game freeze
            }
            ctx.drawImage(fg, 0, canvas.height - fg.height); // draw foreground

            if (state.kangState.velX < 0) {
                //facing left
                ctx.drawImage(
                    kangFlipped,
                    state.kangState.posX,
                    state.kangState.posY
                ); // draw kang
            } else {
                ctx.drawImage(kang, state.kangState.posX, state.kangState.posY); // draw kang
            }
        }

        ctx.fillStyle = "#000"; // score counter text
        ctx.font = "25px Verdana";
        ctx.fillText(
            `Score: ${state.score}`,
            canvas.width - 150,
            canvas.height - 300
        );
        ctx.fill();
    }
    window.requestAnimationFrame(draw);
}

function generateRandomObject() {
    var posx, scale, speed, objectType;
    // 	// only add this new cactus if it is less than 50px taller
    // than the previous cactus (to make it easier)
    //scale = Math.floor(120 + 300 * Math.random());

    // variable speed based on score
    if (state.score < 10) {
        speed = -4;
    } else if (state.score < 20) {
        speed = -6;
    } else if (state.score < 30) {
        speed = -8;
    } else if (state.score < 40) {
        speed = -10;
    } else {
        // https://www.youtube.com/watch?v=BJ0xBCwkg3E
        speed = -12;
    }
    if (Math.floor(Math.random() * 2) == 0) {
        //first case, let objects come from the right
        posx = canvas.width * 2;
    } else {
        //let objects come from the left
        posx = 0 - canvas.width;
        speed = 0 - speed;
    }
    //select object from the array, depending on the level
    if (state.score < 10) {
        //select random object but not the big cacti
        objectType =
            objectTypeArray[
                Math.floor(Math.random() * (objectTypeArray.length - 2))
            ];
    } else {
        objectType =
            objectTypeArray[Math.floor(Math.random() * objectTypeArray.length)]; //select random object from object array
    }

    state.objectsArray.push({
        // add new generated cactus to cactus array. it will be rendered soon!
        type: objectType,
        posX: posx,
        posY: bg.height - fg.height - objectType.height,
        objHeight: objectType.height,
        objWidth: objectType.width,
        speed: speed
    });
}

function detectCollision(kangState, object) {
    var nextObject = object[state.score - state.cactiCleared]; // find the upcoming object to detect collisions for.
    var prevObject = object[state.score - state.cactiCleared - 1]; // find the upcoming object to detect collisions for.
    var collisionDetected;

    if (nextObject.speed < 0) {
        //if object comes from the right
        // detect a collision using the kangaroo and object boundaries
        collisionDetected = collisionLoop(
            "Left and top",
            kangState,
            nextObject,
            prevObject
        );

        if (state.score >= 1) {
            //check if you back into the previous object
            if (prevObject.speed > 0) {
                //if previous came from the left
                collisionDetected =
                    collisionDetected ||
                    collisionLoop("Left", kangState, nextObject, prevObject);
            } else {
                //if previous came from the right
                collisionDetected =
                    collisionDetected ||
                    collisionLoop("Right", kangState, nextObject, prevObject);
            }
        }
    } else {
        //if current object comes from the left
        collisionDetected = collisionLoop(
            "Right and top",
            kangState,
            nextObject,
            prevObject
        );
        if (state.score >= 1) {
            if (prevObject.speed > 0) {
                //if previous comes from the left
                collisionDetected =
                    collisionDetected ||
                    collisionLoop("Left", kangState, nextObject, prevObject);
            } else {
                collisionDetected =
                    collisionDetected ||
                    collisionLoop("Right", kangState, nextObject, prevObject);
            }
        }
    }
    return collisionDetected;
}

function collisionLoop(direction, kangState, nextObject, prevObject) {
    //var nextObject = object[state.score - state.cactiCleared]; // find the upcoming object to detect collisions for.
    //var prevObject = object[state.score - state.cactiCleared - 1]; // find the upcoming object to detect collisions for.
    // kangaroo and object boundaries
    var topOfKang = kangState.posY,
        leftOfKang = kangState.posX + 30,
        rightOfKang = leftOfKang + kang.width - 50,
        bottomOfKang = topOfKang + kang.height - 30,
        //Object boundaries
        leftOfObject = nextObject.posX + 5,
        rightOfObject = leftOfObject + nextObject.objWidth - 5,
        topOfObject = nextObject.posY,
        //Prev object boundaries
        leftOfPrevObject = prevObject ? prevObject.posX : "",
        rightOfPrevObject = prevObject
            ? leftOfPrevObject + prevObject.objWidth
            : "",
        topOfPrevObject = prevObject ? prevObject.posY : "";

    if (direction == "Right") {
        return (
            leftOfKang <= rightOfPrevObject && bottomOfKang >= topOfPrevObject
        );
    }
    if (direction == "Left") {
        return (
            rightOfKang >= leftOfPrevObject && bottomOfKang >= topOfPrevObject
        );
    }
    if (direction == "Left and top") {
        return (
            (rightOfKang >= leftOfObject && bottomOfKang >= topOfObject) || //left collision
            ((leftOfKang >= rightOfObject || rightOfKang >= leftOfObject) &&
                bottomOfKang >= topOfObject)
        ); //top collision
    }
    if (direction == "Right and top") {
        return (
            (leftOfKang <= rightOfObject && bottomOfKang >= topOfObject) || //right collision
            ((rightOfKang <= leftOfObject || leftOfKang <= rightOfObject) &&
                bottomOfKang >= topOfObject)
        ); //top collision
    }
}

function leaderboardStuff(score) {
    if (isNewHighScore(score) && score > 0) {
        document.getElementById("leaderboard").innerHTML += `<tr id="newHigh">
		<td id="initials">
			<input type="text" onkeyup="this.value = this.value.toUpperCase();" maxlength="3" pattern="[A-Z]" name="Something" id="initialsVal" />
		</td>
		<td id="score">
			<input type="text" disabled name="Something" id="scoreVal" />
		</td>
    </tr>`;
        document.getElementById("newHigh").style.display = "block";
        document.getElementById("initialsVal").value = "AAA";
        document.getElementById("scoreVal").value = score;
        document.getElementById("submitHigh").style.display = "block";
    }
}

function isNewHighScore(score) {
    if (leaderboard.length > 0) {
        var newCheck = false;
        if (!alreadyInLeaderboard(score)) {
            leaderboard.map(row => {
                if (row.score < score) {
                    newCheck = true;
                }
            });
        }
        return newCheck;
    } else {
        return true;
    }
}

function alreadyInLeaderboard(score) {
    var found = false;
    leaderboard.map(row => {
        if (row.score == score) {
            found = true;
        }
    });
    return found;
}

function submitHigh() {
    var scoreVal = document.getElementById("scoreVal").value;
    var initialsVal = document.getElementById("initialsVal").value;
    leaderboard.push({
        name: initialsVal,
        score: scoreVal
    });
    leaderboard.sort(compare); // if (collisionDetected) {
    leaderboard.splice(5);
    localStorage.setItem("leaderboard", JSON.stringify(leaderboard));
    document.getElementById("newHigh").style.display = "none";
    document.getElementById("submitHigh").style.display = "none";
    updateLeaderboardView();
}

function updateLeaderboardView() {
    var leaderboardHTML = document.getElementById("leaderboard");
    if (leaderboard.length < 1) {
        leaderboardHTML.innerHTML = `<tr><td>No high scores!</td></tr>`;
    } else {
        leaderboardHTML.innerHTML = "";
        leaderboard.map(row => {
            leaderboardHTML.innerHTML += `<tr><td>${row.name}</td><td>${row.score}</td></tr>`;
        });
    }
    leaderboard.sort(compare);
}

function compare(a, b) {
    /*if (a.score < b.score) {
        return 1;
    }
    if (a.score > b.score) {
        return -1;
    }*/
    return b.score - a.score;
}

// initialize game state
init();
// start rendering start screen
drawStart();
// render actual game
draw();

// ***************** FPGA CONNECTION ***********************

// Pin numbers for connection with FPGA (!!JUMP STILL RANDOM!!)
const GPIORIGHT = 26;
const GPIOLEFT = 24;
const GPIOJUMP1 = 21;

// Configure GPIO's, and save them as objects for later use
const left = new Gpio(GPIOLEFT, "in", "both");
const right = new Gpio(GPIORIGHT, "in", "both");
const jump = new Gpio(GPIOJUMP1, "in", "both");

// we're going to use keyboard events to communicate when a sensor detects an input.
// they seem to be higher priority than custom events
const leftEventOn = new KeyboardEvent("keydown", { keyCode: 37, which: 37 });
const rightEventOn = new KeyboardEvent("keydown", { keyCode: 39, which: 39 });
const upEventOn = new KeyboardEvent("keydown", { keyCode: 38, which: 38 });
const leftEventOff = new KeyboardEvent("keyup", { keyCode: 37, which: 37 });
const rightEventOff = new KeyboardEvent("keyup", { keyCode: 39, which: 39 });
const upEventOff = new KeyboardEvent("keyup", { keyCode: 38, which: 38 });

// Watch GPIO pins, executed when value is changed
right.watch((err, value) => {
    if (err) {
        throw err;
    }
    if (value == 1) { // we detect the GPIO pin to be enabled
        //Notify the game the controller is going right
        document.dispatchEvent(rightEventOn);
        setTimeout(() => {
            document.dispatchEvent(rightEventOff);
        }, 250); // after 250ms we tell the game the sensor is turned off, similar to a key depress
    }
});

left.watch((err, value) => {
    if (err) {
        throw err;
    }
    if (value == 1) { // we detect the GPIO pin to be enabled
        //Notify the game the controller is going left
        document.dispatchEvent(leftEventOn);
        setTimeout(() => {
            document.dispatchEvent(leftEventOff);
        }, 250); // after 250ms we tell the game the sensor is turned off, similar to a key depress
    }
});

jump.watch((err, value) => {
    if (err) {
        throw err;
    }
    if (value == 1) { // we detect the GPIO pin to be enabled
        document.dispatchEvent(upEventOn);
         //Notify the game the controller is going up
        setTimeout(() => {
            document.dispatchEvent(upEventOff);
        }, 250); // after 250ms we tell the game the sensor is turned off, similar to a key depress
    }
});
