let gm = gm||{};
gm.tests = {};

(function(){
	gm.tests.pixiDefaults = function(){
		//simple sprite
		var panda = PIXI.Sprite.fromImage('res/panda.png');
		panda.texture.frame = new PIXI.Rectangle(0,0, 100,100);
		gm.app.stage.addChild(panda);
	}
	gm.tests.pixiProjections = function(){
		//projection
		for(var i = 0; i < 10;i++){
			let item = new TableItem(new PIXI.Texture.fromImage("res/panda.png"), {stands:Math.random()>0.5});
			item.position.set(-gm.app.screen.width *Math.random(), -gm.app.screen.height * Math.random());
			gm.scene.projectionRoot.addChild(item);
		}
	}
	function createTextureMesh(){
		var strip = new BaseGhost(PIXI.Texture.fromImage('res/snake.png'));
		gm.scene.root.addChild(strip);
		strip.y = 0;
		strip.x = 0;
		strip.tint = 0xFFFFFF*Math.random();
		strip.scale.set(0.3);
		strip.moveTo(gm.app.screen.width/2*randfRange(0.9,1.1),gm.app.screen.height/1.5*randfRange(0.9,1.1));
	}
	gm.tests.textureMesh = function(){
		for(var i = 0;i < 3;i++){
			createTextureMesh();
		}
	}
	gm.tests.ghostAvatar = function(){
		let g = new GhostAvatar("res/ghosts/spirit_sprites.json");
		gm.app.stage.addChild(g);
	}
	gm.tests.bitmapText = function(){
		let bitmapText = new PIXI.extras.BitmapText("text using a fancy font!", {font: "35px digital-regular", align: "right"});
		gm.scene.root.addChild(bitmapText);
	}
}())
