let GhostAvatar = (() => {
	return class extends PIXI.Container{
		constructor(config, params) {
			super();

			var graphics = new PIXI.Graphics();
			this.addChild(graphics);
			graphics.lineStyle(2, 0x222222, 1);
			graphics.beginFill(0x000000, 0.1);
			graphics.drawRoundedRect(50, 50, 230, 350, 2);

			var avatar = gm.utils.loadCoa_tools_faces(config, {color:params.color, seed:params.seed});
			avatar.scale.set(0.78);
			avatar.x -= 20;
			this.addChild(avatar);
		}
	}
})();
