#pragma strict

//0 0 0 1 3 0
//1 1 0 0 5 5
//2 1 0 0 2 2
//3 0 0 0 9 9
//4 1 1 1 0 1
//5 1 1 1 0 1

private var NUMBER_COUNT: int = 6; 
private var ONE_REVIEW: int = 10;
private var RATIO_VELOCITY: double = 0.000005;

private var state: int = START;

private var START: int = 0;
private var DELAY: int = 1;
private var IMITATION: int = 2;
  
private var commands : int[ , ];

private var timer : float;

public var aircraftVelocity : float;
private var direction : Vector3;

// Номер текущей команды
private var numberOfCommand : int = 3;

public var acceleration : float = 0;
public var altitudeAcceleration : float = 0;
public var altitudeAccelerationDirection : int = 0;
public var overload : int = 0;
public var durationSite : float = 0;

private var imitationDelaySec : int;
private var objectAngel : int;
private var initialVelocity : int;
private var countOfPlanes : int;

private var planeHeight : float;
private var interference : float;
private var specularSurface : float; 
private var distanceBetweenPlanes : float;

public var aircraftPrefab : GameObject;
  
function Awake()
{
	timer = Time.time;
}

function OnGUI() 
{
	GUI.color = new Color(0, 0, 0, 1f);;
    GUI.Label(new Rect(0, 0, 200, 20), "Высота цели: " + planeHeight);
}
 
function Start () 
{	
	var training : String = PlayerPrefs.GetString("Training");
	var splited : String[] = training.Split([" ", "\n"], System.StringSplitOptions.None);
	
	if ((splited.length % NUMBER_COUNT) != 0)
	{
		Debug.Log("Splited array length is incorrect " + splited.length % NUMBER_COUNT);
		Application.LoadLevel("MenuScene"); // "MenuScene" is the scene name
	}
	
	// Парсим команды
	parseSplitedArray(splited);
	
	// Инициализация начальной скоростью
	// Позднее скорость может меняться
	aircraftVelocity = initialVelocity;
	
	// Начальное направление самолета
	direction = Vector3(Mathf.Cos(objectAngel * Mathf.Deg2Rad), Mathf.Sin(objectAngel * Mathf.Deg2Rad), 0);
	direction.Normalize();
	
	// Устанавливаем видимость цели в зависимости от помех и ЭОП.
	var alpha : float = (specularSurface / 4.5f) * (1f - (interference / 99));
	
	Debug.Log("Initial alpha of object is " + alpha);
	
	for (var i = 0; i < countOfPlanes; i++)
	{
		var childObject : GameObject = Instantiate(aircraftPrefab) as GameObject;
 		childObject.transform.parent = transform;
 		childObject.transform.position = transform.position;
 		childObject.transform.position.x = transform.position.x + (i * distanceBetweenPlanes / 50);
 	}
 	
	var renderers : Component[] = GetComponentsInChildren(SpriteRenderer);
	for (var renderer : SpriteRenderer in renderers) {
			renderer.enabled = false;
			renderer.color = new Color(1f, 1f, 1f, alpha);
	}
}

function Update () 
{	
	// Устанавливаем позицию по нажатой кнопки мыши
	if(Input.GetMouseButtonDown(0) && state == START)
	{
		var p : Vector3 = GetComponent.<Camera>().main.ScreenToWorldPoint(Input.mousePosition);
		
		transform.position = new Vector3(p.x, p.y, 0);
		
		state = DELAY;
	}
	
	// Задержка начала имитации
	if (imitationDelaySec < Time.time - timer && state == DELAY)
	{
		Debug.Log("Cancle delay [" + imitationDelaySec + "] sec. Start imitation.");
		
		var renderers : Component[] = GetComponentsInChildren(SpriteRenderer);
		for (var renderer : SpriteRenderer in renderers) {
				renderer.enabled = true;
		}
			
		state = IMITATION;
	}
		
	if (state == IMITATION)
	{
	 	durationSite = durationSite - Time.deltaTime;
	
	 	tryExecuteNewCommand();
		
 		aircraftVelocity += Time.deltaTime * acceleration;
 		planeHeight += Time.deltaTime * altitudeAcceleration * altitudeAccelerationDirection;
	 	transform.Translate(Time.deltaTime * direction * aircraftVelocity * RATIO_VELOCITY);	
 	}
}

