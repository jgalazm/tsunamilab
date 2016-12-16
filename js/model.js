var container;
var camera, scene, renderer;

var planeWidth, planeHeight,
	screenWidth, screenHeight,
	simNx, simNy, ratio=1;
var toggleBuffer = false;
var planeScreen;

var mousex, mousey, mouseDown=false, rightClick=false;

var time=0;
var speed = 15;

var mTextureBuffer1, mTextureBuffer2, initTextureBuffer;
var screenMaterial, modelMaterial, initialMaterial;
var imagen;


var oldScreenWidth, oldScreenHeight;
var mMap, initCondition = 1;

//------------------------------------------------------
//it requires variables: vshader, mFshader and sFshader
//with url's of vertex/fragment shaders to work.
//------------------------------------------------------
function init(){
	// screenWidth = window.innerWidth;
	// screenHeight = window.innerHeight;



	// container
	simulationDiv = document.getElementById('simulation');
	container = document.getElementById( 'container' );
	// container.width = screenWidth;
	// container.height = screenHeight;
	screenWidth = container.width;
	screenHeight = container.height;

	//event handlers
	container.onmousedown = onMouseDown;
	container.onmouseup = onMouseUp;
	container.onmousemove = onMouseMove;
	container.onmouseout = onMouseOut;

	//renderer
	renderer = new THREE.WebGLRenderer({canvas:container, preserveDrawingBuffer: true});
	renderer.setClearColor( 0xa0a0a0 );
	renderer.setSize(screenWidth, screenHeight);

	// camera
	planeWidth = 1.0;
	planeHeight = planeWidth*screenHeight/screenWidth;
	camera = new THREE.OrthographicCamera( -0.5*planeWidth,
											0.5*planeWidth,
							 		0.5*planeHeight, -0.5*planeHeight,
							 		-500, 1000 );
	scene = new THREE.Scene();

	// uniforms
	simNx = 256;
	simNy = simNx*screenHeight/screenWidth;
	mUniforms = {
		texel: {type: "v2", value: new THREE.Vector2(1/simNx,1/simNy)},
		delta: {type:  "v2", value: undefined},
		tSource: {type: "t", value: mMap},
		colors: {type: "v4v", value: undefined},
		mouse: {type: "v2", value: new THREE.Vector2(0.5,0.5)},
		mouseDown: {type: "i", value: 0},
		boundaryCondition: {type: "i", value:0},
		heatSourceSign: {type: "f", value:1},
		heatIntensity: {type: "f", value:100000},
		brushWidth: {type: "f", value:40},
		pause: {type: 'i', value:0}
	};


	// create material
	initialMaterial = new THREE.ShaderMaterial({
		uniforms: mUniforms,
		vertexShader: $.ajax(vshader, {async:false}).responseText,
		fragmentShader: $.ajax(iFshader,{async:false}).responseText
	});

	modelMaterial = new THREE.ShaderMaterial({
		uniforms: mUniforms,
		vertexShader: $.ajax(vshader, {async:false}).responseText,
		fragmentShader: $.ajax(mFshader,{async:false}).responseText
	});

	screenMaterial = new THREE.ShaderMaterial({
		uniforms: mUniforms,
		vertexShader: $.ajax(vshader,{async:false}).responseText,
		fragmentShader: $.ajax(sFshader,{async:false}).responseText
	});

	//create plane geometry

	var geometry = new THREE.PlaneGeometry(planeWidth , planeHeight);
	planeScreen = new THREE.Mesh( geometry, screenMaterial );
	scene.add( planeScreen );

	//default colormap
	setColorMap('heat');

	runSimulation();

}

function runSimulation(initial_condition){

	//create simulation buffers

	resizeSimulation(simNx,simNy);

	//add GUI controls

	// initControls();

    //do the THING

	planeScreen.material = initialMaterial;
	// mUniforms.tSource.value = initTextureBuffer;
	renderer.render(scene, camera, mTextureBuffer1, true);
	renderer.render(scene, camera, mTextureBuffer2, true);
	mUniforms.tSource.value = mTextureBuffer1;
	planeScreen.material = screenMaterial;
	renderer.render(scene,camera);

	//----proceed with the simulation---
	renderSimulation();
}

function resizeSimulation(nx,ny){

	mUniforms.delta.value = new THREE.Vector2(1/nx,1/ny);

	// create buffers
	if (!mTextureBuffer1){

	mTextureBuffer1 = new THREE.WebGLRenderTarget( nx, ny,
		 					{minFilter: THREE.LinearFilter,
	                         magFilter: THREE.LinearFilter,
	                         format: THREE.RGBAFormat,
	                         type: THREE.FloatType});
	mTextureBuffer2 = new THREE.WebGLRenderTarget( nx, ny,
		 					{minFilter: THREE.LinearFilter,
	                         magFilter: THREE.LinearFilter,
	                         format: THREE.RGBAFormat,
	                         type: THREE.FloatType});

	mTextureBuffer1.texture.wrapS  = THREE.ClampToEdgeWrapping;
	mTextureBuffer1.texture.wrapT  = THREE.ClampToEdgeWrapping;
	mTextureBuffer2.texture.wrapS  = THREE.ClampToEdgeWrapping;
	mTextureBuffer2.texture.wrapT  = THREE.ClampToEdgeWrapping;
	}
	else{
		if (!toggleBuffer){
			mTextureBuffer1.setSize(nx,ny);
		}
		else{
			mTextureBuffer2.setSize(nx,ny);
		}

	}
}


function renderSimulation(){

	planeScreen.material = modelMaterial;
	for (var i=0; i<Math.floor(speed); i++){
		if (!toggleBuffer){
			mUniforms.tSource.value = mTextureBuffer1;
			renderer.render(scene, camera, mTextureBuffer2, true);
			mUniforms.tSource.value = mTextureBuffer2;
		}
		else{
			mUniforms.tSource.value = mTextureBuffer2;
			renderer.render(scene, camera, mTextureBuffer1, true);
			mUniforms.tSource.value = mTextureBuffer1;
		}

		toggleBuffer = !toggleBuffer;
	}
	planeScreen.material = screenMaterial;
	renderer.render(scene,camera);
	requestAnimationFrame(renderSimulation);
}

function setColorMap(cmap){
	var colors;
	if (cmap=='heat'){
		colors = [new THREE.Vector4(1, 1, 1, -10),
				new THREE.Vector4(0, 1, 1, -6.6),
				new THREE.Vector4(0, 0, 1, -3.3),
				new THREE.Vector4(0, 0, 0, 0.0),
				new THREE.Vector4(1, 0, 0, 3.3),
				new THREE.Vector4(1, 1, 0, 6.6),
				new THREE.Vector4(1, 1, 1, 9.9)];
	}
	else if (cmap=='blueInk'){
		colors = [new THREE.Vector4(1, 1, 1, 0),
				new THREE.Vector4(0, 0, 1, 5.0),
				new THREE.Vector4(0, 0, 1, 10.0),
				new THREE.Vector4(0, 0, 1, 10.0),
				new THREE.Vector4(0, 0, 1, 10.0),
				new THREE.Vector4(0, 0, 1, 10.0),
				new THREE.Vector4(0, 0, 1, 10.0)];
	}

	mUniforms.colors.value = colors;
}
