//------------------------------------------------------
//it requires variables: vshader, mFshader and sFshader
//with url's of vertex/fragment shaders to work.
//------------------------------------------------------

var container;
var screenWidth, screenHeight, ratio;
var scene,calc_camera, view_camera, renderer;	
var width, height, ratio=1;

//simulation object
var planeScreen, planeWidth=1, planeHeight=1;
var simNx = 359, simNy = 359;


//simulation texture-materials related stuff
var toggleBuffer = false;
var mTextureBuffer1, mTextureBuffer2, batiTextureBuffer;
var screenMaterial, modelMaterial, initialMaterial, batiMaterial;
var initCondition = 1;

//bathhymetry stuff
var batiname = "batiLatLonPacific"
var batiGeom, batiPlane, batidata;

//physical world variables
var R_earth = 6378000.0,
    rad_deg = 0.01745329252,
    rad_min = 0.000290888208665721,
    cori_w = 7.2722e-5;


//ui
var info
var time=0, dt;
var speed = 1, paused = 1;
var nstep = 0;
var colors;
var stats = new Stats();
stats.setMode( 0 ); // 0: fps, 1: ms, 2: mb

// align top-left


function init(){
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.left = '0px';
	stats.domElement.style.top = '0px';
	document.body.appendChild(stats.domElement);	

	screenHeight = window.innerHeight;
	// ratio = 432/594;
	screenWidth = window.innerWidth;

	simulationDiv = document.getElementById('simulation');
	container = document.getElementById( 'container' );
	container.width = screenWidth;
	container.height = screenHeight;

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
	//renderer
	renderer = new THREE.WebGLRenderer({canvas:container, preserveDrawingBuffer: true});
	renderer.setClearColor( 0x000000);
	renderer.setSize(screenWidth, screenHeight);

	// scene	
	scene = new THREE.Scene();

	// create materials - uniforms

	createMaterials();

	//load input data and planeWidth, planeHeight for calc_camera and objects

    loadData(bati_image);

    //create cameras
    
	createCameras();

	//create geometries

	createGeom();

    //create Buffers  

	resizeSimulation(simNx,simNy);

	//add GUI controls

 	initControls();
 	
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

function createMaterials(){
	// uniforms
	mUniforms = {
		texel: {type: "v2", value: undefined},
		delta: {type:  "v2", value: undefined},
		tSource: {type: "t", value: undefined},
		tBati: {type: "t", value: undefined},
		colors: {type: "v4v", value: undefined},
		bcolors: {type: "v4v", value: undefined},
		
		//sim params	
		rad_min: {type: 'f', value: rad_min},	
		rad_deg: {type: 'f', value: rad_deg},
		gx : {type: 'f', value: 0.01},
		dx : {type: 'f', value:undefined},
		dy : {type: 'f', value:undefined},
		RR : {type: 'f', value:undefined},
		RS : {type: 'f', value:undefined},
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
		cn : {type: 'f', value:  -35.5},   //centroid N coordinate, 18zone
		ce : {type: 'f', value:  -73.0},    //centroid E coordinate, 18zone

		//misc
		pause: {type: 'i', value: 0}
	};

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

}

function loadData(bati_image){
	var data = $.ajax("img/"+batiname+".txt",{async:false}).responseText;
    var dataarray = data.split('\n');
    batidata = {
    	ny:parseInt(dataarray[0].split(':')[1]),
    	nx:parseInt(dataarray[1].split(':')[1]),
    }; 

   
   	
    mUniforms.xmin.value = parseFloat(dataarray[2].split(':')[1]);
    mUniforms.xmax.value = parseFloat(dataarray[3].split(':')[1]);
	mUniforms.ymin.value = parseFloat(dataarray[4].split(':')[1]);
	var ymin = parseFloat(dataarray[4].split(':')[1]);
    mUniforms.ymax.value = parseFloat(dataarray[5].split(':')[1]);
    var ymax = parseFloat(dataarray[5].split(':')[1]);
    mUniforms.zmin.value = parseFloat(dataarray[6].split(':')[1]);
    mUniforms.zmax.value = parseFloat(dataarray[7].split(':')[1]);

    if (mUniforms.zmin.value>0.0){
    	var e = new Error('zmin negative on bathymetry image file'); 
    	throw e;
    }
            
	var simNx  = batidata.nx;//parseInt(batidata.nx);
	var simNy =  batidata.ny;//parseInt(batidata.ny);
	
	planeHeight = 1.0;
	planeWidth = planeHeight*simNx/simNy;
	mUniforms.texel.value = new THREE.Vector2(1/simNx,1/simNy)

    var dx = (mUniforms.xmax.value-mUniforms.xmin.value)/simNx*60.0;
    var dy = (mUniforms.ymax.value-mUniforms.ymin.value)/simNy*60.0;
    mUniforms.dx.value = dx;
    mUniforms.dy.value = dx;
    ymin = mUniforms.ymin.value
    var lat_max = Math.max(Math.abs(ymin),Math.abs(ymax));
    var dx_real = R_earth*Math.cos(lat_max*rad_deg)*dx*rad_min;
    var dy_real = R_earth*dy*rad_min;
    console.log(dx_real)

    dt = 0.45*Math.min(dx_real,dy_real)/Math.sqrt(-9.81*mUniforms.zmin.value);
    
    mUniforms.RR.value = dt/R_earth;
    mUniforms.RS.value = 9.81*mUniforms.RR.value;

	batiTextureBuffer = new THREE.Texture(bati_image);
    batiTextureBuffer.wrapS = THREE.ClampToEdgeWrapping; // are these necessary?
    batiTextureBuffer.wrapT = THREE.ClampToEdgeWrapping;
    batiTextureBuffer.repeat.x = batiTextureBuffer.repeat.y = 2;
    batiTextureBuffer.needsUpdate = true; //this IS necessary	
    mUniforms.tBati.value = batiTextureBuffer;    
}

function createCameras(){
	calc_camera = new THREE.OrthographicCamera( planeWidth/-2,
					 planeWidth/2,
					 planeHeight/2, 
					 planeHeight/-2, - 500, 1000 );
	var r = screenWidth/screenHeight;
	view_camera = new THREE.OrthographicCamera( -0.5*r, 0.5*r, 0.5, -0.5, - 500, 1000 );	
	view_camera.lookAt(0,0,0);
	orb_controls = new THREE.OrbitControls( view_camera, renderer.domElement );
	orb_controls.enableRotate = true;
}
function createGeom(){
	//create a plane for bathymetry
	batiGeom = new THREE.PlaneGeometry(planeWidth,planeHeight);
	batiPlane = new THREE.Mesh(batiGeom, batiMaterial);	
	batiPlane.position.z = -0.1;
	scene.add(batiPlane);
	
	// create a plane for simulation
	var geometry = new THREE.PlaneGeometry(planeWidth , planeHeight);
	planeScreen = new THREE.Mesh( geometry, screenMaterial );
	scene.add( planeScreen );		
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

	
	}
			
	
	planeScreen.material = screenMaterial;
	stats.end();
	orb_controls.update();
	renderer.render(scene, view_camera);		

	requestAnimationFrame(renderSimulation);
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

function setColorMapBar(cmap_bati, cmap_water){
	//requires colormap.js
	
	var c = -mUniforms.zmin.value/(mUniforms.zmax.value - mUniforms.zmin.value);
	var batimap = getColormapArray(cmap_bati,0,c);
	var watermap = getColormapArray(cmap_water,1,0);
	mUniforms.colors.value = watermap;
	mUniforms.bcolors.value = batimap;

	//setup colorbar
	var cbwater  = document.getElementById('cbwater');
	cbwater.width = Math.min(screenWidth/4,300);
    cbwater.height = 50;	
    
    var cbbati  = document.getElementById('cbbati');
	cbbati.width = Math.min(screenWidth/4,300);
    cbbati.height = 50;	
    
    var ncolors = 16;

    var waterlabels = getColormapLabels(cmap_water,1,0);
    var batilabels = getColormapLabels(cmap_bati,0,c);
	colorbar(watermap,cbwater,ncolors,0.0,waterlabels);
	colorbar(batimap,cbbati,ncolors,c,batilabels);
}