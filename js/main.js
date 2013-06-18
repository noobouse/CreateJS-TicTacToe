// globals
var $window = $(window);
var $doc = $("document");
var $container = $("#container");
var $canvas = $("#canvas");
var canvasContext = document.getElementById("canvas").getContext("2d");
var $bg = $("#bg");
var $loading = $("#loading");
var canvas, stage, lines, squares = [], defaultX, defaultO, thisX, thisY, pieces, p1Text, p2Text;
var endGameMenu, endGameBack, endGameAnotherBtn, endGameNewBtn, endGameSwitchBtn;
var numPlayers, numPlayersMenu, numPlayersBack, numPlayersOneBtn, numPlayersTwoBtn;
var numGames = theWinner = player1Score = player2Score = 0;
var player1ScoreText, player2ScoreText;

var board = [0, 0, 0, 0, 0, 0, 0 ,0, 0];

var canvasH = 720;
var canvasW = 480;

var currentPlayer, continueGame;

var manifest = [
    {src: "images/lines.png", id: "lines"},
    {src: "images/square.png", id: "square"},
    {src: "images/x.png", id: "x"},
    {src: "images/o.png", id: "o"},
    {src: "images/endGameBack.png", id: "endGameBack"},
    {src: "images/endGameAnotherBtn.png", id: "endGameAnotherBtn"},
    {src: "images/endGameNewBtn.png", id: "endGameNewBtn"},
    {src: "images/endGameSwitchBtn.png", id: "endGameSwitchBtn"},
    {src: "sounds/click1.mp3 | sounds/click1.ogg", id: "click"},
    {src: "images/numPlayersBack.png", id: "numPlayersBack"},
    {src: "images/numPlayersOneBtn.png", id: "numPlayersOneBtn"},
    {src: "images/numPlayersTwoBtn.png", id: "numPlayersTwoBtn"},
];

var preload, totalLoaded;

Load();
function Load() {
    
    canvas = document.getElementById("canvas");
    stage = new createjs.Stage(canvas);
    stage.enableMouseOver(10);
    stage.regX = canvasW / 2;
    stage.regY = canvasH / 2;
    stage.x = canvasW / 2;
    stage.y = canvasH / 2;
    createjs.Touch.enable(stage);
    createjs.Ticker.setFPS(30);
    createjs.Ticker.useRAF = true;
    createjs.Ticker.addListener(window);
    
    totalLoaded = 0;
    
    preload = new createjs.PreloadJS(false);
    preload.onProgress = HandleProgress;
    preload.onComplete = HandleComplete;
    preload.onFileLoad = HandleFileLoad;
    preload.installPlugin(createjs.SoundJS);
    preload.loadManifest(manifest);
    
    function Stop() { if (preload !== null) { preload.close(); } }
    
    function HandleProgress(event) { $loading.height(event.loaded * canvasH); }
    
    function HandleFileLoad(event) {
        if (event.type = "image") {
            var img = new Image();
            img.src = event.src;
            img.onload = HandleLoadComplete;
        } else if (event.type = "sound") {
            var audio = new Audio();
            audio.src = event.src;
            audio.onload = HandleLoadComplete;
        }
    }
    
    function HandleLoadComplete(event) {
        totalLoaded++;
        if (totalLoaded === manifest.length) {
//            console.log("Load Complete!");
        } else {
//            console.log(totalLoaded + "/" + manifest.length + " loaded");
        }
    }
    
    function HandleComplete(event) {
        $loading.fadeOut();
        $canvas.fadeIn();
        // slight delay on Init() due to Android Jelly Bean bug in canvas
        // the bug is that the first frame or two of the canvas ghosts onto the following frames
        var delayInit = setTimeout(function () {
            Init();
        }, 500);
    }

}

