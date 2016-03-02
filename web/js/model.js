//------------------------------------------------------
//it requires variables: vshader, mFshader and sFshader
//with url's of vertex/fragment shaders to work.
//------------------------------------------------------

var container;
var screenWidth, screenHeight, ratio;
var scene,calc_camera, view_camera, renderer;	
var width, height, ratio=1;

//simulation object
var planeScreen, planeWidth=1.0, planeHeight=1.0;
var simNx = 359, simNy = 359;


//simulation texture-materials related stuff
var toggleBuffer = false;
var mTextureBuffer1, mTextureBuffer2, batiTextureBuffer;
var screenMaterial, modelMaterial, initialMaterial, batiMaterial;
var imagen;

//bathhymetry stuff
var batiname = "bati1"
var batiGeom, batiPlane, batidata;

var info
var time=0, dt;






var mMap, initCondition = 1;

var speed = 1, paused = 1;
var nstep = 0;

var colors;


var stats = new Stats();
stats.setMode( 2 ); // 0: fps, 1: ms, 2: mb

// align top-left


function init(){
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.left = '0px';
	stats.domElement.style.top = '0px';
	document.body.appendChild(stats.domElement);	

	height = window.innerHeight-50;
	ratio = 432/594;
	width = height*ratio;	

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

	calc_camera = new THREE.OrthographicCamera( -0.5, 0.5, 0.5, -0.5, - 500, 1000 );
	view_camera = new THREE.OrthographicCamera( -1.5, 1.5, 0.5, -0.5, - 500, 1000 );
	
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
		// cn : {type: 'f', value:  6020015.52},   //centroid N coordinate, 16zone
		// ce : {type: 'f', value: 666850.37},    //centroid E coordinate, 16zone		
		cn : {type: 'f', value:  6020015.5},   //centroid N coordinate, 18zone
		ce : {type: 'f', value: 666850.4},    //centroid E coordinate, 18zone

		//misc
		pause: {type: 'i', value: 0}
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

	//create a plane for bathymetry
	batiGeom = new THREE.PlaneGeometry(1.0,1.0);
	batiPlane = new THREE.Mesh(batiGeom, batiMaterial);	
	batiPlane.position.z = -0.1;
	scene.add(batiPlane);
	
	// create a plane for simulation
	var geometry = new THREE.PlaneGeometry(1.0 , 1.0);
	planeScreen = new THREE.Mesh( geometry, screenMaterial );
	scene.add( planeScreen );	
 
	// Load the simulation
	var loader = new THREE.ImageLoader();
	loader.load(
		// resource URL
		"img/"+batiname+".jpg",
		// Function when resource is loaded
		function ( image ) {			
			startSimulation(image);
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

function startSimulation(bati_image){

	//create simulation buffers

    var data = $.ajax("img/"+batiname+".txt",{async:false}).responseText;
    var dataarray = data.split('\n');
    batidata = {
    	ny:parseInt(dataarray[0].split(':')[1]),
    	nx:parseInt(dataarray[1].split(':')[1]),
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
            
	var nx = 359;//parseInt(batidata.nx);
	var ny = 359;//parseInt(batidata.ny);
	
    var dx = (mUniforms.xmax.value-mUniforms.xmin.value)/nx;
    var dy = (mUniforms.ymax.value-mUniforms.ymin.value)/ny;
    dt = 0.45*Math.min(dx,dy)/Math.sqrt(-9.81*mUniforms.zmin.value);
    mUniforms.rx.value = dt/dx;
    mUniforms.ry.value = dt/dy;
        
	resizeSimulation(nx,ny);

	//add GUI controls
 	initControls();
 	
	//load bathymetry and bathymetry data

	batiTextureBuffer = new THREE.Texture(bati_image);
    batiTextureBuffer.wrapS = THREE.ClampToEdgeWrapping; // are these necessary?
    batiTextureBuffer.wrapT = THREE.ClampToEdgeWrapping;
    batiTextureBuffer.repeat.x = batiTextureBuffer.repeat.y = 2;
    batiTextureBuffer.needsUpdate = true; //this IS necessary	
    mUniforms.tBati.value = batiTextureBuffer;


	//set default colors
	setColorMapBar('batitopo','wave');

	
	//set initial condition
    // render initial condition and bathymetry to both buffers
    doFaultModel();

	//render to screen
	mUniforms.tSource.value = mTextureBuffer1;
	planeScreen.material = screenMaterial;
	renderer.render(scene,view_camera);

	// ----proceed with the simulation---
	renderSimulation();
}

function doFaultModel(){
	planeScreen.material = initialMaterial;
	renderer.render(scene, calc_camera, mTextureBuffer1, true);
	renderer.render(scene, calc_camera, mTextureBuffer2, true);
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
function writeTimeStamp(){
	nstep = nstep+1;
	time = nstep*dt/60;
	var timetext = "Time: "
	timetext = timetext.concat(time.toFixed(2));
	timetext = timetext.concat(" min.");
	var timeDomEl = document.getElementById("time");
	timeDomEl.textContent = timetext;
}
function renderSimulation(){		

	stats.begin();

	if (paused != 1){
		planeScreen.material = modelMaterial;
		for (var i=0; i<Math.floor(speed); i++){			
			writeTimeStamp();
			if (!toggleBuffer){
				mUniforms.tSource.value = mTextureBuffer1;		
				renderer.render(scene, calc_camera, mTextureBuffer2, true);
				
			}
			else{
				mUniforms.tSource.value = mTextureBuffer2;
				renderer.render(scene, calc_camera, mTextureBuffer1, true);
				
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
		renderer.render(scene, view_camera);		
	}
			
	stats.end();
	requestAnimationFrame(renderSimulation);
}

function setColorMapBar(cmap_bati, cmap_water){
	//requires colormap.js
	
	var c = -mUniforms.zmin.value/(mUniforms.zmax.value - mUniforms.zmin.value);
	var batimap = getColormapArray(cmap_bati,0,c);
	var watermap = getColormapArray(cmap_water,1,0);
	mUniforms.colors.value = watermap;
	mUniforms.bcolors.value = batimap;

	//setup colorbar
	var cbwater  = document.getElementById('cbwater');
	cbwater.width = width/2;
    cbwater.height = 50;	
    
    var cbbati  = document.getElementById('cbbati');
	cbbati.width = width/2;
    cbbati.height = 50;	
    
    var ncolors = 16;

    var waterlabels = getColormapLabels(cmap_water,1,0);
    var batilabels = getColormapLabels(cmap_bati,0,c);
	colorbar(watermap,cbwater,ncolors,0.0,waterlabels);
	colorbar(batimap,cbbati,ncolors,c,batilabels);
}