import "./phaser.js";

var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game',
    physics: {
        default: 'arcade',
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var enemies = [];
var player;
var shape;

var c = 0;
var timedEvent;

var dontMove = true;

var score = 0;
var scoreText;
var gameOverCheck = 0;
var infoText;
var spookyText;
var background;

var laugh;
var deathMusic;
var music;

var game = new Phaser.Game(config);

function preload ()
{
    this.load.image('bg', 'assets/Background.png');
	this.load.image('pizza', 'assets/Pizza_4.png');
	this.load.spritesheet('ghost', 'assets/DoggerEnemy.png', { frameWidth: 32, frameHeight: 32 });
	
	this.load.audio('music', 'assets/music.wav');
	this.load.audio('intro', 'assets/intro1.mp3');
	this.load.audio('deathMusic', 'assets/intro2.mp3');
	this.load.audio('laugh', 'assets/laugh.wav');
}

function create ()
{
	var spriteBounds = Phaser.Geom.Rectangle.Inflate(Phaser.Geom.Rectangle.Clone(this.physics.world.bounds), -20, -20);

	background = this.add.image(400, 300, 'bg');
	
	music = this.sound.add('music', { loop: true, volume: 0.5});
	var intro = this.sound.add('intro', { loop: false});
	laugh = this.sound.add('laugh', { loop: false});
	deathMusic = this.sound.add('deathMusic', { loop: false});

    for (var i = 0; i < 4; i++)
    {
        var pos = Phaser.Geom.Rectangle.Random(spriteBounds);

        
		const ghostIdle = this.anims.create({
            key: 'fly',
            frames: this.anims.generateFrameNumbers('ghost'),
            frameRate: 16,
			repeat: -1
        });

		var block = this.physics.add.sprite(pos.x, pos.y, 'ghost');
		block.setScale(2);

        //block.setVelocity(Phaser.Math.Between(50, 100), Phaser.Math.Between(50, 100));
		//block.setVelocity(Math.floor(Math.random() * 180) + 50, Math.floor(Math.random() * 300) - 150);
        block.setBounce(1).setCollideWorldBounds(true);

		/*
        if (Math.random() > 0.5)
        {
            block.body.velocity.x *= -2;
        }
        else
        {
            block.body.velocity.y *= -2;
        }
		*/
        enemies.push(block);
    }

    player = this.add.circle(400, 300, 120).setStrokeStyle(2, 0xff0000);
	
	shape = this.make.graphics();
	shape.fillStyle(0xffffff);
	shape.arc(0, 0, 120, 0, Math.PI * 2);
	shape.fillPath();
	
    this.input.on('pointermove', function (pointer) {

        player.x = pointer.x;
        player.y = pointer.y;
		shape.x = pointer.x;
		shape.y = pointer.y;

    }, this);
	
	this.input.on('pointerup', function (pointer) {

        if (dontMove)
        {
            intro.play();
			enemies.forEach(function (block) {
				block.setVelocity(Math.floor(Math.random() * 180) + 70, Math.floor(Math.random() * 300) - 170);
				//block.setVelocity(Phaser.Math.Between(100, 180), Phaser.Math.Between(100, 180));
				block.play({ key: 'fly'});
				
				if (Math.random() > 0.5)
				{
					block.body.velocity.x *= -2;
				}
				else
				{
					block.body.velocity.y *= -2;
				}
			}, this);
			
			timedEvent = this.time.addEvent({ delay: 150, callback: onEvent, callbackScope: this, loop: true });
			infoText.setText('');
			dontMove = false;
        }

    }, this);
	
	infoText = this.add.text(400, 300, '', { fontFamily: 'American Typewriter, serif', fontSize: '36px', fill: '#FFF', align: 'center' });
	infoText.setOrigin(0.5);
	infoText.setText([
		'Surround ghosts with the circle',
		'to earn points.',
		'',
		'Don\'t let three ghosts enter the',
		'circle at the same time, or',
		'YOU\'LL GET SPOOKED!',
		'',
		'-- Click to begin --'
	]);
	
	scoreText = this.add.text(16, 16, 'score: 0', { fontFamily: 'American Typewriter, serif', fontSize: '32px', fill: '#FFF' });
	spookyText = this.add.text(400, 300, '', { fontFamily: 'American Typewriter, serif', fontSize: '36px', fill: '#F00', align: 'center' });
	spookyText.setOrigin(0.5);
}

function update (time, delta)
{
    enemies.forEach(function (block) {
        block.setTint(0xffffff);
    });

    //  We need the top-left of the rect
    var x = player.x - (player.width / 2);
    var y = player.y - (player.height / 2);

    var within = this.physics.overlapCirc(player.x, player.y, player.width / 4, player.height);
	
	spookyText.setPosition(Phaser.Math.Between(300, 500), Phaser.Math.Between(250, 350));
	
	if (c === 14)
    {
		within.forEach(function (body) {
			body.gameObject.setTint(0xff0000);
			score++;
			scoreText.setText('Score: ' + score);
			gameOverCheck++;
		});
		
		if (gameOverCheck >= 3) 
		{
			scoreText.setText('Final score: ' + score);
			spookyText.setText('YOU GOT SPOOKED!!!');
			music.stop();
			laugh.play();
			deathMusic.play();
			enemies.forEach(function (block) {
				block.setVelocity(0,0);
			});
			c = 0;
		} else {
			gameOverCheck = 0;
		}
	}
}

function onEvent ()
{
    c++;
	enemies.forEach(function (block) {
        block.alpha -= 0.1;
    });
	background.alpha -= 0.1;

    if (c === 14)
    {
        const mask = shape.createGeometryMask();
		enemies.forEach(function (block) {
			block.alpha = 1;
			block.setMask(mask);
		});
		background.alpha = 1;
		background.setMask(mask);
		music.play();
		timedEvent.remove(false);
    }
}