function Init() {
    
    // this will hold the game pieces as they are placed
    // allows for easy removal for game reset
    pieces = new createjs.Container();
    stage.addChild(pieces);
    
    currentPlayer = 1;
    continueGame = true;
    
    // as pieces are placed they are cloned from these two
    defaultX = new createjs.Bitmap("images/x.png");
    defaultX.regX = defaultX.image.width / 2;
    defaultX.regY = defaultX.image.height / 2;
    defaultX.x = 50;
    defaultX.y = canvasH - 50;
    defaultX.scaleX = .5;
    defaultX.scaleY = .5;
    stage.addChild(defaultX);
    
    defaultO = new createjs.Bitmap("images/o.png");
    defaultO.regX = defaultO.image.width / 2;
    defaultO.regY = defaultO.image.height / 2;
    defaultO.x = canvasW - 50;
    defaultO.y = 50;
    defaultO.scaleX = .5;
    defaultO.scaleY = .5;
    stage.addChild(defaultO);
    
	p1Text = new createjs.Text("Your turn", "30px droid", "#FFF");
    p1Text.x = canvasW / 2;
    p1Text.y = 600;
    p1Text.textAlign = "center";
    p1Text.lineWidth = canvasW;
    stage.addChild(p1Text);
    
    player1ScoreText = new createjs.Text("Score: " + player1Score, "30px droid", "#FFF");
    player1ScoreText.x = 100;
    player1ScoreText.y = canvasH - 60;
    stage.addChild(player1ScoreText);
    
    p2Text = new createjs.Text("Please wait", "30px droid", "#FFF");
    p2Text.x = canvasW / 2;
    p2Text.y = 120;
    p2Text.textAlign = "center";
    p2Text.lineWidth = canvasW;
    p2Text.rotation = 180;
    stage.addChild(p2Text);
    
    player2ScoreText = new createjs.Text("Score: " + player2Score, "30px droid", "#FFF");
    player2ScoreText.x = canvasW - 100;
    player2ScoreText.y = 60;
    player2ScoreText.rotation = 180;
    stage.addChild(player2ScoreText);
    
    lines = new createjs.Bitmap("images/lines.png");
    lines.regX = lines.image.width / 2;
    lines.regY = lines.image.height / 2;
    lines.x = canvasW / 2;
    lines.y = canvasH / 2;
    lines.alpha = .5;
    stage.addChild(lines);
    
    // places the squares within each potential piece location
    // squares have touch events for player moves
    // squares also provide x,y locations for pieces
    // they are visible for design purposes, could be hidden if desired
    for (var i = 0; i < 9; i++) {
        
        WhereSquare(i);
        
        squares[i] = new createjs.Bitmap("images/square.png");
        squares[i].regX = squares[i].image.width / 2;
        squares[i].regY = squares[i].image.height / 2;
        squares[i].x = thisX;
        squares[i].y = thisY;
        squares[i].alpha = .05;
        squares[i].name = i;
        stage.addChild(squares[i]);
        
        squares[i].onPress = HandleSquareClick;
        squares[i].onMouseOver = function() {
            this.alpha = .1;
        }
        squares[i].onMouseOut = function() {
            this.alpha = .05;
        }
                
    }
        
    function WhereSquare(i) {
        switch (i) {
            case 0: thisX = 85; thisY = 205; break;
            case 1: thisX = 240; thisY = 205; break;
            case 2: thisX = 395; thisY = 205; break;
            case 3: thisX = 85; thisY = 360; break;
            case 4: thisX = 240; thisY = 360; break;
            case 5: thisX = 395; thisY = 360; break;
            case 6: thisX = 85; thisY = 515; break;
            case 7: thisX = 240; thisY = 515; break;
            case 8: thisX = 395; thisY = 515; break;                
        } 
    }
    
    // show this at beginning to set num players
    numPlayersMenu = new createjs.Container();
    numPlayersMenu.x = -480;
    numPlayersMenu.y = 0;
    stage.addChild(numPlayersMenu);
    
    numPlayersBack = new createjs.Bitmap("images/numPlayersBack.png");
    numPlayersBack.regX = 0;
    numPlayersBack.regY = 0;
    numPlayersBack.x = 0;
    numPlayersBack.y = 0;
    numPlayersBack.alpha = .8;
    numPlayersMenu.addChild(numPlayersBack);
    
    numPlayersOneBtn = new createjs.Bitmap("images/numPlayersOneBtn.png");
    numPlayersOneBtn.regX = numPlayersOneBtn.image.width / 2;
    numPlayersOneBtn.regY = numPlayersOneBtn.image.height / 2;
    numPlayersOneBtn.x = canvasW / 2;
    numPlayersOneBtn.y = (canvasH / 2) - 150;
    numPlayersOneBtn.onPress = function() {
        NumPlayersChosen(1);
    };
    numPlayersMenu.addChild(numPlayersOneBtn);
    
    numPlayersTwoBtn = new createjs.Bitmap("images/numPlayersTwoBtn.png");
    numPlayersTwoBtn.regX = numPlayersTwoBtn.image.width / 2;
    numPlayersTwoBtn.regY = numPlayersTwoBtn.image.height / 2;
    numPlayersTwoBtn.x = canvasW / 2;
    numPlayersTwoBtn.y = canvasH / 2;
    numPlayersTwoBtn.onPress = function() {
        NumPlayersChosen(2);
    };
    numPlayersMenu.addChild(numPlayersTwoBtn);
    
    // show this after win or tie
    endGameMenu = new createjs.Container();
    endGameMenu.x = -480;
    endGameMenu.y = 0;
    stage.addChild(endGameMenu);
    
    endGameBack = new createjs.Bitmap("images/endGameBack.png");
    endGameBack.regX = 0;
    endGameBack.regY = 0;
    endGameBack.x = 0;
    endGameBack.y = 0;
    endGameBack.alpha = .8;
    endGameMenu.addChild(endGameBack);
    
    endGameAnotherBtn = new createjs.Bitmap("images/endGameAnotherBtn.png");
    endGameAnotherBtn.regX = endGameAnotherBtn.image.width / 2;
    endGameAnotherBtn.regY = endGameAnotherBtn.image.height / 2;
    endGameAnotherBtn.x = canvasW / 2;
    endGameAnotherBtn.y = (canvasH / 2) - 150;
    endGameAnotherBtn.onPress = AnotherGame;
    endGameMenu.addChild(endGameAnotherBtn);
    
    endGameNewBtn = new createjs.Bitmap("images/endGameNewBtn.png");
    endGameNewBtn.regX = endGameNewBtn.image.width / 2;
    endGameNewBtn.regY = endGameNewBtn.image.height / 2;
    endGameNewBtn.x = canvasW / 2;
    endGameNewBtn.y = canvasH / 2;
    endGameNewBtn.onPress = ResetGame;
    endGameMenu.addChild(endGameNewBtn);
    
    endGameSwitchBtn = new createjs.Bitmap("images/endGameSwitchBtn.png");
    endGameSwitchBtn.regX = endGameSwitchBtn.image.width / 2;
    endGameSwitchBtn.regY = endGameSwitchBtn.image.height / 2;
    endGameSwitchBtn.x = canvasW / 2;
    endGameSwitchBtn.y = (canvasH / 2) + 150;
    endGameSwitchBtn.onPress = SwitchSides;
    endGameMenu.addChild(endGameSwitchBtn);
    
    NewGame();
    
}

