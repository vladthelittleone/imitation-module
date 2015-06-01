#pragma strict

private var BUTTON_WIDTH: int = 100;
private var BUTTON_HEIGHT: int = 60;

public var skin: GUISkin;

function OnGUI()
{	
	GUI.skin = skin;
	
	var textBX: int = (Screen.width - BUTTON_WIDTH) /2;
	var textBY: int =  Screen.height / 2 + 200;
	
	if(GUI.Button(
		new Rect(
			textBX,
			textBY,
			BUTTON_WIDTH,
			BUTTON_HEIGHT),
			"Назад"))
	{
		Application.LoadLevel("MenuScene");
	}
}