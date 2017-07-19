"use strict";

/**
 * HTML5 game extended from example found here:
 * https://github.com/lostdecade/simple_canvas_game
 * 
 * Please send feature requests to prophetzopu@gmail.com
 */

// Set up HTML5 canvas
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
var MAP_WIDTH = 540;
var MAP_HEIGHT = 960;
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
var widthRatio = canvas.width / MAP_WIDTH;
var heightRatio = canvas.height / MAP_HEIGHT;
ctx.scale(widthRatio, heightRatio);
document.body.appendChild(canvas);

var fps = 30;
var now;
var then;
var interval = 1000/fps;
var delta;

var screenChanged = true; // Only render the screen if it has changed

var swipeHappened = false;

var DEFAULT_SPEED = 4; // movement in pixels per second

// List of all curtains
var CURTAINS = [];

CURTAINS.push({
    difficulty : 'Very Easy',
    speed : DEFAULT_SPEED,
    image : loadImage('images/curtain_light_blue.png'),
    score : 0,
    highscore : 0
});

CURTAINS.push({
    difficulty : 'Easy',
    speed : DEFAULT_SPEED * 2,
    image : loadImage('images/curtain_blue.png'),
    score : 0,
    highscore : 0
});

CURTAINS.push({
    difficulty : 'Hard',
    speed : DEFAULT_SPEED * 5,
    image : loadImage('images/curtain_red.png'),
    score : 0,
    highscore : 0
});

CURTAINS.push({
    difficulty : 'Very Hard',
    speed : DEFAULT_SPEED * 10,
    image : loadImage('images/curtain_purple.png'),
    score : 0,
    highscore : 0
});

/* Helper Functions */

function loadImage(path)
{
    var img = new Image();
    img.ready = false;
    img.src = path;
    img.onload = function() {
        img.ready = true;
    };
    return img;
}

/* Game Objects */

var theWindow = {
    image: loadImage("images/window.png"),
    render: function()
    {
        // Draw lastLast window
        ctx.drawImage(this.image, curtain.lastLastX, curtain.lastLastY);

        // Draw last window
        ctx.drawImage(this.image, curtain.lastX, curtain.lastY);

        // Draw current window
        ctx.drawImage(this.image, curtain.x, 0);
    }
};

var curtain = {
    index: 0,   // Index of current curtain in CURTAINS map
    current: 0, // Pointer to the current curtain
    cooldownTimer: 0,
    movementAllowed: true,
    lastLastX: 0, // x location of the last curtain
    lastLastY: 0, // x location of the last curtain
    lastX: 0, // x location of the last curtain
    lastY: 0, // x location of the last curtain
    x: 0,
    y: 0,
    nextX: 0,
    nextY: 0,
    cooldown: function(cd)
    {
        // Game is effectively paused for the duration of the cooldown
        clearTimeout(this.cooldownTimer);
        this.movementAllowed = false;
        var thiz = this; // keep 'this' correct for delayed function
        thiz.cooldownTimer = setTimeout(function() { thiz.movementAllowed = true; }, typeof cd !== 'undefined' ? cd : 400);
    },
    spawn: function()
    {
         // Keep track of lastLast curtain
         this.lastLastX = this.lastX;
         //this.lastLastY = this.lastY;

         // Keep track of last curtain
         this.lastX = this.x;
         //this.lastY = this.y;

         // Place the next curtain
         //this.x = 32 + (Math.random() * (MAP_WIDTH - 64));
         this.x = this.lastX + MAP_WIDTH;
         //this.y = 32 + (Math.random() * (MAP_HEIGHT - 64));
         this.y = 0;

         screenChanged = true;
         swipeHappened = false;
    },
    render: function()
    {
        if (this.current.image.ready)
        {
            // Draw the current curtain
            ctx.drawImage(this.current.image, this.x, this.y);

            // Draw the next curtain
            ctx.drawImage(this.current.image, this.x + MAP_WIDTH, 0);
        }
    },
    next: function()
    {
        this.index += 1;
        if (this.index >= CURTAINS.length)
            this.index = 0;
        curtain.current = CURTAINS[this.index];
        reset();
    },
    previous: function previous()
    {
        this.index -= 1;
        if (this.index < 0)
            this.index = CURTAINS.length - 1;
        curtain.current = CURTAINS[this.index];
        reset();
    }
};


