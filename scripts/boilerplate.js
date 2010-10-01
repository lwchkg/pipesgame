var constants = {};
var globals = {};
globals.errorMessage="";
var gameContent = document.getElementById("gameContent");
var gameState="";
var generator = {};
function generateDefaultContent()
{
    return("TODO: "+gameState);
}
function refreshGameState()
{
    var content = "";
    if(globals.errorMessage!="")
    {
        content+="<p>"+globals.errorMessage+"</p>";
        globals.errorMessage="";
    }
    if(generator[gameState]!=null)
    {
        content+=generator[gameState]();
    }
    else
    {
        content+=generateDefaultContent();
    }
    gameContent.innerHTML=content;
}
function setGameState(newGameState)
{
    gameState = newGameState;
    refreshGameState();
}
