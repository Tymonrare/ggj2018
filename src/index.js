let gm = gm||{};

function main(){
	initPIXI();
	init();
}
function initPIXI(){
	gm.app = new PIXI.Application(gm.settings.data.canvasSize.width, gm.settings.data.canvasSize.height, { antialias: true });
	document.body.appendChild(gm.app.view);

	createjs.Ticker.setFPS(60);

	gm.app.stage.interactive = true;

	gm.settings.fitCanvasToScreen();

	gm.scene.init();

	//gm.tests.pixiDefaults();
	//gm.tests.pixiProjections();
	//gm.tests.textureMesh();
}
function init(){
	window.addEventListener('resize', function(event){
		gm.settings.fitCanvasToScreen();
	});
}
