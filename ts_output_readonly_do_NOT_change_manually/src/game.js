/*angular.module('myApp')
  .controller('Ctrl', ['$scope', '$log','$timeout', '$rootScope',
    'gameLogic',
    function ($scope:any, $log:any, $timeout:any, $rootScope:any,
      gameLogic:any) {*/
var game;
(function (game) {
    'use strict';
    game.NUM = 10; // num of rows and cols
    game.draggingStartedRowCol = null;
    game.draggingPiece = null;
    game.nextZIndex = 61;
    game.board = undefined;
    function init() {
        resizeGameAreaService.setWidthToHeight(1);
        gameService.setGame({
            gameDeveloperEmail: "hy821@nyu.edu",
            minNumberOfPlayers: 2,
            maxNumberOfPlayers: 2,
            exampleGame: gameLogic.getExampleGame(),
            riddles: gameLogic.getRiddles(),
            isMoveOk: gameLogic.isMoveOk,
            updateUI: updateUI
        });
        dragAndDropService.addDragListener("gameArea", handleDragEvent);
    }
    game.init = init;
    function handleDragEvent(type, clientX, clientY) {
        // Center point in gameArea
        game.gameArea = document.getElementById('gameArea');
        var x = clientX - game.gameArea.offsetLeft;
        var y = clientY - game.gameArea.offsetTop;
        var moveType = game.typeExpected;
        // Is outside gameArea?
        if (x < 0 || y < 0 || x >= game.gameArea.clientWidth || y >= game.gameArea.clientHeight) {
            if (!game.draggingPiece) {
                return;
            }
            // Drag the piece where the touch is (without snapping to a square).
            var size = getSquareWidthHeight();
            setDraggingPieceTopLeft({ top: y - size.height / 2, left: x - size.width / 2 }, moveType);
            if (type === "touchend") {
                if (moveType === 'X') {
                    game.draggingPiece.style.display = 'none';
                }
            }
        }
        else {
            // Inside gameArea
            var col = Math.floor(game.NUM * x / game.gameArea.clientWidth);
            var row = Math.floor(game.NUM * y / game.gameArea.clientHeight);
            if (type === "touchstart" && !game.draggingStartedRowCol) {
                if (game.board[row][col] === moveType && game.isYourTurn && moveType !== 'X') {
                    game.draggingStartedRowCol = { row: row, col: col };
                    game.draggingPiece = document.getElementById("piece" + moveType + "_" + row + "x" + col);
                    game.draggingPiece.style['z-index'] = ++game.nextZIndex;
                }
                else if (game.isYourTurn && moveType === 'X') {
                    game.draggingStartedRowCol = game.pawnDelta;
                    game.draggingPiece = document.getElementById("pieceX_drag");
                    setDraggingPieceTopLeft(getSquareTopLeft(row, col), moveType);
                    game.draggingPiece.style['z-index'] = ++game.nextZIndex;
                    game.draggingPiece.style.display = 'inline';
                }
            }
            if (!game.draggingPiece) {
                return;
            }
            if (type === "touchend") {
                var frompos = game.draggingStartedRowCol;
                var topos = { row: row, col: col };
                dragDone(frompos, topos);
            }
            else {
                setDraggingPieceTopLeft(getSquareTopLeft(row, col), moveType);
            }
        }
        if (type === "touchend" ||
            type === "touchcancel" || type === "touchleave") {
            // drag ended
            // return the piece to it's original style (then angular will take care to hide it).
            setDraggingPieceTopLeft(getSquareTopLeft(game.draggingStartedRowCol.row, game.draggingStartedRowCol.col), moveType);
            if (moveType === game.typeExpected && game.typeExpected === 'X') {
                game.draggingPiece.style.display = 'none';
            }
            game.draggingStartedRowCol = null;
            //draggingPiece.removeAttribute("style"); // trying out
            game.draggingPiece = null;
        }
    }
    game.handleDragEvent = handleDragEvent;
    //dragAndDropService.addDragListener("gameArea", handleDragEvent);
    /*
        function isInvalidPos(topLeft) {
          var size = getSquareWidthHeight();
          var row = Math.floor(topLeft.top / size.height);
          var col = Math.floor(topLeft.left / size.width);
          return row >= 0 && row <= 9 && col >= 0 && col <= 9 && $scope.board[row][col] !== '';
        }
    */
    function setDraggingPieceTopLeft(topLeft, mType) {
        var originalSize;
        /*
              if (isInvalidPos(topLeft)) {
                $log.info([topLeft]);
                return;
              }
        */
        if (mType === 'X') {
            originalSize = getSquareTopLeft(0, 0);
            game.draggingPiece.style.left = (topLeft.left - originalSize.left) + 'px';
            game.draggingPiece.style.top = (topLeft.top - originalSize.top) + 'px';
        }
        else {
            originalSize = getSquareTopLeft(game.draggingStartedRowCol.row, game.draggingStartedRowCol.col);
            game.draggingPiece.style.left = (topLeft.left - originalSize.left) + 'px';
            game.draggingPiece.style.top = (topLeft.top - originalSize.top) + 'px';
        }
    }
    game.setDraggingPieceTopLeft = setDraggingPieceTopLeft;
    function getSquareWidthHeight() {
        return {
            width: game.gameArea.clientWidth / game.NUM,
            height: game.gameArea.clientHeight / game.NUM
        };
    }
    game.getSquareWidthHeight = getSquareWidthHeight;
    function getSquareTopLeft(row, col) {
        var size = getSquareWidthHeight();
        return { top: row * size.height, left: col * size.width };
    }
    game.getSquareTopLeft = getSquareTopLeft;
    function dragDone(frompos, topos) {
        $rootScope.$apply(function () {
            var msg = 'Dragged piece ' + frompos.row + 'x' + frompos.col + ' to square ' +
                topos.row + 'x' + topos.col;
            //$log.info(msg);
            //$scope.msg = msg;
            if (!game.isYourTurn) {
                return;
            }
            try {
                if (gameLogic.horizontalMoveCheck(frompos, topos, game.board) ||
                    gameLogic.verticalMoveCheck(frompos, topos, game.board) ||
                    gameLogic.diagonalMoveCheck(frompos, topos, game.board)) {
                    var move = gameLogic.createMove(frompos, topos, game.turnIndex, game.jsonState);
                    game.lastSelected = { row: topos.row, col: topos.col };
                    gameService.makeMove(move);
                    game.isYourTurn = false;
                    game.pawnDelta = topos;
                    if (game.typeExpected === 'X') {
                        game.draggingPiece.style.display = 'none';
                    }
                }
            }
            catch (e) {
            }
        });
    }
    game.dragDone = dragDone;
    function getIntegersTill(number) {
        var res = [];
        for (var i = 0; i < number; i++) {
            res.push(i);
        }
        return res;
    }
    game.getIntegersTill = getIntegersTill;
    game.rows = getIntegersTill(game.NUM);
    game.cols = getIntegersTill(game.NUM);
    game.rowsNum = game.NUM;
    game.colsNum = game.NUM;
    //Globals to detect 2 clicks then make move
    //var pawnPosition = {row:'',col:''};
    game.pawnDelta = { row: '', col: '' };
    game.lastSelected = { row: '', col: '' };
    //var movCtr = 2;
    //var moveType = 2;
    function sendComputerMove() {
        gameService.makeMove(gameLogic.createComputerMove(game.jsonState, game.turnIndex));
    }
    game.sendComputerMove = sendComputerMove;
    game.isPawn = function (row, col, pawn) {
        if (game.board[row][col] === pawn) {
            return true;
        }
    };
    game.isNotPawn = function (row, col) {
        if (game.board[row][col] === 'A' ||
            game.board[row][col] === 'B' ||
            game.board[row][col] === 'X') {
            return false;
        }
        else {
            return true;
        }
    };
    game.isWTurn = function () {
        if (game.turnIndex === 0) {
            return true;
        }
        else {
            return false;
        }
    };
    game.isSelected = function (row, col) {
        if (row === game.lastSelected.row && col === game.lastSelected.col) {
            //     		console.log('Found true');
            return true;
        }
        else {
            //     		console.log('Found false');
            return false;
        }
    };
    game.isBTurn = function () {
        if (game.turnIndex === 1) {
            return true;
        }
        else {
            return false;
        }
    };
    //initialise the game using this function call to updateUI
    //updateUI({stateAfterMove: {}, turnIndexAfterMove: 0, yourPlayerIndex: -2});
    function updateUI(params) {
        game.jsonState = angular.toJson(params.stateAfterMove, true);
        game.board = params.stateAfterMove.board;
        game.typeExpected = params.move && params.move[1] && params.move[1].set && params.move[1].set.value ? params.move[1].set.value.pawn : 'A';
        if (game.board === undefined) {
            game.board = gameLogic.getInitialBoard();
        }
        game.isYourTurn = params.turnIndexAfterMove >= 0 &&
            params.yourPlayerIndex === params.turnIndexAfterMove &&
            params.endMatchScores === null; // it's my turn
        game.turnIndex = params.turnIndexAfterMove;
        // Is it the computer's turn?
        if (game.isYourTurn &&
            params.playersInfo[params.yourPlayerIndex].playerId === '') {
            game.isYourTurn = false;
            // Wait 500 milliseconds until animation ends.
            $timeout(sendComputerMove, 1000);
        }
    }
    game.updateUI = updateUI;
})(game || (game = {}));
angular.module('myApp')
    .run(function () {
    $rootScope['game'] = game;
    translate.setLanguage('en', {
        AMAZONS_GAME: "Game of the Amazons",
        RULES_OF_AMAZONS: "Rules of Amazons",
        RULES_SLIDE0: "Each player has four amazons, and a supply of arrows. White moves first, and the players alternate moves thereafter.",
        RULES_SLIDE1: "1. Move one amazon one or more empty squares in a straight line (orthogonally or diagonally).",
        RULES_SLIDE2: "2. The amazon shoots an arrow from its landing square to another square, using another queenlike move.",
        RULES_SLIDE3: "An arrow and an amazon cannot cross or enter a square where another arrow or an amazon of either color occupies.",
        RULES_SLIDE4: "When you play, try to block the other player. The last player to be able to make a move wins.",
        CLOSE: "Start Game"
    });
    game.init();
});
