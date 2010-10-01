globals.board=null;
globals.timer=0;

constants.minimumBoardSize=4;
constants.maximumBoardSize=100;
constants.deltaX=[0,1,0,-1];
constants.deltaY=[-1,0,1,0];
constants.opposite=[2,3,0,1];

globals.title="Pipes";
globals.instructions="Rotate the cells until all cells in the grid are interconnected and 'lit' (colored green).  To rotate a cell, simply click on it.  To 'lock' or 'unlock' a cell(locked cells are colored differently), hold down control while clicking.";

globals.tilesets = [
{name:"Large", size:32, filename: "tileset2_32.png"},
{name:"Middle", size:24, filename: "tileset2_24.png"},
];
globals.tileset = globals.tilesets[1];

function getCellElement(x,y)
{
	return(document.getElementById("cell_"+x+"_"+y));
}

function clickCell(x,y,event)
{
	if(event.ctrlKey)
	{
		globals.board.getCell(x,y).locked = !globals.board.getCell(x,y).locked;
		globals.board.getCell(x,y).update();
	}
	else
	{
		globals.board.turnCell(x,y);
	}
}

generator["play"]=function()
{

	if (globals.board.width <= 20 && globals.board.height <= 20) {
		globals.tileset = globals.tilesets[0];
	} else {
		globals.tileset = globals.tilesets[1];
	}

	var result="";
	var size=globals.tileset.size;
	var s = document.styleSheets[0];
	if (s.insertRule) {
		s.insertRule(".tile {position: absolute; width: "+size+"px; height: "+size+"px; overflow: hidden; background-image:url('images/"+ globals.tileset.filename +"'); }", 0);
	} else {
		s.addRule(".tile", "position: absolute; width: "+size+"px; height: "+size+"px; overflow: hidden; background-image:url('images/"+ globals.tileset.filename +"');", 0);
	}

	for(var y=0;y<globals.board.height;++y)
	{
		for(var x=0;x<globals.board.width;++x)
		{
			value = globals.board.getCell(x,y).getValue();
			globals.board.getCell(x,y).oldValue = value;
			result += '<div class="tile" style="left: ' + (x*size) + 'px; top: ' + (y*size) + 
					'px; background-position: ' + (-(value&15)*size) + 'px ' + (-Math.floor(value/16)*size) +
					'px;" id="cell_'+x+'_'+y+'" onmouseup="clickCell('+x+","+y+
					",event);\" onmouseover=\"globals.board.setCellSelected("+x+","+y+
					",true);\" onmouseout=\"globals.board.setCellSelected("+x+","+y+
					",false)\"></div>";
		}
	}
	result+="<div style=\"position:absolute;top:"+globals.board.height*size+"\">";
	result+="<p id=\"timer\">Time: "+globals.timer+"</p>";
	result+="</div>";
	return(result);
}

function Cell(x,y)
{
	this.x=x;
	this.y=y;
	this.locked = false;
	this.selected = false;
	this.lit = false;
	this.neighbors = [null, null, null, null];
	this.directions = [false, false, false, false];
	this.oldValue = -1;

	this.update=function()
	{
		var value=this.getValue();
		var size=globals.tileset.size;
		if (value == this.oldValue) return;

		this.oldValue = value;
		var cellImage = getCellElement(this.x,this.y);
		if(cellImage!=null)
		{
			cellImage.style.backgroundPosition = (-(value&15)*size) + 'px ' + (-Math.floor(value/16)*size) + 'px';
		}
	}

	this.getValue=function()
	{
		return(
			(this.directions[0]?(1):(0))+
			(this.directions[1]?(2):(0))+
			(this.directions[2]?(4):(0))+
			(this.directions[3]?(8):(0))+
			(this.lit?(16):(0))+
			(this.locked?(32):(0))+
			(this.selected?(64):(0))
		);
	}

	this.rotateCW=function()
	{
		var temp=this.directions[3];
		for(var index=3; index>0; index--)
		{
			this.directions[index]=this.directions[index-1];
		}
		this.directions[0]=temp;
	}

	this.rotateCCW=function()
	{
		var temp=this.directions[0];
		for(var index=0; index<3; index++)
		{
			this.directions[index]=this.directions[index+1];
		}
		this.directions[3]=temp;
	}

	this.scramble=function()
	{
		var turns=new Array();
		if ((this.getValue() & 15) == 15) {
			this.locked=true;
		}
		else {
			for (turns = Math.floor(Math.random()*4); turns>0; turns--) this.rotateCW();
		}
	}

	this.light=function()
	{
		if(!this.lit)
		{
			this.lit=true;
			for(var direction=0; direction<4; direction++)
			{
				if (this.directions[direction] && this.neighbors[direction]!=null && this.neighbors[direction].directions[constants.opposite[direction]])
				{
					this.neighbors[direction].light();
				}
			}
		}
	}
}

