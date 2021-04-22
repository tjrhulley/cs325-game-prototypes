import "./phaser.js";

//classes for units start here
var towerUNIT = new Phaser.Class({
		Extends: Phaser.GameObjects.Image,
		
		initialize:
		
		function towerUNIT(scene, x, y)
		{
			Phaser.GameObjects.Image.call(this, scene)
			
			this.setTexture('tower'); //Import a tower image or spritesheet
			this.setPosition(x, y);
			this.setScale(1.5);
			//this.setOrigin(0);
			
			this.health = 10;
			this.attack = 5;
		},
		
		attack: function()
		{
			
		},
		
		die: function()
		{
			
		}
	});
	
//classes for units end here

var config = {
    type: Phaser.WEBGL,
    width: 1000,
    height: 600,
    parent: 'game',
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

//Game Systems
var myScene;
var spaceVars = []; 
var itemVars = new Array(10); 
var letterKeys = [10, 24, 22, 12, 2, 13, 14, 15, 7, 16, 17, 18, 26, 25, 8, 9, 0, 3, 11, 4, 6, 23, 2, 22, 5, 21, 19, 27, 28, 29];
var selectedUnit = -1;
var selectedSpace = -1;

//Player units
var playerGroup;
var towerUNIT;

//Enemy units

//Hud stuff
var keyText;
var resourcePoints = 10;
var baseHealth = 20;

var DEBUGTEXT2;
var DEBUGTEXT3;

var game = new Phaser.Game(config);

function preload ()
{
	this.load.image('key', 'assets/Key-1.png', { frameWidth: 32, frameHeight: 32 });
	this.load.image('tower', 'assets/tower.png');
	this.load.image('castle', 'assets/castle.png');
	this.load.image('background', 'assets/background.png');
	this.load.image('arrow', 'assets/arrow.png');
}

function create ()
{
	myScene = this;
	
	var bg = this.add.image(400, 180, 'background');
	bg.setScale(3);
	var castle = this.add.image(900, 400, 'castle');
	castle.setScale(0.5);
	var arrow = this.add.image(50, 385, 'arrow');
	arrow.setScale(0.1);
	var arrow = this.add.image(50, 455, 'arrow');
	arrow.setScale(0.1);
	var arrow = this.add.image(50, 525, 'arrow');
	arrow.setScale(0.1);
	
	var keyGroup = this.add.group({ key: 'key', setScale: {x: 2.2, y: 2.2}, frameQuantity: 30});
	
	Phaser.Actions.GridAlign(keyGroup.getChildren(), {
            width: 10,
            height: 3,
            cellWidth: 70,
            cellHeight: 70,
            x: 150,
            y: 400
    });
	
	keyText = this.add.text(100, 350, '', { fontFamily: 'American Typewriter, serif', fontSize: '34px', fill: '#FFFFFF', align: 'left' });
	keyText.setText([
		'Q     W     E      R      T      Y     U      I      O      P',
		'',
		'A      S      D     F      G     H      J      K      L      ;',
		'',
		'Z      X      C     V      B     N     M      ,       .       ?'
	]);
	
	for (var i = 0; i < 3; i++) {
		spaceVars[i] = new Array(10); 
	}
	
	
	playerGroup = this.add.group();
	
	
	var DEBUGTEXT1 = this.add.text(10,50, '', { font: '32px Courier', fill: '#000000' });
	DEBUGTEXT2 = this.add.text(10,100, '', { font: '28px Courier', fill: '#000000' });
	DEBUGTEXT3 = this.add.text(10,150, '', { font: '28px Courier', fill: '#000000' });
	var pointText = this.add.text(650,50, '', { font: '28px Courier', fill: '#FF00FF' });
	
	DEBUGTEXT1.text = "Press 1-9 to select a unit";
	DEBUGTEXT2.text = "Or press enter to advance a turn.";
	DEBUGTEXT3.text = "Imagine there are enemies because I haven't added them yet.";
	pointText.text = "Resource points: " + resourcePoints;
	
	this.input.keyboard.on('keydown', function (event) { //EDIT THIS CODE to incorporate : , . / keys. Keycodes 59, 188, 190, and 191 respecively

        if (event.keyCode === 13) //Spacebar
		{ 
			if (selectedUnit > 0 && selectedSpace > 0) {
				if (resourcePoints >= 5) { 
					DEBUGTEXT1.text = 'Unit placed!';
					DEBUGTEXT2.text = "Press enter to advance a turn.";
					resourcePoints -= 5;
					pointText.text = "Resource points: " + resourcePoints;
					placeUnit();
				}
			} else if (selectedUnit < 0) {
				//Go to next turn
				nextTurn();
				DEBUGTEXT1.text = "Press 1-9 to select a unit";
				DEBUGTEXT2.text = "Or press enter to advance a turn.";
				DEBUGTEXT3.text = 'Go to next turn!';
				resourcePoints += 2;
				pointText.text = "Resource points: " + resourcePoints;
			}
		}
		else if (event.keyCode === 8) //Backspace
		{ 
			if (selectedUnit > 0) {
				if (selectedSpace > 0) {
					//remove placement preview
					selectedSpace = -1;
					DEBUGTEXT1.text = 'Unit selected! Tower';
					DEBUGTEXT2.text = "Press any key and then enter to place the unit";
					DEBUGTEXT3.text = '(Backspace to go back)';
				} else {
					//remove unit preview
					selectedUnit = -1;
					DEBUGTEXT1.text = "Press 1-9 to select a unit";
					DEBUGTEXT2.text = "Or press enter to advance a turn.";
					DEBUGTEXT3.text = '';
				}
			}
		}
		else if (event.keyCode >= 48 && event.keyCode <= 57) //number 1-0
		{ 
			//show preview image of unit
			
			selectedUnit = event.keyCode;
			DEBUGTEXT1.text = 'Unit selected! Tower'; 
			DEBUGTEXT2.text = "Press any key to select a space.";
			DEBUGTEXT3.text = '(Backspace to go back)';
		}
		else if ((event.keyCode >= 65 && event.keyCode <= 90) || event.keyCode === 59 || (event.keyCode >= 188 && event.keyCode <= 191))
        {
            if (selectedUnit > 0) {
				//show preview of where the unit will be placed
				selectedSpace = event.keyCode;
				DEBUGTEXT1.text = 'Space selected! ' + event.keyCode; 
				DEBUGTEXT2.text = 'Press enter to place it!';
				DEBUGTEXT3.text = '(Backspace to go back)';
			}
        }

    });
}

function update ()
{
	
}

function placeUnit () 
{
	//Check if resource points for the unit are enough before placing it.
	
	//Starting index = x 130, y 330
	//Increment x by 70 every space
	//Increment y by 70 every space
	if (selectedSpace >= 65 && selectedSpace <= 90) {
		var newKey = letterKeys[selectedSpace - 65];
	} else if (selectedSpace === 59) {
		var newKey = letterKeys[26];
	} else if (selectedSpace === 188) {
		var newKey = letterKeys[27];
	} else {
		var newKey = letterKeys[selectedSpace - 162];
	}
	
	//DEBUGTEXT2.text = selectedSpace - 65;
	//DEBUGTEXT3.text = newKey;
	
	if (newKey < 10) {
		myScene.children.add(new towerUNIT(myScene, 130 + (70 * newKey), 330));
	} else if ((newKey >= 10) && (newKey < 20)) {
		myScene.children.add(new towerUNIT(myScene, 130 + (70 * (newKey - 10)), 400));
	} else {
		myScene.children.add(new towerUNIT(myScene, 130 + (70 * (newKey - 20)), 470));
	}
	
	selectedUnit = -1;
	selectedSpace = -1;
}

function nextTurn ()
{
	
}