let GhostAvatar = (() => {
	return class extends PIXI.Container{
		constructor(config) {
			super();

			const loader = new PIXI.loaders.Loader();
			loader.add('config', config)
			loader.load(process);

			let path = config.substring(0, config.lastIndexOf('/')+1);

			var graphics = new PIXI.Graphics();
			this.addChild(graphics);
			graphics.lineStyle(2, 0x222222, 1);
			graphics.beginFill(0x000000, 0.1);
			graphics.drawRoundedRect(50, 50, 230, 350, 2);

			//It used in addImage()
			graphics.z = 10;

			let self = this;
			function addRandomFrom(node){
				//(0)
				let texture = new PIXI.Texture.fromImage(path + node.resource_path);

				//(2)
				function addImage(){
					let xframe = randi(node.tiles_x-1);
					let yframe = randi(node.tiles_y-1);
					let wframe = texture.baseTexture.realWidth/node.tiles_x;
					let hframe = texture.baseTexture.realHeight/node.tiles_y;
					let rectangle = new PIXI.Rectangle(xframe*wframe, yframe*hframe, wframe, hframe);

					let img = new PIXI.Sprite(new PIXI.Texture(texture, rectangle));
					img.position.set(node.position[0], node.position[1]);
					img.z = node.z;

					//add with sorting
					let added = false;
					for(var i = self.children.length - 1;i >= 0;i--){
						if(self.children[i].z != undefined && img.z > self.children[i].z){
							self.addChildAt(img, i+1);
							added = true;
							break;
						}
					}
					if(!added)
						self.addChild(img);
				}

				//(1)
				if(texture.baseTexture.hasLoaded) addImage()
				else texture.baseTexture.once('loaded', addImage);

			}

			function process(loader, resources){
				let frame = {
					x:0,
					y:0,
					w:0,
					h:0
				}

				let res = resources.config.data.nodes;
				let topperSelect = randElem(["Horns", "Ears", "Hats"]);
				let mouthSelect = randElem(["Mouth", "Mustache"]);
				for(var i in res){
					if(
						res[i].name.startsWith("BASE") ||
						res[i].name.startsWith("Eyes") ||
						res[i].name.startsWith("Brows") ||
						res[i].name.startsWith("Emocii") ||
						res[i].name.startsWith(topperSelect) ||
						res[i].name.startsWith(mouthSelect) ||
						res[i].name.startsWith("Paws") ||
						res[i].name.startsWith("Glasses")
					)
						addRandomFrom(res[i]);
				}


			}
		}
	}
})();