function Board(width,height)
{
	this.pr = 0;

	this.width=width;
	this.height=height;
	this.numCells=width*height;
	this.genCount=0;
	this.genNextList=new Array();
	this.cells = new Array();
	var y;
	var x;

	for(y=0;y<height;++y)
	{
		this.cells.push(new Array());
		for(x=0;x<width;++x)
		{
			this.cells[y].push(new Cell(x,y));
            if(y>0)
            {
                this.cells[y][x].neighbors[0]=this.cells[y-1][x];
                this.cells[y-1][x].neighbors[2]=this.cells[y][x];
            }
            if(x>0)
            {
                this.cells[y][x].neighbors[3]=this.cells[y][x-1];
                this.cells[y][x-1].neighbors[1]=this.cells[y][x];
            }
		}
	}

	this.setCellSelected = function (x,y,value)
	{
	    this.getCell(x,y).selected=value;
	    this.getCell(x,y).update();
	}

	this.turnCell = function (x,y)
	{
		if(this.getCell(x,y).locked) return;
		this.getCell(x,y).rotateCW();
		this.light();
		if(this.getLitCount() == this.numCells) 
		{
			this.setCellSelected(x,y,false);
			clearInterval(globals.timerId);
			setGameState("solved");
		}
		this.update();
	}

	this.getCell=function(x,y)
	{
		return(this.cells[y][x]);
	}

	this.getLitCount=function()
	{
		var result=0;
		for(var y=0;y<this.height;++y)
		{
			for(var x=0;x<this.width;++x)
			{
				if(this.getCell(x,y).lit) result++;
			}
		}
		return(result);
	}

	this.clearLights=function()
	{
		for(var y=0;y<this.height;++y)
		{
			for(var x=0;x<this.width;++x)
			{
				this.getCell(x,y).lit=false;
			}
		}
	}

	this.update=function()
	{
		for(var y=0;y<this.height;++y)
		{
			for(var x=0;x<this.width;++x)
			{
				this.getCell(x,y).update();
			}
		}
	}

	this.scramble=function()
	{
		for(var y=0;y<this.height;++y)
		{
			for(var x=0;x<this.width;++x)
			{
				this.getCell(x,y).scramble();
			}
		}
	}

	this.light=function()
	{
		this.clearLights();
		this.getCell(Math.floor(this.width/2),Math.floor(this.height/2)).light();
	}

	this.generate=function()
	{
		
		if (this.genCount == 0)
		{
			// set first lit cell if not already have
			var x=Math.floor(Math.random()*this.width);
			var y=Math.floor(Math.random()*this.height);
			this.getCell(x,y).lit=true;
			this.genNextList.push([x, y]);
			this.genCount++;
			// pass through
		}

		for(i=0;i<10000;i++)
		{
			if(this.genCount < this.numCells)
			{
				r = Math.floor(Math.random()*this.genNextList.length);
				x = this.genNextList[r][0];
				y = this.genNextList[r][1];
				//if(++this.pr < 10) alert(x + " " + y); // debug (generate message for <10 times)

				var passable=new Array(4);
				var found=false;
				for(direction=0; direction<4; direction++)
				{
					if(this.getCell(x,y).neighbors[direction]==null) continue;
					if(this.getCell(x,y).neighbors[direction].lit) continue;
					passable[direction]=true;
					found=true;
				}
				if(found)
				{
					if (direction.length == 1) this.genNextList[r] = this.genNextList.pop();
					do {
							direction=Math.floor(Math.random()*passable.length);
					} while(!passable[direction]);
					this.getCell(x,y).directions[direction]=true;
					x+=constants.deltaX[direction];
					y+=constants.deltaY[direction];
					direction=constants.opposite[direction];
					this.getCell(x,y).directions[direction]=true;
					this.getCell(x,y).lit=true;
					this.genNextList.push([x, y]);
					this.genCount++;
				}
				else
				{
					if (direction.length == 1) this.genNextList[r] = this.genNextList.pop();
				}
			}
			else
			{
				return(true);
			}
		}
		return(true);
	}
}

generator["generate"]=function()
{
	var result="Generating Board...."+Math.floor(globals.board.genCount*100/globals.board.numCells)+"%";
	setTimeout("generate()",0);
	return(result);
}

function incrementTimer()
{
	globals.timer++;
	document.getElementById("timer").innerHTML="Time: "+globals.timer;
}

function generate()
{
	if (globals.board.genCount >= globals.board.numCells)
	{
		//globals.board.clearLights();
		globals.board.scramble();
		globals.board.light();
		setGameState("play");
		//globals.board.update();
		globals.timer=0;
		globals.timerId=setInterval("incrementTimer();",1000);
	}
	else
	{
		while(!globals.board.generate()){}
		refreshGameState();
	}
}

function startGame()
{
	var size=Number(document.getElementById("boardSize").value);
	globals.board=new Board(size,size);
	globals.board.genCount=0;
	globals.board.genNextList=[];
	setGameState("generate");
}

generator["solved"]=function()
{
	var result="";
	var size=globals.tileset.size;
	for(var y=0;y<globals.board.height;++y)
	{
		for(var x=0;x<globals.board.width;++x)
		{
			value = globals.board.getCell(x,y).getValue();
			result += '<div class="tile" style="left: ' + (x*size) + 'px; top: ' + (y*size) + 
					'px; background-position: ' + (-(value&15)*size) + 'px ' + (-Math.floor(value/16)*size) +
					'px;" id="cell_'+x+'_'+y+'" onclick="clickCell('+x+","+y+
					",event);\" onmouseover=\"globals.board.setCellSelected("+x+","+y+
					",true);\" onmouseout=\"globals.board.setCellSelected("+x+","+y+
					",false)\"></div>";
		}
	}
	result+="<div style=\"position:absolute;top:"+globals.board.height*size+"\">";
	result+="<p id=\"timer\">Total Time: "+globals.timer+"</p>";
    result+="<p>Play again?<button onclick=\"setGameState('start');\">Yes</button><button onclick=\"setGameState('confirmquit');\">No</button></p>";
	result+="</div>";
	return(result);
}

generator["start"]=function()
{
	var result="";
	result+="<p>Select Board Size:";
	result+="<select id=\"boardSize\">";
	for(var index=constants.minimumBoardSize;index<=constants.maximumBoardSize;++index)
	{
		result+="<option value=\""+index+"\""+((globals.board!=null&&index==globals.board.width)?(" selected"):(""))+">"+index+"x"+index;
	}
	result+="</select>";
	result+="<button onclick=\"startGame();\">Start Game</button>";
	result+="</p>";
	return(result);
}
setGameState("title");