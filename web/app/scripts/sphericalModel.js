//------------------------------------------------------
//it requires variables: vshader, mFshader and sFshader
//with url's of vertex/fragment shaders to work.
//------------------------------------------------------

var container;
var screenWidth, screenHeight, ratio;
var calc_scene,calc_camera,  view_scene, view_camera, renderer;
var width, height, ratio=1;
var orb_controls, track_controls;

//simulation object

var planeScreen, planeWidth=1, planeHeight=1;
var simNx, simNy ;


//simulation texture-materials related vars

var toggleBuffer = false;
var mTextureBuffer1, mTextureBuffer2, batiTextureBuffer,batiTextureBufferColored;
var screenMaterial, modelMaterial, initialMaterial, batiMaterial;
var initCondition = 1;

//bathhymetry stuff

var batiname = "batiWorld"
var batiGeom, batiPlane, batidata;
var earthMesh;

//physical world constants

var R_earth = 6378000.0,
    rad_deg = 0.01745329252,
    rad_min = 0.000290888208665721,
    cori_w = 7.2722e-5;
// historical scenarios
var historicalData;

//ui

var info
var time=0, dt;
var speed = 1, paused = 0;
var nstep = 0;
var colors;
var stats = new Stats();

stats.setMode( 0 ); // 0: fps, 1: ms, 2: mb

// align top-left


function init(){
	console.log("init()");
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.left = '0px';
	stats.domElement.style.top = '0px';

	console.log(stats);


	/*Add FPS to html*/
	//document.body.appendChild(stats.domElement);

	screenHeight = window.innerHeight;
	// ratio = 432/594;
	//screenWidth = window.innerWidth*0.8;
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

	console.log("init_end");

}

function startSimulation(bati_image){
	console.log("startSimulation()");
	//renderer
	renderer = new THREE.WebGLRenderer({canvas:container, preserveDrawingBuffer: true});
	renderer.setClearColor( 0x000000);
	renderer.setSize(screenWidth, screenHeight);

	// scene
	calc_scene = new THREE.Scene();
	view_scene = new THREE.Scene();

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
  makeQuery();

 	initControls();

	//set default colors
	setColorMapBar('batitopo','wave2');


	//set initial condition
    // render initial condition and bathymetry to both buffers
    doFaultModel();
    changeScenario("valdivia1960");
	//render to screen
	mUniforms.tSource.value = mTextureBuffer1;
	planeScreen.material = screenMaterial;
	renderer.render(calc_scene,view_camera);


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

	batiMaterial2 = new THREE.MeshPhongMaterial();

	batiMaterial = new THREE.ShaderMaterial({
		uniforms: mUniforms,
		vertexShader: vshader_text,
		fragmentShader: bFshader_text
	});

	initialMaterial = new THREE.ShaderMaterial({
		uniforms: mUniforms,
		vertexShader: vshader_text,
		fragmentShader: iFshader_text
	});

	modelMaterial = new THREE.ShaderMaterial({
		uniforms: mUniforms,
		vertexShader: vshader_text,
		fragmentShader: mFshader_text
	});

	screenMaterial = new THREE.ShaderMaterial({
		uniforms: mUniforms,
		vertexShader: vshader_text,
		fragmentShader: sFshader_text,
		transparent:true
	});

}
function changeScenario(scenario){

	mUniforms.L.value = historicalData[scenario].L;
	mUniforms.W.value = historicalData[scenario].W
	mUniforms.depth.value = historicalData[scenario].depth;
	mUniforms.slip.value = historicalData[scenario].slip;
	mUniforms.strike.value = historicalData[scenario].strike;
	mUniforms.dip.value = historicalData[scenario].dip;
	mUniforms.rake.value = historicalData[scenario].rake;
	mUniforms.U3.value = historicalData[scenario].U3;
	mUniforms.cn.value = historicalData[scenario].cn;
	mUniforms.ce.value = historicalData[scenario].ce;

	doFaultModel();
    planeScreen.material = screenMaterial;
    nstep = 0;
    renderer.render(view_scene,view_camera);
    console.log('render fault');
}