function HandleSquareClick(event) {
    var tween;
    if (currentPlayer === 1) {
        PlayerOneMove(event);
    } else {
        PlayerTwoMove(event);
    }
    event.target.visible = false;
}
    
function PlayerOneMove(event) {
    currentPlayer = 2;
    p1Text.text = "Please wait";
    p2Text.text = "Your turn";
    var x = defaultX.clone();
    x.x = event.target.x;
    x.y = event.target.y;
    pieces.addChild(x);
    tween = createjs.Tween.get(x, {loop: false}).to({scaleX: 1, scaleY: 1}, 500, createjs.Ease.backOut);
    createjs.SoundJS.play("click");
    board[parseInt(event.target.name)] = (currentPlayer === 1) ? 2 : 1;
    CheckTheBoard();
}
function PlayerTwoMove(event) {
    currentPlayer = 1;
    p1Text.text = "Your turn";
    p2Text.text = "Please wait";
    var o = defaultO.clone();
    o.x = event.target.x;
    o.y = event.target.y;
    pieces.addChild(o);
    tween = createjs.Tween.get(o, {loop: false}).to({scaleX: 1, scaleY: 1}, 500, createjs.Ease.backOut);
    createjs.SoundJS.play("click");
    board[parseInt(event.target.name)] = (currentPlayer === 1) ? 2 : 1;
    CheckTheBoard();
}
function PlayerTwoAutoMove() {
    currentPlayer = 1;
    p1Text.text = "Your turn";
    p2Text.text = "Please wait";
    var o = defaultO.clone();
    var move = GetMove();
    o.x = squares[move].x;
    o.y = squares[move].y;
    squares[move].visible = false;
    pieces.addChild(o);
    tween = createjs.Tween.get(o, {loop: false}).to({scaleX: 1, scaleY: 1}, 500, createjs.Ease.backOut);
    createjs.SoundJS.play("click");
    board[move] = (currentPlayer === 1) ? 2 : 1;
    CheckTheBoard();
}

