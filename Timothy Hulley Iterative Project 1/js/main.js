import "./phaser.js";

var config = {
    type: Phaser.WEBGL,
    width: 800,
    height: 600,
    parent: 'game',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

//Look up demos for randomly spawning objects and despawning objects when they go offscreen.

//Game objects
var player;

//Game systems
const minRoad = 200;
const maxRoad = 600;
var maxTime = 1300;
var cursors;
var gameStep = 0;
/*
-0: Game has not started. Press to start
-1: Robber's turn
-2: Robber crashed or time is up. Press to start next turn
-3: Cop's start screen
-4: Cop's turn
-5: Start over
*/
var objPos = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
var objGroup;
var objTracker = 0;
var moneyPos = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
var moneyGroup;
var moneyTracker = 0;
var timer = 0;
var timedEvent1;
var timedEvent2;

//Hud stuff
var score = 0;
var hudTime = maxTime;
var roadGif;
var scoreText;
var timeText;
var infoText;

//var DEBUGtext;

var game = new Phaser.Game(config);

function preload ()
{
    this.load.image('car', 'assets/car1.png'); //load an image for a car
	this.load.image('police', 'assets/car2.png'); //load an image for a police car
	this.load.image('cone', 'assets/cone.png');//load image for obsticles
	this.load.spritesheet('money', 'assets/money.png', { frameWidth: 16, frameHeight: 16}); //load image for money
	this.load.image('roadStill', 'assets/roadStill.png');//load image for stationary road
	this.load.spritesheet('roadGif', 'assets/roadGif.png', {frameWidth: 800, frameHeight: 600}); //load image for road gif
}

function create ()
{
    this.add.image(400, 300, 'roadStill');
	
	this.anims.create({
        key: 'roadAnim',
        frames: this.anims.generateFrameNumbers('roadGif', { start: 0, end: 8 }),
        frameRate: 14,
        repeat: -1
    });
	
	roadGif = this.add.sprite(400, 300, 'roadGif');
	roadGif.play({key: 'roadAnim'});
	roadGif.setVisible(false);
	
	this.anims.create({
        key: 'coinSpin',
        frames: this.anims.generateFrameNumbers('money', { start: 0, end: 1 }),
        frameRate: 2,
        repeat: -1
    });
	
	this.physics.world.setBoundsCollision(true, true, false, false);

    player = this.physics.add.image(400, 450, 'car');
    player.setCollideWorldBounds(true);
	player.body.setBoundsRectangle(new Phaser.Geom.Rectangle(200, 150, 400, 500));
	player.setScale(0.2);
	player.setVelocityY(0);
	
	cursors = this.input.keyboard.createCursorKeys();
	
	for (var i = 0; i < objPos.length; i++) {
		objPos[i] = Phaser.Math.Between(minRoad, maxRoad);
	}
	
	objGroup = this.physics.add.group({
		defaultKey: 'cone',
		maxSize: 20
	});
	
	moneyGroup = this.physics.add.group({
		defaultKey: 'money',
		maxSize: 10
	});
	
	this.physics.add.overlap(player, objGroup, crash);
	this.physics.add.overlap(player, moneyGroup, collectCoin);
	
	this.input.on('pointerup', function (pointer) {
		if (gameStep === 0) {
			
			timedEvent1 = this.time.addEvent({
				delay: 1000,
				loop: true,
				callback: objEvent
			});
			
			timedEvent2 = this.time.addEvent({
				delay: 1500,
				loop: true,
				callback: dropMoneyEvent
			});
			
			infoText.setText('');
			roadGif.setVisible(true);
			gameStep++;
		} else if (gameStep === 2) {
			infoText.setText([
				'You are a cop!',
				'',
				'Follow the robber\'s money trail!',
				'Collect money to earn points!',
				'-- Click to begin --'
			]);
			
			player.y = -2000;
			player = this.physics.add.image(400, 450, 'police');
			player.setCollideWorldBounds(true);
			player.body.setBoundsRectangle(new Phaser.Geom.Rectangle(200, 150, 400, 500));
			player.setScale(0.2);
			player.setVelocityY(0);
			
			this.physics.add.overlap(player, objGroup, crash);
			this.physics.add.overlap(player, moneyGroup, collectCoin);
			
			objGroup.clear(true);
			moneyGroup.clear(true);
			hudTime = maxTime;
			timeText.setText('Time: ' + hudTime);
			score = 0;
			scoreText.x = 16;
			scoreText.setText('Score: ' + score);
			
			gameStep++;
		} else if (gameStep === 3) {
			infoText.setText('');
			
			timedEvent1 = this.time.addEvent({
				delay: 1000,
				loop: true,
				callback: objEvent
			});
	
			timedEvent2 = this.time.addEvent({
				delay: 1500,
				loop: true,
				callback: spawnMoneyEvent
			});
			roadGif.setVisible(true);
			gameStep++;
		}
		
	}, this);
	
	infoText = this.add.text(400, 300, '', { fontFamily: 'American Typewriter, serif', fontSize: '36px', fill: '#DEAD33', align: 'center' });
	infoText.setOrigin(0.5);
	infoText.setText([
		'You are a robber!',
		'',
		'Flee from the cops until the timer ends.',
		'Don\'t hit any obsticles!',
		'-- Click to begin --'
	]);
	
	timeText = this.add.text(16,16, 'Time: ' + hudTime);
	scoreText = this.add.text(-160,32, 'Score: ' + score);
	
	//DEBUGtext = this.add.text(16,16, '');
}

function update ()
{
	if (gameStep === 1 || gameStep === 4) {
		Phaser.Actions.IncY(objGroup.getChildren(), 10);
		Phaser.Actions.IncY(moneyGroup.getChildren(), 10);
	}

    objGroup.children.iterate(function (cone) {
		if (cone.y > 600) {
            objGroup.killAndHide(cone);
        }
    });
	
	moneyGroup.children.iterate(function (money) {
        if (money.y > 600) {
            moneyGroup.killAndHide(money);
        }
    });
	
	if (gameStep === 1 || gameStep === 4) {
		if (cursors.left.isDown)
		{
			player.setVelocityX(-220);
		}
		else if (cursors.right.isDown)
		{
			player.setVelocityX(220);
		}
		else
		{
			player.setVelocityX(0);
		}
		
		hudTime--;
		score++;
		timeText.setText('Time: ' + hudTime);
		scoreText.setText('Score: ' + score);
		timer++;
		if (timer >= maxTime) {
			crash();
		}
	}
}

function objEvent ()
{
	const cone = objGroup.get(objPos[objTracker], 0);
	
	if (objTracker > 19) return;
	if (!cone) return;
	
	cone.setActive(true);
	cone.setVisible(true);
	cone.setScale(0.2);
	
	objTracker++;
}

function dropMoneyEvent ()
{
	const money = moneyGroup.get(player.x, player.y);
	
	if (moneyTracker > 9) return;
	if (!money) return;
	
	moneyPos[moneyTracker] = money.x;
	//DEBUGtext.setText('Money positions: ' + moneyPos[0] + moneyPos[1] + moneyPos[2] + moneyPos[3] + moneyPos[4] + moneyPos[5] + moneyPos[6] + moneyPos[7] + moneyPos[8] + moneyPos[9]);
	
	money.setActive(true);
	money.setVisible(true);
	money.setScale(2);
	
	moneyTracker++;
}

function spawnMoneyEvent ()
{
	const money = moneyGroup.get(moneyPos[moneyTracker], 0);
	
	if (moneyTracker > 9) return;
	if (!money) return;
	
	//DEBUGtext.setText('Money positions: ' + moneyPos[0] + moneyPos[1] + moneyPos[2] + moneyPos[3] + moneyPos[4] + moneyPos[5] + moneyPos[6] + moneyPos[7] + moneyPos[8] + moneyPos[9]);
	
	money.setActive(true);
	money.setVisible(true);
	money.setScale(2);
	
	moneyTracker++;
}

function crash ()
{
	if (gameStep === 1 || gameStep === 4) {
		if (gameStep === 1) {
		if (timer >= maxTime) {
			infoText.setText([
				'You\'ve escaped the cops!!!',
				'',
				'--> Click to play stage 2! <--'
			]);
		} else {
			infoText.setText([
				'You have crashed!!!',
				'',
				'--> Click to play stage 2! <--'
			]);
		}
		} else {
			infoText.setText([
				'Thank you for playing!',
				'Final Score: ' + score
			]);
		}
		
		gameStep++;
		player.setVelocityX(0);
		timedEvent1.remove(false);
		timedEvent2.remove(false);
		roadGif.setVisible(false);
		moneyTracker = 0;
		objTracker = 0;
		maxTime = timer + 50;
		timer = 0;
	}
}

function collectCoin ()
{
	if (gameStep === 4) {
		moneyGroup.clear(true);
		score += 100;
		//increase score
	}
}