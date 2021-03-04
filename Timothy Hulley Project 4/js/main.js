import "./phaser.js";

var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
	parent: 'game',
    physics: {
        default: 'matter',
        /*arcade: {
            gravity: { y: 300 },
            debug: false
        },*/
		matter: {
            debug: false,
            gravity: { y: 1 }
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var player;
var timer = 0;
var scoreTimer = 0.0;
var floor;
var step1;
var step2;
var step3;
var step4;
var door;
var roomSign;
var cursors;
var box;

var winSound;
var loseSound;
var gameOver = false;
var infoText;

var game = new Phaser.Game(config);

function preload ()
{
    this.load.image('sky', 'assets/Wallpaperf1.jpg');
    this.load.image('ground', 'assets/platform3.jpg');
	this.load.image('box', 'assets/box.png');
	this.load.image('door', 'assets/sign_browndoor.png');
	this.load.image('wordart', 'assets/wordart.png');
	this.load.image('roomsign', 'assets/roomsign.jpg');
    //this.load.spritesheet('dude', 'assets/dude.png', { frameWidth: 32, frameHeight: 48 });
	this.load.spritesheet('dude', 'assets/Old hero.png', { frameWidth: 16, frameHeight: 16 });
	
	this.load.audio('lose', 'assets/Ohmygod.mp3');
	this.load.audio('win', 'assets/yay.wav');
}

function create ()
{
    this.matter.world.setBounds(0, 0, 800, 600, 1, true, true, true, false);
	
	winSound = this.sound.add('win', { loop: false, volume: 0.5});;
	loseSound = this.sound.add('lose', { loop: false, volume: 0.3});;
	
	this.add.image(400, 300, 'sky');

    floor = this.matter.add.image(400, 568, 'ground', null, {isStatic: true}).setScale(2);
	floor.setTint(0xc49d84);
	
	step1 = this.matter.add.image(700, 504, 'ground', null, {isStatic: true}).setScale(2);
	step2 = this.matter.add.image(800, 440, 'ground', null, {isStatic: true}).setScale(2);
	step3 = this.matter.add.image(900, 376, 'ground', null, {isStatic: true}).setScale(2);
	step4 = this.matter.add.image(1000, 312, 'ground', null, {isStatic: true}).setScale(2);
	door = this.add.image(750, 214, 'door');
	door.setScale(0.1);
	roomSign = this.add.image(750, 130, 'roomsign');
	roomSign.setScale(0.6);
	
	var sign = this.add.image(250, 150, 'wordart');
	sign.setScale(0.25);
	/*
	for (var i = 0; i < 4; i++) {
		 var floor = this.matter.add.image(400, 568, 'ground', null, {isStatic: true}).setScale(2);
	}*/

    //platforms.create(400, 568, 'ground').setScale(2).refreshBody();
	/*
    platforms.create(600, 400, 'ground');
    platforms.create(50, 250, 'ground');
    platforms.create(750, 220, 'ground');
	*/
    player = this.matter.add.sprite(100, 450, 'dude');
	player.setScale(2);
	player.setFixedRotation();

    //player.setBounce(0.2);
    //player.setCollideWorldBounds(true);
	//player.setPushable(false);
	
	box = this.matter.add.sprite(100, 300, 'box');
	//box.setCollideWorldBounds(true);
	//box.setInteractive(true);
	box.setBounce(1.5);
	box.setFrictionAir(0.05);
	//box.setDrag(100,100);
	//player.setFriction(1, 0);

    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('dude', { start: 18, end: 22 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'turn',
        frames: [ { key: 'dude', frame: 11 } ],
        frameRate: 20
    });
/*
    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1
    });
*/
    cursors = this.input.keyboard.createCursorKeys();
	
	infoText = this.add.text(400, 300, '', { fontFamily: 'American Typewriter, serif', fontSize: '36px', fill: '#F0F', align: 'center' });
	infoText.setOrigin(0.5);

    //this.physics.add.collider(player, platforms);
	//this.physics.add.collider(box, platforms);
	//this.physics.add.collider(box, player);
	
	this.matter.world.on('collisionstart', function (event) {

        

    });
}

function update ()
{
    if (!gameOver) {
		timer++;
		scoreTimer += 0.02;
		if (timer === 10) {
			floor.y += 1;
			step1.y += 1;
			step2.y += 1;
			step3.y += 1;
			step4.y += 1;
			door.y +=1;
			roomSign.y +=1;
			timer = 0;
		}
	
		if (player.y > 620) {
			player.setTint(0xff0000);
			infoText.setText([
				'You have sunk into the quicksand!',
				'GAME OVER'
			]);
			loseSound.play();
			gameOver = true;
		}
	
		if (box.y > 600) {
			box.setTint(0xff0000);
			infoText.setText([
				'The luggage sunk into the quicksand!',
				'GAME OVER'
			]);
			loseSound.play();
			gameOver = true;
		}
	
		if (box.x > 700) {
			box.setTint(0x00ff00);
			scoreTimer = Math.round(scoreTimer*100)/100;
			infoText.setText([
				'The luggage was delivered!',
				'YOU WON',
				'',
				'Time: ' + scoreTimer
			]);
			winSound.play();
			gameOver = true;
		}
	
		if (cursors.left.isDown)
		{
			player.setVelocityX(-5);
			player.scaleX=-2;
			player.setFixedRotation();
			player.anims.play('left', true);
		}
		else if (cursors.right.isDown)
		{
			player.setVelocityX(5);
			player.scaleX=+2;
			player.setFixedRotation();
			player.anims.play('left', true);
		}
		else
		{
			player.setVelocityX(0);

			player.anims.play('turn');
		}

		if (cursors.up.isDown /*&& player.isTouching.platforms*/)
		{
			player.setVelocityY(-6);
		}
	}
}
