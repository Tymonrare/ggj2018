let gm = gm||{};
gm.scene = {};

(function(){
	function initTableStuff(){
		{
			for(var i = 0;i < 10;i++){
				var index = randi(5)
				var stands = !!(index >=3 && randi(1));
				let item = new TableItem(new PIXI.Texture.fromImage("res/table_stuff/small/"+index+".png"), {stands:stands, movable:true});
				item.position.set(randfRange(-gm.app.screen.width/2, gm.app.screen.width/2), -randf(gm.app.screen.height));
				if(stands)
					item.rotation = randfRange(-Math.PI/10, Math.PI/10);
				else
					item.image.rotation = Math.PI*2*Math.random();
				item.snap();
				gm.scene.projectionRoot.addChild(item);
			}
		}
		var items = ["pen", "pencil"];
		for(var i in items)
		{
			let item = new TableItem(new PIXI.Texture.fromImage("res/table_stuff/small/"+items[i]+".png"), {stands:false, movable:true});
			item.position.set(randfRange(-gm.app.screen.width/2, gm.app.screen.width/2), -randf(gm.app.screen.height));
			item.snap();
			item.image.scale.set(0.3);
			item.image.rotation = Math.PI*2*Math.random();
			gm.scene.projectionRoot.addChild(item);
		}
		{
			let item = new CrystalPortal();
			item.position.set(0, -500);
			item.snap();
			item.scale.set(1.3);
			gm.scene.projectionRoot.addChild(item);
		}
		{
			let item = new TableItem(new PIXI.Texture.fromImage("res/table_stuff/spirit_cup.png"), {stands:true, movable:true});
			item.position.set(randfRange(-gm.app.screen.width/2, gm.app.screen.width/2), -500);
			item.image.scale.set(0.7);
			item.snap();
			gm.scene.projectionRoot.addChild(item);
		}
		{
			let item = new TableItem(new PIXI.Texture.fromImage("res/table_stuff/spirit_clock.png"), {stands:true, movable:true});
			item.position.set(randfRange(-gm.app.screen.width/2, gm.app.screen.width/2), -500);
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
			gm.scene.projectionRoot.addChild(item);

			let score =  ("" + gm.play.score).padStart(6, "0");
			let scoreText = new PIXI.extras.BitmapText(score, {font: "70px digital-regular", align: "left"});
			item.addChild(scoreText);
			scoreText.y += 185;
			scoreText.x -= 150;

			let souls =  ("" + gm.play.soulsSent).padStart(6, "0");
			let soulsText = new PIXI.extras.BitmapText(score, {font: "70px digital-regular", align: "left"});
			item.addChild(soulsText);
			soulsText.y += 350;
			soulsText.x -= 150;

			setInterval(()=>{
				score =  ("" + gm.play.score).padStart(6, "0");
				souls =  ("" + gm.play.soulsSent).padStart(6, "0");
				scoreText.text = score;
				soulsText.text = souls;
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
		var container = new PIXI.Container();
		gm.scene.root.addChild(container);
		gm.scene.cornerPapers = {};
		gm.scene.cornerPapers.root = container;

		gm.scene.cornerPapers.addNew = function(){
			let item = new CornerPaper();
			container.addChildAt(item, 1);

			return item;
		}
		gm.scene.cornerPapers.updateRotations = function(){
			for(var i = 1;i < container.children.length;i++){
				let rotation = Math.PI/10 - Math.PI/14*i;
				container.children[i].cornerPos.rotation = rotation;
				if(container.children[i].state == 0)
					createjs.Tween.get(container.children[i], {loop: false})
						.to(container.children[i].cornerPos, 300 + i*100, createjs.Ease.quartInOut)
			}
		}
		gm.scene.cornerPapers.removeAll = function(){
			function rm(index){
				setTimeout(()=>container.children[index].removeFromGame(), randf(100));
			}
			//first paper is parmanent
			for(var i = 1; i < container.children.length;i++)
				rm(i);
		}

		initMainPaper();
	}
	function initMainPaper(){
		var container = new PIXI.Container();
		gm.scene.cornerPapers.root.addChild(container);

		function addPaper(index){
			var factor = (i / gm.play.boilers.count);
			var paper = new CornerPaper();
			container.addChild(paper);
			paper.cornerPos.y -= 700 - 100*factor;
			paper.cornerPos.x += 300 - 100*factor;
			paper.cornerPos.rotation = Math.PI/5 - Math.PI*factor/7;
			paper.autoPutForward = false;

			var numberText = new PIXI.Text(index + ' Boiler', {fontFamily : 'Arial', fontSize: 16, fill : 0x111111});
			numberText.y = 280;
			numberText.x = -200;
			paper.addChild(numberText);

			var basicText = new PIXI.Text('Basic text in pixi', {fontFamily : 'Arial', fontSize: 20, fill : 0x111111});
			basicText.y = -280;
			basicText.x = -200;
			paper.addChild(basicText);

			setInterval(()=>{
				var text = ""

				var b = gm.play.boilers.souls[index];

				var combos = {};
				var singles = 0;
				function processText(param){
					for(var key in param){
						text += "\t\t" + key + ": " + param[key] + "\n";
						if(param[key] > 1)
							combos["x" + param[key]] = (combos["x" + param[key]]||0)+1
						else
							singles++;
					}
				}

				text += "Boiler " + index + ":\n";

				text += " DEATH CAUSES:\n";
				processText(b.deathCauses);

				text += " TOPPERS:\n";
				processText(b.toppers);

				text += " MOUTHS:\n";
				processText(b.mouths);

				text += " COLORS:\n";
				processText(b.colors);

				text += "\n\n SINGLES: " + singles;
				text += "\t(+" + singles*2 + "points)";

				text += "\n DUPLICATIONS: ";
				var pluspoints = 0;
				for(var key in combos){
					text += " " + key + ": " + combos[key];
					pluspoints += Math.pow(parseInt(key.slice(1)), combos[key]);
				}
				text += "\t(-" + pluspoints + "points)";

				basicText.text = text;
			}, 100);
		}

		for(var i = gm.play.boilers.count-1; i >=0 ;i--)
			addPaper(i);

	}
	let tvinstanced = false;
	function initTV(){
		var item = new PIXI.Sprite(new PIXI.Texture.fromImage("res/spirit_chain.png"));
		item.anchor.set(0.5, 0);
		item.x = gm.app.screen.width*0.1;
		item.y -= 100;
		item.scale.set(0.7);
		gm.scene.root.addChildAt(item, 0);

		item.interactive = true;
		item.on('pointerdown', ()=>{
			createjs.Tween.get(item, {loop: false})
				.to({y:-30}, 300, createjs.Ease.elasticInOut)

			var ctv = new PIXI.Container();
			var tv = new PIXI.Sprite(new PIXI.Texture.fromImage("res/spirit_tv.png"));
			tv.anchor.set(0.5, 0.5);
			ctv.x = gm.app.screen.width*randfRange(0.1,0.9);
			ctv.y = -200;
			ctv.skew.x = 0.1;
			ctv.skew.y = randfRange(-0.2, 0.2);
			gm.scene.root.addChild(ctv);

			var texture = PIXI.Texture.fromVideo('res/video/swingwing.mp4');
			texture.baseTexture.source.loop = true;
			if(tvinstanced)
				texture.baseTexture.source.volume = 0;

			tvinstanced = true;

			var videoSprite = new PIXI.Sprite(texture);			
			videoSprite.anchor.set(0.6, 0.5);
			videoSprite.scale.set(0.7);
			ctv.addChild(videoSprite);
			ctv.addChild(tv);

			gm.themesound.stop();

			createjs.Tween.get(ctv, {loop: false})
				.to({y:gm.app.screen.height*randfRange(0.5,0.9)}, 700, createjs.Ease.bounceOut)
		});
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
				item.scale.set(30*scale);
				item.blendMode = PIXI.BLEND_MODES.ADD;
				item.alpha = 0.5;
				item.rotation = Math.PI*2*Math.random();
				item.tint = 0xFFDDAA;
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

		initTV();

		var back = new PIXI.Sprite(new PIXI.Texture.fromImage("res/back.jpg"));
		gm.scene.root.addChildAt(back, 0)
		back.tint = 0x333333;
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
	function calcScore(){
		gm.play.score = 0;

		var combos = {};
		var singles = 0;
			for(var i = 0; i < gm.play.boilers.count;i++){
				var b = gm.play.boilers.souls[i];
				for(var bkey in b)
					for(var key in b[bkey]){
						if(b[bkey][key] > 1)
							combos["x" + b[bkey][key]] = (combos["x" + b[bkey][key]]||0)+1
						else
							singles++;
					}
			}
		for(var key in combos){
			var add = Math.pow(parseInt(key.slice(1)), combos[key]);
			gm.play.score -= add;
		}
		gm.play.score += singles*2;
	}
	gm.spawnGhost = function(){
		var strip = new BaseGhost("res/ghosts/flow/sprites_flow.json");
		gm.scene._ghostContainer.addChild(strip);

		strip.tint = 0xFFFFFF*Math.random();
		strip.scale.set(randfRange(0.8, 1));

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
		gm.play = {};
		gm.play.deathCauses = [
			"Ischaemic heart disease",
			"Stoke",
			"Lower respiratory",
			"Chronic obstructive",
			"Trachea cancer",
			"Bronchus cancer",
			"Lung cancer",
			"Diabetes mellitus",
			"Alzheimer disease",
			"Diarrhoeal disease",
			"Tuberculosis",
			"Road injury",
			"Brick injury",
			"Accident"
		];
		gm.play.colors = {};

		var colorNames = Object.keys(commonColors);
		for(var i = 0;i < 7;i++){
			var c = randElem(colorNames);
			gm.play.colors[c] = commonColors[c];
		}

		gm.play.score = 0;
		setInterval(calcScore, 100);
		gm.play.soulsSent = 0;
		gm.play.boilers = {};
		gm.play.boilers.count = randiRange(3,5);
		gm.play.boilers.souls = [];
		for(var i = 0; i < gm.play.boilers.count;i++){
			gm.play.boilers.souls.push({
				toppers:{},
				deathCauses:{},
				mouths:{},
				colors:{}
			});
		}

		gm.themesound = new Howl({
			src: ["res/music/theme.mp3"],
			autoplay: true,
			loop: true,
			volume: 0.5
		});

		load(()=>{
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

			setInterval(()=>{
				if(!randi(gm.scene.cornerPapers.root.children.length)) gm.spawnGhost();
			}, 5050);
		});
	}
}())
