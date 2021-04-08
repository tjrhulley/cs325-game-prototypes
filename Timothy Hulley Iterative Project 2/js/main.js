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
var fakePlayer;
var exploObj;

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
var objType = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
//0 = cone, 1 = trash, 2 = oil, 3 = car, 4 = deer
var objPos = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
var objGroup; //original cone group
var trashGroup;
var oilGroup;
var carGroup;
var deerGroup;
var objTracker = 0;
var moneyPos = [400, 400, 400, 400, 400, 400, 400, 400, 400, 400, 400];
var moneyGroup;
var moneyTracker = 0;
var timer = 0;
var timedEvent1;
var timedEvent2;

//Hud stuff
var score = 0;
var highScore = 0;
var hudTime = maxTime;
var roadGif;
var scoreText;
var highScoreText;
var timeText;
var infoText;

//Sound effects
var coinGetSnd;
var coinDropSnd;
var carIdleSnd;
var carDriveSnd;
var sirenSnd;
var crashSnd;
var winSnd;

var game = new Phaser.Game(config);

function preload ()
{
    this.load.image('car', 'assets/car1.png'); //load an image for a car
	this.load.image('police', 'assets/car2.png'); //load an image for a police car
	this.load.image('civ', 'assets/car3.png');
	this.load.image('cone', 'assets/cone.png');//load image for obsticles
	this.load.image('trash', 'assets/trash.png');
	this.load.image('oil', 'assets/oil.png');
	this.load.spritesheet('deer', 'assets/deer.png', { frameWidth: 32, frameHeight: 32});
	this.load.spritesheet('explosion1', 'assets/explosion1.png', { frameWidth: 100, frameHeight: 100});
	this.load.spritesheet('money', 'assets/money.png', { frameWidth: 16, frameHeight: 16}); //load image for money
	this.load.image('roadStill', 'assets/roadStill.png');//load image for stationary road
	this.load.spritesheet('roadGif', 'assets/roadGif.png', {frameWidth: 800, frameHeight: 600}); //load image for road gif
	
	this.load.audio('engineIdle', 'sounds/engineIdle.wav');
	this.load.audio('engineDrive', 'sounds/engineDrive.mp3');
	this.load.audio('policeSiren', 'sounds/Siren.wav');
	this.load.audio('dropCoin', 'sounds/Drop_Coin.wav');
	this.load.audio('getCoin', 'sounds/Pickup_Coin.wav');
	this.load.audio('explode', 'sounds/CrashAuto_S08IM.2.wav');
	this.load.audio('win', 'sounds/win31.mp3');
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
	
	coinGetSnd = this.sound.add('getCoin', {volume: 0.4});
	coinDropSnd = this.sound.add('dropCoin', {volume: 0.3});
	carIdleSnd = this.sound.add('engineIdle', { loop: true, volume: 1.2});
	carDriveSnd = this.sound.add('engineDrive', {loop: true, volume: 0.3});
	sirenSnd = this.sound.add('policeSiren', {volume: 0.4});
	crashSnd = this.sound.add('explode', {volume: 0.7});
	winSnd = this.sound.add('win', {volume: 0.7});
	
	carIdleSnd.play();
	
	this.anims.create({
        key: 'coinSpin',
        frames: this.anims.generateFrameNumbers('money', { start: 0, end: 7 }),
        frameRate: 10,
        repeat: -1
    });
	
	this.anims.create({
        key: 'explosion',
        frames: this.anims.generateFrameNumbers('explosion1', { start: 0, end: 49 }),
        frameRate: 20,
        repeat: 0
    });
	
	this.anims.create({
        key: 'deerWalk',
        frames: this.anims.generateFrameNumbers('deer', { start: 3, end: 5 }),
        frameRate: 5,
        repeat: -1
    });
	
	exploObj = this.add.sprite(-400, 400, 'explosion1');
	exploObj.setScale(2);
	
	this.physics.world.setBoundsCollision(true, true, false, false);

    player = this.physics.add.image(400, 450, 'car');
    player.setCollideWorldBounds(true);
	player.body.setBoundsRectangle(new Phaser.Geom.Rectangle(200, 150, 400, 500));
	player.setScale(0.2);
	player.setVelocityY(0);
	
	fakePlayer = this.physics.add.image(-300, 450, 'car');
	fakePlayer.setScale(0.2);
	
	cursors = this.input.keyboard.createCursorKeys();
	
	for (var i = 0; i < objPos.length; i++) {
		objPos[i] = Phaser.Math.Between(minRoad, maxRoad);
		objType[i] = Phaser.Math.Between(0, 4);
	}
	
	objGroup = this.physics.add.group({
		defaultKey: 'cone',
		maxSize: 20
	});
	trashGroup = this.physics.add.group({
		defaultKey: 'trash',
		maxSize: 20
	});
	oilGroup = this.physics.add.group({
		defaultKey: 'oil',
		maxSize: 20
	});
	carGroup = this.physics.add.group({
		defaultKey: 'civ',
		maxSize: 20
	});
	deerGroup = this.physics.add.group({
		defaultKey: 'deer',
		maxSize: 20
	});
	
	moneyGroup = this.physics.add.group({
		defaultKey: 'money',
		maxSize: 10
	});
	
	this.physics.add.overlap(player, objGroup, crash);
	this.physics.add.overlap(player, trashGroup, crash);
	this.physics.add.overlap(player, oilGroup);
	this.physics.add.overlap(player, carGroup, crash);
	this.physics.add.overlap(player, deerGroup, crash);
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
			
			carIdleSnd.stop();
			carDriveSnd.play();
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
			this.physics.add.overlap(player, trashGroup, crash);
			this.physics.add.overlap(player, oilGroup);
			this.physics.add.overlap(player, carGroup, crash);
			this.physics.add.overlap(player, deerGroup, crash);
			this.physics.add.overlap(player, moneyGroup, collectCoin);
			
			carIdleSnd.play();
			
			objGroup.clear(true);
			trashGroup.clear(true);
			oilGroup.clear(true);
			carGroup.clear(true);
			deerGroup.clear(true);
			moneyGroup.clear(true);
			hudTime = maxTime;
			timeText.setText('Time: ' + hudTime);
			score = 0;
			scoreText.x = 16;
			scoreText.setText('Score: ' + score);
			fakePlayer.y = -100;
			moneyTracker = 0;
			
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
			
			carIdleSnd.stop();
			carDriveSnd.play();
			sirenSnd.play();
			
			roadGif.setVisible(true);
			gameStep++;
		} else if (gameStep >= 5) {
			infoText.setText([
				'You are a robber!',
				'',
				'Flee from the cops until the timer ends.',
				'Don\'t hit any obsticles!',
				'-- Click to begin --'
			]);
			
			player.y = -2000;
			player = this.physics.add.image(400, 450, 'car');
			player.setCollideWorldBounds(true);
			player.body.setBoundsRectangle(new Phaser.Geom.Rectangle(200, 150, 400, 500));
			player.setScale(0.2);
			player.setVelocityY(0);
			
			this.physics.add.overlap(player, objGroup, crash);
			this.physics.add.overlap(player, trashGroup, crash);
			this.physics.add.overlap(player, carGroup, crash);
			this.physics.add.overlap(player, deerGroup, crash);
			this.physics.add.overlap(player, moneyGroup, collectCoin);
			
			carIdleSnd.play();
			
			objGroup.clear(true);
			trashGroup.clear(true);
			oilGroup.clear(true);
			carGroup.clear(true);
			deerGroup.clear(true);
			moneyGroup.clear(true);
			
			maxTime = 1300;
			hudTime = maxTime;
			timeText.setText('Time: ' + hudTime);
			highScoreText.setText('High score: ' + highScore);
			score = 0;
			scoreText.x = -160;
			gameStep = 0;
			moneyTracker = 0;
			
			fakePlayer.y = 450;
			fakePlayer.x = -300;
			
			for (var i = 0; i < objPos.length; i++) {
				objPos[i] = Phaser.Math.Between(minRoad, maxRoad);
				objType[i] = Phaser.Math.Between(0, 4);
			}
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
	
	timeText = this.add.text(16,16, 'Time: ' + hudTime, { fontFamily: 'American Typewriter, serif', fill: '#DEAD33'});
	scoreText = this.add.text(-160,32, 'Score: ' + score, { fontFamily: 'American Typewriter, serif', fill: '#DEAD33'});
	highScoreText = this.add.text(630,16, 'High score: ' + highScore, { fontFamily: 'American Typewriter, serif', fill: '#DEAD33'});
	
	//DEBUGtext = this.add.text(16,16, '');
}

