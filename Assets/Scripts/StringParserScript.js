#pragma strict

private var NUMBER_COUNT = 6;   

public var commands : int[ , ];
public var imitationDelaySec : int;
public var objectAngel : int;
public var initialVelocity : int;
public var interference : int;
public var heightPlane : long;
public var distanceBetweenPlane : float;
public var amountOfPlane : int;
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

function Update () {

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
	if (commands[0, 0] != 0 && commands[0, 1] != 0) 
	{
		Application.LoadLevel("MenuScene"); // "MenuScene" is the scene name
	}
	
	imitationDelaySec = 10 * ((10 * commands[0, 2]) + commands[0, 3]);
	
	if (imitationDelaySec > 300)
	{
		Application.LoadLevel("MenuScene"); // "MenuScene" is the scene name
	}
	
	objectAngel = 10 * ((10 * commands[0, 4]) + commands[0, 5]);
	
	if (objectAngel > 360) 
	{
		Application.LoadLevel("MenuScene"); // "MenuScene" is the scene name
	}
}

// First command
private function parseFirstCommand()
{
	if (commands[1, 0] != 1) 
	{
		Application.LoadLevel("MenuScene"); // "MenuScene" is the scene name
	}
	
	initialVelocity = 10 * ((100 * commands[1, 1]) + (10 * commands[1, 2]) + commands[1, 3]);
	
	if (initialVelocity > 2000)
	{
		Application.LoadLevel("MenuScene"); // "MenuScene" is the scene name
	}
	
	interference = (10 * commands[1, 4]) + commands[1, 5];
}

// 2-command
private function parseSecondCommand()
{
	if(commands[2,0] != 2)
	{
		Application.LoadLevel("MenuScene"); // "MenuScene" is the scene name	
	}
	
	heightPlane = 100 * (commands[2,1] * 100 + commands[2,2] * 10 + commands[2,3]);
	
	if(heightPlane > 50000)
	{
		Application.LoadLevel("MenuScene"); // "MenuScene" is the scene name
	}
	
	switch(commands[2,4])
	{
		case 1:
			distanceBetweenPlane = 1.6;
			break;
		case 2:
			distanceBetweenPlane = 3.2;
			break;
		case 3:
			distanceBetweenPlane = 6.4;
			break;
		default:
			Application.LoadLevel("MenuScene"); // "MenuScene" is the scene name
			break;
	}
	
	amountOfPlane = commands[2,5];
	
	if(amountOfPlane > 7)
	{
		Application.LoadLevel("MenuScene"); // "MenuScene" is the scene name
	}
}

// 3-command
private function parseThirdCommand()
{
	if(commands[3,0] != 3)
	{
		Application.LoadLevel("MenuScene"); // "MenuScene" is the scene name	
	}
	
	if( (commands[3,1] != 0) || (commands[3,2] != 0) || (commands[3,3] != 0))
	{
		Application.LoadLevel("MenuScene"); // "MenuScene" is the scene name	
	}
	
	specularSurface = commands[3,4] + commands[3,5] * 0.1;
	
	if(specularSurface > 9)
	{
		Application.LoadLevel("MenuScene"); // "MenuScene" is the scene name	
	}
}