function onMouseMove(e){
	var ev = e ? e : window.event;

	mousex = ev.pageX - simulation.offsetLeft*0.0;
	mousey = ev.pageY - simulation.offsetTop*0.0;

	if (mouseDown){
		mUniforms.mouse.value = new THREE.Vector2(mousex/screenWidth,
							1-mousey/screenHeight);
	}
}
function onMouseDown(e){
	mouseDown = true;
	mUniforms.mouseDown.value = 1;
	if (e.which == 3){
		mUniforms.heatSourceSign.value = -1;
	}
	else {
		mUniforms.heatSourceSign.value =  1;
	}
	console.log(mousex);
	mUniforms.mouse.value = new THREE.Vector2(mousex/screenWidth,
								1-mousey/screenHeight);
}

function onMouseUp(e){
	mouseDown = false;
	mUniforms.mouseDown.value = 0;
}

function onMouseOut(e){
	mouseDown = false;
	mUniforms.mouseDown.value = 0;
}
