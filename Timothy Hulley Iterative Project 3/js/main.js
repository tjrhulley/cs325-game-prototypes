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
			this.setOrigin(0);
			
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
var spaceVars = []; 
var itemVars = new Array(10); 
var letterKeys = [16, 22, 4, 17, 19, 24, 20, 8, 14, 15, 0, 18, 3, 5, 6, 7, 9, 10, 11, 26, 25, 23, 2, 21, 1, 13, 12, 27, 28, 29];
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

var game = new Phaser.Game(config);

function preload ()
{
	this.load.image('key', 'assets/Key-1.png', { frameWidth: 32, frameHeight: 32 });
	this.load.image('tower', 'assets/tower.png');
}

function create ()
{
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
	
	
	playerGroup = this.physics.add.group();
	
	
	var DEBUGTEXT1 = this.add.text(10,50, '', { font: '32px Courier', fill: '#ffff00' });
	var DEBUGTEXT2 = this.add.text(10,100, '', { font: '32px Courier', fill: '#ffff00' });
	var DEBUGTEXT3 = this.add.text(10,150, '', { font: '32px Courier', fill: '#ffff00' });
	
	this.input.keyboard.on('keydown', function (event) { //EDIT THIS CODE to incorporate : , . / keys. Keycodes 59, 188, 190, and 191 respecively

        if (event.keyCode === 32) //Spacebar
		{ 
			if (selectedUnit > 0 && selectedSpace > 0) {
				placeUnit();
				DEBUGTEXT1.text = 'Unit placed at ' + selectedSpace;
			} else if (selectedUnit < 0) {
				//Go to next turn
				nextTurn();
				DEBUGTEXT1.text = 'Go to next turn!';
			}
		}
		else if (event.keyCode === 8) //Backspace
		{ 
			if (selectedUnit > 0) {
				if (selectedSpace > 0) {
					//remove placement preview
					selectedSpace = -1;
					DEBUGTEXT1.text = 'Unit placed at ' + selectedSpace;
				} else {
					//remove unit preview
					selectedUnit = -1;
				}
			}
		}
		else if (event.keyCode >= 48 && event.keyCode <= 57) //number 1-0
		{ 
			//show preview image of unit
			
			selectedUnit = event.keyCode;
			DEBUGTEXT1.text = 'Unit selected! ' + event.keyCode; 
		}
		else if (event.keyCode >= 65 && event.keyCode <= 90) //Letters. NEED TO ADD : , . /
        {
            if (selectedUnit > 0) {
				//show preview of where the unit will be placed
				selectedSpace = event.keyCode;
				DEBUGTEXT1.text = 'Space selected! ' + event.keyCode; 
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
	
	var newKey = letterKeys[selectedSpace - 65];
	
	if (newKey < 10) {
		this.children.add(new towerUNIT(this, 130 + (70 * (newKey - 1)), 330));
	} else if ((newKey >= 10) && (newKey < 20)) {
		this.children.add(new towerUNIT(this, 130 + (70 * (newKey - 10)), 400));
	} else {
		this.children.add(new towerUNIT(this, 130 + (70 * (newKey - 20)), 470));
	}
	
	selectedUnit = -1;
	selectedSpace = -1;
}

function nextTurn ()
{
	
}