function update ()
{
	//Object movers
	if (gameStep === 1 || gameStep === 4) {
		Phaser.Actions.IncY(objGroup.getChildren(), 10);
		Phaser.Actions.IncY(trashGroup.getChildren(), 10);
		Phaser.Actions.IncY(oilGroup.getChildren(), 10);
		Phaser.Actions.IncY(carGroup.getChildren(), 5);
		Phaser.Actions.IncY(deerGroup.getChildren(), 10);
		Phaser.Actions.IncY(moneyGroup.getChildren(), 10);
	}

	//Object killers
    objGroup.children.iterate(function (cone) {
		if (cone.y > 600) {
            objGroup.killAndHide(cone);
        }
    });
	trashGroup.children.iterate(function (trash) {
		if (trash.y > 600) {
            trashGroup.killAndHide(trash);
        }
    });
	oilGroup.children.iterate(function (oil) {
		if (oil.y > 600) {
            oilGroup.killAndHide(oil);
        }
    });
	carGroup.children.iterate(function (car) {
		if (car.y > 600) {
            carGroup.killAndHide(car);
        }
    });
	deerGroup.children.iterate(function (deer) {
		if (deer.y > 600) {
            deerGroup.killAndHide(deer);
        }
    });
	moneyGroup.children.iterate(function (money) {
        if (money.y > 600) {
            moneyGroup.killAndHide(money);
        }
    });
	
	if (gameStep === 1 || gameStep === 4) {
		if (player.body.touching.none) {
		if (cursors.left.isDown)
		{
			player.setVelocityX(-240);
		}
		else if (cursors.right.isDown)
		{
			player.setVelocityX(240);
		}
		else
		{
			player.setVelocityX(0);
		}
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
	
	if (gameStep === 2) {
		fakePlayer.y -= 10;
	} else if (gameStep === 5) {
		if (fakePlayer.y < 350) {
			fakePlayer.y += 10;
		}
	}
}

function objEvent ()
{
	if (objTracker > 19) return;
	
	//0 = cone, 1 = trash, 2 = oil, 3 = car, 4 = deer
	if (objType[objTracker] === 0) {
		spawnCone();
	} else if (objType[objTracker] === 1) {
		spawnTrash();
	} else if (objType[objTracker] === 2) {
		spawnOil();
	} else if (objType[objTracker] === 3) {
		spawnCar();
	} else {
		spawnDeer();
	}
	
	objTracker++;
}

function spawnCone ()
{
	const cone = objGroup.get(objPos[objTracker], 0);
	
	if (!cone) return;
	
	cone.setActive(true);
	cone.setVisible(true);
	cone.setScale(0.2);
}

function spawnTrash ()
{
	const trash = trashGroup.get(objPos[objTracker], 0);
	
	if (!trash) return;
	
	trash.setActive(true);
	trash.setVisible(true);
	trash.setScale(0.2);
}

function spawnOil ()
{
	const oil = oilGroup.get(objPos[objTracker], 0);
	
	if (!oil) return;
	
	oil.setActive(true);
	oil.setVisible(true);
	oil.setScale(0.1);
}

function spawnCar ()
{
	const car = carGroup.get(objPos[objTracker], 0);
	
	if (!car) return;
	
	car.setActive(true);
	car.setVisible(true);
	car.setScale(0.2);
	car.body.setBoundsRectangle(new Phaser.Geom.Rectangle(400, 300, 400, 2000));
	
	const carDirection = Phaser.Math.Between(0, 2);
	
	if (carDirection === 0) {
		car.setVelocity(50, 0);
	} else if (carDirection === 1) {
		car.setVelocity(-50, 0);
	}
}

function spawnDeer ()
{
	const deer = deerGroup.get(objPos[objTracker], 0);
	
	if (!deer) return;
	
	deer.setActive(true);
	deer.setVisible(true);
	deer.setScale(2.5);
	deer.play({ key: 'deerWalk'});
	
	const deerDirection = Phaser.Math.Between(0, 2);
	
	if (deerDirection === 0) {
		deer.setVelocity(50, 0);
	} else if (deerDirection === 1) {
		deer.flipX=true;
		deer.setVelocity(-50, 0);
	}
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
	money.play({ key: 'coinSpin'});
	coinDropSnd.play();
	
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
	money.play({ key: 'coinSpin'});
	
	moneyTracker++;
}

function crash ()
{
	if (gameStep === 1 || gameStep === 4) {
		carDriveSnd.stop();
		sirenSnd.stop();
		if (gameStep === 1) {
			if (timer >= maxTime) {
				infoText.setText([
					'You\'ve escaped the cops!!!',
					'',
					'--> Click to play stage 2! <--'
				]);
				fakePlayer.x = player.x;
				player.y = -2000;
				winSnd.play();
			} else {
				infoText.setText([
					'You have crashed!!!',
					'',
					'--> Click to play stage 2! <--'
				]);
				crashSnd.play();
				player.y = -2000;
				exploObj.x = player.x;
				exploObj.play({ key: 'explosion'});
			}
		} else {
			if (timer >= maxTime) {
				infoText.setText([
					'You caught the perp! Thank you for playing!',
					'Final Score: ' + score,
					'High Score: ' + highScore,
					'--> Click to try again! <--'
				]);
				fakePlayer.x = player.x;
				winSnd.play();
			} else {
				infoText.setText([
					'You crashed and could not reach the perp!!!',
					'Final Score: ' + score,
					'High Score: ' + highScore,
					'--> Click to try again! <--'
				]);
				crashSnd.play();
				player.y = -2000;
				exploObj.x = player.x;
				exploObj.play({ key: 'explosion'});
			}
			if (score > highScore) {
				highScore = score;
			}
			
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
		coinGetSnd.play();
		score += 100;
		//increase score
	}
}