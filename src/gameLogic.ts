//angular.module('myApp', ['ngTouch', 'ui.bootstrap', 'gameServices']).factory('gameLogic', function () {
//  'use strict';

  module gameLogic {


  export function isEqual(object1:any, object2:any) {
    return angular.equals(object1, object2);
  }

  export function copyObject(object:any) {
    return angular.copy(object);
  }

  export function getInitialBoard(){

  	var i:any,j:any,board:any=[];

    for(i=0;i<10;i+=1)
      {
          board[i]=[];
          for(j=0;j<10;j+=1)
            {
              board[i][j]='';
            }
      }

    board[0][3]='A';board[0][6]='A';board[3][0]='A';board[3][9]='A';
    board[6][0]='B';board[6][9]='B';board[9][3]='B';board[9][6]='B';

    return board;
    }

  export function init(){

    var board = getInitialBoard();
    return {'turnInfo':{ctr:2,pawn:'A'},'pawnDelta':{row:'',col:''},'board':board};

  }

//function to check if the pawn at i,j can make valid move and return 1 if true else 0
  export function canMove(i:any,j:any,board:any){
    var loop = {rowFrom:0,rowTo:0,colFrom:0,colTo:0}, x:any, y:any;

    if(i===0 && j===0){loop = {rowFrom:0,rowTo:1,colFrom:0,colTo:1};}
    else if (i===0 && j===9){loop = {rowFrom:0,rowTo:1,colFrom:8,colTo:9};}
    else if (i===9 && j===0){loop = {rowFrom:8,rowTo:9,colFrom:0,colTo:1};}
    else if (i===9 && j===9){loop = {rowFrom:8,rowTo:9,colFrom:8,colTo:9};}
    else if (i===0 && j>0 && j<9){loop = {rowFrom:0,rowTo:1,colFrom:j-1,colTo:j+1};}
    else if (i>0 && i<9 && j===0){loop = {rowFrom:i-1,rowTo:i+1,colFrom:0,colTo:1};}
    else if (i===9 && j>0 && j<9){loop = {rowFrom:8,rowTo:9,colFrom:j-1,colTo:j+1};}
    else if (i>0 && i<9 && j===9){loop = {rowFrom:i-1,rowTo:i+1,colFrom:8,colTo:9};}
    else{loop = {rowFrom:i-1,rowTo:i+1,colFrom:j-1,colTo:j+1};}

    for(x=loop.rowFrom;x<=loop.rowTo;x+=1){
      for(y=loop.colFrom;y<=loop.colTo;y+=1){
        if(board[x][y]===''){return 1;}
      }
    }


    return 0;
  }

  export function getWinner(board:any,turnIndex:any){
    var Actr=0,Bctr=0,i:any,j:any;

    for(i=0;i<10;i+=1){
      for (j=0;j<10;j+=1){
        if(board[i][j] === 'A'){ Actr += canMove(i,j,board);}
          else if(board[i][j] === 'B'){ Bctr += canMove(i,j,board);}
      }
    }

    if (turnIndex==='A' && Bctr === 0){return 'A';}
    if (turnIndex==='B' && Actr === 0){return 'B';}
    return '';

  }

  export function createMove(pawnPosition:any, pawnDelta:any, turnIndexBeforeMove:any, stateBeforeMove:any){

  	if(stateBeforeMove==="{}")
  	{
  		stateBeforeMove = init();
  	}
  	else
  	{
  		var temp = angular.fromJson(stateBeforeMove);
  		stateBeforeMove = temp;
  	}

  	if(turnIndexBeforeMove===0) {turnIndexBeforeMove = {turnIndex:0};}
  	if(turnIndexBeforeMove===1) {turnIndexBeforeMove = {turnIndex:1};}

    var board = stateBeforeMove.board,
    	turnInfo = stateBeforeMove.turnInfo,
    	newTurn = turnIndexBeforeMove,        //copy value of current turn
    	newTurnInfo = turnInfo,
        pp = pawnPosition,
        pd = pawnDelta,
        winner:any,
        result:any;


    var boardAfterMove = copyObject(board);

    if (board[pawnDelta.row][pawnDelta.col] !== '') {
      throw new Error("pawn must land in empty position");
    }

	if(turnInfo.ctr===2){
      if(board[pawnPosition.row][pawnPosition.col]!==turnInfo.pawn){
        throw new Error("pawn has to exist at position");
      }
      else{
        boardAfterMove[pawnPosition.row][pawnPosition.col] = '';
      }
    }

    if(turnInfo.ctr===1){
      if(pawnPosition.row===stateBeforeMove.pawnDelta.row &&
      		pawnPosition.col===stateBeforeMove.pawnDelta.col)
      		{
      			if((turnIndexBeforeMove.turnIndex===0 &&
      				board[pawnPosition.row][pawnPosition.col]!=='A') ||
      				(turnIndexBeforeMove.turnIndex===1 &&
      				board[pawnPosition.row][pawnPosition.col]!=='B'))
      				{
        				throw new Error("player has to shoot arrow from the same place");
        			}
      		}
      else{
        throw new Error("Wrong position for shooting arrow");
      }
    }


    boardAfterMove[pawnDelta.row][pawnDelta.col] = turnInfo.pawn;//pawnName can be X,A or B

    if(turnInfo.ctr === 1)
    {
      winner = getWinner(boardAfterMove,boardAfterMove[pawnPosition.row][pawnPosition.col]);
      if(winner==='')
      {
          if(turnIndexBeforeMove.turnIndex===0){newTurn.turnIndex=1;newTurnInfo.ctr=2;newTurnInfo.pawn='B';}
          else if(turnIndexBeforeMove.turnIndex===1){newTurn.turnIndex=0;newTurnInfo.ctr=2;newTurnInfo.pawn='A';}
      }
      else
      {
        result = {endMatch: {endMatchScores:(winner === 'A' ? [1, 0] : (winner === 'B' ? [0, 1] : [0, 0]))}};
        newTurnInfo = {ctr:'',pawn:''};
        var winnerstring = (winner === 'A' ? 'Game Over! White player wins' : 'Game over! Black Player wins');
        window.alert(winnerstring);
        return [result,
                {set: {key: 'turnInfo', value: newTurnInfo}},
                {set: {key: 'pawnPosition', value :{row:pp.row, col:pp.col}}},
                {set: {key: 'pawnDelta', value :{row:pd.row, col:pd.col}}},
                {set: {key: 'board', value: boardAfterMove}}];
      }
    }
    else
    {
      newTurnInfo.ctr = 1;newTurnInfo.pawn = 'X';		//ctr was 2 so make it 1 and change pawn name,player remains same
    }


    return [{setTurn:newTurn},
    		{set: {key: 'turnInfo', value: newTurnInfo}},
            {set: {key: 'pawnPosition', value :{row:pp.row, col:pp.col}}},
            {set: {key: 'pawnDelta', value :{row:pd.row, col:pd.col}}},
            {set: {key: 'board', value: boardAfterMove}}];

  }

  export function horizontalMoveCheck(pos1:any,pos2:any,board:any){

    var i:any,greaterpos:any,lesserpos:any;
    if(Math.abs(pos1.row - pos2.row) === 0){
      if(pos2.col > pos1.col){
        greaterpos = pos2;
        lesserpos = pos1;
        for (i=lesserpos.col+1; i<=greaterpos.col; i+=1){
          if(board[greaterpos.row][i] !== ''){
            return false;
          }
        }
      }
      else{
        greaterpos = pos1;
        lesserpos = pos2;
        for (i=greaterpos.col-1; i>=lesserpos.col; i-=1){
          if(board[greaterpos.row][i] !== ''){
            return false;
          }
        }
      }
    }
    else{
      return false;
    }

    return true;
  }											//check to see if move is horizontal, and if all squares between current
                                              //position and new position are unoccupied
  export function verticalMoveCheck(pos1:any,pos2:any,board:any){

    var greaterpos:any,lesserpos:any,i:any;
    if(Math.abs(pos1.col - pos2.col) === 0){
      if(pos2.row > pos1.row){
        greaterpos = pos2;
        lesserpos = pos1;
        for (i=lesserpos.row+1; i<=greaterpos.row; i+=1){
          if(board[i][greaterpos.col] !== ''){
            return false;
          }
        }
      }
      else{
        greaterpos = pos1;
        lesserpos = pos2;
        for (i=greaterpos.row-1; i>=lesserpos.row; i-=1){
          if(board[i][greaterpos.col] !== ''){
            return false;
          }
        }
      }
    }
    else{
      return false;
    }
    return true;
  }

  export function diagonalMoveCheck(pos1:any,pos2:any,board:any){

    var greaterpos:any,lesserpos:any,i:any,j:any;
    if(Math.abs(pos1.row - pos2.row) === Math.abs(pos1.col - pos2.col)){
      greaterpos = pos2;
      lesserpos = pos1;

      if(pos2.col > pos1.col && pos2.row < pos1.row){	//NE direction
        i=lesserpos.row-1;j=lesserpos.col+1;
        while(i>=greaterpos.row && j<=greaterpos.col){
          if(board[i][j] !== ''){
            return false;
          }
          i-=1;j+=1;
        }
      }

      else if(pos2.col > pos1.col && pos2.row > pos1.row){								//SE direction
        i=lesserpos.row+1;j=lesserpos.col+1;
        while(i<=greaterpos.row && j<=greaterpos.col){
          if(board[i][j] !== ''){
            return false;
          }
          i+=1;j+=1;
        }
      }
      else if(pos2.col < pos1.col && pos2.row > pos1.row){								//SW direction
        i=lesserpos.row+1;j=lesserpos.col-1;
          while(i<=greaterpos.row && j>=greaterpos.col){
          if(board[i][j] !== ''){
            return false;
          }
          i+=1;j-=1;
        }
      }

      else if(pos2.col < pos1.col && pos2.row < pos1.row){								//NW direction
        i=lesserpos.row-1;j=lesserpos.col-1;
        while(i>=greaterpos.row && j>=greaterpos.col){
          if(board[i][j] !== ''){
            return false;
          }
          i-=1;j-=1;
        }
      }
    }

    else{
        return false;
    }

    return true;
}

  export function getExampleGame(){
  	var game = [
  				  {
  				   turnIndexBeforeMove:{turnIndex:0},
  				   stateBeforeMove:{turnInfo:{ctr:2,pawn:'A'},pawnDelta:{row:'',col:''},
  				   											  board:[['','','','A','','','A','','',''],
                                      								['','','','','','','','','',''],
                                      								['','','','','','','','','',''],
                                      								['A','','','','','','','','','A'],
                                      								['','','','','','','','','',''],
                                      								['','','','','','','','','',''],
                                      								['B','','','','','','','','','B'],
                                    								['','','','','','','','','',''],
                                      								['','','','','','','','','',''],
                                      								['','','','B','','','B','','','']]},
                    move:[{setTurn:{turnIndex:0}},
                    	  {set: {key: 'turnInfo', value: {ctr:1,pawn:'X'}}},
          				  {set: {key: 'pawnPosition', value: {row:0, col:3}}},
          				  {set: {key: 'pawnDelta', value: {row:0, col:4}}},
          				  {set: {key: 'board', value: [['','','','','A','','A','','',''],
                                      				   ['','','','','','','','','',''],
                                      				   ['','','','','','','','','',''],
                                                       ['A','','','','','','','','','A'],
                                             		   ['','','','','','','','','',''],
                          				               ['','','','','','','','','',''],
                  				                       ['B','','','','','','','','','B'],
                    				                   ['','','','','','','','','',''],
                 				                       ['','','','','','','','','',''],
                				                       ['','','','B','','','B','','','']]}}],
                    comment:"player 0 starts and moves his pawn from (0,3) to (0,4)"
                  },

  				  {
  				   turnIndexBeforeMove:{turnIndex:0},
  				   stateBeforeMove:{turnInfo:{ctr:1,pawn:'X'},pawnDelta:{row:0,col:4},
  				   											  board:[['','','','','A','','A','','',''],
                                      								['','','','','','','','','',''],
                                      								['','','','','','','','','',''],
                                      								['A','','','','','','','','','A'],
                                      								['','','','','','','','','',''],
                                      								['','','','','','','','','',''],
                                      								['B','','','','','','','','','B'],
                                    								['','','','','','','','','',''],
                                      								['','','','','','','','','',''],
                                      								['','','','B','','','B','','','']]},
                    move:[{setTurn:{turnIndex:1}},
                    	  {set: {key: 'turnInfo', value: {ctr:2,pawn:'B'}}},
          				  {set: {key: 'pawnPosition', value: {row:0, col:4}}},
          				  {set: {key: 'pawnDelta', value: {row:9, col:4}}},
          				  {set: {key: 'board', value: [['','','','','A','','A','','',''],
                                      				   ['','','','','','','','','',''],
                                      				   ['','','','','','','','','',''],
                                     				   ['A','','','','','','','','','A'],
                              				           ['','','','','','','','','',''],
                          				               ['','','','','','','','','',''],
              				                           ['B','','','','','','','','','B'],
         				                               ['','','','','','','','','',''],
       					                               ['','','','','','','','','',''],
           					                           ['','','','B','X','','B','','','']]}}],
                    comment:"player 0 shoots arrow from (0,4) to (9,4)"
                  },

            	  {
            	   turnIndexBeforeMove:{turnIndex:1},
  				   stateBeforeMove:{turnInfo:{ctr:2,pawn:'B'},pawnDelta:{row:9,col:4},
  				   											  board:[['','','','','A','','A','','',''],
                                      				   				  ['','','','','','','','','',''],
                                      				   				  ['','','','','','','','','',''],
                                     				   				  ['A','','','','','','','','','A'],
                              					     		          ['','','','','','','','','',''],
                          				               				  ['','','','','','','','','',''],
              				                           				  ['B','','','','','','','','','B'],
         				                               				  ['','','','','','','','','',''],
       					                               				  ['','','','','','','','','',''],
           					                           				  ['','','','B','X','','B','','','']]},
                    move:[{setTurn:{turnIndex:1}},
                    	  {set: {key: 'turnInfo', value: {ctr:1,pawn:'X'}}},
          				  {set: {key: 'pawnPosition', value: {row:6, col:0}}},
          				  {set: {key: 'pawnDelta', value: {row:9, col:0}}},
          				  {set: {key: 'board', value: [['','','','','A','','A','','',''],
                                      				   ['','','','','','','','','',''],
                                      	   			   ['','','','','','','','','',''],
                                     				   ['A','','','','','','','','','A'],
                              					       ['','','','','','','','','',''],
                          				               ['','','','','','','','','',''],
              				                           ['','','','','','','','','','B'],
         				                               ['','','','','','','','','',''],
       					                               ['','','','','','','','','',''],
           					                           ['B','','','B','X','','B','','','']]}}],
                    comment:"player 1 now has the turn and moves his pawn from (6,0) to (9,0)"
                  },

            	  {
            	   turnIndexBeforeMove:{turnIndex:1},
  				   stateBeforeMove:{turnInfo:{ctr:1,pawn:'X'},pawnDelta:{row:9, col:0},
  				   											  board:[['','','','','A','','A','','',''],
                                      				   				['','','','','','','','','',''],
                                      	   			   				['','','','','','','','','',''],
                                     				   				['A','','','','','','','','','A'],
                              					       				['','','','','','','','','',''],
                          				          					['','','','','','','','','',''],
              				                           				['','','','','','','','','','B'],
         				                               				['','','','','','','','','',''],
       					                               				['','','','','','','','','',''],
           					                           				['B','','','B','X','','B','','','']]},
                    move:[{setTurn:{turnIndex:0}},
                    	  {set: {key: 'turnInfo', value: {ctr:2,pawn:'A'}}},
          				  {set: {key: 'pawnPosition', value: {row:9, col:0}}},
          				  {set: {key: 'pawnDelta', value: {row:4, col:0}}},
          				  {set: {key: 'board', value: [['','','','','A','','A','','',''],
                                      				   ['','','','','','','','','',''],
                                      	   			   ['','','','','','','','','',''],
                                     				   ['A','','','','','','','','','A'],
                              					       ['X','','','','','','','','',''],
                          				          	   ['','','','','','','','','',''],
              				                           ['','','','','','','','','','B'],
         				                               ['','','','','','','','','',''],
       					                               ['','','','','','','','','',''],
           					                           ['B','','','B','X','','B','','','']]}}],
                    comment:"player 1 shoots arrow from (9,0) to (4,0)"
                  },

            	  {
            	   turnIndexBeforeMove:{turnIndex:0},
  				   stateBeforeMove:{turnInfo:{ctr:2,pawn:'A'},pawnDelta:{row:4, col:0},
  				   											  board:[['','','','','A','','A','','',''],
                                      				   				 ['','','','','','','','','',''],
                                      	   			   				 ['','','','','','','','','',''],
                                     				   				 ['A','','','','','','','','','A'],
                              					       				 ['X','','','','','','','','',''],
                          				          	   				 ['','','','','','','','','',''],
              				                           				 ['','','','','','','','','','B'],
         				                               				 ['','','','','','','','','',''],
       					                               				 ['','','','','','','','','',''],
           					                           				 ['B','','','B','X','','B','','','']]},
                    move:[{setTurn:{turnIndex:0}},
                    	  {set: {key: 'turnInfo', value: {ctr:1,pawn:'X'}}},
          				  {set: {key: 'pawnPosition', value: {row:0, col:6}}},
          				  {set: {key: 'pawnDelta', value: {row:0, col:9}}},
          				  {set: {key: 'board', value:[['','','','','A','','','','','A'],
                                      				  ['','','','','','','','','',''],
                                      	   			  ['','','','','','','','','',''],
                                     				  ['A','','','','','','','','','A'],
                              					      ['X','','','','','','','','',''],
                          				          	  ['','','','','','','','','',''],
              				                          ['','','','','','','','','','B'],
         				                              ['','','','','','','','','',''],
       					                              ['','','','','','','','','',''],
           					                          ['B','','','B','X','','B','','','']]}}],
                    comment:"player 0 moves his pawn from (0,6) to (0,9)"
                  }
            	];
    return game;
  }

  export function getRiddles(){
  	var riddles = [	{
  					 turnIndexBeforeMove:{turnIndex:1},
  					 stateBeforeMove:{ turnInfo:{ctr:2,pawn:'B'},
  					 				   pawnDelta:{row:'0',col:'2'},
  					 				   board:[['','','X','A','X','X','A','X','',''],
                                      		  ['','','X','X','','X','X','X','',''],
                                      		  ['X','X','','','','','','','X','X'],
                                      		  ['A','X','','','','','','','X','A'],
                                      		  ['X','X','','','','X','','X','X','X'],
                                      		  ['X','X','','','','','','','X','X'],
                                      		  ['B','X','','','','','','','X','B'],
                                    		  ['X','X','','','','','','','X','X'],
                                      		  ['','','X','X','','','','','',''],
                                      		  ['','','X','B','X','X','B','','','']]},

                    move:[{setTurn:{turnIndex:1}},
                    	  {set: {key: 'turnInfo', value: {ctr:1,pawn:'X'}}},
          				  {set: {key: 'pawnPosition', value: {row:9, col:3}}},
          				  {set: {key: 'pawnDelta', value: {row:8, col:4}}},
          				  {set: {key: 'board', value: [['','','X','A','X','X','A','X','',''],
                                      		  		   ['','','X','X','','X','X','X','',''],
                                      		  		   ['X','X','','','','','','','X','X'],
                                      		  		   ['A','X','','','','','','','X','A'],
                                      		  		   ['X','X','','','','X','','X','X','X'],
                                      		  		   ['X','X','','','','','','','X','X'],
                                      		  		   ['B','X','','','','','','','X','B'],
                                    		  		   ['X','X','','','','','','','X','X'],
                                      		  		   ['','','X','X','B','','','','',''],
                                      		  		   ['','','X','','X','X','B','','','']]}}],
                    comment:"if B plays a combination of pawn move from 9,3 to 8,4 and then arrow move from 8,4 to 1,4 : B wins"
                  },

                  	{
                  		turnIndexBeforeMove:{turnIndex:0},
  					    stateBeforeMove:{ turnInfo:{ctr:2,pawn:'A'},
  					    				  pawnDelta:{row:'9',col:'3'},
  					 				   board:[['X','','X','','X','X','A','X','',''],
                                      		  ['','','X','X','','X','X','X','',''],
                                      		  ['X','X','','','X','','X','','X','X'],
                                      		  ['A','','','X','A','','','','X','A'],
                                      		  ['X','X','','','','X','','X','X','X'],
                                      		  ['X','','','','X','','','','X','X'],
                                      		  ['B','X','','','','','B','','X',''],
                                    		  ['X','X','','','','','','','X','X'],
                                      		  ['','','X','X','','','','','',''],
                                      		  ['X','','X','B','X','X','B','','','']]},

                    	move:[{setTurn:{turnIndex:0}},
                    		  {set: {key: 'turnInfo', value: {ctr:1,pawn:'X'}}},
          				      {set: {key: 'pawnPosition', value: {row:3, col:4}}},
          				      {set: {key: 'pawnDelta', value: {row:5, col:2}}},
          				      {set: {key: 'board', value: [['X','','X','','X','X','A','X','',''],
                                      		  		      ['','','X','X','','X','X','X','',''],
                                      		  		      ['X','X','','','X','','X','','X','X'],
                                      		  		      ['A','','','X','','','','','X','A'],
                                      		  		      ['X','X','','','','X','','X','X','X'],
                                      		  		      ['X','','A','','X','','','','X','X'],
                                      		  		      ['B','X','','','','','B','','X',''],
                                    		  		      ['X','X','','','','','','','X','X'],
                                      		  		      ['','','X','X','','','','','',''],
                                      		  		      ['X','','X','B','X','X','B','','','']]}}],
                    comment:"A moves to 5,2 and can block off pawn B at 6,0 completely by playing his arrow to 5,1"
                }];

        return riddles;
    }

  export function createComputerMove(stateBeforeMove:any, turnIndexBeforeMove:any){
  	var temp = angular.fromJson(stateBeforeMove);
  	stateBeforeMove = temp;
  	var pawnPosList:any = [];
  	var pawnDelList:any = {'1':[],'2':[],'3':[],'4':[]};
  	var pawnPosition:any,pawnDelta:any;
  	var i:any,j:any,index=1;
  	var board = stateBeforeMove.board;
  	var turnInfo = stateBeforeMove.turnInfo;

//   	console.log(stateBeforeMove);
//   	console.log(turnIndexBeforeMove);

  	if(turnInfo.ctr===2){
  	for(i=0;i<10;i+=1){
  		for(j=0;j<10;j+=1){
  			if((turnIndexBeforeMove===0 && board[i][j]==='A') ||
  				(turnIndexBeforeMove===1 && board[i][j]==='B')){
  				var tempPos = {row:i,col:j};
  				pawnPosList.push(tempPos);
  			}
  		}
  	}
  	}
  	else{
  		pawnPosList.push(stateBeforeMove.pawnDelta);
  	}

  	console.log(pawnPosList);
//   	get list of possible pawndeltas for each pawn positiong and list them as
//   	{1:[{row:..,col:..},{row:..,col:..}..],
//   	 2:[{row:..,col:..},{row:..,col:..}..],
//   	 .
//   	 .
//   	 }
  	for(i = 0; i<pawnPosList.length; i+=1){
  		var pos = pawnPosList[i];
  		for(j=pos.col+1;j<10;j+=1){
  			if(board[pos.row][j] === ''){
  			temp = {row:pos.row,col:j};
  			pawnDelList[index].push(temp);} //East
  			else{break;}}
  		for(j=pos.col-1;j>=0;j-=1){
  			if(board[pos.row][j] === ''){temp = {row:pos.row,col:j};pawnDelList[index].push(temp);} //West
  			else{break;}}
  		for(j=pos.row+1;j<10;j+=1){
  			if(board[j][pos.col] === ''){temp = {row:j,col:pos.col};pawnDelList[index].push(temp);} //south
  			else{break;}}
  		for(j=pos.row-1;j>=0;j-=1){
  			if(board[j][pos.col] === ''){temp = {row:j,col:pos.col};pawnDelList[index].push(temp);} //north
  			else{break;}}

  		var startRow=pos.row+1,startCol=pos.col+1;
  		while(startRow<10 && startCol<10){
  			if(board[startRow][startCol] === ''){
  			temp = {row:startRow,col:startCol};pawnDelList[index].push(temp);startRow+=1;startCol+=1;} //SE
  			else{break;}}

  		startRow=pos.row+1;
      startCol=pos.col-1;
  		while(startRow<10 && startCol>=0){
  			if(board[startRow][startCol] === ''){
  			temp = {row:startRow,col:startCol};pawnDelList[index].push(temp);startRow+=1;startCol-=1;} //SW
  			else{break;}}

  		startRow=pos.row-1;
      startCol=pos.col+1;
  		while(startRow>=0 && startCol<10){
  			if(board[startRow][startCol] === ''){temp = {row:startRow,col:startCol};pawnDelList[index].push(temp);
  			startRow-=1;startCol+=1;} //NE
  			else{break;}}

  		startRow=pos.row-1;
      startCol=pos.col-1;
  		while(startRow>=0 && startCol>=0){
  			if(board[startRow][startCol] === ''){
  			temp = {row:startRow,col:startCol};pawnDelList[index].push(temp);startRow-=1;startCol-=1;} //NW
  			else{break;}}

  		index+=1;
  	}

    var pawnNumber:any, listLen:any, pawnDelNumber:any, tempArray:any;
    while(1){
            if(turnInfo.ctr===2){
  	             pawnNumber = Math.floor((Math.random()*4)+1);	//get number between 1 and 4
  	        }
  	        else{
  	             pawnNumber = 1;
            }
            pawnPosition = pawnPosList[pawnNumber-1];			    //get pawn Position of that pawn
  	        listLen = pawnDelList[pawnNumber].length;     //get length of array of that pawns possible moves
            if (listLen !== 0){
              break;
            }
    }

    pawnDelNumber = Math.floor((Math.random()*listLen)); // generate a random number between 0 and length from prev step
  	tempArray = pawnDelList[pawnNumber];				//extract the array from the main list
  	pawnDelta = tempArray[pawnDelNumber];				    //get delta position at random index using pawnDelNumber

  	console.log(pawnPosition,pawnDelta);
  	var randomMove = createMove(pawnPosition,pawnDelta,turnIndexBeforeMove,stateBeforeMove);

  	return randomMove;
  }

  export function isMoveOk(params:any){
	var move = params.move,
    turnIndexBeforeMove = params.turnIndexBeforeMove,
    stateBeforeMove = params.stateBeforeMove,
    expectedMove:any,
    board = stateBeforeMove.board;

//    console.log(params)

 	turnIndexBeforeMove = (turnIndexBeforeMove===0) ? {turnIndex:0} : {turnIndex:1};

	if(board===undefined){
      stateBeforeMove = init();
      board = stateBeforeMove.board;
    }

    var pawnDelta = move[3].set.value,
    pawnPosition = move[2].set.value;

//    var x = new Error();

 	try{
      	if (horizontalMoveCheck(pawnPosition,pawnDelta,board) ||
          	verticalMoveCheck(pawnPosition,pawnDelta,board)  ||
          	diagonalMoveCheck(pawnPosition,pawnDelta,board))
        {

		  		expectedMove = createMove(pawnPosition,pawnDelta,turnIndexBeforeMove,stateBeforeMove);
        		if(isEqual(move,expectedMove))
        		{
        			return true;
        		}
        		else
        		{
        			return false;
        		}
      	}
      	else
      	{
      		return false;
      	}
    }
	catch(x)
	{
	//	console.log(x);
		return false;
	} 
	}
}
angular.module('myApp', ['ngTouch', 'ui.bootstrap', 'gameServices']).factory('gameLogic', function () {

  return {
    isMoveOk : gameLogic.isMoveOk,
    createMove : gameLogic.createMove,
    createComputerMove : gameLogic.createComputerMove,
    getInitialBoard : gameLogic.getInitialBoard,
    getExampleGame : gameLogic.getExampleGame,
    getRiddles : gameLogic.getRiddles,
    horizontalMoveCheck : gameLogic.horizontalMoveCheck,
    verticalMoveCheck : gameLogic.verticalMoveCheck,
    diagonalMoveCheck : gameLogic.diagonalMoveCheck,
  };
});
