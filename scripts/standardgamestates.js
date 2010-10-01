globals.title="TODO: globals.title";
generator["title"]=function ()
{
    var result = "";
    result += "<h1>"+globals.title+"</h1>";
    result += "<p><button onClick=\"setGameState('start');\">Start</button>";
    result += "<button onClick=\"setGameState('instructions');\">How To Play</button>";
    result += "<button onClick=\"setGameState('confirmquit');\">Quit</button></p>";
    return(result);
}
globals.instructions="TODO: globals.instructions";
generator["instructions"] = function ()
{
    var result = "";
    result += "<h2>How To Play "+globals.title+"</h2>";
    result += "<p>";
	result+=globals.instructions;
    result += "</p>";
    result += "<p><button onClick=\"setGameState('start');\">Ok</button>";
    result += "<button onClick=\"setGameState('confirmquit');\">Quit</button></p>";
    return(result);
}
generator["quit"] = function ()
{
    var result = "";
    result += "<p>Thank you for playing "+globals.title+".</p>";
    result += "<p><a href=\"../games.html\">Return to JavaScript Games</a></p>";
    return(result);
}
generator["confirmquit"] = function ()
{
    var result = "";
    result += "<h2>Are you sure you want to quit?</h2>";
    result += "<p><button onClick=\"setGameState('quit');\">Yes</button>";
    result += "<button onClick=\"setGameState('title');\">No</button></p>";
    return(result);
}


