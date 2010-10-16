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

function board_pro() {
	this.replaceTileset_setStylesheet();
}
board_pro.prototype = {
	hsize: 0,
	vsize: 0,

	refreshPiece: function(x, y, caller) {
		var i = caller.pieces[x][y];
		var j = caller.states[x][y];
		var h = globals.tileset.h;
		var v = globals.tileset.v;
		if (i != this.oldpieces[x][y] || j != this.oldstates[x][y]) {
			tiles[x][y].style.backgroundPosition = (-i*h) + 'px ' + (-j*v) + 'px';
			this.oldpieces[x][y] = i;
			this.oldstates[x][y] = j;
		}
	},

	refresh: function(caller) {
		var hsize = caller.hsize;
		var vsize = caller.vsize;

		if (hsize == this.hsize && vsize == this.vsize) {
		// if size is okay, set style of all tiles
			var h = globals.tileset.h;
			var v = globals.tileset.v;
			for (var y=0; y < vsize; y++) {
				for (var x=0; x < hsize; x++) {
					var i = caller.pieces[x][y];
					var j = caller.states[x][y];
					if (i != this.oldpieces[x][y] || j != this.oldstates[x][y]) {
						tiles[x][y].style.backgroundPosition = (-i*h) + 'px ' + (-j*v) + 'px';
						this.oldpieces[x][y] = i;
						this.oldstates[x][y] = j;
					}
				}
			}
		} else {
		// if size is not okay, redraw the whole board
			this.oldpieces = new Array(hsize);
			this.oldstates = new Array(hsize);

			for (var x=0; x < hsize; x++) {
				this.oldpieces[x] = new Array(vsize);
				this.oldstates[x] = new Array(vsize);
			}

			var h = globals.tileset.h;
			var v = globals.tileset.v;

			var s = "";
			for (var y=0; y<vsize; y++) {
				for (var x=0; x<hsize; x++) {
					var ix = caller.pieces[x][y];
					var iy = caller.states[x][y];
					s += '<div id="tile_'+x+'_'+y+'" class="t" style="left: ' + (x*h) + 'px; top: ' + (y*v) + 'px; background-position: ' + (ix * -h) + 'px ' + (iy * -v) + 'px"></div>';

					this.oldpieces[x][y] = caller.pieces[x][y];
					this.oldstates[x][y] = caller.states[x][y];
				}
			}
			// Hidden div to allocate space for menu
			s += '<div id="menu_placeholder" class="t1" style="left: ' + (hsize*h) + 'px; "></div>';

			document.getElementById("gameContent").innerHTML = s;

			tiles = new Array(hsize);
			for (var x=0; x<hsize; x++) {
				tiles[x] = new Array(vsize);
			}

			for (var d = document.getElementById("gameContent").firstChild;
				d; d = d.nextSibling) {
				var d1 = d.id.split("_");
				if (d1[0] == "tile") {
					tiles[parseInt(d1[1])][parseInt(d1[2])] = d;
				} else if (d1[0] = "menu")
					menu_placeholder = d;
			}

			this.hsize = hsize;
			this.vsize = vsize;
		}
	},

	replaceTileset_setStylesheet: function() {
		var h = globals.tileset.h;
		var v = globals.tileset.v;

		var s = document.styleSheets[0];
		if (s.cssRules) {
			while (s.cssRules.length) s.deleteRule(0);
		} else {
			while (s.rules.length) s.removeRule(0);
		}
		
		var str = "width: "+h+"px; height: "+v+"px; background-image:url('images/"+ globals.tileset.filename +"');";
		if (s.insertRule) {
			s.insertRule(".t {" + str + "}", 0);
		} else {
			s.addRule(".t", str, 0);
		}
	},

	replaceTileset: function(n) {
		globals.tileset = globals.tilesets[n];
		this.replaceTileset_setStylesheet();

		var hsize = this.hsize;
		var vsize = this.vsize;

		var h = globals.tileset.h;
		var v = globals.tileset.v;

		for (var y=0; y<vsize; y++) {
			for (var x=0; x<hsize; x++) {
				var i = this.oldpieces[x][y];
				var j = this.oldstates[x][y];

				var t = tiles[x][y];
				t.style.left = (x * h) + "px";
				t.style.top = (y * v) + "px";
				t.style.backgroundPosition = (-i*h) + 'px ' + (-j*v) + 'px';
			}
		}
		
		if (hsize) menu_placeholder.style.left=(hsize * h) + "px";
	},

	scrollTo: function(x, y) {
		var h = globals.tileset.h;
		var v = globals.tileset.v;
		var wh = window.innerWidth || document.body.parentElement.clientWidth;
		var wv = window.innerHeight || document.body.parentElement.clientHeight;

		window.scrollTo(x*h - (wh - h - 200)/2, y*v - (wv - v)/2);
	}
}

