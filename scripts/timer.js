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

startTime = 0;
timerEvent = 0;

function startTimer() {
	stopTimer();
	document.getElementById("timer").innerHTML = "00:00:00";
	startTime = new Date().getTime();
	timerEvent = setInterval("updateTimer()", 1000);
}

function updateTimer() {
	var t = new Date().getTime() - startTime;
	t = Math.round(t/1000);

	var sec = t % 60;
	t = Math.floor(t/60);
	var min = t % 60;
	var hour = Math.floor(t/60);

	document.getElementById("timer").innerHTML =
			(hour < 10 ? "0" : "") + hour + ":" +
			(min < 10 ? "0" : "") + min + ":" +
			(sec < 10 ? "0" : "") + sec;
}

function stopTimer() {
	if (timerEvent) {
		clearInterval(timerEvent);
		timerEvent = 0;
	}
}