function loadData(bati_image){
	var data = $.ajax("img/"+batiname+".txt",{async:false}).responseText;
    var dataarray = data.split('\n');
    batidata = {
    	ny:parseInt(dataarray[0].split(':')[1]),
    	nx:parseInt(dataarray[1].split(':')[1]),
    };

	// $.getJSON( "data/faults.json", function(data) {
	//   historicalData = data;
	//   changeScenario("japan2011");
	//   console.log( "success" );
	// })
	//   .done(function() {
	//     console.log( "second success" );
	//     // changeScenario("japan2011");
	//   })
	//   .fail(function(val) {
	//   	console.log(val);
	//     console.log( "error" );
	//   })
	//   .always(function() {
	//     console.log( "complete" );
	//   });

	$.ajax({
	  dataType: "json",
	  url: "data/historicalData.json",
	  async: false,
	  success: function(data) {
		  historicalData = data;
		  console.log( "success" );
		}
	});


    mUniforms.xmin.value = parseFloat(dataarray[2].split(':')[1]);
    mUniforms.xmax.value = parseFloat(dataarray[3].split(':')[1]);
	mUniforms.ymin.value = parseFloat(dataarray[4].split(':')[1]);
	var ymin = parseFloat(dataarray[4].split(':')[1]);
    mUniforms.ymax.value = parseFloat(dataarray[5].split(':')[1]);
    var ymax = parseFloat(dataarray[5].split(':')[1]);
    mUniforms.zmin.value = parseFloat(dataarray[6].split(':')[1]);
    mUniforms.zmax.value = parseFloat(dataarray[7].split(':')[1]);

    if (mUniforms.zmin.value>0.0){
    	var e = new Error('zmin positive on bathymetry image file');
    	throw e;
    }


	simNx  = batidata.nx;//parseInt(batidata.nx);
	simNy =  batidata.ny;//parseInt(batidata.ny);
	if (simNx>1000){
		simNx = simNx/3;
		simNy = simNy/3;
	}
	console.log('There are '+simNx.toString()+ ' cells in the X direction')
	console.log('There are '+simNy.toString()+ ' cells in the Y direction')


	planeHeight = 1.0;
	planeWidth = planeHeight*simNx/simNy;
	mUniforms.texel.value = new THREE.Vector2(1/simNx,1/simNy)

    var dx = (mUniforms.xmax.value-mUniforms.xmin.value)/(simNx)*60.0;
    var dy = (mUniforms.ymax.value-mUniforms.ymin.value)/(simNy)*60.0;
    mUniforms.dx.value = dx;
    mUniforms.dy.value = dx;
    // ymin = mUniforms.ymin.value
    var lat_max = 60;//Math.max(Math.abs(ymin),Math.abs(ymax));
    var dx_real = R_earth*Math.cos(lat_max*rad_deg)*dx*rad_min;
    var dy_real = R_earth*dy*rad_min;

    dt = 0.5*Math.min(dx_real,dy_real)/Math.sqrt(-9.81*mUniforms.zmin.value);

    mUniforms.RR.value = dt/R_earth;
    mUniforms.RS.value = 9.81*mUniforms.RR.value;

	batiTextureBuffer = new THREE.Texture(bati_image);
    batiTextureBuffer.wrapS = THREE.ClampToEdgeWrapping; // are these necessary?
    batiTextureBuffer.wrapT = THREE.ClampToEdgeWrapping;
    // batiTextureBuffer.repeat.x = batiTextureBuffer.repeat.y = 2;
    batiTextureBuffer.needsUpdate = true; //this IS necessary
    mUniforms.tBati.value = batiTextureBuffer;


}

