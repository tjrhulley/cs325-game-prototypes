import "./phaser.js";

// You can copy-and-paste the code from any of the examples at https://examples.phaser.io here.
var config = {
    type: Phaser.WEBGL,
    width: 640,
    height: 480,
    parent: 'game',
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var snake;
var legs;
var food1;
var food2;
var food3;
var food4;
var cursors;

//  Direction consts
var UP = 0;
var DOWN = 1;
var LEFT = 2;
var RIGHT = 3;
var dontMove = 1;
var toReset = 4;

var score = 0;
var scoreText;

var get1;
var get2;
var death;

var game = new Phaser.Game(config);

function preload ()
{
    this.load.image('food', 'assets/Pizza_0.png');
    this.load.image('body', 'assets/Pizza_1.png');
	this.load.image('middle', 'assets/Pizza_2.png');
	this.load.image('house', 'assets/Pizza_3.png');
	this.load.image('pizza', 'assets/Pizza_4.png');
	this.load.image('sky', 'assets/sky.png' );
	
	this.load.audio('coin1', 'assets/Get1.wav');
	this.load.audio('coin2', 'assets/Get2.wav');
	this.load.audio('coin3', 'assets/Get3.wav');
	this.load.audio('death', 'assets/Explosion.wav');
}

function create ()
{
	this.add.image(320, 240, 'sky');
	this.add.image(30, 30, 'pizza');
	legs = this.add.image(320, 464, 'food');
	scoreText = this.add.text(64, 16, 'score: 0', { fontSize: '32px', fill: '#000' });
	
	get1 = this.sound.add('coin1');
	get2 = this.sound.add('coin3');
	death = this.sound.add('death');
	
    var Food = new Phaser.Class({

        Extends: Phaser.GameObjects.Image,

        initialize:

        function Food (scene, x, y)
        {
            Phaser.GameObjects.Image.call(this, scene)

            this.setTexture('house');
            this.setPosition(x * 16, y * 16);
            this.setOrigin(0);

            this.total = 0;
			
			this.lootGet = false;

            scene.children.add(this);
        },

        eat: function ()
        {
            this.lootGet = true;
			this.total++;
			if (toReset > 0)
			{
				get1.play();
			}
			score += 50;
			scoreText.setText('Score: ' + score);
        }

    });

    var Snake = new Phaser.Class({

        initialize:

        function Snake (scene, x, y)
        {
            this.headPosition = new Phaser.Geom.Point(x, y);

            this.body = scene.add.group();

            this.head = this.body.create(x * 16, y * 16, 'body');
            this.head.setOrigin(0);

            this.alive = true;

            this.speed = 70;

            this.moveTime = 0;

            this.tail = new Phaser.Geom.Point(x, y);

            this.heading = UP;
            this.direction = UP;
        },

        update: function (time)
        {
            if (dontMove == 0)
            {
				if (time >= this.moveTime)
				{
					this.grow();
					return this.move(time);
				}
			}
        },

        faceLeft: function ()
        {
            if (this.direction === UP || this.direction === DOWN)
            {
                this.heading = LEFT;
            }
        },

        faceRight: function ()
        {
            if (this.direction === UP || this.direction === DOWN)
            {
                this.heading = RIGHT;
            }
        },

        faceUp: function ()
        {
            if (this.direction === LEFT || this.direction === RIGHT)
            {
                this.heading = UP;
            }
        },

        faceDown: function ()
        {
            if (this.direction === LEFT || this.direction === RIGHT)
            {
                this.heading = DOWN;
            }
        },

        move: function (time)
        {
            /**
            * Based on the heading property (which is the direction the pgroup pressed)
            * we update the headPosition value accordingly.
            * 
            * The Math.wrap call allow the snake to wrap around the screen, so when
            * it goes off any of the sides it re-appears on the other.
            */
            switch (this.heading)
            {
                case LEFT:
                    this.headPosition.x = Phaser.Math.Wrap(this.headPosition.x - 1, 0, 40); //set the values to 0 and 40 if this doesn't work
                    break;

                case RIGHT:
                    this.headPosition.x = Phaser.Math.Wrap(this.headPosition.x + 1, 0, 40);
                    break;

                case UP:
                    this.headPosition.y = Phaser.Math.Wrap(this.headPosition.y - 1, 0, 30);
                    break;

                case DOWN:
                    this.headPosition.y = Phaser.Math.Wrap(this.headPosition.y + 1, 0, 30);
                    break;
            }

            this.direction = this.heading;

            //  Update the body segments and place the last coordinate into this.tail
            Phaser.Actions.ShiftPosition(this.body.getChildren(), this.headPosition.x * 16, this.headPosition.y * 16, 1, this.tail);

            //  Check to see if any of the body pieces have the same x/y as the head
            //  If they do, the head ran into the body

            var hitBody = Phaser.Actions.GetFirst(this.body.getChildren(), { x: this.head.x, y: this.head.y }, 1);

            if (hitBody)
            {
                console.log('dead');

                this.alive = false;
				
				scoreText.setText('FINAL SCORE: ' + score);
				
				death.play();

                return false;
            }
            else
            {
                //  Update the timer ready for the next movement
                this.moveTime = time + this.speed;

                return true;
            }
        },

        grow: function ()
        {
            var newPart = this.body.create(this.tail.x, this.tail.y, 'middle');

            newPart.setOrigin(0);
        },

        collideWithFood: function (food)
        {
            if (this.head.x === food.x && this.head.y === food.y)
            {
                food.eat();
				
				food.eat();
                food.setPosition(-50, -50);

                //  For every 5 items of food eaten we'll increase the snake speed a little
                if (this.speed > 20 && food.total % 5 === 0)
                {
                    this.speed -= 5;
                }

                return true;
            }
            else
            {
                return false;
            }
        },

        updateGrid: function (grid)
        {
            //  Remove all body pieces from valid positions list
            this.body.children.each(function (segment) {

                var bx = segment.x / 16;
                var by = segment.y / 16;

                grid[by][bx] = false;

            });

            return grid;
        },
		
		resetSnake: function ()
        {
            this.body.clear(true);
            this.head = this.body.create(snake.x, snake.y, 'body');
            this.head.setOrigin(0);
            this.tail = new Phaser.Geom.Point(snake.x, snake.y);
			legs.setPosition(snake.x, snake.y);
			get2.play();
        }

    });

    food1 = new Food(this, 10, 8);
    food2 = new Food(this, 20, 6);
    food3 = new Food(this, 30, 8);
	food4 = new Food(this, 20, 12);

    snake = new Snake(this, 18, 26);

    //  Create our keyboard controls
    cursors = this.input.keyboard.createCursorKeys();
}

function update (time, delta)
{
    if (!snake.alive)
    {
        return;
    }

    /**
    * Check which key is pressed, and then change the direction the snake
    * is heading based on that. The checks ensure you don't double-back
    * on yourself, for example if you're moving to the right and you press
    * the LEFT cursor, it ignores it, because the only valid directions you
    * can move in at that time is up and down.
    */
    if (cursors.left.isDown)
    {
        dontMove = 0;
		//snake.head.angle = -90;
		snake.faceLeft();
    }
    else if (cursors.right.isDown)
    {
        dontMove = 0;
		//snake.head.angle = 90;
		snake.faceRight();
    }
    else if (cursors.up.isDown)
    {
        dontMove = 0;
		//snake.head.angle = 0;
		snake.faceUp();
    }
    else if (cursors.down.isDown)
    {
        dontMove = 0;
		//snake.head.angle = 180;
		snake.faceDown();
    }

    if (snake.update(time))
    {
        //  If the snake updated, we need to check for collision against food

        if (snake.collideWithFood(food1))
        {
            toReset -= 1;           
        }
        if (snake.collideWithFood(food2))
        {
            toReset -= 1;           
        }
        if (snake.collideWithFood(food3))
        {
           toReset -= 1;            
        }
		if (snake.collideWithFood(food4))
        {
           toReset -= 1;            
        }
        if (toReset <= 0)
        {
            repositionFood(food1);
            repositionFood(food2);
            repositionFood(food3);
			repositionFood(food4);
			snake.resetSnake();
			legs.setPosition((snake.x - 16) * 1, (snake.y - 16) * 1);
            toReset = 4;
			//dontMove = 1;
        }
    }
}

/**
* We can place the food anywhere in our 40x30 grid
* *except* on-top of the snake, so we need
* to filter those out of the possible food locations.
* If there aren't any locations left, they've won!
*
* @method repositionFood
* @return {boolean} true if the food was placed, otherwise false
*/
function repositionFood (food)
{
    //  First create an array that assumes all positions
    //  are valid for the new piece of food

    //  A Grid we'll use to reposition the food each time it's eaten
    var testGrid = [];

    for (var y = 0; y < 30; y++)
    {
        testGrid[y] = [];

        for (var x = 0; x < 40; x++)
        {
            testGrid[y][x] = true;
        }
    }

    snake.updateGrid(testGrid);

    //  Purge out false positions
    var validLocations = [];

    for (var y = 0; y < 30; y++)
    {
        for (var x = 0; x < 40; x++)
        {
            if (testGrid[y][x] === true)
            {
                //  Is this position valid for food? If so, add it here ...
                validLocations.push({ x: x, y: y });
            }
        }
    }

    if (validLocations.length > 0)
    {
        //  Use the RNG to pick a random food position
        var pos = Phaser.Math.RND.pick(validLocations);

        //  And place it
        food.setPosition(pos.x * 16, pos.y * 16);

        return true;
    }
    else
    {
        return false;
    }
}
