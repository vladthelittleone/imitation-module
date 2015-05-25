#pragma strict

//0 0 0 1 3 0
//1 1 0 0 5 5
//2 1 0 0 2 2
//3 0 0 0 9 9
//0 0 3 0 3 0
//1 0 0 1 9 9
//2 0 0 1 1 1
//3 0 0 0 9 9

private var NUMBER_COUNT: int = 6; 
private var ONE_REVIEW: int = 10;
private var RATIO_VELOCITY: double = 0.000005;

private var state: int = START;

private var START: int = 0;
private var DELAY: int = 1;
private var IMITATION: int = 2;
  
private var commands : int[ , ];

private var timer : float;

private var aircraftVelocity : int;
private var direction : Vector3;

public var imitationDelaySec : int;
public var objectAngel : int;
public var initialVelocity : int;
public var interference : float;
public var planeHeight : int;
public var countOfPlanes : int;
public var specularSurface : float; 
public var distanceBetweenPlanes : float;

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
		var upd : long = Time.time - timer;
	 	
	 	if (upd > 1)
	 	{
	 		timer = Time.time;
	 		
			transform.Translate(direction * aircraftVelocity * RATIO_VELOCITY);
	 	}	 	
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
	
	if( (commands[3,1] != 0) || (commands[3,2] != 0) || (commands[3,3] != 0))
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