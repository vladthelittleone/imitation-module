#pragma strict

//0 0 0 0 3 0
//1 1 0 0 5 5
//2 1 0 0 2 2
//3 0 0 0 9 9
//4 1 1 1 0 1
//5 1 1 1 0 1
//6 1 4 0 0 9
//7 1 4 1 0 9
//8 5 4 0 0 9
//9 1 1 9 0 0

private var NUMBER_COUNT: int = 6; 
private var ONE_REVIEW: int = 10;
private var RATIO_VELOCITY: double = 0.000005;

private var state: int = START;

private var START: int = 0;
private var DELAY: int = 1;
private var IMITATION: int = 2;
private var END_OF_IMITATION: int = 3;
  
public var BUTTON_HEIGHT:int = 60;
public var BUTTON_WIDTH:int = 100;
  
// #########################
// Список комманд
private var commands : int[ , ];

// Таймер
private var timer : float;


// #########################
// Номер текущей команды
private var numberOfCommand : int = -1;

// Ускорение
private var acceleration : float = 0;

// Текущее модуль измнения высоты
private var altitudeAcceleration : float = 0;

// Текущий угол поворота
private var rotationAngel : float = 0;

// Текущая скорость самолета
private var aircraftVelocity : float;

// Время выполнения комманды
private var durationSite : float = 0;

// Время выполнения "Змейки"
private var snakeDuration : float = 0;


// #########################
// Направление модуля изменения высоты
private var altitudeAccelerationDirection : int = 0;


// #########################
// Задержка иммитации
private var imitationDelaySec : int;

// Начальный угол объекта
private var objectAngel : int;

// Начальное направление самолета
private var direction : Vector3;

// Начальная скорость
private var initialVelocity : int;

// Кол-во самолетов
private var countOfPlanes : int;


// #########################
// Текущая высота
private var planeHeight : float;

// Помехи
private var interference : float;

// Эффективная отражающая поверхность
private var specularSurface : float; 

// Расстояние между самолетами
private var distanceBetweenPlanes : float;

// #########################
// выполняется "Змейка"?
private var snakeCount : int = 0;

private var training : String = "";

public var aircraftPrefab : GameObject;

function Awake()
{
	timer = Time.time;
}

function OnGUI() 
{
    var x: int = Screen.width - BUTTON_WIDTH;
	var y: int = Screen.height - BUTTON_HEIGHT;
	
	GUI.color = new Color(0, 0, 0, 1f);;
    GUI.Label(new Rect(0, 0, 250, 20), "ВЦ: " + planeHeight);
    GUI.Label(new Rect(0, 20, 250, 20), "СЦ: " + aircraftVelocity);
    GUI.Label(new Rect(0, 40, 250, 20), "МУ: " + acceleration);
    GUI.Label(new Rect(0, 60, 250, 20), "КЦ: " + countOfPlanes);
    GUI.Label(new Rect(0, 80, 250, 20), "УР: " + rotationAngel);
    GUI.Label(new Rect(0, 100, 250, 20), "ПЗ: " + snakeDuration);
    GUI.Label(new Rect(0, 120, 250, 20), "КП: " + snakeCount);
    
	// Draw a button for transfer to menu
	if (GUI.Button(
	  // Center in X, 2/3 of the height in Y
	  new Rect(
	  x, 
	  y, 
	  BUTTON_WIDTH, 
	  BUTTON_HEIGHT),
	  "Назад"
	))
	  
	{
	  PlayerPrefs.SetString("ForMainMenu", training);
	  // On Click, clear text area.
	  Application.LoadLevel("MenuScene");
	}
}

