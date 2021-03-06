﻿#pragma strict

/// <summary>
/// Title screen script
/// </summary>

public var text:String = "";

public var TEXT_AREA_WIDTH:int = 512;
public var TEXT_AREA_HEIGHT:int = 240;
public var BUTTON_HEIGHT:int = 60;
	
public var LABEL_WIDTH:int = 512;
public var LABEL_HEIGHT:int = 60;
public var LABLE_OFFSET:int = 70;

public var skin: GUISkin;

function OnGUI()
{
	var textAreaX: int = Screen.width / 2 - (TEXT_AREA_WIDTH / 2);
	var textAreaY: int = (2 * Screen.height / 3) - TEXT_AREA_HEIGHT;
	
	var labelX : int = Screen.width / 2 - (LABEL_WIDTH / 2);
	var labelY : int = textAreaY - LABLE_OFFSET;
	
	GUI.skin = skin;

	GUI.Label(
		new Rect(
			labelX ,
			labelY ,
			LABEL_WIDTH,
			LABEL_HEIGHT),
			"Модуль устройства имитации  КСА 86Ж6"
	);
	
	if (PlayerPrefs.GetString("ForMainMenu") != "")
	{
		text = PlayerPrefs.GetString("ForMainMenu");
	    PlayerPrefs.SetString("ForMainMenu", "");
	}
	
	text = GUI.TextArea (
	  // Center in X, 2/3 of the height in Y
	  new Rect (
	  textAreaX, 
	  textAreaY, 
	  TEXT_AREA_WIDTH, 
	  TEXT_AREA_HEIGHT), 
	  text, -1);
	  
	// Draw a button to start the game
	if (GUI.Button(
	  // Center in X, 2/3 of the height in Y
	  new Rect(
	  textAreaX, 
	  textAreaY + TEXT_AREA_HEIGHT + 10, 
	  TEXT_AREA_WIDTH / 2 - 10,  
	  BUTTON_HEIGHT),
	  "ВВОД"
	  ))
	{
	  if (!text.Equals(""))
	  {
	   	// On Click, load the first level.
	  	Application.LoadLevel("IndicatorScene"); // "IndicatorScene" is the scene name
	  	PlayerPrefs.SetString("Training", text); // Set pref for indicator game scene
	  }
	}
	
    // Draw a button to start the game
	if (GUI.Button(
	  // Center in X, 2/3 of the height in Y
	  new Rect(
	  textAreaX + TEXT_AREA_WIDTH / 2 + 10, 
	  textAreaY + TEXT_AREA_HEIGHT + 10, 
	  TEXT_AREA_WIDTH / 2 - 10, 
	  BUTTON_HEIGHT),
	  "Справка"
	))
	  
	{
	  // On Click, clear text area.
	  Application.LoadLevel("ReferenceScene");
	  PlayerPrefs.SetString("Training", text);
	}
	
	var error : String = PlayerPrefs.GetString("Error");
	
	if (error != "")
	{
		GUI.Label(new Rect(
		labelX,
		textAreaY + TEXT_AREA_HEIGHT + 100, 
		512, 80),"Ошибка:" + error);
	}
	
}