function GetMove() {
    // look for moves to block
    // I was going to do checks for winning moves but AI never goes first
    // therefore blocking works nicely enough and AI can sometimes win if player is sloppy
    // plus AI sometimes makes mistakes which makes things more fun
    var choice = false;
    for (var i = 0; i < board.length; i++) {
        switch (i) {
            case 0: choice = CheckCornersForBlock(i, 1, 2, 3, 6, 4, 8); break;
            case 1: choice = CheckSidesForBlock(i, 0, 2, 4, 7); break;
            case 2: choice = CheckCornersForBlock(i, 1, 0, 5, 8, 4, 6); break;
            case 3: choice = CheckSidesForBlock(i, 0, 6, 4, 5); break;
            case 5: choice = CheckSidesForBlock(i, 2, 8, 4, 3); break;
            case 6: choice = CheckCornersForBlock(i, 3, 0, 7, 8, 4, 2); break;
            case 7: choice = CheckSidesForBlock(i, 6, 8, 4, 1); break;
            case 8: choice = CheckCornersForBlock(i, 5, 2, 7, 6, 4, 0); break;
        }
        if (choice) { break; };
        if (i === board.length - 1) { choice = RandomMove(); };
    }
    return choice;
    
    function CheckCornersForBlock(input, a, b, c, d, e, f) {
        if (board[input] === 1) {
            if (board[a] === 1 && board[b] === 0) { return b;
                } else if (board[b] === 1 && board[a] === 0) { return a;
                } else if (board[c] === 1 && board[d] === 0) { return d;
                } else if (board[d] === 1 && board[c] === 0) { return c;
                } else if (board[e] === 1 && board[f] === 0) { return f;
                } else if (board[f] === 1 && board[e] === 0) { return e;
                } else { return false;
            }
        }
    }
    function CheckSidesForBlock(input, a, b, c, d) {
        if (board[input] === 1) {
            if (board[a] ===1 && board[b] === 0) { return b;
                } else if (board[b] === 1 && board[a] === 0) { return a;
                } else if (board[c] === 1 && board[d] === 0) { return d;
                } else if (board[d] === 1 && board[c] === 0) { return c;
                } else { return false;
            }
        }
    }
    function RandomMove() {
        var tempArray = [];
        for (var i = 0; i < board.length; i++) { if (board[i] === 0) { tempArray.push(i); } }
        return tempArray[Math.floor(Math.random() * tempArray.length)];
    }
}

function CheckTheBoard() {
    if (board[0] !== 0 && board[0] === board[1] && board[1] === board[2]) {
        Winner(0, 1, 2);
    } else if (board[3] !== 0 && board[3] === board[4] && board[4] === board[5]) {
        Winner(3, 4, 5);
    } else if (board[6] !== 0 && board[6] === board[7] && board[7] === board[8]) {
        Winner(6, 7, 8);
    } else if (board[0] !== 0 && board[0] === board[3] && board[3] === board[6]) {
        Winner(0, 3, 6);
    } else if (board[1] !== 0 && board[1] === board[4] && board[4] === board[7]) {
        Winner(1, 4, 7);
    } else if (board[2] !== 0 && board[2] === board[5] && board[5] === board[8]) {
        Winner(2, 5, 8);
    } else if (board[0] !== 0 && board[0] === board[4] && board[4] === board[8]) {
        Winner(0, 4, 8);
    } else if (board[2] !== 0 && board[2] === board[4] && board[4] === board[6]) {
        Winner(2, 4, 6);
    } else {
        CheckForTie();
    }
}

function Winner(a, b, c) {
    if (currentPlayer === 1) {
        theWinner = 2;
        p1Text.text = "You lose";
        p2Text.text = "You win";
//        console.log("O winner" + " : " + a + "/" + b + "/" + c);
    } else {
        theWinner = 1;
        p1Text.text = "You win";
        p2Text.text = "You lose";
//        console.log("X winner" + " : " + a + "/" + b + "/" + c);
    }
    EndGame();
}

