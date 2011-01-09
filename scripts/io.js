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

io = {
	loadgame: function(savestr) {
		var buf = savestr.split("&");
		var savedata = {};
		for (var i in buf) {
			var buf1 = buf[i].split("=");
			if (buf1.length != 2) return false;
			savedata[decodeURIComponent(buf1[0])] = decodeURIComponent(buf1[1]);
		}
		pipes_logic.load(savedata);
	},

	loadPrompt: function() {
		var i;

		var str = prompt("Paste the URL below to load a game:\n(If you cannot load the game in IE, paste the URL here.)", "");
		if (!str) return false;

		if ((i = str.indexOf("?")) >= 0) str = str.substr(i+1);
		if ((i = str.indexOf("#")) >= 0) str = str.substr(0, i+1);
		this.loadgame(str);
	},

	savegame: function() {
		var savedata = {};
		if (!pipes_logic.save(savedata)) return false;

		// mini serializer
		var savestr = "";
		var first = true;
		for (var key in savedata) {
			if (first)
				first = false;
			else
				savestr += "&";
			savestr += encodeURIComponent(key) + "=" + encodeURIComponent(savedata[key]);
		}
		return savestr;
	},

	saveToBookmarks: function() {
		var url = this.savegame();
		if (!url) return;

		url = window.location.protocol + "//" + window.location.host + window.location.pathname + "?" + url;
		if (window.innerHeight || url.length <= 2083) {
			var title = "Pipes Game - " + (new Date());
			if (window.sidebar)
				window.sidebar.addPanel(title, url, "");
			else if (window.external)
				window.external.AddFavorite(url, title);
			else if(window.opera && window.print) { 
				var e=document.createElement('a');
				e.setAttribute('href',url);
				e.setAttribute('title',name);
				e.setAttribute('rel','sidebar');
				e.click();
			}
		}
		else
			// Cannot save due to IE max url length limit (2083 chars)
			alert("Pipes Game Error:\nCannot create bookmark with more than 2083 characters in IE.\n\nPress \"Save to Clipboard\" instead.");
	},

	saveToClipboard: function() {
		var url = this.savegame();
		if (!url) return;

		url = window.location.protocol + "//" + window.location.host + window.location.pathname + "?" + url;

		if (1) {
			prompt("Copy the URL below to clipboard:", url);
		}
	}
}