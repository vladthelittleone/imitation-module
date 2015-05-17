#pragma strict

/// <summary>
/// Title screen script
/// </summary>

var text : String = "";
var skin : GUISkin = Resources.LoadAssetAtPath("Assets/Scripts/GUISkin.GUISkin",GUISkin);
function OnGUI()
{
	var textAreaWidth : int = 512;
	var textAreaHeight : int = 240;
	var buttonHeight : int = 60;

	var textAreaX : int = Screen.width / 2 - (textAreaWidth / 2);
	var textAreaY : int = (2 * Screen.height / 3) - textAreaHeight;
	
	var labelX : int = Screen.width / 2 - 275;
	var labelY : int = Screen.height / 4 - 200;
	
	GUI.skin = skin;
	//var style:GUIStyle;
	//style.fontSize = 20;
	GUI.Label(
		new Rect(
			labelX ,
			labelY ,
			550,
			200),
			"Модуль устройства имитации  КСА 86Ж6"
	);
	text = GUI.TextArea (
	  // Center in X, 2/3 of the height in Y
	  new Rect (
	  textAreaX, 
	  textAreaY, 
	  textAreaWidth, 
	  textAreaHeight), 
	  text, -1);
	  
	// Draw a button to start the game
	if (GUI.Button(
	  // Center in X, 2/3 of the height in Y
	  new Rect(
	  textAreaX, 
	  textAreaY + textAreaHeight, 
	  textAreaWidth / 2, 
	  buttonHeight),
	  "START"
	  ))
	{
	  // On Click, load the first level.
	  PlayerPrefs.SetString("Training", text); // Set pref for indicator game scene
	  Application.LoadLevel("IndicatorScene"); // "IndicatorScene" is the scene name
	}
	
    // Draw a button to start the game
	if (GUI.Button(
	  // Center in X, 2/3 of the height in Y
	  new Rect(
	  textAreaX + textAreaWidth / 2, 
	  textAreaY + textAreaHeight, 
	  textAreaWidth / 2, 
	  buttonHeight),
	  "CLEAR"
	  ))
	{
	  // On Click, clear text area.
	  text = "";
	}
}