var info = {
    difficulty: function()
    {
        return "[Difficulty " + ": " + curtain.current.difficulty + "]";
    },
    score: function()
    {
        return curtain.current.score;
    },
    highscore: function()
    {
        return curtain.current.highscore;
    },
    spacing: "   ",
    render: function()
    {
        // Difficulty
        ctx.fillStyle = "rgb(255, 255, 255)";
        ctx.font = "30px Arial";
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        ctx.fillText(this.difficulty(), 5, MAP_HEIGHT-40);

        // Score
        ctx.fillStyle = "rgb(255, 255, 255)";
        ctx.font = "72px Arial";
        ctx.textAlign = "right";
        ctx.textBaseline = "top";
        ctx.fillText(this.score(), MAP_WIDTH-10, MAP_HEIGHT-110);

        // Highscore
        ctx.fillStyle = "rgb(255, 255, 255)";
        ctx.font = "20px Arial";
        ctx.textAlign = "right";
        ctx.textBaseline = "top";
        ctx.fillText("Highest: " + this.highscore(), MAP_WIDTH-10, MAP_HEIGHT-30);
    }
};

// Keyboard event handling
var KEYS = {
    down: {}
};

addEventListener("keydown", function(e) {
    KEYS.down[e.keyCode] = true;
});

addEventListener("keyup", function(e) {
    delete KEYS.down[e.keyCode];

    if (e.keyCode === 83) // Player pressed 's'
    {
        if (e.shiftKey === true) // Player was holding shift
            curtain.previous();
        else
            curtain.next();
    }
});

// Game logic
var reset = function()
{
    curtain.lastLastX = 0;
    curtain.lastLastY = 0;
    curtain.lastX = 0;
    curtain.lastY = 0;
    curtain.x = 0;
    curtain.y = 0;
    curtain.nextX = 0;
    curtain.nextY = 0;
    curtain.spawn();
    curtain.cooldown(1500);
};

var update = function(modifier)
{
    if (curtain.movementAllowed)
    {
        screenChanged = true;

        curtain.lastLastX -= curtain.current.speed;
        curtain.lastX -= curtain.current.speed;

        curtain.x -= curtain.current.speed;
        if (curtain.x < MAP_WIDTH * -1)
            curtain.x = MAP_WIDTH * -1;

        if (swipeHappened)
        {
            curtain.y -= MAP_HEIGHT * 0.1;
            if (curtain.y < MAP_HEIGHT * -1)
                curtain.y = MAP_HEIGHT * -1;
        }

        if (38 in KEYS.down) // Player holding up
        {
            curtain.y -= curtain.current.speed * modifier;
            if (curtain.y < MAP_HEIGHT*-1)
                curtain.y = MAP_HEIGHT*-1;
            screenChanged = true;
        }
        if (40 in KEYS.down) // Player holding down
        {
            curtain.y += curtain.current.speed * modifier;
            if (curtain.y > 0)
                curtain.y = 0;
            screenChanged = true;
        }

        // Did player lose?
        if (curtain.x <= MAP_WIDTH*-1)
        {
            curtain.current.score = 0;
            reset();
        }

        // Is curtain off screen?
        if (curtain.y <= MAP_HEIGHT*-1)
        {
            ++curtain.current.score;

            if (curtain.current.score > curtain.current.highscore)
                curtain.current.highscore = curtain.current.score;

            // was previously reset
            curtain.spawn();
        }
    }
};

var render = function()
{
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    theWindow.render(curtain.x);
    curtain.render();
    info.render();
};

var init = function()
{
    then = Date.now();
    curtain.current = CURTAINS[curtain.index];
    reset();
    main();
};

var main = function()
{
    // Frame rate limiting code extended from:
    // http://codetheory.in/controlling-the-frame-rate-with-requestanimationframe/

    // Animate next frame
    requestAnimationFrame(main);

    var now = Date.now();
    var delta = now - then;

    if (delta > interval)
    {
        then = now - (delta % interval);

        update(delta / 1000);

        if (screenChanged)
        {
            render();
            screenChanged = false;
        }
    }
};

// Detect swipes...
canvas.id = "canvas";
$(function() {
    $("#canvas").swipe( {
        tap:function(event, target) {
        },
        doubleTap:function(event, target) {
        },
        longTap:function(event, target) {
        },
        hold:function(event, target) {
            curtain.next();
        },
        swipeUp:function(event, direction, distance, duration, fingerCount) {
            // Only allow swipe up if curtain visible
            if (curtain.x < MAP_WIDTH)
                swipeHappened = true;
        },
        threshold: 100
/*
        swipeStatus:function(event, phase, direction, distance, duration, fingerCount, fingerData) {
            if (phase === "move")
            {
                if (direction === "up")
                {
                    curtain.y -= 1;
                    if (curtain.y < MAP_HEIGHT * -1)
                        curtain.y = MAP_HEIGHT * -1;
                    screenChanged = true;
                }
                else if (direction === "down")
                {
                    curtain.y += 1;
                    if (curtain.y > 0)
                        curtain.y = 0;
                    screenChanged = true;
                }
            }
        }
*/
    });
});

// Cross-browser support for requestAnimationFrame
var w = window;
w.requestAnimationFrame = w.requestAnimationFrame
                       || w.webkitRequestAnimationFrame
                       || w.msRequestAnimationFrame
                       || w.mozRequestAnimationFrame;

// Let's play this game!
window.onload = function() {
    init();
}
