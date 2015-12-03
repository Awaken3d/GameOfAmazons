/*angular.module('myApp')
  .controller('Ctrl', ['$scope', '$log','$timeout', '$rootScope',
    'gameLogic',
    function ($scope:any, $log:any, $timeout:any, $rootScope:any,
      gameLogic:any) {*/
module game {
    'use strict';
    //console.log('Translation of RULES_OF_AMAZONS is ' + $translate('RULES_OF_AMAZONS'));


    //export var gameArea = document.getElementById('gameArea');
    export var gameArea: HTMLElement;
    export var NUM = 10; // num of rows and cols
    export var draggingStartedRowCol:any = null;
    export var draggingPiece:HTMLElement = null;
    export var nextZIndex = 61;

    //additional variables
    export var typeExpected:any;
    export var board:any = undefined;
    export let isYourTurn:any;
    export let jsonState:any;
    export let turnIndex:any;
    export function init(){
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

    export function handleDragEvent(type:any, clientX:any, clientY:any) {
      // Center point in gameArea
      gameArea = document.getElementById('gameArea');
      var x = clientX - gameArea.offsetLeft;
      var y = clientY - gameArea.offsetTop;
      var moveType = typeExpected;

      // Is outside gameArea?
      if (x < 0 || y < 0 || x >= gameArea.clientWidth || y >= gameArea.clientHeight) {
        if (!draggingPiece) {
          return;
        }
          // Drag the piece where the touch is (without snapping to a square).
        var size = getSquareWidthHeight();
        setDraggingPieceTopLeft({top: y - size.height / 2, left: x - size.width / 2}, moveType);
        if (type === "touchend"){
          if (moveType === 'X') {
            draggingPiece.style.display = 'none';
          }
        }
      } else {
        // Inside gameArea
        var col = Math.floor(NUM * x / gameArea.clientWidth);
        var row = Math.floor(NUM * y / gameArea.clientHeight);
 
        if (type === "touchstart" && !draggingStartedRowCol) {
          if (board[row][col] === moveType && isYourTurn && moveType !== 'X') {
            draggingStartedRowCol = {row: row, col: col};
            draggingPiece = document.getElementById("piece"+moveType+"_"+row+"x"+col);
            draggingPiece.style['z-index'] = ++nextZIndex;
          }else if (isYourTurn && moveType === 'X') {
              draggingStartedRowCol = pawnDelta;
              draggingPiece = document.getElementById("pieceX_drag");
              setDraggingPieceTopLeft(getSquareTopLeft(row, col), moveType);
              draggingPiece.style['z-index'] = ++nextZIndex;
              draggingPiece.style.display = 'inline';
           }
        }
        if (!draggingPiece) {
          return;
        }

        if (type === "touchend") {
          var frompos = draggingStartedRowCol;
          var topos = {row: row, col: col};
          dragDone(frompos, topos);
        } else {
            setDraggingPieceTopLeft(getSquareTopLeft(row, col), moveType);
        }
      }

      if (type === "touchend" ||
          type === "touchcancel" || type === "touchleave") {
        // drag ended
        // return the piece to it's original style (then angular will take care to hide it).
        setDraggingPieceTopLeft(getSquareTopLeft(draggingStartedRowCol.row, draggingStartedRowCol.col), moveType);

        if (moveType === typeExpected && typeExpected === 'X') {
          draggingPiece.style.display = 'none';
        }
        draggingStartedRowCol = null;
        //draggingPiece.removeAttribute("style"); // trying out
        draggingPiece = null;
      }

    }
    //dragAndDropService.addDragListener("gameArea", handleDragEvent);
/*
    function isInvalidPos(topLeft) {
      var size = getSquareWidthHeight();
      var row = Math.floor(topLeft.top / size.height);
      var col = Math.floor(topLeft.left / size.width);
      return row >= 0 && row <= 9 && col >= 0 && col <= 9 && $scope.board[row][col] !== '';
    }
*/
    export function setDraggingPieceTopLeft(topLeft:any, mType:any) {
      var originalSize:any;
/*
      if (isInvalidPos(topLeft)) {
        $log.info([topLeft]);
        return;
      }
*/
      if (mType === 'X') {
        originalSize = getSquareTopLeft(0, 0);
        draggingPiece.style.left = (topLeft.left - originalSize.left) + 'px';
        draggingPiece.style.top = (topLeft.top - originalSize.top) + 'px';
      } else {
        originalSize = getSquareTopLeft(draggingStartedRowCol.row, draggingStartedRowCol.col);
        draggingPiece.style.left = (topLeft.left - originalSize.left) + 'px';
        draggingPiece.style.top = (topLeft.top - originalSize.top) + 'px';
      }
    }

    export function getSquareWidthHeight() {
      return {
        width: gameArea.clientWidth / NUM,
        height: gameArea.clientHeight / NUM
      };
    }

    export function getSquareTopLeft(row:any, col:any) {
      var size = getSquareWidthHeight();
      return {top: row * size.height, left: col * size.width};
    }

    export function dragDone(frompos:any, topos:any) {
      $rootScope.$apply(function() {
        var msg = 'Dragged piece ' + frompos.row + 'x' + frompos.col + ' to square ' +
          topos.row + 'x' + topos.col;
        //$log.info(msg);
        //$scope.msg = msg;

        if (!isYourTurn) {
          return;
        }

        try {
          if (gameLogic.horizontalMoveCheck(frompos,topos,board)||
            	gameLogic.verticalMoveCheck(frompos,topos,board)  ||
            	gameLogic.diagonalMoveCheck(frompos,topos,board)) {
                var move = gameLogic.createMove(frompos, topos, turnIndex, jsonState);
                lastSelected = {row: topos.row, col: topos.col};
                gameService.makeMove(move);
                isYourTurn = false;
                pawnDelta = topos;
                if (typeExpected === 'X') {
                  draggingPiece.style.display = 'none';
                }
              }
        } catch (e) {
        //  $log.info(['Illegal Move ', frompos, topos]);
        }
      });
    }

  export function getIntegersTill(number:any) {
      var res:any = [];
      for (var i = 0; i < number; i++) {
        res.push(i);
      }
      return res;
    }
    export let rows = getIntegersTill(NUM);
    export let cols = getIntegersTill(NUM);
    export let rowsNum = NUM;
    export let colsNum = NUM;

    //Globals to detect 2 clicks then make move
    //var pawnPosition = {row:'',col:''};
  export   var pawnDelta = {row:'',col:''};
  export   var lastSelected = {row:'', col:''};
    //var movCtr = 2;
    //var moveType = 2;

  export   function sendComputerMove() {
      gameService.makeMove(
          gameLogic.createComputerMove(jsonState,turnIndex));
    }

    export let isPawn = function(row:any,col:any,pawn:any){
    	if(board[row][col]===pawn){
    		return true;}
    };

    export let isNotPawn = function(row:any,col:any){
      if(board[row][col]==='A' ||
        board[row][col]==='B' ||
        board[row][col]==='X'){
        return false;
      }
      else {
        return true;
      }
    };

    export let isWTurn = function(){
    	if(turnIndex===0){
    	return true;
    	}
    	else{
    	return false;
    	}
    };

    export let isSelected = function(row:any,col:any){
    	if(row===lastSelected.row && col===lastSelected.col){
//     		console.log('Found true');
    		return true;
    	}
    	else{
//     		console.log('Found false');
    		return false;
    	}
    };

    export let isBTurn = function(){
    	if(turnIndex===1){
    	return true;
    	}
    	else{
    	return false;
    	}
    };


    //initialise the game using this function call to updateUI
    //updateUI({stateAfterMove: {}, turnIndexAfterMove: 0, yourPlayerIndex: -2});
  export function updateUI(params:any) {
      jsonState = angular.toJson(params.stateAfterMove, true);
      board = params.stateAfterMove.board;
      typeExpected = params.move && params.move[1] && params.move[1].set && params.move[1].set.value ? params.move[1].set.value.pawn : 'A';

      if (board === undefined) {
        board = gameLogic.getInitialBoard();
      }
      isYourTurn = params.turnIndexAfterMove >= 0 && // game is ongoing
        params.yourPlayerIndex === params.turnIndexAfterMove &&
        params.endMatchScores === null; // it's my turn
      turnIndex = params.turnIndexAfterMove;

     // Is it the computer's turn?
      if (isYourTurn &&
          params.playersInfo[params.yourPlayerIndex].playerId === '') {
        isYourTurn = false;
        // Wait 500 milliseconds until animation ends.
        $timeout(sendComputerMove, 1000);
      }
    }}



    angular.module('myApp')
    .run(function() {
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