private function parseSplitedArray(splited : String[])
{
	// Количество комманд
	var size : int = splited.length / NUMBER_COUNT; 
	
	// Проверка на начальные данные
	if (size < 4)
	{
		Debug.Log("Incorrect command size");
	
		Application.LoadLevel("MenuScene"); // "MenuScene" is the scene name
	}
	
	commands = new int[size, NUMBER_COUNT];
	
	// Заполнение матрицы комманд
	for (var i = 0; i < size; i++)
	{
		for (var j = 0; j < NUMBER_COUNT; j++)
		{
			var tmp : int = parseInt(splited[(i * NUMBER_COUNT) + j]);
			
			if (tmp < 0)
			{
				Debug.Log("Negative number");
			
				Application.LoadLevel("MenuScene"); // "MenuScene" is the scene name
			}
			
			commands[i, j] = tmp;
		}
	}
	
	// Инициализация начальных переменных
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
	
	planeHeight = 100 * (commands[2, 1] * 100 + commands[2, 2] * 10 + commands[2, 3]);
	
	if(planeHeight > 50000 || planeHeight < 100)
	{
		Debug.Log("Invalid height");
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
	
	if( (commands[3, 1] != 0) || (commands[3, 2] != 0) || (commands[3,3] != 0))
	{	
		Debug.Log("Invalid command 3");
		Application.LoadLevel("MenuScene"); // "MenuScene" is the scene name	
	}
	
	specularSurface = commands[3, 4] + commands[3, 5] * 0.1;
	
	if(specularSurface > 9.9f || specularSurface < 0.1f)
	{
		Debug.Log("To large specular force");
		Application.LoadLevel("MenuScene"); // "MenuScene" is the scene name	
	}
}

// 4-command
private function parseFourthCommand()
{
	if(commands[numberOfCommand, 0] != 4)
	{
		Debug.Log("Invalid fourth command");
		Application.LoadLevel("MenuScene"); // "MenuScene" is the scene name	
	}
	
	acceleration = commands[numberOfCommand, 1] * 2;
	
	if (acceleration > 12) 
	{
		Debug.Log("To large acceleration");
		Application.LoadLevel("MenuScene"); // "MenuScene" is the scene name
	}
	
	altitudeAcceleration = commands[numberOfCommand, 2] * 20;
	
	if (altitudeAcceleration > 180)
	{
		Debug.Log("To large heigh acceleration");
		Application.LoadLevel("MenuScene"); // "MenuScene" is the scene name
	}
	
	switch(commands[numberOfCommand, 3])
	{
		case 0:
			altitudeAccelerationDirection = 1;
			break;
		case 1:
			altitudeAccelerationDirection = -1;
			break;
		default:
			Debug.Log("Invalid altitude acceleration direction");
			Application.LoadLevel("MenuScene"); // "MenuScene" is the scene name
			break;
	}
	
	durationSite = (commands[numberOfCommand, 4] * 10 + commands[numberOfCommand, 5]) * ONE_REVIEW;
	
	Debug.Log("New duration: " + durationSite);
	
	if (durationSite > 99 * ONE_REVIEW)
	{
		Debug.Log("To large duration site");
		Application.LoadLevel("MenuScene"); // "MenuScene" is the scene nam
	}
}

// 5-command
private function parseFifthCommand()
{
	if(commands[numberOfCommand, 0] != 5)
	{
		Debug.Log("Invalid fifth command");
		Application.LoadLevel("MenuScene"); // "MenuScene" is the scene name	
	}
	
	acceleration = -commands[numberOfCommand, 1] * 2;
	
	if (acceleration < -12) 
	{
		Debug.Log("To low acceleration");
		Application.LoadLevel("MenuScene"); // "MenuScene" is the scene name
	}
	
	altitudeAcceleration = commands[numberOfCommand, 2] * 20;
	
	if (altitudeAcceleration > 180)
	{
		Debug.Log("To large heigh acceleration");
		Application.LoadLevel("MenuScene"); // "MenuScene" is the scene name
	}
	
	switch(commands[numberOfCommand, 3])
	{
		case 0:
			altitudeAccelerationDirection = 1;
			break;
		case 1:
			altitudeAccelerationDirection = -1;
			break;
		default:
			Debug.Log("Invalid altitude acceleration direction");
			Application.LoadLevel("MenuScene"); // "MenuScene" is the scene name
			break;
	}
	
	durationSite = (commands[numberOfCommand, 4] * 10 + commands[numberOfCommand, 5]) * ONE_REVIEW;
	
	Debug.Log("New duration: " + durationSite);
	
	if (durationSite > 99 * ONE_REVIEW)
	{
		Debug.Log("To large duration site");
		Application.LoadLevel("MenuScene"); // "MenuScene" is the scene nam
	}
}

// 6-command
private function parseSixthCommand()
{
	if(commands[numberOfCommand, 0] != 6)
	{
		Debug.Log("Invalid sixth command");
		Application.LoadLevel("MenuScene"); // "MenuScene" is the scene name	
	}
	
	acceleration = commands[numberOfCommand, 1] * 2;
	
	if (acceleration > 12) 
	{
		Debug.Log("To large acceleration");
		Application.LoadLevel("MenuScene"); // "MenuScene" is the scene name
	}
	
	overload = commands[numberOfCommand, 2] * 2;
	
	if (overload > 10 || overload < 2)
	{
		Debug.Log("Invalid overload");
		Application.LoadLevel("MenuScene"); // "MenuScene" is the scene name
	}
	
	switch(commands[numberOfCommand, 3])
	{
		case 0:
			altitudeAccelerationDirection = 1;
			break;
		case 1:
			altitudeAccelerationDirection = -1;
			break;
		default:
			Debug.Log("Invalid altitude acceleration direction");
			Application.LoadLevel("MenuScene"); // "MenuScene" is the scene name
			break;
	}
	
	durationSite = (commands[numberOfCommand, 4] * 10 + commands[numberOfCommand, 5]) * ONE_REVIEW;
	
	Debug.Log("New duration: " + durationSite);
	
	if (durationSite > 99 * ONE_REVIEW)
	{
		Debug.Log("To large duration site");
		Application.LoadLevel("MenuScene"); // "MenuScene" is the scene nam
	}
}

private function reset()
{
	altitudeAccelerationDirection = 0;
	altitudeAcceleration = 0;
	acceleration = 0;
	overload = 0;
}

private function tryExecuteNewCommand()
{
 	var size : int = commands.Length / NUMBER_COUNT;
	 	
	if (durationSite <= 0)
 	{
 		reset();
	 	
	 	numberOfCommand++;
	 	
	 	if (size  < numberOfCommand + 1)
	 	{
	 		Debug.Log("Size of command pull [" + size + "] and number of command [" + numberOfCommand + "]");
			Application.LoadLevel("MenuScene"); // "MenuScene" is the scene
	 	} 
	 	else 
	 	{
		 	switch(commands[numberOfCommand, 0])
			{
				case 4:
					parseFourthCommand();
					break;
				case 5:
					parseFifthCommand();
					break;
				case 6:
					parseSixthCommand();
				default:
					Debug.Log("Invalid command number");
					Application.LoadLevel("MenuScene"); // "MenuScene" is the scene name
					break;
			}
	 	}
	}
}