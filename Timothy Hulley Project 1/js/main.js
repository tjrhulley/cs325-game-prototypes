import "./phaser.js";

// You can copy-and-paste the code from any of the examples at https://examples.phaser.io here.
// You will need to change the `parent` parameter passed to `new Phaser.Game()` from
// `phaser-example` to `game`, which is the id of the HTML element where we
// want the game to go.
// The assets (and code) can be found at: https://github.com/photonstorm/phaser3-examples
// You will need to change the paths you pass to `this.load.image()` or any other
// loading functions to reflect where you are putting the assets.
// All loading functions will typically all be found inside `preload()`.

// The simplest class example: https://phaser.io/examples/v3/view/scenes/scene-from-es6-class

class gameScene extends Phaser.Scene {
    
	constructor() {
        super();
		
		var player;
		var houses;
    }
    
    preload() {
        this.load.image( 'pizzaLegs', 'assets/Pizza dude-1.png.png' );
		this.load.image( 'pizzaTorso', 'assets/Pizza dude-2.png.png' );
		this.load.image( 'skyTEMP', 'assets/sky.png' );
    }
    
    create() {
        this.add.image(400, 300, 'skyTEMP');
		this.add.image(400, 584, 'pizzaLegs');
		
		player = this.add.sprite(400, 568, 'pizzaTorso');
    }
    
    update() {
		if (cursors.left.isDown) {
			player.setVelocityX(-160);
		} 
		else if (cursors.right.isDown) {
			player.setVelocityX(160);
		}
		else if (cursors.up.isDown) {
			player.setVelocityY(-160);
		}
		else if (cursors.down.isDown) {
			player.setVelocityY(160);
		}
    }
}

const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: 'game',
    width: 800,
    height: 600,
    scene: gameScene,
    //physics: { default: 'arcade' },
});
