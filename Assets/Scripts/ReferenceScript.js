#pragma strict

public var BUTTON_HEIGHT:int = 500;
public var BUTTON_WIDTH:int = 500;
public var skin: GUISkin;

function OnGUI()
{	
	GUI.skin = skin;
	var textBX: int = Screen.width / 2 + 450;
	var textBY: int =  Screen.height / 2 + 200;
	if(GUI.Button(
		new Rect(
		textBX,
		textBY,
		100,
		60
		),"Назад"
	))
	{
		Application.LoadLevel("MenuScene");
	}
}