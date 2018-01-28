let gm = gm||{};
gm.scene = {};

(function(){
	function initTableStuff(){
		{
			let item = new CrystalPortal();
			item.position.set(0, -500);
			item.snap();
			item.scale.set(1.3);
			gm.scene.projectionRoot.addChild(item);
		}
		{
			let item = new TableItem(new PIXI.Texture.fromImage("res/table_stuff/spirit_clock.png"), {stands:true, movable:true});
			item.position.set(-gm.app.screen.width *Math.random(), -500);
			item.snap();
			gm.scene.projectionRoot.addChild(item);

			let timeString = "00000";

			let bitmapText = new PIXI.extras.BitmapText(timeString, {font: "75px digital-regular", align: "center"});
			item.addChild(bitmapText);
			bitmapText.y -= 150;
			bitmapText.x -= 100;

			setInterval(()=>{
				let sample = "1234 567890!@#$%^&*()p87gBSAlpfkpЁ!";
				timeString = timeString.replaceAt(randi(timeString.length-1), randElem(sample));
				bitmapText.text = timeString;
			}, 1000);
		}
		{
			let item = new TableItem(new PIXI.Texture.fromImage("res/table_stuff/spirit_jar.png"), {stands:true});
			item.position.set(gm.app.screen.width * randfRange(0.3, 0.5), -200);
			item.snap();
			item.image.anchor.y = 0.8;
			item.tint = 0xCCCCFF
			item.ghosts = [];
			gm.scene.ghostStorage = item;
			gm.scene.projectionRoot.addChild(item);
			item.onDrag = function(){
				for(var i in item.ghosts){
					let g = item.ghosts[i];
					if(!g._original_scale)
						g._original_scale = g.scale.x;

					let trfm = gm.scene.ghostStorage.worldTransform;
					g.x = trfm.tx;
					g.y = trfm.ty;

					g.scale.set(trfm.a*g._original_scale);
				}
			};
			item.onUserInteract = function(){
				let g = item.ghosts.shift();
				if(!g) return;
				g.moveTo(0, -700/g.scale.x*item.scale.x);
				setTimeout(()=>{
					g.moveToAbsolute(gm.app.screen.width*randfRange(0.4, 0.6), gm.app.screen.height*randfRange(0.7, 0.9));
					g.heightLimit = g.widthLimit;
					g.addInteraction();
				}, 200);
			}
		}

		{
			let item = new TableItem(new PIXI.Texture.fromImage("res/table_stuff/spirit_numbers.png"), {stands:false, movable:false});
			item.position.set(-gm.app.screen.width/2, -400);
			item.image.scale.x = -1;
			gm.scene.projectionRoot.addChild(item);

			let score =  ("" + gm.play.score).padStart(6, "0");
			let bitmapText = new PIXI.extras.BitmapText(score, {font: "70px digital-regular", align: "left"});
			item.addChild(bitmapText);
			bitmapText.y += 185;
			bitmapText.x -= 130;
			setInterval(()=>{
				score =  ("" + gm.play.score).padStart(6, "0");
				bitmapText.text = score;
			}, 100);
		}

		{
			let item = new TableItem(new PIXI.Texture.fromImage("res/table_stuff/spirit_frame.png"), {stands:true, movable:true});
			item.position.set(-gm.app.screen.width *Math.random(), -500);
			item.snap();
			gm.scene.projectionRoot.addChild(item);
		}

	}
	function initTable(){
		// create a new Sprite from an image path
		var container = new PIXI.projection.Container2d();
		container.position.set(gm.app.screen.width / 2, gm.app.screen.height);

		//TODO: remove
		var squareFar = new PIXI.Sprite(PIXI.Texture.WHITE);
		squareFar.tint = 0xff0000;
		squareFar.alpha = 0;
		squareFar.factor = 1;
		squareFar.anchor.set(0.5);
		squareFar.position.set(gm.app.screen.width / 2, 50);

		var surface = new PIXI.projection.Sprite2d(new PIXI.Texture.fromImage("res/bkg.jpg"));
		surface.anchor.set(0.5, 1.0);
		//surface.scale.y = -1; //sorry, have to do that to make a correct projection
		surface.width = gm.app.screen.width*2;
		surface.height = gm.app.screen.height;

		gm.scene.root.addChild(container);
		gm.scene.root.addChild(squareFar);
		container.addChild(surface);
		gm.scene.projectionRoot = container;

		// Listen for animate update
		gm.app.ticker.add(function (delta) {
			// clear the projection
			container.proj.clear();
			container.updateTransform();
			// now we can get local coords for points of perspective
			let pos = container.toLocal(squareFar.position);
			//need to invert this thing, otherwise we'll have to use scale.y=-1 which is not good
			pos.y = -pos.y;
			pos.x = -pos.x;
			container.proj.setAxisY(pos, -squareFar.factor);
		});
	}
	function initCornerPapers(){
		//Без нее мигает)
		var panda = PIXI.Sprite.fromImage('res/panda.png');
		panda.anchor.set(1);
		gm.app.stage.addChild(panda);

		var container = new PIXI.Container();
		gm.scene.root.addChild(container);
		gm.scene.cornerPapers = {};
		gm.scene.cornerPapers.root = container;

		gm.scene.cornerPapers.addNew = function(){
			let item = new CornerPaper();
			container.addChild(item);

			return item;
		}
		gm.scene.cornerPapers.removeAll = function(){
			function rm(index){
				setTimeout(()=>container.children[index].removeFromGame(), randf(100));
			}
			for(var i in container.children){
				rm(i);
			}
		}
	}
	function initEnvironment(){
		function addLamp(where, scale){
			{
				var item = new PIXI.Sprite(new PIXI.Texture.fromImage("res/spirit_bulb.png"));
				item.anchor.set(0.5, 0);
				item.x = gm.app.screen.width*where;
				item.scale.set(scale);
				gm.scene.root.addChildAt(item, 0);

				createjs.Tween.get(item, {loop: true})
						.to({rotation:Math.PI*randfRange(-0.02, 0.02)}, randiRange(2000,5000), createjs.Ease.quadInOut)
					.to({rotation:0}, randiRange(2000,5000), createjs.Ease.quadInOut)
			}


			//light
			{
				var item = new PIXI.Sprite(new PIXI.Texture.fromImage("res/effects/pump_flare_0"+randiRange(4, 6)+".png"));
				item.anchor.set(0.5, 0.5);
				item.x = gm.app.screen.width*where;
				item.y = 400*scale;
				item.scale.set(20*scale);
				item.blendMode = PIXI.BLEND_MODES.SCREEN;
				item.alpha = 0.5;
				item.rotation = Math.PI*2*Math.random();
				item.tint = 0xFFDD56;
				gm.scene.root.addChildAt(item, 1);

				createjs.Tween.get(item, {loop: true})
					.to({alpha:0.53}, randiRange(60,200), createjs.Ease.linear)
					.to({alpha:0.5}, randiRange(60,200), createjs.Ease.linear)
					.to({alpha:0.47}, randiRange(60,200), createjs.Ease.linear)
			}
		}
		addLamp(0.2, 0.25);
		addLamp(0.8, 0.35);
		addLamp(0.55, 0.15);
	}
	function initMain(){
		var container = new PIXI.Container();
		gm.app.stage.addChild(container);

		gm.scene.root = container;
	}
	function initGhosts(){
		for(var i = 0;i < 3;i++){
			setTimeout(gm.spawnGhost, randf(3000));
		}
	}
	function whaitTillLoad(callback){
		var waitID = setInterval(()=>{
			if(gm.scene.ghostStorage.worldTransform.tx){
				clearInterval(waitID);
				callback();
			}
		}, 10);
	}
	function load(callback){
		const loader = new PIXI.loaders.Loader();
		loader.add('fnt', 'res/fonts/digital-regular/digital-regular.fnt')
		loader.load((loader, resources) => {
			PIXI.loaders.parseBitmapFontData(resources.fnt, new PIXI.Texture.fromImage("res/fonts/digital-regular/digital-regular.png")); 
			callback();
		});
	}
	gm.spawnGhost = function(){
		var strip = new BaseGhost("res/ghosts/flow/sprites_flow.json");
		gm.scene._ghostContainer.addChild(strip);

		strip.tint = 0xFFFFFF*Math.random();
		strip.scale.set(randfRange(0.8, 1.2));

		strip.y = gm.scene.ghostStorage.worldTransform.ty;
		strip.x = gm.scene.ghostStorage.worldTransform.tx;

		for(var i in strip.points){
			strip.points[i].x = 0;
			strip.points[i].y = -10000-i*10;
		}

		strip.moveTo(0, randiRange(-150, -50)/strip.scale.x)
		gm.scene.ghostStorage.ghosts.push(strip);
	}
	gm.scene.init = function(){
		load(()=>{

			gm.play = {};
			gm.play.score = 0;
			gm.play.boilers = 4;

			initMain();
			initTable();
			initTableStuff();

			initEnvironment();

			whaitTillLoad(()=>{
				var container = new PIXI.Container();
				container.filters = [new PIXI.filters.GlowFilter(15, 3, 1, 0xFFFFFF, 0.5)];
				gm.scene._ghostContainer = container;
				gm.scene.root.addChild(container);

				initGhosts();
				initCornerPapers();
			});
		});
	}
}())
