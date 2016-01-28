var container;
var camera, scene, renderer;	

var width, height, ratio=1;
var toggleBuffer = false;
var planeScreen;


var info
var time=0;

var mTextureBuffer1, mTextureBuffer2, batiTextureBuffer;
var screenMaterial, modelMaterial, initialMaterial, batiMaterial;
var imagen;

//bathhymetry stuff
var geotest, mat, planeTest, batidata;


var mMap, initCondition = 1;

var speed = 1;
var nstep = 0;
//------------------------------------------------------
//it requires variables: vshader, mFshader and sFshader
//with url's of vertex/fragment shaders to work.
//------------------------------------------------------
function init(){
	height = window.innerHeight*0.95;
	ratio = 432/594;
	width = height*ratio;
	// width = Math.min(
	// 	window.innerWidth,
	// 	window.innerHeight)*0.95;
	// ratio = 594/432;
	// height = width*ratio;
	
	// width = 432;
	// height = 594;
	simulationDiv = document.getElementById('simulation');
	container = document.getElementById( 'container' );
	container.width = width;
	container.height = height;

	info = document.createElement( 'div' );
	info.style.position = 'absolute';
	info.style.top = '10px';
	info.style.width = '100%';
	info.style.textAlign = 'center';
	simulationDiv.appendChild( info );	

	//event handlers
	container.oncontextmenu = function(){return false};
	$(document).keyup(function(evt) {
	if (evt.keyCode == 80)
		mUniforms.pause.value = 1.0 - mUniforms.pause.value;
	else if (evt.keyCode == 83)
		snapshot();
	});

	//renderer
	renderer = new THREE.WebGLRenderer({canvas:container, preserveDrawingBuffer: true});
	renderer.setClearColor( 0xa0a0a0 );
	renderer.setSize(width, height);

	// camera
	var camHeight = height;
	var camWidth = width;

	camera = new THREE.OrthographicCamera( -0.5, 0.5, 0.5, -0.5, - 500, 1000 );
	scene = new THREE.Scene();

	// uniforms
	mUniforms = {
		texel: {type: "v2", value: new THREE.Vector2(1/width,1/height)},
		delta: {type:  "v2", value: undefined},
		tSource: {type: "t", value: undefined},
		tBati: {type: "t", value: undefined},
		colors: {type: "v4v", value: undefined},
		bcolors: {type: "v4v", value: undefined},

		//sim params		
		gx : {type: 'f', value: 0.01},
		rx : {type: 'f', value: undefined},
		ry : {type: 'f', value: undefined},
		g : {type: 'f', value: 9.81},
		xmin: {type: "f", value: 0.0},
		xmax: {type: "f", value: 1.0},
		ymin: {type: "f", value: 0.0},
		ymax: {type: "f", value: 1.0},
		zmin: {type: "f", value: 0.0},
		zmax: {type: "f", value: 1.0},

		//fault params		
		L : {type: 'f', value: 450000.0},
		W : {type: 'f', value: 150000.0},		
		depth : {type: 'f', value: 30100.0},
		slip : {type: 'f', value:  6.06},
		strike : {type: 'f', value: 18.0},
		dip : {type: 'f', value: 18.0},
		rake :  {type:  'f', value: 112.0},
		U3 : {type: 'f', value:  0.0},
		cn : {type: 'f', value:  6020015.529892579},   //centroid N coordinate
		ce : {type: 'f', value: 666850.3764601912}    //centroid E coordinate
	};


	// create material

	batiMaterial = new THREE.ShaderMaterial({
		uniforms: mUniforms,
		vertexShader: $.ajax(vshader, {async:false}).responseText,
		fragmentShader: $.ajax(bFshader,{async:false}).responseText
	});

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
		fragmentShader: $.ajax(sFshader,{async:false}).responseText,
		transparent:true
	});

	//create a splane
	geotest = new THREE.PlaneGeometry(1.0,1.0);
 	// mat = new THREE.MeshBasicMaterial({color:0x0000aa, opacity:1.0, transparent:true});
	planeTest = new THREE.Mesh(geotest, batiMaterial);	
	planeTest.position.z = -0.5;
	scene.add(planeTest);
	
	// create plane geometry
	var geometry = new THREE.PlaneGeometry(1.0 , 1.0);
	planeScreen = new THREE.Mesh( geometry, screenMaterial );
	scene.add( planeScreen );	

	//default colormap
	setColorMap('blues','jet');
 

	// Load the simulation
	var loader = new THREE.ImageLoader();
	loader.load(
		// resource URL
		"img/bati1.jpg",
		// Function when resource is loaded
		function ( image ) {			
			runSimulation(image);
		},
		// Function called when download progresses
		function ( xhr ) {
			console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
		},
		// Function called when download errors
		function ( xhr ) {
			console.log( 'An error happened' );
		}
	);

}

