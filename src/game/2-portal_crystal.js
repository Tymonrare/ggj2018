let CrystalPortal = (() => {
	var crystalShift = 250;
	return class extends TableItem{
		constructor() {
			super(new PIXI.Texture.fromImage("res/table_stuff/spirit_pentagram.png"), {stands:true, movable:false});

			this.initCrystal();
			this.allowTeleport = true;
			this.snap();
			this.addRopes();
			this.addInteraction();
		}

		initCrystal(){
			var self = this;
			function makeGlitching(){
				var str = self.glitchSrt;
				splitfilter.uniforms.red[0] = randiRange(-str,str);
				splitfilter.uniforms.red[1] = randiRange(-str,str);

				splitfilter.uniforms.green[0] = randiRange(-str,str);
				splitfilter.uniforms.green[1] = randiRange(-str,str);

				splitfilter.uniforms.blue[0] = randiRange(-str,str);
				splitfilter.uniforms.blue[1] = randiRange(-str,str);
			}

			this.glitchSrt = 0;
			var splitfilter = new PIXI.filters.RGBSplitFilter();
			this.image.filters = [splitfilter];
			setInterval(makeGlitching, 100);

			var crystal = new PIXI.projection.Sprite2d(new PIXI.Texture.fromImage("res/table_stuff/spirit_crystal.png"));
			crystal.anchor.set(0.5, 1);
			crystal.y -= 70;
			crystal.x -= 20;
			crystal.scale.set(2);
			crystal.filters = [splitfilter];
			this.addChild(crystal);
			this.crystal = crystal;

			createjs.Tween.get(crystal, {loop: true})
				.to({y:-90}, 3000, createjs.Ease.quadInOut)
				.to({y:-70}, 3000, createjs.Ease.quadInOut)

			makeGlitching(); //do once to discard
		}

		addInteraction() {
			this.interactive = true;
			this
				.on('pointermove', this.handleGhosts)
				.on('pointerdown', this.sendGhost);
		}

		addRopes(){
			var pivotContainer = new PIXI.Container();
			pivotContainer.alpha = 0;
			pivotContainer.name = "ropes_pivot"
			this.addChildAt(pivotContainer, 1);
			pivotContainer.y -= crystalShift+70;
			pivotContainer.x -= 20;

			var ropesContainer = new PIXI.Container();
			this.ropesContainer = ropesContainer;
			this.ropesContainer.scale.set(0);
			pivotContainer.addChild(ropesContainer);

			this.teleportDirections = [];

			var ray = new PIXI.Sprite(new PIXI.Texture.fromImage("res/effects/ray.png"));
			ray.anchor.set(0,0.5);
			ray.scale.x = 5;
			ray.alpha = 0.7;
			pivotContainer.addChild(ray);
			ray.blendMode = PIXI.BLEND_MODES.ADD;
			this.highlightRopesRay = ray;

			var self = this;
			function add(index){
				// build a rope!
				var ropeLength = 45;

				var points = [];

				for (var i = 0; i < 25; i++) {
					points.push(new PIXI.Point(i * ropeLength, 0));
				}

				var rope = new PIXI.mesh.Rope(PIXI.Texture.fromImage('res/rope.png'), points);
				rope.rotation = Math.PI*2*(index/gm.play.boilers.count) + randfRange(-Math.PI*0.1, Math.PI*0.1);

				self.teleportDirections.push(rope.rotation);
				rope.scale.y = 0.5;
				rope.blendMode = PIXI.BLEND_MODES.ADD;
				rope.interactive = false;
				ropesContainer.addChild(rope);

				var text = new PIXI.Text('to ' + index, {fontFamily : 'Arial', fontSize: 44, fill : 0xFFFFFF});
				pivotContainer.addChild(text);
				text.x = Math.cos(rope.rotation)*200;
				text.y = Math.sin(rope.rotation)*200;

				// start animating
				var count = randf(10);
				gm.app.ticker.add(function() {
					count += randfRange(0.01, 0.05);

					// make the snake
					for (var i = 0; i < points.length; i++) {
						var lfactor = (i/points.length);
						points[i].y = Math.sin((i * 0.5) + count) * 50 * lfactor;
						points[i].x = i * ropeLength + Math.cos((i * 0.3) + count) * 30 * lfactor;
					}
				});

			}

			for(var i = 0; i < gm.play.boilers.count;i++)
				add(i);
		}

		allowTransfer(ghost){
			this.allowTeleport = false; //do not accept new ghosts

			this.ropesContainer.scale.set(1);

			createjs.Tween.get(this.getChildByName("ropes_pivot"), {loop: false})
				.to({alpha:1}, 1000, createjs.Ease.quartInOut)
			this.glitchSrt = 4;
			this.containsGhost = ghost;
		}

		sendGhost(){
			if(!this.containsGhost || this.allowTeleport) return;
			this.tranfering = true;

			createjs.Tween.get(this.highlightRopesRay, {loop: false})
				.to({alpha:1}, 50, createjs.Ease.quartInOut)
				.to({alpha:0.7}, 1000, createjs.Ease.quartIn) //just return for next animation

			//scale in another tween
			createjs.Tween.get(this.highlightRopesRay.scale, {loop: false})
				.to({x:7, y:2.5}, 200, createjs.Ease.quadOut)
				.to({x:5, y:1}, 1000, createjs.Ease.quartIn) //just return for next animation


			createjs.Tween.get(this.getChildByName("ropes_pivot"), {loop: false})
				.to({alpha:0}, 2000, createjs.Ease.quartInOut)

			this.glitchSrt = 0;

			this.containsGhost.vanishInPoint = false;
			createjs.Tween.get(this.containsGhost, {loop: false, override:true})
				.to({alpha:1}, 300, createjs.Ease.quartIn)

			this.containsGhost.moveToAbsolute(
				this.ropesContainer.worldTransform.tx + Math.cos(this.highlightRopesRay.rotation)*1200, 
				this.ropesContainer.worldTransform.ty + Math.sin(this.highlightRopesRay.rotation)*1200);

			setTimeout(()=>{
				this.allowTeleport = true; //do not accept new ghosts
				this.tranfering = false;

				this.containsGhost.linkPaper.removeFromGame();
				this.containsGhost.parent.removeChild(this.containsGhost);

				this.ropesContainer.scale.set(0);
				gm.play.soulsSent += 1;

				var g = this.containsGhost;
				var b = gm.play.boilers.souls[this.targetBoiler];
				b.toppers[g.topperType] = (b.toppers[g.topperType]||0)+1;
				b.deathCauses[g.deathCause] = (b.deathCauses[g.deathCause]||0)+1;
				b.mouths[g.mouthType] = (b.mouths[g.mouthType]||0)+1;
				b.colors[g.colorName] = (b.colors[g.colorName]||0)+1;

				this.containsGhost = null;
			}, 1000);
		}

		handleGhosts(event){
			if(!this.tranfering && gm.activeGhost && this.allowTeleport && this.crystal.getBounds().contains(event.data.global.x, event.data.global.y)){
				gm.activeGhost.interactive = false;
				gm.activeGhost.vanishInPoint = true;

				gm.activeGhost.moveToAbsolute(
					this.ropesContainer.worldTransform.tx,
					this.ropesContainer.worldTransform.ty);

				createjs.Tween.get(gm.activeGhost, {loop: false})
					.to({alpha:0}, 1000, createjs.Ease.quartInOut)

				this.allowTransfer(gm.activeGhost);

				gm.activeGhost = null;
			}
			else if(this.containsGhost && !this.tranfering){
				var mousepos = event.data.global;
				var thispos = new PIXI.Point(
					this.worldTransform.tx,
					this.worldTransform.ty - crystalShift
				);
				var dir = new PIXI.Point(
					mousepos.x - thispos.x,
					thispos.y -	mousepos.y
				)

				function rotate(p, theta) {
					var xtemp = p.x;
					p.x = p.x * Math.cos(theta) - p.y * Math.sin(theta);
					p.y = xtemp * Math.sin(theta) + p.y * Math.cos(theta);
				};

				rotate(dir, Math.PI/2);

				var angle = Math.atan2(dir.x, dir.y);

				var nearest = 0;
				var _nearestVal = 999;
				for(var i in this.teleportDirections){
					var value = calculateDifferenceBetweenAngles(angle+Math.PI/2+Math.PI/4, this.teleportDirections[i]);
					if(value < _nearestVal){
						nearest = i;
						_nearestVal = value
					}
				}

				for(var i in this.ropesContainer.children){
					var rope = this.ropesContainer.children[i];
					if(i != nearest)
						rope.tint = 0xFFFFFF;
					else{
						rope.tint = 0xFFBBBB;
						this.highlightRopesRay.rotation = rope.rotation;
						this.targetBoiler = i;
					}
				}

			}
		}
	}
})();