function CheckForTie() {
    var count = 0;
    for (var i = 0; i < board.length; i++) {
        if (board[i] === 0) {
            count++;
        }
    }
    if (count === 0) {
//        console.log("tie");
        p1Text.text = "Tie";
        p2Text.text = "Tie";
        EndGame();
    } else {
        if (numPlayers === 1 && currentPlayer === 2) {
            setTimeout(PlayerTwoAutoMove, 500);
        }
    }
}

function EndGame() {
    numGames++;
    if (numPlayers === 1) {
        endGameSwitchBtn.visible = false;
    }
    var tween = createjs.Tween.get(endGameMenu, {loop: false}).wait(500).to({x: 0}, 500, createjs.Ease.backOut);
    for (var i = 0; i < squares.length; i++) { squares[i].onPress = null; }
    if (theWinner === 1) {
        player1Score++;
    } else if (theWinner === 2) {
        player2Score++;
    }
    theWinner = 0;
    player1ScoreText.text = "Score: " + player1Score;
    player2ScoreText.text = "Score: " + player2Score;
//    console.log("games: " + numGames + " P1: " + player1Score + " P2: " + player2Score);
}

function NumPlayersChosen(num) {
    if (num === 1) {
        numPlayers = 1;
//        console.log("one player");
    } else if (num === 2) {
        numPlayers = 2;
//        console.log("two players");
    }
    var tween = createjs.Tween.get(numPlayersMenu, {loop: false}).to({x: -480}, 500, createjs.Ease.backOut).call(RestoreSquares);
}

function AnotherGame() {
    currentPlayer = 1;
    p1Text.text = "Your turn";
    p2Text.text = "Please wait";
    endGameSwitchBtn.visible = true;
    
    pieces.removeAllChildren();
    
    for (var i = 0; i < squares.length; i++) {
        if (!squares[i].isVisible()) {
            squares[i].visible = true;
        }
    }
    
    board = [0, 0, 0, 0, 0, 0, 0 ,0, 0];
    
    var tween = createjs.Tween.get(endGameMenu, {loop: false}).to({x: -480}, 500, createjs.Ease.backOut).call(RestoreSquares);
}

function ResetGame() {
    player1Score = player2Score = 0;
    player1ScoreText.text = "Score: " + player1Score;
    player2ScoreText.text = "Score: " + player2Score;
    endGameSwitchBtn.visible = true;
    AnotherGame();
}

function NewGame() {
    player1Score = player2Score = 0;
    player1ScoreText.text = "Score: " + player1Score;
    player2ScoreText.text = "Score: " + player2Score;
    endGameSwitchBtn.visible = true;
    for (var i = 0; i < squares.length; i++) {
        squares[i].onPress = null;
    }
    
    var tween = createjs.Tween.get(numPlayersMenu, {loop: false}).to({x: 0}, 500, createjs.Ease.backOut);
}

function SwitchSides() {
    // just rotate entire stage around
    var tween;
    if (stage.rotation === 0) {
        tween = createjs.Tween.get(stage, {loop: false}).to({rotation: 180}, 1000, createjs.Ease.backOut);
    } else {
        tween = createjs.Tween.get(stage, {loop: false}).to({rotation: 0}, 1000, createjs.Ease.backOut);
    }
    AnotherGame();
}

function RestoreSquares() {
    for (var i = 0; i < squares.length; i++) {
        squares[i].onPress = HandleSquareClick;
    }
}

function tick() { stage.update(); }
                
$(window).on("resize", resize);
resize();
function resize() {
    var windowWidth = window.innerWidth;
    var windowHeight = window.innerHeight;
    var scaleToFitX = windowWidth / canvasW;
    var scaleToFitY = windowHeight / canvasH;
    
    var currentScreenRatio = windowWidth / windowHeight;
    var optimalRatio = Math.min(scaleToFitX, scaleToFitY);
    
    if (currentScreenRatio >= 1.77 && currentScreenRatio <= 1.79) {
        $container.css("width", windowWidth);
        $container.css("height", windowHeight);
    } else {
        $container.css("width", canvasW * optimalRatio);
        $container.css("height", canvasH * optimalRatio);
    }
}