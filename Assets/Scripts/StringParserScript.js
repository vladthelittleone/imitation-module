#pragma strict

// 0 0 3 0 3 0
// 1 0 0 1 9 9
// 2 0 0 1 1 1
// 3 0 0 0 9 9
// 0 0 3 0 3 0
// 1 0 0 1 9 9
// 2 0 0 1 1 1
// 3 0 0 0 9 9

private var NUMBER_COUNT = 6;   
private var commands : int[ , ];

private var parser: StringParserScript;
private var state: int;

private var START: int = 0;
private var ACTION: int = 1;

public var imitationDelaySec : int;
public var objectAngel : int;
public var initialVelocity : int;
public var interference : int;
public var heightPlane : long;
public var distanceBetweenPlanes : float;
public var countOfPlanes : int;
public var specularSurface : float; 

function Start () 
{	
	var training : String = PlayerPrefs.GetString("Training");
	var splited : String[] = training.Split([" ", "\n"], System.StringSplitOptions.None);
	
	if ((splited.length % NUMBER_COUNT) != 0)
	{
		Application.LoadLevel("MenuScene"); // "MenuScene" is the scene name
	}
	
	var size : int = splited.length / NUMBER_COUNT; 
	
	parseSplitedArray(splited);
}

function Update () 
{
 	if (state == START)
	{
		Debug.Log(imitationDelaySec);
		
	}
	
	state = ACTION;
	
	transform.Translate (0.0001,0,0);
}

private function parseSplitedArray(splited : String[])
{
	var size : int = splited.length / NUMBER_COUNT; 
	
	if (size < 4)
	{
		Application.LoadLevel("MenuScene"); // "MenuScene" is the scene name
	}
	
	commands = new int[size, NUMBER_COUNT];
	
	for (var i = 0; i < size; i++)
	{
		for (var j = 0; j < NUMBER_COUNT; j++)
		{
			var tmp : int = parseInt(splited[(i * NUMBER_COUNT) + j]);
			
			if (tmp < 0)
			{
				Application.LoadLevel("MenuScene"); // "MenuScene" is the scene name
			}
			
			commands[i, j] = tmp;
		}
	}
	
	initialSettings();
}

// Initial settings
private function initialSettings()
{
	parseZeroCommand();
	parseFirstCommand();
	parseSecondCommand();
	parseThirdCommand();
}

// Zero command
private function parseZeroCommand()
{
	if (commands[0, 0] != 0 || commands[0, 1] != 0) 
	{
		Debug.Log("Invalid zero command");
		Application.LoadLevel("MenuScene"); // "MenuScene" is the scene name
	}
	
	imitationDelaySec = 10 * ((10 * commands[0, 2]) + commands[0, 3]);
	
	if (imitationDelaySec > 300)
	{
		Debug.Log("To large imitation delay");
		Application.LoadLevel("MenuScene"); // "MenuScene" is the scene name
	}
	
	objectAngel = 10 * ((10 * commands[0, 4]) + commands[0, 5]);
	
	if (objectAngel > 360) 
	{
		Debug.Log("To large angel");
		Application.LoadLevel("MenuScene"); // "MenuScene" is the scene name
	}
}

// First command
private function parseFirstCommand()
{
	if (commands[1, 0] != 1) 
	{
		Debug.Log("Invalid first command");
		Application.LoadLevel("MenuScene"); // "MenuScene" is the scene name
	}
	
	initialVelocity = 10 * ((100 * commands[1, 1]) + (10 * commands[1, 2]) + commands[1, 3]);
	
	if (initialVelocity > 2000)
	{
		Debug.Log("To large velocity");
		Application.LoadLevel("MenuScene"); // "MenuScene" is the scene name
	}
	
	interference = (10 * commands[1, 4]) + commands[1, 5];
}

// 2-command
private function parseSecondCommand()
{
	if(commands[2, 0] != 2)
	{
		Debug.Log("Invalid second command");
		Application.LoadLevel("MenuScene"); // "MenuScene" is the scene name	
	}
	
	heightPlane = 100 * (commands[2, 1] * 100 + commands[2, 2] * 10 + commands[2, 3]);
	
	if(heightPlane > 50000)
	{
		Debug.Log("Height large");
		Application.LoadLevel("MenuScene"); // "MenuScene" is the scene name
	}
	
	switch(commands[2, 4])
	{
		case 1:
			distanceBetweenPlanes = 1.6;
			break;
		case 2:
			distanceBetweenPlanes = 3.2;
			break;
		case 3:
			distanceBetweenPlanes = 6.4;
			break;
		default:
			Debug.Log("Invalid distance");
			Application.LoadLevel("MenuScene"); // "MenuScene" is the scene name
			break;
	}
	
	countOfPlanes = commands[2,5];
	
	if(countOfPlanes > 7)
	{
		Debug.Log("To large count of planes");
		Application.LoadLevel("MenuScene"); // "MenuScene" is the scene name
	}
}

// 3-command
private function parseThirdCommand()
{
	if(commands[3, 0] != 3)
	{
		Debug.Log("Invalid third command");
		Application.LoadLevel("MenuScene"); // "MenuScene" is the scene name	
	}
	
	if( (commands[3,1] != 0) || (commands[3,2] != 0) || (commands[3,3] != 0))
	{	
		Debug.Log("Invalid command 3");
		Application.LoadLevel("MenuScene"); // "MenuScene" is the scene name	
	}
	
	specularSurface = commands[3, 4] + commands[3, 5] * 0.1;
	
	if(specularSurface > 9.9f)
	{
		Debug.Log("To large specular force");
		Application.LoadLevel("MenuScene"); // "MenuScene" is the scene name	
	}
}