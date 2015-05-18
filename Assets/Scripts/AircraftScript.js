#pragma strict

private var parser: StringParserScript;
private var state: int;

private var START: int = 0;
private var ACTION: int = 1;

function Start () 
{
	parser = GetComponent(StringParserScript);
}

function Update () 
{
	if (state == START)
	{
		Debug.Log(parser.imitationDelaySec);
		
	}
	
	state = ACTION;
}