/*
The Pipes Game
Copyright (C) 2010  WC Leung

This file is part of The Pipes Game.

The Pipes Game is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

The Pipes Game is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with The Pipes Game.  If not, see <http://www.gnu.org/licenses/>.
*/

function pipes_logic_pro() {
}
pipes_logic_pro.prototype = {

	minsize: 1,
	maxsize: 100,

	cx: 0,
	cy: 0,

	cursorx: -1,
	cursory: -1,

	vsize: 0,
	hsize: 0,

	// Tag piece
	tagPiece: function(x, y, norefresh) {
		if (typeof x == 'undefined') x = this.cursorx;
		if (typeof y == 'undefined') y = this.cursory;

		if (x >= 0 && x < this.hsize && y >= 0 && y <= this.vsize) {
			this.states[x][y] |= 2;
			if (!norefresh) board.refreshPiece(x, y, this);
		}
	},

	// Untag piece
	untagPiece: function(x, y, norefresh) {
		if (typeof x == 'undefined') x = this.cursorx;
		if (typeof y == 'undefined') y = this.cursory;

		if (x >= 0 && x < this.hsize && y >= 0 && y <= this.vsize) {
			this.states[x][y] &= 0xd;
			if (!norefresh) board.refreshPiece(x, y, this);
		}
	},

	// Toggle tag/untag status of piece
	togglePiece: function(x, y, norefresh) {
		if (typeof x == 'undefined') x = this.cursorx;
		if (typeof y == 'undefined') y = this.cursory;

		if (x >= 0 && x < this.hsize && y >= 0 && y <= this.vsize) {
			this.states[x][y] ^= 2;
			if (!norefresh) board.refreshPiece(x, y, this);
		}
	},

	// Set cursor
	setCursor: function(x, y) {
		if (this.cursorx != x || this.cursory != y) {
			var hsize = this.hsize;
			var vsize = this.vsize;

			if (this.cursorx >= 0 && this.cursorx < hsize && this.cursory >= 0 && this.cursory <= vsize) {
				this.states[this.cursorx][this.cursory] &= 0xfb;
				board.refreshPiece(this.cursorx, this.cursory, this)
			}

			if (x >= 0 && x < hsize && y >= 0 && y <= vsize) {
				this.states[x][y] |= 4;
				board.refreshPiece(x, y, this)
			}

			this.cursorx = x;
			this.cursory = y;
		}
	},

	// Move cursor
	moveCursor: function(deltax, deltay) {
		var hsize = this.hsize;
		var vsize = this.vsize;
		var cursorx = this.cursorx;
		var cursory = this.cursory;

		if (cursorx >= 0 && cursorx < hsize && cursory >= 0 && cursory <= vsize) {
			this.setCursor((cursorx + deltax + hsize) % hsize, (cursory + deltay + vsize) % vsize);
		} else {
			this.setCursor(0, 0);
		}
		board.scrollTo(this.cursorx, this.cursory);
	},

	// Light pipes and determine if the game is won
	light: function(cx, cy, norefresh) {
		if (typeof cx == "undefined") {
			cx = this.cx;
		} else {
			this.cx = cx;
		}

		if (typeof cy == "undefined") {
			cy = this.cy;
		} else {
			this.cy = cy;
		}

		var hsize = this.hsize;
		var vsize = this.vsize;

		for (var x=0; x < hsize; x++) {
			for (var y=0; y < vsize; y++) {
				this.states[x][y] &= 0xe;
			}
		}

		var lighted = 0;
		var lightList = new Array(hsize * vsize);
		lightList[0] = (cy << 8) + cx;
		var lightCount = 1;

		while (lightCount) {
			lighted++;

			lightCount--;
			var c = lightList[lightCount];
			var x = c & 0xff;
			var y = c >>> 8;
			this.states[x][y] |= 1;

			if (y > 0 && this.pieces[x][y] & 1 &&
					this.pieces[x][y-1] & 4 && !(this.states[x][y-1] & 1)) {
				lightList[lightCount] = (y-1 << 8) + x;
				lightCount++;
			}
			if (x < hsize-1 && this.pieces[x][y] & 2 &&
					this.pieces[x+1][y] & 8 && !(this.states[x+1][y] & 1)) {
				lightList[lightCount] = (y << 8) + x+1;
				lightCount++;
			}
			if (y < vsize-1 && this.pieces[x][y] & 4 &&
					this.pieces[x][y+1] & 1 && !(this.states[x][y+1] & 1)) {
				lightList[lightCount] = (y+1 << 8) + x;
				lightCount++;
			}
			if (x > 0 && this.pieces[x][y] & 8 &&
					this.pieces[x-1][y] & 2 && !(this.states[x-1][y] & 1)) {
				lightList[lightCount] = (y << 8) + x-1;
				lightCount++;
			}
		}

		if (lighted == hsize * vsize) {
			// won the game
			stopTimer();
			document.getElementById("timer").className = "won";
		}
		if (!norefresh) board.refresh(this);
		return lighted == hsize * vsize;
	},

	// Rotate piece
	rotatePiece: function(x, y, dir) {
		if (typeof x == 'undefined') x = this.cursorx;
		if (typeof y == 'undefined') y = this.cursory;

		if (x >= 0 && x < this.hsize && y >= 0 && y <= this.vsize) {
			var i = this.pieces[x][y];
			if (!dir)
				i = i << 1 & 0xf | i >>> 3;
			else
				i = i << 3 & 0xf | i >>> 1;
			this.pieces[x][y] = i;

			this.light();
		}
	},

	// Generate pipes maze
	// Note: generation now takes less than 1s for 100x100
	generate: function(hsize, vsize) {
		this.hsize = hsize;
		this.vsize = vsize;

		var size = hsize * vsize;
		var addList = new Array(size);

		var added = new Array(hsize);
		this.pieces = new Array(hsize);
		this.states = new Array(hsize);

		for (var x=0; x < hsize; x++) {
			added[x] = new Array(vsize);
			this.pieces[x] = new Array(vsize);
			this.states[x] = new Array(vsize);
			for (var y=0; y < vsize; y++) {
				this.states[x][y] = 0;
			}
		}

		var cx = Math.floor((Math.random()*.3 + .4) * hsize);
		var cy = Math.floor((Math.random()*.3 + .4) * vsize);
		this.cx = cx; this.cy = cy;

		addList[0] = (cy << 8) + cx;
		added[cx][cy] = true;
		// flag startup piece for adding the first connection later
		this.pieces[cx][cy] = 0x10;

		var addCount = 1;
		for (var connectedCount = 0; connectedCount < size; connectedCount++) {
			// get position from addList to add a connection
			var pos = Math.floor(Math.random() * addCount);
			var c = addList[pos];
			var x = c & 0xff;
			var y = c >>> 8;

			// add connection
			if (connectedCount) while (1) {
				var dir = Math.floor(Math.random() * 4);
				if (dir == 0) {
					if (y > 0 && this.pieces[x][y-1]) {
						this.pieces[x][y] |= 1;
						this.pieces[x][y-1] |= 4;
						break;
					}
				} else if (dir == 1) {
					if (x < hsize-1 && this.pieces[x+1][y]) {
						this.pieces[x][y] |= 2;
						this.pieces[x+1][y] |= 8;
						break;
					}
				} else if (dir == 2) {
					if (y < vsize-1 && this.pieces[x][y+1]) {
						this.pieces[x][y] |= 4;
						this.pieces[x][y+1] |= 1;
						break;
					}
				} else {
					if (x > 0 && this.pieces[x-1][y]) {
						this.pieces[x][y] |= 8;
						this.pieces[x-1][y] |= 2;
						break;
					}
				}
			}

			// remove the added item from addList
			addCount--;
			if (pos != addCount) addList[pos] = addList[addCount];

			// add nearby pieces to addList if not already added
			if (y > 0 && !added[x][y-1]) {
				addList[addCount] = (y-1 << 8) + x;
				added[x][y-1] = true;
				addCount++;
			}
			if (x < hsize-1 && !added[x+1][y]) {
				addList[addCount] = (y << 8) + x+1;
				added[x+1][y] = true;
				addCount++;
			}
			if (y < vsize-1 && !added[x][y+1]) {
				addList[addCount] = (y+1 << 8) + x;
				added[x][y+1] = true;
				addCount++;
			}
			if (x > 0 && !added[x-1][y]) {
				addList[addCount] = (y << 8) + x-1;
				added[x-1][y] = true;
				addCount++;
			}
		}
		// unflag startup piece
		this.pieces[cx][cy] &= 0xf;

	},

	scramble: function() {
		var hsize = this.hsize;
		var vsize = this.vsize;
		for (var x = 0; x < hsize; x++) {
			for (var y = 0; y < vsize; y++) {
				var d = Math.floor(Math.random() * 4);
				var i = this.pieces[x][y];
				i = i << d & 0xf | i >>> (4-d);
				this.pieces[x][y] = i;
			}
		}
	},

	// Save data in object obj. Only relevant properties are added
	save: function(obj) {
		var hsize = this.hsize;
		var vsize = this.vsize;

		if (this.hsize < 1 || this.vsize < 1) return false;
		props = ["hsize", "vsize", "cx", "cy", "cursorx", "cursory"];
		for (i in props) {
			obj[props[i]] = this[props[i]];
		}

		var pieces = "";
		var states = "";
		for (var y = 0; y < vsize; y++) {
			for (var x = 0; x < hsize; x++) {
				pieces += this.pieces[x][y].toString(16);
				states += this.states[x][y].toString(16);
			}
			if (y + 1 < vsize) {
				pieces += "_";
				states += "_";
			}
		}

		obj.pieces = pieces;
		obj.states = states;
		return true;
	},

	load: function(obj) {
		var hsize, vsize, cx, cy, cursorx, cursory, pieces_l, states_l
		// validate data
		try {
			hsize = parseInt(obj.hsize);
			if (hsize < this.minsize || hsize > this.maxsize)
				throw ("hsize is invalid");

			vsize = parseInt(obj.hsize);
			if (vsize < this.minsize || vsize > this.maxsize)
				throw ("vsize is invalid");

			cx = parseInt(obj.cx);
			if (cx < 0 || cx >= hsize)
				throw ("cx is invalid");

			cy = parseInt(obj.cy);
			if (cy < 0 || cy >= vsize)
				throw ("cy is invalid");

			cursorx = parseInt(obj.cursorx);
			if (cursorx < -1 || cursorx >= hsize)
				throw ("cursorx is invalid");

			cy = parseInt(obj.cy);
			if (cursory < -1 || cursory >= vsize)
				throw ("cursory is invalid");

			pieces_l = obj.pieces.split("_");
			if (pieces_l.length != vsize)
				throw ("pieces contains an incorrect number of lines");

			states_l = obj.states.split("_");
			if (states_l.length != vsize)
				throw ("states contains an incorrect number of lines");

			var pieces_check = new RegExp("^[0-9a-f]{" + hsize + "}$");
			var states_check = new RegExp("^[0-9a-f]{" + hsize + "}$");

			for (var i=0; i<vsize; i++) {
				if (!pieces_check.test(pieces_l[i]))
					throw ("pieces contains an error in line " + i);
				if (!states_check.test(states_l[i]))
					throw ("states contains an error in line " + i);
			}
		} catch(e) {
			// validate fail: alert and quit
			alert("Unable to load save data.\nReason: " + e + "\n\nYou may start a new game instead.\n\nIf you are using Internet Explorer, please press\n\"Load from URL\" and paste the URL there.");
			return false;
		}

		// write data after validation
		this.hsize = hsize;
		this.vsize = vsize;

		this.pieces = new Array(hsize);
		this.states = new Array(hsize);

		for (var x=0; x < hsize; x++) {
			this.pieces[x] = new Array(vsize);
			this.states[x] = new Array(vsize);
		}

		for (var y = 0; y < vsize; y++) {
			for (var x = 0; x < hsize; x++) {
				this.pieces[x][y] = parseInt(pieces_l[y].charAt(x), 16);
				this.states[x][y] = parseInt(states_l[y].charAt(x), 16);
			}
		}

		var won = this.light(cx, cy);
		this.setCursor(cursorx, cursory);
		this.moveCursor(0, 0);

		if (!won) {
			startTimer();
			document.getElementById("timer").className = "";
		}

		var form_sizeselect = document.getElementById("sizeselect");
		var form_hsize = document.getElementById("hsize");
		var form_vsize = document.getElementById("vsize");

		var size = hsize + "x" + vsize;

		for (i=0; i<form_sizeselect.options.length; i++) {
			if (size == form_sizeselect.options[i].value) {
				form_sizeselect.value = size;
				form_hsize.disabled = true;
				form_vsize.disabled = true;
				return true;
			}
		}

		form_sizeselect.value = "custom";
		form_hsize.value = hsize;
		form_vsize.value = vsize;
		form_hsize.disabled = false;
		form_vsize.disabled = false;

		return true;
	}
}
