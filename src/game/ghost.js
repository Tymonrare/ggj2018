let BaseGhost = (() => {
	// build a rope!
	var ropeLength = 45;
	var widthLimit = 400;
	var heightLimit = 200;

	return class extends PIXI.mesh.Rope{
		constructor(texture) {
			var points = [];

			for (var i = 0; i < 25; i++) {
				points.push(new PIXI.Point(i * ropeLength, 0));
			}

			super(texture, points)

			this.blendMode = PIXI.BLEND_MODES.ADD;
			this.points = points;
			this.moveSpeed = randfRange(0.05, 0.1);
			this.widthLimit = widthLimit*randfRange(0.5, 1.2);
			this.heightLimit = heightLimit*randfRange(0.5, 1.2);
			this.count = randf(10);
			this.targetPoint = { x:0, y:0 };
			this.leadingPoint = this.points.length;

			gm.app.ticker.add((dt)=>this.update(dt));
		}

		moveTo(x, y){
			this.targetPoint = {x:x, y:y};
			this.moveToPoint = true;

			this.leadingPoint = 1;
		}

		update(dt){
			let plgh = this.points.length;
			this.count += this.moveSpeed;

			if(this.moveToPoint){
				this.points[plgh-this.leadingPoint].x = LinearInterpolate(this.points[plgh-this.leadingPoint].x, this.targetPoint.x, 0.1);
				this.points[plgh-this.leadingPoint].y = LinearInterpolate(this.points[plgh-this.leadingPoint].y, this.targetPoint.y, 0.1);

				for (var i = plgh - 1 - this.leadingPoint; i >= 0; i--) {
					this.points[i].x = LinearInterpolate(this.points[i].x, this.points[i+1].x, 0.3);
					this.points[i].y = LinearInterpolate(this.points[i].y, this.points[i+1].y, 0.3);
				}

				if(
					Math.abs(this.points[plgh-this.leadingPoint].x - this.targetPoint.x) < 10 &&
					Math.abs(this.points[plgh-this.leadingPoint].y - this.targetPoint.y) < 10){
					this.leadingPoint++;
					if(this.leadingPoint == plgh){
						this.moveToPoint = false;
						this.leadingPoint++; //remove last point from lerp list
					}
				}
			}

			// make the snake
			for (var i = plgh-1; i > plgh-this.leadingPoint; i--) {
				this.points[i].x = LinearInterpolate(this.points[i].x, Math.sin(i*0.2+this.count)*Math.cos(this.count/10)*this.widthLimit + this.targetPoint.x, 0.1);
				this.points[i].y = LinearInterpolate(this.points[i].y, Math.cos(i*0.2+this.count)*Math.sin(this.count/10)*this.heightLimit + this.targetPoint.y, 0.1);
			}
		}

		enableDebug(){
			var g = new PIXI.Graphics();
			g.x = strip.x;
			g.y = strip.y;
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
	}
})();