function Start () 
{	
	training = PlayerPrefs.GetString("Training");

	var splited : String[] = training.Split([" ", "\n"], System.StringSplitOptions.None);
	
	if ((splited.length % NUMBER_COUNT) != 0)
	{
		toMainMenu("Некоректный количество цифр в команде: " + splited.length % NUMBER_COUNT);	
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
 	
	var renderers : Component[] = GetComponentsInChildren(SpriteRenderer);
	for (var renderer : SpriteRenderer in renderers) {
			renderer.enabled = false;
			renderer.color = new Color(1f, 1f, 1f, alpha);
	}
	
	 	// Увеличение точки в зависимости от кол-ва самолетов
 	var desiredScale : float = 1 + (distanceBetweenPlanes / 50) * countOfPlanes;
	transform.localScale = Vector3(desiredScale, desiredScale, desiredScale);

}

function Update () 
{	
	// Устанавливаем позицию по нажатой кнопки мыши
	if(Input.GetMouseButtonDown(0) && state == START)
	{
		var p : Vector3 = GetComponent.<Camera>().main.ScreenToWorldPoint(Input.mousePosition);
		
		transform.position = new Vector3(p.x, p.y, 0);
		
		// Создаем новую точку
		var startPoint : GameObject = Instantiate(aircraftPrefab) as GameObject;
		startPoint.transform.position = transform.position;
		
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
 		updateAircraftParams();
 	}

 	if (state == END_OF_IMITATION)
 	{
 		updateAircraftParams();
 		
		if (Time.time - timer > 20)
		{
			Application.LoadLevel("MenuScene"); // "MenuScene" is the scene nam
		}
 	}
}

private function updateAircraftParams()
{
	if (Time.time - timer > 1)
	{
		// Создаем новую точку
		var point : GameObject = Instantiate(aircraftPrefab) as GameObject;
		
		point.transform.position = transform.position;
		
		timer = Time.time;
	}
	
	aircraftVelocity += Time.deltaTime * acceleration;
	planeHeight += Time.deltaTime * altitudeAcceleration * altitudeAccelerationDirection;
 		
 	transform.Translate(Time.deltaTime * direction * aircraftVelocity * RATIO_VELOCITY);	
 	transform.Rotate(Vector3.forward, rotationAngel * Time.deltaTime);
}

private function parseSplitedArray(splited : String[])
{
	// Количество комманд
	var size : int = splited.length / NUMBER_COUNT; 
	
	// Проверка на начальные данные
	if (size < 4)
	{
		toMainMenu("Некоректное кол-во комманд: " + size);	
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
				toMainMenu("Найдено отрицательное значение");	
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
	numberOfCommand++;
	
	if (commands[0, 0] != 0 || commands[0, 1] != 0) 
	{
		toMainMenu("Неверное значение комманды");	
	}
	
	imitationDelaySec = 10 * ((10 * commands[0, 2]) + commands[0, 3]);
	
	if (imitationDelaySec > 300)
	{
		toMainMenu("Выская задержка начала имитации: " + imitationDelaySec);
	}
	
	objectAngel = 10 * ((10 * commands[0, 4]) + commands[0, 5]);
	
	if (objectAngel > 360) 
	{
		toMainMenu("Некоректный качальный курс цели: " + objectAngel);
	}
}

// First command
private function parseFirstCommand()
{
	numberOfCommand++;
	
	if (commands[1, 0] != 1) 
	{
		toMainMenu("Неверное значение комманды");	
	}
	
	initialVelocity = 10 * ((100 * commands[1, 1]) + (10 * commands[1, 2]) + commands[1, 3]);
	
	if (initialVelocity > 2000)
	{
		toMainMenu("Неверное значение начальной скорости цели: " + initialVelocity);	
	}
	
	interference = (10 * commands[1, 4]) + commands[1, 5];
}

// 2-command
private function parseSecondCommand()
{
	numberOfCommand++;
	
	if(commands[2, 0] != 2)
	{
		toMainMenu("Неверное значение комманды");	
	}
	
	planeHeight = 100 * (commands[2, 1] * 100 + commands[2, 2] * 10 + commands[2, 3]);
	
	if(planeHeight > 50000 || planeHeight < 100)
	{
		toMainMenu("Неверное значение высоты цели: " + planeHeight);
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
			toMainMenu("Неверное значение расстояния между целями: " + commands[2, 4]);
			break;
	}
	
	countOfPlanes = commands[2,5];
	
	if(countOfPlanes > 7)
	{
		toMainMenu("Неверное значение количества в группе: " + countOfPlanes);
	}
}

// 3-command
private function parseThirdCommand()
{
	numberOfCommand++;
	
	if(commands[3, 0] != 3)
	{
		toMainMenu("Неверное значение комманды");	
	}
	
	if( (commands[3, 1] != 0) || (commands[3, 2] != 0) || (commands[3,3] != 0))
	{	
		toMainMenu("Неверное формат комманды");	
	}
	
	specularSurface = commands[3, 4] + commands[3, 5] * 0.1;
	
	if(specularSurface > 9.9f || specularSurface < 0.1f)
	{
		toMainMenu("Слишком высокое ЭОП " + specularSurface);
	}
}

// 4-command
private function parseFourthCommand()
{
	if(commands[numberOfCommand, 0] != 4)
	{
		toMainMenu("Неверное значение комманды");	
	}
	
	acceleration = commands[numberOfCommand, 1] * 2;
	
	if (acceleration > 12) 
	{
		toMainMenu("Слишком высокое значение модуля линейного ускорения " + acceleration);
	}
	
	computeAccelerationCommands();
}

// 5-command
private function parseFifthCommand()
{
	if(commands[numberOfCommand, 0] != 5)
	{
		toMainMenu("Неверное значение комманды");
	}
	
	acceleration = -commands[numberOfCommand, 1] * 2;
	
	if (acceleration < -12) 
	{
		toMainMenu("Слишком низкое значение модуля линейного ускорения " + acceleration);
	}

	computeAccelerationCommands();
}

// 6-command
private function parseSixthCommand()
{
	if(commands[numberOfCommand, 0] != 6)
	{
		toMainMenu("Неверное значение комманды");	
	}
	
	acceleration = commands[numberOfCommand, 1] * 2;
	
	if (acceleration > 12) 
	{
		toMainMenu("Слишком высокое значение модуля линейного ускорения " + acceleration);	
	}
	
	// Рассчет поворота в секунду 
	computeRotation();
}

// 7-command
private function parseSeventhCommand()
{
	if(commands[numberOfCommand, 0] != 7)
	{
		toMainMenu("Неверное значение комманды");
	}
	
	acceleration = -commands[numberOfCommand, 1] * 2;
	
	if (acceleration < -12) 
	{
		toMainMenu("Слишком низкое значение модуля линейного ускорения " + acceleration);	
	}
	
	// Рассчет поворота в секунду 
	computeRotation();
}

// 8-command
private function parseEighthCommand()
{
	if(commands[numberOfCommand, 0] != 8)
	{
		toMainMenu("Неверное значение комманды");	
	}
	
	altitudeAcceleration = commands[numberOfCommand, 2] * 20;
	altitudeAccelerationDirection = 1;
	
	if (altitudeAcceleration > 180)
	{
		toMainMenu("Неверное значение модуля скорости изменения высоты " + altitudeAcceleration);
	}
	
	// Рассчет поворота в секунду 
	computeRotation();
}

// 9-command
private function parseNinthCommand()
{
	if(commands[numberOfCommand, 0] != 9)
	{
		toMainMenu("Неверное значение комманды");	
	}
	
	snakeCount = commands[numberOfCommand, 1];
	
	if(snakeCount > 9 || snakeCount < 0)
	{
		toMainMenu("Неверное значение количества периодов 'Змейки': " + snakeCount);
	}
	
	var overload : int = commands[numberOfCommand, 2] * 2;
	
	if (overload > 10 || overload < 2)
	{
		toMainMenu("Неверное значение перегрузки: " + overload);
	}
	
	snakeDuration = commands[numberOfCommand, 3] * ONE_REVIEW; 
	
	if(snakeDuration > 90 || snakeDuration < 0)
	{
		toMainMenu("Неверна продолжительность периодов: " + commands[numberOfCommand, 3]);	
	}
	
	if( (commands[numberOfCommand, 4] != 0) || (commands[numberOfCommand, 5] != 0))
	{	
		toMainMenu("Неверный формат команды №9");
	}
	
	// Рассчет поворота в секунду 
	durationSite = snakeDuration / 2;
	rotationAngel = 180 / durationSite;
}

private function reset()
{
	altitudeAccelerationDirection = 0;
	altitudeAcceleration = 0;
	acceleration = 0;
	rotationAngel = 0;
	snakeCount = 0;
}

private function computeRotation()
{
	var overload : int = commands[numberOfCommand, 2] * 2;
	
	if (overload > 10 || overload < 2)
	{
		toMainMenu("Неверное значение перегрузки: " + overload);
	}
	
	var rotationDirection : int = 1;
	
	switch(commands[numberOfCommand, 3])
	{
		case 0:
			rotationDirection = 1;
			break;
		case 1:
			rotationDirection = -1;
			break;
		default:
			toMainMenu("Неверное направление угла");
			break;
	}
	
	var angel : int = commands[numberOfCommand, 4] * 100 + commands[numberOfCommand, 5] * 10;
	
	if (angel > 360 || angel < 10)
	{
		toMainMenu("Неверный угол поворота: " + angel);
	}
	
	// Рассчет поворота в секунду 
	rotationAngel = rotationDirection * (5 - 9 / overload);
	durationSite = angel / Mathf.Abs(rotationAngel);
	
	Debug.Log("Start rotation on " + angel + " angel for " + rotationAngel + " per " + durationSite + " sec.");
}

private function computeAccelerationCommands()
{
	altitudeAcceleration = commands[numberOfCommand, 2] * 20;
	
	if (altitudeAcceleration > 180)
	{
		toMainMenu("Слишком высокое значение изменения высоты: " + altitudeAcceleration);
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
			toMainMenu("Неверное направление изменения высоты");
			break;
	}
	
	durationSite = (commands[numberOfCommand, 4] * 10 + commands[numberOfCommand, 5]) * ONE_REVIEW;
	
	Debug.Log("New duration: " + durationSite);
	
	if (durationSite > 99 * ONE_REVIEW)
	{
		toMainMenu("Слишком высокая продолжительность участка в обзорах " + durationSite / ONE_REVIEW);
	}
}

private function toMainMenu(error : String) 
{
	var e : String = error + " [в списке под номером " + numberOfCommand + "]";
	
	PlayerPrefs.SetString("Error", e);
	Debug.Log(e);
	Application.LoadLevel("MenuScene"); // "MenuScene" is the scene nam
}

private function tryExecuteNewCommand()
{
 	var size : int = commands.Length / NUMBER_COUNT;
	 	
	if (durationSite <= 0)
 	{
 		if (snakeCount > 0)
 		{
 			durationSite = snakeDuration / 2;
 			rotationAngel = -rotationAngel;
 			
 			if (rotationAngel < 0)
 			{
 				snakeCount--;
 			} 
 			
 			return;
 		}
 		
 		reset();
	 	
	 	numberOfCommand++;
	 	
	 	if (size  < numberOfCommand + 1)
	 	{
	 		Debug.Log("Size of command pull [" + size + "] and number of command [" + numberOfCommand + "]");
	 		state = END_OF_IMITATION;
	 		timer = Time.time;
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
					break;
				case 7:
					parseSeventhCommand();
					break;
				case 8:
					parseEighthCommand();
					break;
				case 9:
					parseNinthCommand();
					break;
				default:
					toMainMenu("Неверный номер команды");
					break;
			}
	 	}
	}
}