function createCameras(){
	calc_camera = new THREE.OrthographicCamera( planeWidth/-2,
					 planeWidth/2,
					 planeHeight/2,
					 planeHeight/-2, - 500, 1000 );

	var r = screenWidth/screenHeight;
	// view_camera = new THREE.OrthographicCamera( -0.5*r*2, 0.5*r*2, 0.5*2, -0.5*2, - 500, 1000 );
	view_camera = new THREE.PerspectiveCamera(45,screenWidth/screenHeight,0.01,500);
	view_camera.position.x = 0.0;
	view_camera.position.y = Math.sin(mUniforms.cn.value*Math.PI/180.0);
	view_camera.position.z = Math.cos(mUniforms.cn.value*Math.PI/180.0);
	view_camera.lookAt(new THREE.Vector3(0,0,0));
	view_scene.add(view_camera);

	// orb_controls = new THREE.OrbitControls( view_camera);
	// orb_controls.enableRotate = true;
	track_controls = new THREE.TrackballControls(view_camera, document.getElementById('simulation'));
	// track_controls.target.set(0,0,0);
	track_controls.zoomSpeed = 1.2/100.0;
	track_controls.rotateSpeed = 2.0/2.50;
	track_controls.noZoom = false;
	track_controls.panSpeed = 0.08;
	track_controls.minDistance = 0.8;
	track_controls.maxDistance = 2.0;
	// track_controls.dynamicDampingFactor = 0.3;
}
function createGeom(){
	//create that sphere

	//create a plane for bathymetry
	batiGeom = new THREE.PlaneGeometry(planeWidth,planeHeight);
	// batiPlane = new THREE.Mesh(batiGeom, batiMaterial);
	// batiPlane.position.z = -0.1;
	// scene.add(batiPlane);

	batiGeom2 = new THREE.PlaneGeometry(planeWidth, planeHeight);


	//first use batiMaterial1 to render to buffer
	batiPlane2 = new THREE.Mesh(batiGeom, batiMaterial);

	//now use material2, to render to screen

	batiMaterial2.map =  THREE.ImageUtils.loadTexture('img/'+batiname+'Map.jpg');
	batiMaterial2.bumpMap = THREE.ImageUtils.loadTexture('img/'+batiname+'BumpMap.jpg');;
	batiMaterial2.bumpScale = 0.02;
	// batiMaterial2.specularMap    = THREE.ImageUtils.loadTexture('img/'+batiname+'SpecMap.jpg')
	// batiMaterial2.specular  = new THREE.Color('grey')
	batiPlane2.material = batiMaterial2;
	batiPlane2.position.z = -0.001;
	// view_scene.add(batiPlane2);

	//bati sphere
	var ysouth = Math.PI/2 - mUniforms.ymin.value*Math.PI/180.0;
	var ynorth = Math.PI/2 - mUniforms.ymax.value*Math.PI/180.0;

	var sphereBatiGeom = new THREE.SphereGeometry(0.5, 32*4, 32*4,
												0, Math.PI*2,
													0, Math.PI);
	var sphereBatiMat  = new THREE.MeshPhongMaterial();
	sphereBatiMat.map = THREE.ImageUtils.loadTexture('img/'+batiname+'Map_NASA.jpg');
	sphereBatiMat.bumpMap = THREE.ImageUtils.loadTexture('img/batiWholeWorldBumpMap.jpg');
	// sphereBatiMat.specularMap    = THREE.ImageUtils.loadTexture('img/'+batiname+'SpecMap.jpg')
	sphereBatiMat.bumpScale = 0.01;
	// sphereBatiMat.emissive = 0xffffff;

	earthBatiMesh	= new THREE.Mesh(sphereBatiGeom, sphereBatiMat);
	// earthBatiMesh.position.x = 2.0;
	var d =  -(mUniforms.ce.value - mUniforms.xmin.value)*Math.PI/180.0;
	earthBatiMesh.rotateY(d-Math.PI/2.0);;
	view_scene.add(earthBatiMesh);

	//model sphere

	// var sphereModelGeom = new THREE.SphereGeometry(0.5*1.01, 32, 32, 0, Math.PI*2, Math.PI/6, Math.PI*2/3);

	var sphereModelGeom = new THREE.SphereGeometry(0.5*1.01, 32, 32,
													0, Math.PI*2,
													ynorth, ysouth-ynorth);
	var sphereModelMat  = screenMaterial;
	earthModelMesh	= new THREE.Mesh(sphereModelGeom, sphereModelMat);
	// earthModelMesh.position.x = 2.0;

	earthModelMesh.rotateY(d+Math.PI/2.0);
	view_scene.add(earthModelMesh);


	var light	= new THREE.AmbientLight( 0xffffff,0.9);
	view_scene.add( light );

	var light	= new THREE.DirectionalLight( 0xffffff, 1 )
	light.position.set(3,3,5)
	view_scene.add( light );

	var light = new THREE.PointLight( 0xaaaaaa, 0.5, 0 );
	light.position.set( 0, 0, 50 );
	view_scene.add( light );

	// create a plane for simulation
	var geometry = new THREE.PlaneGeometry(planeWidth , planeHeight);
	planeScreen = new THREE.Mesh( geometry, screenMaterial );
	calc_scene.add( planeScreen );


	var stars_geometry  = new THREE.SphereGeometry(90, 32, 32)
	// create the material, using a texture of startfield
	var stars_material  = new THREE.MeshBasicMaterial()
	stars_material.map   = THREE.ImageUtils.loadTexture('img/galaxy_starfield.png')
	stars_material.side  = THREE.BackSide
	// create the mesh based on geometry and material
	var stars_mesh  = new THREE.Mesh(stars_geometry, stars_material)
	view_scene.add(stars_mesh);


	// var axisHelper = new THREE.AxisHelper( 5 );
	// view_scene.add( axisHelper );


}

