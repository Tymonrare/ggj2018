let TableItem = (() => {
	let defaultProps = {
		stands:false,
		movable:true
	}
	return class extends PIXI.projection.Sprite2d {
		constructor(texture, props) {
			super(texture);

			//set props
			props = props||defaultProps;
			for(var i in defaultProps){
				if(props[i] != undefined) continue;

				props[i] = defaultProps[i];
			}

			this.anchor.set(0.5, props.stands ? 1.0 : 0.5);
			this.proj.affine = props.stands ? PIXI.projection.AFFINE.AXIS_X : PIXI.projection.AFFINE.NONE;;
			if(props.movable)
				this.addInteraction();
		}

		addInteraction() {
			this.interactive = true;
			this
				.on('pointerdown', this.onDragStart)
				.on('pointerup', this.onDragEnd)
				.on('pointerupoutside', this.onDragEnd)
				.on('pointermove', this.onDragMove);
		}

		snap() {
			this.position.x = Math.min(Math.max(this.position.x, -gm.app.screen.width / 2), gm.app.screen.width / 2);
			this.position.y = Math.min(Math.max(this.position.y, -gm.app.screen.height + 10), 10);
			this.scale.x = 1;
			this.scale.y = 1;

			if(this.onDrag) requestAnimationFrame(this.onDrag);
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
			obj.scale.x = 1.1;
			obj.scale.y = 1.1;
			event.stopPropagation();

			obj.parent.setChildIndex(obj, obj.parent.children.length-1);
		}

		onDragEnd(event) {
			var obj = event.currentTarget;
			if (!obj.dragging) return;
			if (obj.dragging != 1) {
				this.snap(obj);
			}

			obj.dragging = 0;
			obj.dragData = null;

			event.stopPropagation();
			// set the interaction data to null
		}

		onDragMove(event) {
			var obj = event.currentTarget;
			if (!obj.dragging) return;
			event.stopPropagation();
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
				// DRAG
				obj.position.set(
					obj.dragObjStart.x + (dragPointerEnd.x - obj.dragPointerStart.x),
					obj.dragObjStart.y + (dragPointerEnd.y - obj.dragPointerStart.y)
				);
				if(obj.onDrag) obj.onDrag();

			//set depth
			let selfy = obj.position.y;
			let selfindex = obj.parent.getChildIndex(obj);
			if(selfindex > 1){
				let other = obj.parent.getChildAt(selfindex-1);
				let othery = other.position.y;
				if(selfy < othery)
					obj.parent.setChildIndex(obj, selfindex-1);
			}
			if(selfindex < obj.parent.children.length-1){
				let other = obj.parent.getChildAt(selfindex+1);
				let othery = other.position.y;
				if(selfy > othery)
					obj.parent.setChildIndex(obj, selfindex+1);
			}
			}
		}
	}
})();