function runSimulation(initial_condition){

	//create simulation buffers
	var nx = parseInt(432);
	var ny = parseInt(594);

	resizeSimulation(nx,ny);

	//add GUI controls

	   //soon

	//load bathymetry and bathymetry data

	batiTextureBuffer = new THREE.Texture(initial_condition);
    batiTextureBuffer.wrapS = THREE.ClampToEdgeWrapping; // are these necessary?
    batiTextureBuffer.wrapT = THREE.ClampToEdgeWrapping;
    batiTextureBuffer.repeat.x = batiTextureBuffer.repeat.y = 2;
    batiTextureBuffer.needsUpdate = true; //this IS necessary	
    mUniforms.tBati.value = batiTextureBuffer;

    var data = $.ajax("img/bati1.txt",{async:false}).responseText;
    var dataarray = data.split('\n');
    batidata = {
    	nx:parseInt(dataarray[0].split(':')[1]),
    	ny:parseInt(dataarray[1].split(':')[1]),
    };    
    mUniforms.xmin.value = parseFloat(dataarray[2].split(':')[1]);
    mUniforms.xmax.value = parseFloat(dataarray[3].split(':')[1]);
	mUniforms.ymin.value = parseFloat(dataarray[4].split(':')[1]);
    mUniforms.ymax.value = parseFloat(dataarray[5].split(':')[1]);
    mUniforms.zmin.value = parseFloat(dataarray[6].split(':')[1]);
    mUniforms.zmax.value = parseFloat(dataarray[7].split(':')[1]);
    
    if (mUniforms.zmin.value>0.0){
    	var e = new Error('zmin negative on bathymetry image file'); 
    	throw e;
    }
    var dx = (mUniforms.xmax.value-mUniforms.xmin.value)/nx;
    var dy = (mUniforms.ymax.value-mUniforms.ymin.value)/ny;
    var dt = 0.45*Math.min(dx,dy)/Math.sqrt(-9.81*mUniforms.zmin.value);
    mUniforms.rx.value = dt/dx;
    mUniforms.ry.value = dt/dy;
	
	//set initial condition
    // render initial condition and bathymetry to both buffers
	planeScreen.material = initialMaterial;
	renderer.render(scene, camera, mTextureBuffer1, true);
	renderer.render(scene, camera, mTextureBuffer2, true);

	//render to screen
	mUniforms.tSource.value = mTextureBuffer1;
	planeScreen.material = screenMaterial;
	renderer.render(scene,camera);

	// ----proceed with the simulation---
	renderSimulation();
}

function resizeSimulation(nx,ny){

	mUniforms.delta.value = new THREE.Vector2(1/(nx-1),1/(ny-1));
	
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
		nstep = nstep+1;
		// console.log(nstep);
		if (!toggleBuffer){
			mUniforms.tSource.value = mTextureBuffer1;		
			renderer.render(scene, camera, mTextureBuffer2, true);
			
		}
		else{
			mUniforms.tSource.value = mTextureBuffer2;
			renderer.render(scene, camera, mTextureBuffer1, true);
			
		}

		toggleBuffer = !toggleBuffer;
	}

	if (!toggleBuffer){
		mUniforms.tSource.value = mTextureBuffer2;		
	}
	else{
		mUniforms.tSource.value = mTextureBuffer1;
	}

	planeScreen.material = screenMaterial;
	renderer.render(scene,camera);			
	requestAnimationFrame(renderSimulation);
}

function setColorMap(cmap_bati,cmap_water){
	var colors = {
		'heat': [new THREE.Vector4(1, 1, 1, -1/10.0), //white
				new THREE.Vector4(0, 1, 1, -6.6/10.0),  //cyan
				new THREE.Vector4(0, 0, 1, -3.3/10.0),  //blue
				new THREE.Vector4(0, 0, 0, 0.0),   //red
				new THREE.Vector4(1, 0, 0, 3.3/10.0),   //yellow
				new THREE.Vector4(1, 1, 0, 6.6/10.0),	  //red
				new THREE.Vector4(1, 1, 1, 9.9/10.0)], 
		'jet': [new THREE.Vector4(0, 0, 1, 0.0*2), //azul
				new THREE.Vector4(0, 1, 1, 0.33*2),  //cyan
				new THREE.Vector4(0, 1, 0, 0.5*2),  //verde
				new THREE.Vector4(1, 1, 0, 0.66*2),   //amarillo
				new THREE.Vector4(1, 0, 0, 1.0*2),   //rojo
				new THREE.Vector4(1, 0, 0, 1.0*2),	  //rojo
				new THREE.Vector4(1, 0, 0, 1.0*2)],
		'blues': [new THREE.Vector4(0, 0, 0.3, 0.0), //azul
				new THREE.Vector4(0.8, 0.8, 0.8, 1.0),  //blanco
				new THREE.Vector4(0.8, 0.8, 0.8, 1.0),  //blanco
				new THREE.Vector4(0.8, 0.8, 0.8, 1.0),  //blanco
				new THREE.Vector4(0.8, 0.8, 0.8, 1.0),  //blanco
				new THREE.Vector4(0.8, 0.8, 0.8, 1.0),  //blanco
				new THREE.Vector4(0.8, 0.8, 0.8, 1.0)]};
	
	mUniforms.colors.value = colors[cmap_water];
	mUniforms.bcolors.value = colors[cmap_bati]
}
