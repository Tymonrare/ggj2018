let CornerPaper = (() => {
	let shiftTime = 700;
	return class extends PIXI.Sprite{
		constructor(props) {
			let variants = []
			for(var i = 0;i <= 3;i++)
				variants.push("res/papers/variant" + i + ".png");
			super(new PIXI.Texture.fromImage(randElem(variants)));

			this.state = 3;
			//0: in corner
			//1: moving
			//2: in center
			//3: hidden
			
			this.cornerPos = {
				x:gm.app.screen.width,
				y:gm.app.screen.height,
				rotation:Math.PI/10 - Math.PI/14*gm.scene.cornerPapers.root.children.length,
				alpha:1
			}
			this.anchor.set(0.5);
			this.position.set(gm.app.screen.width*2, gm.app.screen.height*2);
			this.toggleCornerShow();

			this.addInteraction();
		}

		removeFromGame(){
			createjs.Tween.get(this, {loop: false, override:true})
				.to({ x: gm.app.screen.width*2, y:gm.app.screen.height*2, alpha:0, rotation:Math.PI/2}, shiftTime, createjs.Ease.quartInOut)
				.call(()=>this.parent.removeChild(this));
		}

		toggleCornerShow(){
			var waitID = setInterval(()=>{
				if(this.state == 0 || this.state == 2){
					this.state = 1;
					clearInterval(waitID);

					createjs.Tween.get(this, {loop: false})
						.to({ x: gm.app.screen.width*2, y:gm.app.screen.height*2, alpha:0, rotation:Math.PI/2}, shiftTime, createjs.Ease.quartInOut)
						.call(()=>this.state = 3);
				}
				else if(this.state == 3){
					this.state = 1;
					clearInterval(waitID);
					createjs.Tween.get(this, {loop: false})
						.to(this.cornerPos, shiftTime, createjs.Ease.quartInOut)
						.call(()=>this.state = 0);
				}
			}, 33);
		}

		addInteraction() {
			this.interactive = true;
			this
				.on('pointerdown', this.onClick)
		}

		putForward(){
				this.parent.setChildIndex(this, this.parent.children.length-1);
		}

		onClick(event){
			let obj = event.currentTarget;

			if(this.state == 0){
				this.state = 1;

				createjs.Tween.get(obj, {loop: false})
					.to({ x: gm.app.screen.width/2, y:gm.app.screen.height/2, rotation:randfRange(-0.1, 0.1)}, shiftTime, createjs.Ease.quartInOut)
					.call(()=>this.state = 2);

				this.putForward();
			}
			else if(this.state == 2){
				this.state = 1;
				createjs.Tween.get(obj, {loop: false})
					.to(obj.cornerPos, shiftTime, createjs.Ease.quartInOut)
					.call(()=>this.state = 0);
			}
		}

	}
})();
