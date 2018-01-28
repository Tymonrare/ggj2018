let gm = gm||{};
gm.utils = {};

gm.utils.loadCoa_tools_faces = function(config, params, callback){
	params = params||{};

	var container = new PIXI.Container();

	const loader = new PIXI.loaders.Loader();
	loader.add('config', config)
	loader.load(process);

	let path = config.substring(0, config.lastIndexOf('/')+1);

	let loads = 0;
	function countLoads(){
		if(++loads == 0 && callback) callback();
	}

	//TODO: Add pure loader
	function addRandomFrom(node, colorize){
		loads--;
		//(0)
		let texture = new PIXI.Texture.fromImage(path + node.resource_path);

		//(2)
		function addImage(){
			function rand(max, seed){
				seed = (params.seed+seed)+10000;
				seed *= Math.sin(seed)*Math.tan(seed);
				seed = Math.abs(Math.round(seed));

				return seed%max;
			}

			let xframe = rand(node.tiles_x, node.name.length+node.resource_path.length);//Gen random values
			let yframe = rand(node.tiles_y, node.name.length+node.resource_path.length);

			let wframe = texture.baseTexture.realWidth/node.tiles_x;
			let hframe = texture.baseTexture.realHeight/node.tiles_y;
			let rectangle = new PIXI.Rectangle(xframe*wframe, yframe*hframe, wframe, hframe);

			let img = new PIXI.Sprite(new PIXI.Texture(texture, rectangle));
			img.position.set(node.position[0], node.position[1]);
			img.z = node.z;
			
			if(colorize && params.color)
				img.tint = params.color;

			//add with sorting
			let added = false;
			for(var i = 0; i < container.children.length;i++){
				if(container.children[i].z != undefined && img.z <= container.children[i].z){
					container.addChildAt(img, i);
					added = true;
					break;
				}
			}
			if(!added)
				container.addChild(img);

			countLoads();
		}

		//(1)
		if(texture.baseTexture.hasLoaded) requestAnimationFrame(addImage);
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
		let a_topperSelect = ["horns", "ears", "hats"];
		let topperSelect = a_topperSelect[params.seed%a_topperSelect.length];
		let a_mouthSelect = ["mouth", "mustache"];
		let mouthSelect = a_mouthSelect[params.seed%a_mouthSelect.length];
		let elements = [
			"base",
			"eyes",
			"brows",
			"emotions",
			"paws",
			"glasses"
		]
		let colorizable = [
			"base", "ears"
		]

		for(var i in res){
			let name = res[i].name.split('.')[0];
			if(
				name == topperSelect ||
				name == mouthSelect ||
				elements.includes(name)
			)
				addRandomFrom(res[i], colorizable.includes(name));
		}


	}

	return container;
}
