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
	this.game_content = document.getElementById("gameContent");
	this.menu_placeholder = document.getElementById("menu_placeholder");
	this.tileset_loading = document.getElementById("loading_images");
	this.ctx = document.getElementById("gameContent").getContext('2d');

	this.tileImage = new Image();
	this.tileImage.onload = createDelegate(this._replaceTileset, this);

	this.replaceTileset();
}

board_pro.prototype = {
	hsize: 0,
	vsize: 0,

	getXY: function(x, y) {
		var h = globals.tileset.h;
		var v = globals.tileset.v;
		return [Math.floor(x/h), Math.floor(y/v)];
	},

	refreshPiece: function(x, y, caller) {
		var ix = caller.pieces[x][y];
		var iy = caller.states[x][y];
		var h = globals.tileset.h;
		var v = globals.tileset.v;

		if (ix != this.oldpieces[x][y] || iy != this.oldstates[x][y]) {
			this.ctx.drawImage(this.tileImage, ix*h, iy*v, h, v, x*h, y*v, h, v);
			this.oldpieces[x][y] = ix;
			this.oldstates[x][y] = iy;
		}
	},

	refresh: function(caller) {
		var hsize = caller.hsize;
		var vsize = caller.vsize;

		var h = globals.tileset.h;
		var v = globals.tileset.v;

		if (hsize == this.hsize && vsize == this.vsize) {
		// if size is okay, only redraw needed tiles
			for (var y=0; y < vsize; y++) {
				for (var x=0; x < hsize; x++) {
					var ix = caller.pieces[x][y];
					var iy = caller.states[x][y];
					if (ix != this.oldpieces[x][y] || iy != this.oldstates[x][y]) {
						this.ctx.drawImage(this.tileImage, ix*h, iy*v, h, v, x*h, y*v, h, v);
						this.oldpieces[x][y] = ix;
						this.oldstates[x][y] = iy;
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

			this.game_content.width = hsize * h;
			this.game_content.height = vsize * v;

			for (var y=0; y<vsize; y++) {
				for (var x=0; x<hsize; x++) {
					var ix = caller.pieces[x][y];
					var iy = caller.states[x][y];

					this.ctx.drawImage(this.tileImage, ix*h, iy*v, h, v, x*h, y*v, h, v);
					this.oldpieces[x][y] = caller.pieces[x][y];
					this.oldstates[x][y] = caller.states[x][y];
				}
			}

			// Place menu placeholder at right place
			this.menu_placeholder.style.left = (hsize*h) + 'px'

			this.hsize = hsize;
			this.vsize = vsize;
		}
	},

	replaceTileset: function(n) {
		if (typeof(n) != "undefined") globals.tileset = globals.tilesets[n];
		this.tileset_loading.style.display = "";
		this.tileImage.src = "images/" + globals.tileset.filename;
	},

	_replaceTileset: function(n) {
		this.tileset_loading.style.display = "none";

		var hsize = this.hsize;
		var vsize = this.vsize;

		var h = globals.tileset.h;
		var v = globals.tileset.v;

		this.game_content.width = hsize * h;
		this.game_content.height = vsize * v;

		if (hsize) {
			for (var y=0; y<vsize; y++) {
				for (var x=0; x<hsize; x++) {
					var ix = this.oldpieces[x][y];
					var iy = this.oldstates[x][y];

					this.ctx.drawImage(this.tileImage, ix*h, iy*v, h, v, x*h, y*v, h, v);
				}
			}
			this.menu_placeholder.style.left=(hsize * h) + "px";
		}
	},

	scrollTo: function(x, y) {
		var h = globals.tileset.h;
		var v = globals.tileset.v;
		var wh = window.innerWidth || document.body.parentElement.clientWidth;
		var wv = window.innerHeight || document.body.parentElement.clientHeight;

		window.scrollTo(x*h - (wh - h - 200)/2, y*v - (wv - v)/2);
	}
}