function doFaultModel(){
	planeScreen.material = initialMaterial;
	renderer.render(calc_scene, calc_camera, mTextureBuffer1, true);
	renderer.render(calc_scene, calc_camera, mTextureBuffer2, true);
}

function resizeSimulation(nx,ny){

	mUniforms.delta.value = new THREE.Vector2(1/nx,1/ny);

	// create buffers
	if (!mTextureBuffer1){


	batiTextureBufferColored = new THREE.WebGLRenderTarget( nx, ny,
		 					{minFilter: THREE.LinearFilter,
	                         magFilter: THREE.LinearFilter,
	                         format: THREE.RGBAFormat,
	                         type: THREE.FloatType});

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
				renderer.render(calc_scene, calc_camera, mTextureBuffer2, true);

			}
			else{
				mUniforms.tSource.value = mTextureBuffer2;
				renderer.render(calc_scene, calc_camera, mTextureBuffer1, true);

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
	// orb_controls.update();
	track_controls.update();
	renderer.render(view_scene, view_camera);

	requestAnimationFrame(renderSimulation);
}

function writeTimeStamp(){
	nstep = nstep+1;
	time = nstep*dt;
	var timetext = "Time: ";
	// timetext = timetext.concat(time.toFixed(2));
	// timetext = timetext.concat(" min.");

	var hours = Math.floor(time/60/60),
        minutes = Math.floor((time - (hours * 60 * 60))/60),
        seconds = Math.round(time - (hours * 60 * 60) - (minutes * 60));
    var timetext = timetext.concat(hours + ':' + ((minutes < 10) ? '0' + minutes : minutes) + ':' + ((seconds < 10) ? '0' + seconds : seconds));


	var timeDomEl = document.getElementById("time");
	timeDomEl.textContent = timetext;
}

function setColorMapBar(cmap_bati, cmap_water){
	//requires colormap.js

	//var c = -mUniforms.zmin.value/(mUniforms.zmax.value - mUniforms.zmin.value);
	var watermap = getColormapArray(cmap_water,1,0);
	mUniforms.colors.value = watermap;

	//setup colorbar
	var cbwater  = document.getElementById('cbwater');
	cbwater.width = screenWidth/5;//Math.min(screenWidth/2,300);
    cbwater.height = 40
    // cbwater.height = 100;
    // cbwater.width = 80;

	colorbar(watermap,cbwater,0.0);
}
