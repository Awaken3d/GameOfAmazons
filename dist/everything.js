//angular.module('myApp', ['ngTouch', 'ui.bootstrap', 'gameServices']).factory('gameLogic', function () {
//  'use strict';
var gameLogic;
(function (gameLogic) {
    function isEqual(object1, object2) {
        return angular.equals(object1, object2);
    }
    gameLogic.isEqual = isEqual;
    function copyObject(object) {
        return angular.copy(object);
    }
    gameLogic.copyObject = copyObject;
    function getInitialBoard() {
        var i, j, board = [];
        for (i = 0; i < 10; i += 1) {
            board[i] = [];
            for (j = 0; j < 10; j += 1) {
                board[i][j] = '';
            }
        }
        board[0][3] = 'A';
        board[0][6] = 'A';
        board[3][0] = 'A';
        board[3][9] = 'A';
        board[6][0] = 'B';
        board[6][9] = 'B';
        board[9][3] = 'B';
        board[9][6] = 'B';
        return board;
    }
    gameLogic.getInitialBoard = getInitialBoard;
    function init() {
        var board = getInitialBoard();
        return { 'turnInfo': { ctr: 2, pawn: 'A' }, 'pawnDelta': { row: '', col: '' }, 'board': board };
    }
    gameLogic.init = init;
    //function to check if the pawn at i,j can make valid move and return 1 if true else 0
    function canMove(i, j, board) {
        var loop = { rowFrom: 0, rowTo: 0, colFrom: 0, colTo: 0 }, x, y;
        if (i === 0 && j === 0) {
            loop = { rowFrom: 0, rowTo: 1, colFrom: 0, colTo: 1 };
        }
        else if (i === 0 && j === 9) {
            loop = { rowFrom: 0, rowTo: 1, colFrom: 8, colTo: 9 };
        }
        else if (i === 9 && j === 0) {
            loop = { rowFrom: 8, rowTo: 9, colFrom: 0, colTo: 1 };
        }
        else if (i === 9 && j === 9) {
            loop = { rowFrom: 8, rowTo: 9, colFrom: 8, colTo: 9 };
        }
        else if (i === 0 && j > 0 && j < 9) {
            loop = { rowFrom: 0, rowTo: 1, colFrom: j - 1, colTo: j + 1 };
        }
        else if (i > 0 && i < 9 && j === 0) {
            loop = { rowFrom: i - 1, rowTo: i + 1, colFrom: 0, colTo: 1 };
        }
        else if (i === 9 && j > 0 && j < 9) {
            loop = { rowFrom: 8, rowTo: 9, colFrom: j - 1, colTo: j + 1 };
        }
        else if (i > 0 && i < 9 && j === 9) {
            loop = { rowFrom: i - 1, rowTo: i + 1, colFrom: 8, colTo: 9 };
        }
        else {
            loop = { rowFrom: i - 1, rowTo: i + 1, colFrom: j - 1, colTo: j + 1 };
        }
        for (x = loop.rowFrom; x <= loop.rowTo; x += 1) {
            for (y = loop.colFrom; y <= loop.colTo; y += 1) {
                if (board[x][y] === '') {
                    return 1;
                }
            }
        }
        return 0;
    }
    gameLogic.canMove = canMove;
    function getWinner(board, turnIndex) {
        var Actr = 0, Bctr = 0, i, j;
        for (i = 0; i < 10; i += 1) {
            for (j = 0; j < 10; j += 1) {
                if (board[i][j] === 'A') {
                    Actr += canMove(i, j, board);
                }
                else if (board[i][j] === 'B') {
                    Bctr += canMove(i, j, board);
                }
            }
        }
        if (turnIndex === 'A' && Bctr === 0) {
            return 'A';
        }
        if (turnIndex === 'B' && Actr === 0) {
            return 'B';
        }
        return '';
    }
    gameLogic.getWinner = getWinner;
    function createMove(pawnPosition, pawnDelta, turnIndexBeforeMove, stateBeforeMove) {
        if (stateBeforeMove === "{}") {
            stateBeforeMove = init();
        }
        else {
            var temp = angular.fromJson(stateBeforeMove);
            stateBeforeMove = temp;
        }
        if (turnIndexBeforeMove === 0) {
            turnIndexBeforeMove = { turnIndex: 0 };
        }
        if (turnIndexBeforeMove === 1) {
            turnIndexBeforeMove = { turnIndex: 1 };
        }
        var board = stateBeforeMove.board, turnInfo = stateBeforeMove.turnInfo, newTurn = turnIndexBeforeMove, //copy value of current turn
        newTurnInfo = turnInfo, pp = pawnPosition, pd = pawnDelta, winner, result;
        var boardAfterMove = copyObject(board);
        if (board[pawnDelta.row][pawnDelta.col] !== '') {
            throw new Error("pawn must land in empty position");
        }
        if (turnInfo.ctr === 2) {
            if (board[pawnPosition.row][pawnPosition.col] !== turnInfo.pawn) {
                throw new Error("pawn has to exist at position");
            }
            else {
                boardAfterMove[pawnPosition.row][pawnPosition.col] = '';
            }
        }
        if (turnInfo.ctr === 1) {
            if (pawnPosition.row === stateBeforeMove.pawnDelta.row &&
                pawnPosition.col === stateBeforeMove.pawnDelta.col) {
                if ((turnIndexBeforeMove.turnIndex === 0 &&
                    board[pawnPosition.row][pawnPosition.col] !== 'A') ||
                    (turnIndexBeforeMove.turnIndex === 1 &&
                        board[pawnPosition.row][pawnPosition.col] !== 'B')) {
                    throw new Error("player has to shoot arrow from the same place");
                }
            }
            else {
                throw new Error("Wrong position for shooting arrow");
            }
        }
        boardAfterMove[pawnDelta.row][pawnDelta.col] = turnInfo.pawn; //pawnName can be X,A or B
        if (turnInfo.ctr === 1) {
            winner = getWinner(boardAfterMove, boardAfterMove[pawnPosition.row][pawnPosition.col]);
            if (winner === '') {
                if (turnIndexBeforeMove.turnIndex === 0) {
                    newTurn.turnIndex = 1;
                    newTurnInfo.ctr = 2;
                    newTurnInfo.pawn = 'B';
                }
                else if (turnIndexBeforeMove.turnIndex === 1) {
                    newTurn.turnIndex = 0;
                    newTurnInfo.ctr = 2;
                    newTurnInfo.pawn = 'A';
                }
            }
            else {
                result = { endMatch: { endMatchScores: (winner === 'A' ? [1, 0] : (winner === 'B' ? [0, 1] : [0, 0])) } };
                newTurnInfo = { ctr: '', pawn: '' };
                var winnerstring = (winner === 'A' ? 'Game Over! White player wins' : 'Game over! Black Player wins');
                window.alert(winnerstring);
                return [result,
                    { set: { key: 'turnInfo', value: newTurnInfo } },
                    { set: { key: 'pawnPosition', value: { row: pp.row, col: pp.col } } },
                    { set: { key: 'pawnDelta', value: { row: pd.row, col: pd.col } } },
                    { set: { key: 'board', value: boardAfterMove } }];
            }
        }
        else {
            newTurnInfo.ctr = 1;
            newTurnInfo.pawn = 'X'; //ctr was 2 so make it 1 and change pawn name,player remains same
        }
        return [{ setTurn: newTurn },
            { set: { key: 'turnInfo', value: newTurnInfo } },
            { set: { key: 'pawnPosition', value: { row: pp.row, col: pp.col } } },
            { set: { key: 'pawnDelta', value: { row: pd.row, col: pd.col } } },
            { set: { key: 'board', value: boardAfterMove } }];
    }
    gameLogic.createMove = createMove;
    function horizontalMoveCheck(pos1, pos2, board) {
        var i, greaterpos, lesserpos;
        if (Math.abs(pos1.row - pos2.row) === 0) {
            if (pos2.col > pos1.col) {
                greaterpos = pos2;
                lesserpos = pos1;
                for (i = lesserpos.col + 1; i <= greaterpos.col; i += 1) {
                    if (board[greaterpos.row][i] !== '') {
                        return false;
                    }
                }
            }
            else {
                greaterpos = pos1;
                lesserpos = pos2;
                for (i = greaterpos.col - 1; i >= lesserpos.col; i -= 1) {
                    if (board[greaterpos.row][i] !== '') {
                        return false;
                    }
                }
            }
        }
        else {
            return false;
        }
        return true;
    }
    gameLogic.horizontalMoveCheck = horizontalMoveCheck; //check to see if move is horizontal, and if all squares between current
    //position and new position are unoccupied
    function verticalMoveCheck(pos1, pos2, board) {
        var greaterpos, lesserpos, i;
        if (Math.abs(pos1.col - pos2.col) === 0) {
            if (pos2.row > pos1.row) {
                greaterpos = pos2;
                lesserpos = pos1;
                for (i = lesserpos.row + 1; i <= greaterpos.row; i += 1) {
                    if (board[i][greaterpos.col] !== '') {
                        return false;
                    }
                }
            }
            else {
                greaterpos = pos1;
                lesserpos = pos2;
                for (i = greaterpos.row - 1; i >= lesserpos.row; i -= 1) {
                    if (board[i][greaterpos.col] !== '') {
                        return false;
                    }
                }
            }
        }
        else {
            return false;
        }
        return true;
    }
    gameLogic.verticalMoveCheck = verticalMoveCheck;
    function diagonalMoveCheck(pos1, pos2, board) {
        var greaterpos, lesserpos, i, j;
        if (Math.abs(pos1.row - pos2.row) === Math.abs(pos1.col - pos2.col)) {
            greaterpos = pos2;
            lesserpos = pos1;
            if (pos2.col > pos1.col && pos2.row < pos1.row) {
                i = lesserpos.row - 1;
                j = lesserpos.col + 1;
                while (i >= greaterpos.row && j <= greaterpos.col) {
                    if (board[i][j] !== '') {
                        return false;
                    }
                    i -= 1;
                    j += 1;
                }
            }
            else if (pos2.col > pos1.col && pos2.row > pos1.row) {
                i = lesserpos.row + 1;
                j = lesserpos.col + 1;
                while (i <= greaterpos.row && j <= greaterpos.col) {
                    if (board[i][j] !== '') {
                        return false;
                    }
                    i += 1;
                    j += 1;
                }
            }
            else if (pos2.col < pos1.col && pos2.row > pos1.row) {
                i = lesserpos.row + 1;
                j = lesserpos.col - 1;
                while (i <= greaterpos.row && j >= greaterpos.col) {
                    if (board[i][j] !== '') {
                        return false;
                    }
                    i += 1;
                    j -= 1;
                }
            }
            else if (pos2.col < pos1.col && pos2.row < pos1.row) {
                i = lesserpos.row - 1;
                j = lesserpos.col - 1;
                while (i >= greaterpos.row && j >= greaterpos.col) {
                    if (board[i][j] !== '') {
                        return false;
                    }
                    i -= 1;
                    j -= 1;
                }
            }
        }
        else {
            return false;
        }
        return true;
    }
    gameLogic.diagonalMoveCheck = diagonalMoveCheck;
    function getExampleGame() {
        var game = [
            {
                turnIndexBeforeMove: { turnIndex: 0 },
                stateBeforeMove: { turnInfo: { ctr: 2, pawn: 'A' }, pawnDelta: { row: '', col: '' },
                    board: [['', '', '', 'A', '', '', 'A', '', '', ''],
                        ['', '', '', '', '', '', '', '', '', ''],
                        ['', '', '', '', '', '', '', '', '', ''],
                        ['A', '', '', '', '', '', '', '', '', 'A'],
                        ['', '', '', '', '', '', '', '', '', ''],
                        ['', '', '', '', '', '', '', '', '', ''],
                        ['B', '', '', '', '', '', '', '', '', 'B'],
                        ['', '', '', '', '', '', '', '', '', ''],
                        ['', '', '', '', '', '', '', '', '', ''],
                        ['', '', '', 'B', '', '', 'B', '', '', '']] },
                move: [{ setTurn: { turnIndex: 0 } },
                    { set: { key: 'turnInfo', value: { ctr: 1, pawn: 'X' } } },
                    { set: { key: 'pawnPosition', value: { row: 0, col: 3 } } },
                    { set: { key: 'pawnDelta', value: { row: 0, col: 4 } } },
                    { set: { key: 'board', value: [['', '', '', '', 'A', '', 'A', '', '', ''],
                                ['', '', '', '', '', '', '', '', '', ''],
                                ['', '', '', '', '', '', '', '', '', ''],
                                ['A', '', '', '', '', '', '', '', '', 'A'],
                                ['', '', '', '', '', '', '', '', '', ''],
                                ['', '', '', '', '', '', '', '', '', ''],
                                ['B', '', '', '', '', '', '', '', '', 'B'],
                                ['', '', '', '', '', '', '', '', '', ''],
                                ['', '', '', '', '', '', '', '', '', ''],
                                ['', '', '', 'B', '', '', 'B', '', '', '']] } }],
                comment: "player 0 starts and moves his pawn from (0,3) to (0,4)"
            },
            {
                turnIndexBeforeMove: { turnIndex: 0 },
                stateBeforeMove: { turnInfo: { ctr: 1, pawn: 'X' }, pawnDelta: { row: 0, col: 4 },
                    board: [['', '', '', '', 'A', '', 'A', '', '', ''],
                        ['', '', '', '', '', '', '', '', '', ''],
                        ['', '', '', '', '', '', '', '', '', ''],
                        ['A', '', '', '', '', '', '', '', '', 'A'],
                        ['', '', '', '', '', '', '', '', '', ''],
                        ['', '', '', '', '', '', '', '', '', ''],
                        ['B', '', '', '', '', '', '', '', '', 'B'],
                        ['', '', '', '', '', '', '', '', '', ''],
                        ['', '', '', '', '', '', '', '', '', ''],
                        ['', '', '', 'B', '', '', 'B', '', '', '']] },
                move: [{ setTurn: { turnIndex: 1 } },
                    { set: { key: 'turnInfo', value: { ctr: 2, pawn: 'B' } } },
                    { set: { key: 'pawnPosition', value: { row: 0, col: 4 } } },
                    { set: { key: 'pawnDelta', value: { row: 9, col: 4 } } },
                    { set: { key: 'board', value: [['', '', '', '', 'A', '', 'A', '', '', ''],
                                ['', '', '', '', '', '', '', '', '', ''],
                                ['', '', '', '', '', '', '', '', '', ''],
                                ['A', '', '', '', '', '', '', '', '', 'A'],
                                ['', '', '', '', '', '', '', '', '', ''],
                                ['', '', '', '', '', '', '', '', '', ''],
                                ['B', '', '', '', '', '', '', '', '', 'B'],
                                ['', '', '', '', '', '', '', '', '', ''],
                                ['', '', '', '', '', '', '', '', '', ''],
                                ['', '', '', 'B', 'X', '', 'B', '', '', '']] } }],
                comment: "player 0 shoots arrow from (0,4) to (9,4)"
            },
            {
                turnIndexBeforeMove: { turnIndex: 1 },
                stateBeforeMove: { turnInfo: { ctr: 2, pawn: 'B' }, pawnDelta: { row: 9, col: 4 },
                    board: [['', '', '', '', 'A', '', 'A', '', '', ''],
                        ['', '', '', '', '', '', '', '', '', ''],
                        ['', '', '', '', '', '', '', '', '', ''],
                        ['A', '', '', '', '', '', '', '', '', 'A'],
                        ['', '', '', '', '', '', '', '', '', ''],
                        ['', '', '', '', '', '', '', '', '', ''],
                        ['B', '', '', '', '', '', '', '', '', 'B'],
                        ['', '', '', '', '', '', '', '', '', ''],
                        ['', '', '', '', '', '', '', '', '', ''],
                        ['', '', '', 'B', 'X', '', 'B', '', '', '']] },
                move: [{ setTurn: { turnIndex: 1 } },
                    { set: { key: 'turnInfo', value: { ctr: 1, pawn: 'X' } } },
                    { set: { key: 'pawnPosition', value: { row: 6, col: 0 } } },
                    { set: { key: 'pawnDelta', value: { row: 9, col: 0 } } },
                    { set: { key: 'board', value: [['', '', '', '', 'A', '', 'A', '', '', ''],
                                ['', '', '', '', '', '', '', '', '', ''],
                                ['', '', '', '', '', '', '', '', '', ''],
                                ['A', '', '', '', '', '', '', '', '', 'A'],
                                ['', '', '', '', '', '', '', '', '', ''],
                                ['', '', '', '', '', '', '', '', '', ''],
                                ['', '', '', '', '', '', '', '', '', 'B'],
                                ['', '', '', '', '', '', '', '', '', ''],
                                ['', '', '', '', '', '', '', '', '', ''],
                                ['B', '', '', 'B', 'X', '', 'B', '', '', '']] } }],
                comment: "player 1 now has the turn and moves his pawn from (6,0) to (9,0)"
            },
            {
                turnIndexBeforeMove: { turnIndex: 1 },
                stateBeforeMove: { turnInfo: { ctr: 1, pawn: 'X' }, pawnDelta: { row: 9, col: 0 },
                    board: [['', '', '', '', 'A', '', 'A', '', '', ''],
                        ['', '', '', '', '', '', '', '', '', ''],
                        ['', '', '', '', '', '', '', '', '', ''],
                        ['A', '', '', '', '', '', '', '', '', 'A'],
                        ['', '', '', '', '', '', '', '', '', ''],
                        ['', '', '', '', '', '', '', '', '', ''],
                        ['', '', '', '', '', '', '', '', '', 'B'],
                        ['', '', '', '', '', '', '', '', '', ''],
                        ['', '', '', '', '', '', '', '', '', ''],
                        ['B', '', '', 'B', 'X', '', 'B', '', '', '']] },
                move: [{ setTurn: { turnIndex: 0 } },
                    { set: { key: 'turnInfo', value: { ctr: 2, pawn: 'A' } } },
                    { set: { key: 'pawnPosition', value: { row: 9, col: 0 } } },
                    { set: { key: 'pawnDelta', value: { row: 4, col: 0 } } },
                    { set: { key: 'board', value: [['', '', '', '', 'A', '', 'A', '', '', ''],
                                ['', '', '', '', '', '', '', '', '', ''],
                                ['', '', '', '', '', '', '', '', '', ''],
                                ['A', '', '', '', '', '', '', '', '', 'A'],
                                ['X', '', '', '', '', '', '', '', '', ''],
                                ['', '', '', '', '', '', '', '', '', ''],
                                ['', '', '', '', '', '', '', '', '', 'B'],
                                ['', '', '', '', '', '', '', '', '', ''],
                                ['', '', '', '', '', '', '', '', '', ''],
                                ['B', '', '', 'B', 'X', '', 'B', '', '', '']] } }],
                comment: "player 1 shoots arrow from (9,0) to (4,0)"
            },
            {
                turnIndexBeforeMove: { turnIndex: 0 },
                stateBeforeMove: { turnInfo: { ctr: 2, pawn: 'A' }, pawnDelta: { row: 4, col: 0 },
                    board: [['', '', '', '', 'A', '', 'A', '', '', ''],
                        ['', '', '', '', '', '', '', '', '', ''],
                        ['', '', '', '', '', '', '', '', '', ''],
                        ['A', '', '', '', '', '', '', '', '', 'A'],
                        ['X', '', '', '', '', '', '', '', '', ''],
                        ['', '', '', '', '', '', '', '', '', ''],
                        ['', '', '', '', '', '', '', '', '', 'B'],
                        ['', '', '', '', '', '', '', '', '', ''],
                        ['', '', '', '', '', '', '', '', '', ''],
                        ['B', '', '', 'B', 'X', '', 'B', '', '', '']] },
                move: [{ setTurn: { turnIndex: 0 } },
                    { set: { key: 'turnInfo', value: { ctr: 1, pawn: 'X' } } },
                    { set: { key: 'pawnPosition', value: { row: 0, col: 6 } } },
                    { set: { key: 'pawnDelta', value: { row: 0, col: 9 } } },
                    { set: { key: 'board', value: [['', '', '', '', 'A', '', '', '', '', 'A'],
                                ['', '', '', '', '', '', '', '', '', ''],
                                ['', '', '', '', '', '', '', '', '', ''],
                                ['A', '', '', '', '', '', '', '', '', 'A'],
                                ['X', '', '', '', '', '', '', '', '', ''],
                                ['', '', '', '', '', '', '', '', '', ''],
                                ['', '', '', '', '', '', '', '', '', 'B'],
                                ['', '', '', '', '', '', '', '', '', ''],
                                ['', '', '', '', '', '', '', '', '', ''],
                                ['B', '', '', 'B', 'X', '', 'B', '', '', '']] } }],
                comment: "player 0 moves his pawn from (0,6) to (0,9)"
            }
        ];
        return game;
    }
    gameLogic.getExampleGame = getExampleGame;
    function getRiddles() {
        var riddles = [{
                turnIndexBeforeMove: { turnIndex: 1 },
                stateBeforeMove: { turnInfo: { ctr: 2, pawn: 'B' },
                    pawnDelta: { row: '0', col: '2' },
                    board: [['', '', 'X', 'A', 'X', 'X', 'A', 'X', '', ''],
                        ['', '', 'X', 'X', '', 'X', 'X', 'X', '', ''],
                        ['X', 'X', '', '', '', '', '', '', 'X', 'X'],
                        ['A', 'X', '', '', '', '', '', '', 'X', 'A'],
                        ['X', 'X', '', '', '', 'X', '', 'X', 'X', 'X'],
                        ['X', 'X', '', '', '', '', '', '', 'X', 'X'],
                        ['B', 'X', '', '', '', '', '', '', 'X', 'B'],
                        ['X', 'X', '', '', '', '', '', '', 'X', 'X'],
                        ['', '', 'X', 'X', '', '', '', '', '', ''],
                        ['', '', 'X', 'B', 'X', 'X', 'B', '', '', '']] },
                move: [{ setTurn: { turnIndex: 1 } },
                    { set: { key: 'turnInfo', value: { ctr: 1, pawn: 'X' } } },
                    { set: { key: 'pawnPosition', value: { row: 9, col: 3 } } },
                    { set: { key: 'pawnDelta', value: { row: 8, col: 4 } } },
                    { set: { key: 'board', value: [['', '', 'X', 'A', 'X', 'X', 'A', 'X', '', ''],
                                ['', '', 'X', 'X', '', 'X', 'X', 'X', '', ''],
                                ['X', 'X', '', '', '', '', '', '', 'X', 'X'],
                                ['A', 'X', '', '', '', '', '', '', 'X', 'A'],
                                ['X', 'X', '', '', '', 'X', '', 'X', 'X', 'X'],
                                ['X', 'X', '', '', '', '', '', '', 'X', 'X'],
                                ['B', 'X', '', '', '', '', '', '', 'X', 'B'],
                                ['X', 'X', '', '', '', '', '', '', 'X', 'X'],
                                ['', '', 'X', 'X', 'B', '', '', '', '', ''],
                                ['', '', 'X', '', 'X', 'X', 'B', '', '', '']] } }],
                comment: "if B plays a combination of pawn move from 9,3 to 8,4 and then arrow move from 8,4 to 1,4 : B wins"
            },
            {
                turnIndexBeforeMove: { turnIndex: 0 },
                stateBeforeMove: { turnInfo: { ctr: 2, pawn: 'A' },
                    pawnDelta: { row: '9', col: '3' },
                    board: [['X', '', 'X', '', 'X', 'X', 'A', 'X', '', ''],
                        ['', '', 'X', 'X', '', 'X', 'X', 'X', '', ''],
                        ['X', 'X', '', '', 'X', '', 'X', '', 'X', 'X'],
                        ['A', '', '', 'X', 'A', '', '', '', 'X', 'A'],
                        ['X', 'X', '', '', '', 'X', '', 'X', 'X', 'X'],
                        ['X', '', '', '', 'X', '', '', '', 'X', 'X'],
                        ['B', 'X', '', '', '', '', 'B', '', 'X', ''],
                        ['X', 'X', '', '', '', '', '', '', 'X', 'X'],
                        ['', '', 'X', 'X', '', '', '', '', '', ''],
                        ['X', '', 'X', 'B', 'X', 'X', 'B', '', '', '']] },
                move: [{ setTurn: { turnIndex: 0 } },
                    { set: { key: 'turnInfo', value: { ctr: 1, pawn: 'X' } } },
                    { set: { key: 'pawnPosition', value: { row: 3, col: 4 } } },
                    { set: { key: 'pawnDelta', value: { row: 5, col: 2 } } },
                    { set: { key: 'board', value: [['X', '', 'X', '', 'X', 'X', 'A', 'X', '', ''],
                                ['', '', 'X', 'X', '', 'X', 'X', 'X', '', ''],
                                ['X', 'X', '', '', 'X', '', 'X', '', 'X', 'X'],
                                ['A', '', '', 'X', '', '', '', '', 'X', 'A'],
                                ['X', 'X', '', '', '', 'X', '', 'X', 'X', 'X'],
                                ['X', '', 'A', '', 'X', '', '', '', 'X', 'X'],
                                ['B', 'X', '', '', '', '', 'B', '', 'X', ''],
                                ['X', 'X', '', '', '', '', '', '', 'X', 'X'],
                                ['', '', 'X', 'X', '', '', '', '', '', ''],
                                ['X', '', 'X', 'B', 'X', 'X', 'B', '', '', '']] } }],
                comment: "A moves to 5,2 and can block off pawn B at 6,0 completely by playing his arrow to 5,1"
            }];
        return riddles;
    }
    gameLogic.getRiddles = getRiddles;
    function createComputerMove(stateBeforeMove, turnIndexBeforeMove) {
        var temp = angular.fromJson(stateBeforeMove);
        stateBeforeMove = temp;
        var pawnPosList = [];
        var pawnDelList = { '1': [], '2': [], '3': [], '4': [] };
        var pawnPosition, pawnDelta;
        var i, j, index = 1;
        var board = stateBeforeMove.board;
        var turnInfo = stateBeforeMove.turnInfo;
        //   	console.log(stateBeforeMove);
        //   	console.log(turnIndexBeforeMove);
        if (turnInfo.ctr === 2) {
            for (i = 0; i < 10; i += 1) {
                for (j = 0; j < 10; j += 1) {
                    if ((turnIndexBeforeMove === 0 && board[i][j] === 'A') ||
                        (turnIndexBeforeMove === 1 && board[i][j] === 'B')) {
                        var tempPos = { row: i, col: j };
                        pawnPosList.push(tempPos);
                    }
                }
            }
        }
        else {
            pawnPosList.push(stateBeforeMove.pawnDelta);
        }
        console.log(pawnPosList);
        //   	get list of possible pawndeltas for each pawn positiong and list them as
        //   	{1:[{row:..,col:..},{row:..,col:..}..],
        //   	 2:[{row:..,col:..},{row:..,col:..}..],
        //   	 .
        //   	 .
        //   	 }
        for (i = 0; i < pawnPosList.length; i += 1) {
            var pos = pawnPosList[i];
            for (j = pos.col + 1; j < 10; j += 1) {
                if (board[pos.row][j] === '') {
                    temp = { row: pos.row, col: j };
                    pawnDelList[index].push(temp);
                } //East
                else {
                    break;
                }
            }
            for (j = pos.col - 1; j >= 0; j -= 1) {
                if (board[pos.row][j] === '') {
                    temp = { row: pos.row, col: j };
                    pawnDelList[index].push(temp);
                } //West
                else {
                    break;
                }
            }
            for (j = pos.row + 1; j < 10; j += 1) {
                if (board[j][pos.col] === '') {
                    temp = { row: j, col: pos.col };
                    pawnDelList[index].push(temp);
                } //south
                else {
                    break;
                }
            }
            for (j = pos.row - 1; j >= 0; j -= 1) {
                if (board[j][pos.col] === '') {
                    temp = { row: j, col: pos.col };
                    pawnDelList[index].push(temp);
                } //north
                else {
                    break;
                }
            }
            var startRow = pos.row + 1, startCol = pos.col + 1;
            while (startRow < 10 && startCol < 10) {
                if (board[startRow][startCol] === '') {
                    temp = { row: startRow, col: startCol };
                    pawnDelList[index].push(temp);
                    startRow += 1;
                    startCol += 1;
                } //SE
                else {
                    break;
                }
            }
            startRow = pos.row + 1;
            startCol = pos.col - 1;
            while (startRow < 10 && startCol >= 0) {
                if (board[startRow][startCol] === '') {
                    temp = { row: startRow, col: startCol };
                    pawnDelList[index].push(temp);
                    startRow += 1;
                    startCol -= 1;
                } //SW
                else {
                    break;
                }
            }
            startRow = pos.row - 1;
            startCol = pos.col + 1;
            while (startRow >= 0 && startCol < 10) {
                if (board[startRow][startCol] === '') {
                    temp = { row: startRow, col: startCol };
                    pawnDelList[index].push(temp);
                    startRow -= 1;
                    startCol += 1;
                } //NE
                else {
                    break;
                }
            }
            startRow = pos.row - 1;
            startCol = pos.col - 1;
            while (startRow >= 0 && startCol >= 0) {
                if (board[startRow][startCol] === '') {
                    temp = { row: startRow, col: startCol };
                    pawnDelList[index].push(temp);
                    startRow -= 1;
                    startCol -= 1;
                } //NW
                else {
                    break;
                }
            }
            index += 1;
        }
        var pawnNumber, listLen, pawnDelNumber, tempArray;
        while (1) {
            if (turnInfo.ctr === 2) {
                pawnNumber = Math.floor((Math.random() * 4) + 1); //get number between 1 and 4
            }
            else {
                pawnNumber = 1;
            }
            pawnPosition = pawnPosList[pawnNumber - 1]; //get pawn Position of that pawn
            listLen = pawnDelList[pawnNumber].length; //get length of array of that pawns possible moves
            if (listLen !== 0) {
                break;
            }
        }
        pawnDelNumber = Math.floor((Math.random() * listLen)); // generate a random number between 0 and length from prev step
        tempArray = pawnDelList[pawnNumber]; //extract the array from the main list
        pawnDelta = tempArray[pawnDelNumber]; //get delta position at random index using pawnDelNumber
        console.log(pawnPosition, pawnDelta);
        var randomMove = createMove(pawnPosition, pawnDelta, turnIndexBeforeMove, stateBeforeMove);
        return randomMove;
    }
    gameLogic.createComputerMove = createComputerMove;
    function isMoveOk(params) {
        var move = params.move, turnIndexBeforeMove = params.turnIndexBeforeMove, stateBeforeMove = params.stateBeforeMove, expectedMove, board = stateBeforeMove.board;
        //    console.log(params)
        turnIndexBeforeMove = (turnIndexBeforeMove === 0) ? { turnIndex: 0 } : { turnIndex: 1 };
        if (board === undefined) {
            stateBeforeMove = init();
            board = stateBeforeMove.board;
        }
        var pawnDelta = move[3].set.value, pawnPosition = move[2].set.value;
        //    var x = new Error();
        try {
            if (horizontalMoveCheck(pawnPosition, pawnDelta, board) ||
                verticalMoveCheck(pawnPosition, pawnDelta, board) ||
                diagonalMoveCheck(pawnPosition, pawnDelta, board)) {
                expectedMove = createMove(pawnPosition, pawnDelta, turnIndexBeforeMove, stateBeforeMove);
                if (isEqual(move, expectedMove)) {
                    return true;
                }
                else {
                    return false;
                }
            }
            else {
                return false;
            }
        }
        catch (x) {
            //	console.log(x);
            return false;
        }
    }
    gameLogic.isMoveOk = isMoveOk;
})(gameLogic || (gameLogic = {}));
angular.module('myApp', ['ngTouch', 'ui.bootstrap', 'gameServices']).factory('gameLogic', function () {
    return {
        isMoveOk: gameLogic.isMoveOk,
        createMove: gameLogic.createMove,
        createComputerMove: gameLogic.createComputerMove,
        getInitialBoard: gameLogic.getInitialBoard,
        getExampleGame: gameLogic.getExampleGame,
        getRiddles: gameLogic.getRiddles,
        horizontalMoveCheck: gameLogic.horizontalMoveCheck,
        verticalMoveCheck: gameLogic.verticalMoveCheck,
        diagonalMoveCheck: gameLogic.diagonalMoveCheck,
    };
});
;/*angular.module('myApp')
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
