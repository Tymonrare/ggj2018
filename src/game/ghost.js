let BaseGhost = (() => {
	// build a rope!
	var ropeLength = 20;
	var widthLimit = 150;
	var heightLimit = 50;

	var refLength = 0.13; //"Scale" factor in update.sin()

	return class extends PIXI.Container{
		constructor(config) {
			super();

			var points = [];

			for (var i = 0; i < 25; i++) {
				points.push(new PIXI.Point(i * ropeLength, 0));
			}

			this.randSeed = randi(999999);
			this.color = randfRange(0.5, 1)*0xFFFFFF; 

			var rowbody = gm.utils.loadCoa_tools_faces(config, {color:this.color, seed:this.randSeed}, ()=>{
				rowbody.cacheAsBitmap = true;
				var texture = gm.app.renderer.generateTexture(rowbody);
				var body = new PIXI.mesh.Rope(texture, points);
				body.blendMode = PIXI.BLEND_MODES.ADD;
				body.y = rowbody.getBounds().height-50;
				this.addChild(body);

				/*
				{
					var item = new PIXI.Sprite(texture);
					item.anchor.set(0, 0);
					item.y -= rowbody.getBounds().height-50;
					gm.scene.root.addChild(item);
				}
				*/
			});

			this.points = points;
			this.moveSpeed = randfRange(0.02, 0.05);

			this.widthLimit = widthLimit*randfRange(0.5, 1.2);
			this.heightLimit = heightLimit*randfRange(0.5, 1.2);
			this.timeRotateFactor = 0.1;

			this.count = randf(10);
			this.targetPoint = { x:0, y:0 };
			this.leadingPoint = this.points.length;
			this.vanishInPoint = false;

			this.addLinkedPaper();

			gm.app.ticker.add((dt)=>this.update(dt));
		}

		addLinkedPaper(){
			this.linkPaper = gm.scene.cornerPapers.addNew();
			let g = new GhostAvatar("res/ghosts/avatars/spirit_sprites.json", {color:this.color, seed:this.randSeed});
			g.scale.set(0.7);
			g.position.set(-200,-300);
			this.linkPaper.addChild(g);
		}

		moveToAbsolute(x,y, onTargetReached){
			this.moveTo(
				(x - this.position.x)/this.scale.x,
				(y - this.position.y)/this.scale.y,
				onTargetReached
			)
		}

		moveTo(x, y, onTargetReached){
			this.targetPoint = {x:x, y:y};
			this.moveToPoint = true;

			this.leadingPoint = 1;
			//single-fires event
			this.onTargetReached = onTargetReached;
		}

		update(dt){
			let plgh = this.points.length;
			this.count += this.moveSpeed;

			if(this.moveToPoint){
				this.points[plgh-this.leadingPoint].x = LinearInterpolate(this.points[plgh-this.leadingPoint].x, this.targetPoint.x, 0.1);
				this.points[plgh-this.leadingPoint].y = LinearInterpolate(this.points[plgh-this.leadingPoint].y, this.targetPoint.y, 0.1);

				for (var i = plgh - 1 - this.leadingPoint; i >= 0; i--) {
					this.points[i].x = LinearInterpolate(this.points[i].x, this.points[i+1].x, 0.5);
					this.points[i].y = LinearInterpolate(this.points[i].y, this.points[i+1].y, 0.5);
				}

				if(
					Math.abs(this.points[plgh-this.leadingPoint].x - this.targetPoint.x) < 10 &&
					Math.abs(this.points[plgh-this.leadingPoint].y - this.targetPoint.y) < 10){

					if(!this.vanishInPoint)
					this.leadingPoint++;

					if(this.leadingPoint == plgh){
						this.moveToPoint = false;
						this.leadingPoint++; //remove last point from lerp list

						if(this.onTargetReached) {
							this.onTargetReached();
							this.onTargetReached = null;
						}
					}
				}
			}

			// make the snake
			for (var i = plgh-1; i > plgh-this.leadingPoint; i--) {
				this.points[i].x = LinearInterpolate(this.points[i].x, 
					Math.sin(i*refLength+this.count) * Math.cos(this.count*this.timeRotateFactor)*this.widthLimit + this.targetPoint.x, 0.1);
				this.points[i].y = LinearInterpolate(this.points[i].y, 
					Math.cos(i*refLength+this.count) * Math.sin(this.count*this.timeRotateFactor)*this.heightLimit + this.targetPoint.y, 0.1);
			}
		}

		enableDebug(){
			var g = new PIXI.Graphics();
			this.parent.addChild(g);

			gm.app.ticker.add(renderPoints);

			function renderPoints () {
				g.clear();

				g.lineStyle(2,0xffc2c2);
				g.moveTo(this.points[0].x,this.points[0].y);

				for (var i = 1; i < plgh; i++) {
					g.lineTo(this.points[i].x,this.points[i].y);
				}

				for (var i = 1; i < plgh; i++) {
					g.beginFill(0xff0022);
					g.drawCircle(this.points[i].x,this.points[i].y,10);
					g.endFill();
				}
			}
		}

		addInteraction() {
			this.interactive = true;
			this
				.on('pointerdown', this.onDragStart)
				.on('pointerup', this.onDragEnd)
				.on('pointerupoutside', this.onDragEnd)
				.on('pointermove', this.onDragMove);
		}

		onDragStart(event) {
			var obj = event.currentTarget;
			obj.dragData = event.data;
			obj.dragging = 1;
			obj.dragPointerStart = event.data.getLocalPosition(obj.parent);
			obj.dragObjStart = new PIXI.Point();
			obj.dragObjStart.copy(obj.position);
			obj.dragGlobalStart = new PIXI.Point();
			obj.dragGlobalStart.copy(event.data.global);
			event.stopPropagation();
			obj.linkPaper.putForward();

			gm.activeGhost = obj;
		}

		onDragEnd(event) {
			var obj = event.currentTarget;
			if (!obj.dragging) return;
			if (obj.dragging == 1)
				if(obj.onUserInteract) obj.onUserInteract();

			obj.dragging = 0;
			obj.dragData = null;

			event.stopPropagation();
			// set the interaction data to null
			gm.activeGhost = null;
		}

		onDragMove(event) {
			var obj = event.currentTarget;
			if (!obj.dragging) return;
			var data = obj.dragData; // it can be different pointer!
			if (obj.dragging == 1) {
				// click or drag?
				if (Math.abs(data.global.x - obj.dragGlobalStart.x) +
					Math.abs(data.global.y - obj.dragGlobalStart.y) >= 3) {
					// DRAG
					obj.dragging = 2;
				}
			}
			if (obj.dragging == 2) {
				var dragPointerEnd = data.getLocalPosition(obj.parent);
				obj.moveToAbsolute(dragPointerEnd.x, dragPointerEnd.y);
				if(obj.onDrag) obj.onDrag();
			}
		}
	}
})();
