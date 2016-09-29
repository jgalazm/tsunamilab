var container;
var screenWidth, screenHeight, ratio;
var simulationScene, simulationCamera,  viewScene, viewCamera, renderer;
var width, height, ratio=1;
var orbitControls, trackBallControls;

//simulation object

var viewPlane, simulationPlane, planeWidth=1, planeHeight=1;
var simNx, simNy ;


//simulation texture-materials related vars

var toggleBuffer = false;
var mTextureBuffer1, mTextureBuffer2;
var screenMaterial, modelMaterial, initialMaterial, batiMaterial;
var batiTexture;
var initialCondition = 1;

//bathhymetry stuff

var batiname = "batiWorld";
var batiGeometry, batiPlane;
var earthMesh;
var sphereBatiMat;
var starsMaterial;

//physical world constants

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

//files to be loaded

var historicalData, batidata, dataarray,
	batiMap, batiMatMap, batiMatBumpMap, starsMap;


function init(){
	screenHeight = window.innerHeight;
	screenWidth = window.innerWidth;

	simulationDiv = document.getElementById('simulation');
	container = document.getElementById( 'container' );
	container.width = screenWidth;
	container.height = screenHeight;

  window.addEventListener('resize', resizeCanvas, false);

	// Load data and start the simulation
	var loader = new THREE.TextureLoader();

	var loadBathymetry = function(){
		loader.load(
			// resource URL
			"img/"+batiname+".jpg",
			// Function when resource is loaded
			function ( texture ) {
        // texture.wrapS=  THREE.RepeatWrapping;
				batiTexture = texture;
        batiTexture.wrapS = THREE.RepeatWrapping;
        batiTexture.wrapT = THREE.ClampToEdgeWrapping;
        batiTexture.needsUpdate = true;
				loadData();

				startSimulation();
				loadCities()
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
	};
	loadBathymetry();


}
function loadData(){
	var data = $.ajax("img/"+batiname+".txt",{async:false}).responseText;

	dataarray = data.split('\n');
    batidata = {
    	ny:parseInt(dataarray[0].split(':')[1]),
    	nx:parseInt(dataarray[1].split(':')[1]),
    };

	$.ajax({
	  dataType: "json",
	  url: "data/historicalData.json",
	  async: false,
	  success: function(data) {
		  historicalData = data;
		  console.log( "success" );
		}
	});

	batiMatMap = THREE.ImageUtils.loadTexture('img/'+batiname+'Map_NASA.jpg');
	batiMatMap.offset.x = 0.5;
	batiMatMap.wrapS = THREE.RepeatWrapping;
  batiMatMap.wrapT = THREE.ClampToEdgeWrapping;

	batiMatBumpMap = THREE.ImageUtils.loadTexture('img/batiWholeWorldBumpMap.jpg');
	batiMatBumpMap.offset.x = 0.5;
	batiMatBumpMap.wrapS = THREE.RepeatWrapping;
  batiMatBumpMap.wrapT = THREE.ClampToEdgeWrapping;

	starsMap = THREE.ImageUtils.loadTexture('img/galaxy_starfield.png');
};

function startSimulation(){
	console.log("startSimulation()");
	//renderer
	renderer = new THREE.WebGLRenderer({canvas:container, preserveDrawingBuffer: true});
	renderer.setClearColor( 0x000000);
	renderer.setSize(screenWidth, screenHeight);

	// scene
	simulationScene = new THREE.Scene();
	viewScene = new THREE.Scene();
	// create materials - uniforms

	createMaterials();

	//load input data and planeWidth, planeHeight for simulationCamera and objects

  setSimulation();

    //create Buffers

	resizeSimulation(simNx,simNy);

	// create lights
	createLights();

    //create cameras

	createCameras();

	//create geometries


	createObjects();



 	// initControls();

	//set default colors
	setColorMapBar('batitopo','wave');

  //set initial condition
  // render initial condition and bathymetry to both buffers

  doFaultModel();
  changeScenario("valdivia1960");

  //add GUI controls
  makeUSGSQuery();
  
	//render to screen

	mUniforms.tSource.value = mTextureBuffer1;
	simulationPlane.material = screenMaterial;
	renderer.render(simulationScene,viewCamera);


	// ----proceed with the simulation---

	renderSimulation();
}

function loadCities(){
	$.ajax({
	  dataType: "json",
	  url: "data/citiesLocation/cities.json",
	  async: false,
	  success: function(data) {
	  	console.log(data)
		  setCities(data);
		}
	});
}

function setCities(data){
		var phiLength = 0.027*Math.PI,
		thetaLength = 0.01*Math.PI
		//ce == lon == phi == alpha, cn == lat == theta == beta
	
	data.forEach(function(city){
		var alpha = Math.PI/180*city.lon;
		var beta = Math.PI/180*city.lat;
		var r = 0.5;
		
		city.name = "  " + city.name + "  "
		
		var geometry = new THREE.SphereBufferGeometry( 0.0025, 50, 50 );
		var materialSphere = new THREE.MeshLambertMaterial( { color: "rgba(255,127,10,1)", side : THREE.DoubleSide} );
		var object = new THREE.Mesh( geometry, materialSphere);

		var geometryBorder = new THREE.SphereBufferGeometry( 0.0026, 50, 50, 0, Math.PI * 2, Math.PI / 5, Math.PI - Math.PI / 5 );
		var materialSphereBorder = new THREE.MeshLambertMaterial( { color: "rgba(0,0,0,1)", side : THREE.DoubleSide} );
		var objectBorder = new THREE.Mesh( geometryBorder, materialSphereBorder);

		var x = -r*Math.cos(beta)*Math.cos(alpha);
		var y = r*Math.sin(beta);
		var z = r*Math.cos(beta)*Math.sin(alpha);
		object.position.x = x;
		object.position.y = y;
		object.position.z = z;
		viewScene.add( object );

		objectBorder.position.x = x;
		objectBorder.position.y = y;
		objectBorder.position.z = z;

		teste = objectBorder;
		// objectBorder.rotation.set(new THREE.Vector3(x,y,z));
		viewScene.add( objectBorder );
		objectBorder.up = new THREE.Vector3(0,0,-1)
		objectBorder.lookAt(new THREE.Vector3(0,0,0));
		objectBorder.rotateX(-Math.PI / 2)
		
		var canvas1 = document.createElement('canvas');
		var context1 = canvas1.getContext('2d');
		context1.font = "Bold 30px Helvetica";
		context1.fillStyle = 'rgba(226,226,226,0.6)';
	    
	  var width = context1.measureText(city.name).width;
	  var height = 60;
	  context1.fillRect(0, 0, width, height);
	    
		context1.fillStyle = "rgba(69,62,62,1)";
	  context1.fillText(city.name, 0, height/2 + 15);
	  // canvas contents will be used for a texture
		var texture1 = new THREE.Texture(canvas1) 
		texture1.needsUpdate = true;
	      
	    var material1 = new THREE.MeshBasicMaterial( {map: texture1, side:THREE.DoubleSide } );
	    material1.transparent = true;
	    material1.alphaTest = 0.5;
	
		var mesh1Geometry = new THREE.SphereGeometry(0.5*1.005, 32*4, 32*4,	 alpha, phiLength, Math.PI/2 - beta, thetaLength)
	
	  
	     mesh1 = new THREE.Mesh(
	        mesh1Geometry,
	        material1
	      );
		mesh1.position.set(0,0,0);
		viewScene.add( mesh1 );
	});
		var axisHelper = new THREE.AxisHelper( 5 );
	viewScene.add( axisHelper );
}

function createMaterials(){
	// uniforms
	mUniforms = {
    t:{type:"f",value:0.0},
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
		L : {type: 'f', value: undefined},
		W : {type: 'f', value: undefined},
		depth : {type: 'f', value: undefined},
		slip : {type: 'f', value:  undefined},
		strike : {type: 'f', value: undefined},
		dip : {type: 'f', value: undefined},
		rake :  {type:  'f', value: undefined},
		U3 : {type: 'f', value:  undefined},
		cn : {type: 'f', value:  undefined},   //centroid N coordinate, 18zone
		ce : {type: 'f', value:  undefined},    //centroid E coordinate, 18zone

		//misc
		pause: {type: 'i', value: 0}
	};


	batiMaterial = new THREE.MeshPhongMaterial({
		map: batiMatMap,
		bumpMap: batiMatBumpMap,
		bumpScale: 0.02 //,
		// 	batiMaterial.specularMap    = THREE.ImageUtils.loadTexture('img/'+batiname+'SpecMap.jpg')
		// batiMaterial.specular  = new THREE.Color('grey')
	});

	sphereBatiMat  = new THREE.MeshPhongMaterial({
		map : batiMatMap,
		bumpMap : batiMatBumpMap,
		//specularMap : THREE.ImageUtils.loadTexture('img/'+batiname+'SpecMap.jpg')
		bumpScale : 0.01
		//emissive : 0xffffff;
	});

	stars_material  = new THREE.MeshBasicMaterial({
		map: starsMap,
		side: THREE.BackSide
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

function setSimulation(){
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
		simNx = simNx/5;
		simNy = simNy/5;
  }
  // set simNx and simNy as the nearest power of two
  // this is needed by THREE.RepeatWrapping
  var xpower=  Math.floor(Math.log(simNx)/Math.log(2));
  var ypower=  Math.floor(Math.log(simNy)/Math.log(2));

  if (simNx-Math.pow(2,xpower)<Math.pow(2,xpower+1)-simNx){
    simNx = Math.pow(2,xpower);
  }
  else{
    simNx = Math.pow(2,xpower+1)
  }

  if (simNy-Math.pow(2,ypower)<Math.pow(2,ypower+1)-simNy){
    simNy = Math.pow(2,ypower);
  }
  else{
    simNy = Math.pow(2,ypower+1)
  }
  mUniforms.xmin.value = 0.0;
  mUniforms.xmax.value = 360-360/simNx/2.0;

	planeHeight = 1.0;
	planeWidth = planeHeight*simNx/simNy;
	mUniforms.texel.value = new THREE.Vector2(1/simNx,1/simNy)

  var dx = (mUniforms.xmax.value-mUniforms.xmin.value)/(simNx)*60.0;
  var dy = (mUniforms.ymax.value-mUniforms.ymin.value)/(simNy)*60.0;
  mUniforms.dx.value = dx;
  mUniforms.dy.value = dy;

  // ymin = mUniforms.ymin.value
  var lat_max = 85;//Math.max(Math.abs(ymin),Math.abs(ymax));
  var dx_real = R_earth*Math.cos(lat_max*rad_deg)*dx*rad_min;
  var dy_real = R_earth*dy*rad_min;

  dt = 0.5*Math.min(dx_real,dy_real)/Math.sqrt(-9.81*mUniforms.zmin.value);

  mUniforms.RR.value = dt/R_earth;
  mUniforms.RS.value = 9.81*mUniforms.RR.value;

  mUniforms.tBati.value = batiTexture;
}

function resizeCanvas(){
	screenWidth = container.width;
	screenHeight = container.height;
	container.width = window.innerWidth;
  container.height = window.innerHeight;
	renderer.setSize(container.width, container.height);
	viewCamera.aspect = container.width/container.height;
	viewCamera.updateProjectionMatrix();
}


function resizeSimulation(nx,ny){

	mUniforms.delta.value = new THREE.Vector2(1/nx,1/ny);

	// create buffers
	if (!mTextureBuffer1){

	mTextureBuffer1 = new THREE.WebGLRenderTarget( nx, ny,
		 					{minFilter: THREE.LinearFilter,
	                          magFilter: THREE.LinearFilter,
	                          format: THREE.RGBAFormat,
	                          type: THREE.FloatType,
                            wrapS: THREE.RepeatWrapping,
                            wrapT: THREE.ClampToEdgeWrapping,
                            needsUpdate: true});
	mTextureBuffer2 = new THREE.WebGLRenderTarget( nx, ny,
		 					{minFilter: THREE.LinearFilter,
	                         magFilter: THREE.LinearFilter,
	                         format: THREE.RGBAFormat,
	                         type: THREE.FloatType,
                           wrapS: THREE.RepeatWrapping,
                         wrapT: THREE.ClampToEdgeWrapping,
                       needsUpdate: true});
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

    simulationPlane.material = screenMaterial;
    nstep = 0;
    renderer.render(viewScene,viewCamera);
}

function setView(cn,ce){
	var alpha = Math.PI/180*ce;
	var beta = Math.PI/180*cn;
	var r = 1.0;

	var currentX = viewCamera.position.x;
	var currentY = viewCamera.position.y;
	var currentZ = viewCamera.position.z;

	var currentR = Math.sqrt(currentX*currentX+currentY*currentY+currentZ*currentZ);
	var currentTheta = Math.atan2(currentX,currentZ)+Math.PI/2;
	var currentPhi = Math.asin(currentY/currentR);

	var animate = function(time){
		TWEEN.update(time);
		requestAnimationFrame( animate );
	}
	viewCamera.up = new THREE.Vector3(0,1,0);
	animate();

	var light = viewScene.getObjectByName("directional Light");
 	var tween = new TWEEN.Tween({r: currentR, theta: currentTheta, phi:currentPhi}).to({
	    r: r, 
	    theta: alpha, 
	    phi: beta
	}, 2000).easing(TWEEN.Easing.Quintic.InOut).onUpdate(function() {
	    var targetX = -this.r*Math.cos(this.phi)*Math.cos(this.theta);
		var targetY = this.r*Math.sin(this.phi);
		var targetZ = this.r*Math.cos(this.phi)*Math.sin(this.theta);
	    viewCamera.position.x = targetX;
	    viewCamera.position.y = targetY;
	    viewCamera.position.z = targetZ;
	    light.position.x = viewCamera.position.x;
		light.position.y = viewCamera.position.y;
		light.position.z = viewCamera.position.z;
	}).onComplete(function(){
        animate = function(){};
    }).start();
    console.log(light)
}
function createCameras(){
	simulationCamera = new THREE.OrthographicCamera( planeWidth/-2,
					 planeWidth/2,
					 planeHeight/2,
					 planeHeight/-2, - 500, 1000 );

	var r = screenWidth/screenHeight;
	// viewCamera = new THREE.OrthographicCamera( -0.5*r*2, 0.5*r*2, 0.5*2, -0.5*2, - 500, 1000 );
	viewCamera = new THREE.PerspectiveCamera(45,screenWidth/screenHeight,0.01,500);
	viewCamera.position.x = 0.0;
	viewCamera.position.y = 0.0;
	viewCamera.position.z = 1.0;
	viewCamera.lookAt(new THREE.Vector3(0,0,0));
	viewScene.add(viewCamera);


	/* use these with OrtgraphicCamera
	 orbitControls = new THREE.OrbitControls( viewCamera);
	 orbitControls.enableRotate = true;*/

	trackBallControls = new THREE.TrackballControls(viewCamera, document.getElementById('simulation'));
	trackBallControls.target.set(0,0,0);
	trackBallControls.zoomSpeed = 1.2/100.0;
	trackBallControls.rotateSpeed = 2.0/2.50;
	trackBallControls.noZoom = false;
	trackBallControls.panSpeed = 0.08;
	trackBallControls.minDistance = 0.65;
	trackBallControls.maxDistance = 2.0;
	trackBallControls.dynamicDampingFactor = 0.1;
}
function createObjects(){

	// Plane used to plot the simulation calculated values

	var simulationGeometry = new THREE.PlaneGeometry(planeWidth , planeHeight);
	simulationPlane = new THREE.Mesh( simulationGeometry, screenMaterial );
	simulationScene.add( simulationPlane);

	// --------- 3D Sphere visualization ----------------

	/* Sphere showing a satellite image of the earth*/

	var sphereBatiGeom = new THREE.SphereGeometry(0.5, 32*4, 32*4,
							0, Math.PI*2.0, 0, Math.PI);
	earthBatiMesh	= new THREE.Mesh(sphereBatiGeom, sphereBatiMat);
	viewScene.add(earthBatiMesh);

	/*
	Sphere mesh to show the simulation
	*/

	// total extent of latitude of the texture
	var ysouth = Math.PI/2 - mUniforms.ymin.value*Math.PI/180.0;
	var ynorth = Math.PI/2 - mUniforms.ymax.value*Math.PI/180.0;


	var sphereModelGeometry = new THREE.SphereGeometry(0.5*1.001, 32*4, 32*4,	0, Math.PI*2.0,	ynorth, ysouth-ynorth)
	earthModelMesh	= new THREE.Mesh(sphereModelGeometry, screenMaterial);
	viewScene.add(earthModelMesh);

	var starsGeometry  = new THREE.SphereGeometry(90, 32, 32)
	var starsMesh  = new THREE.Mesh(starsGeometry, stars_material)
	viewScene.add(starsMesh);


	// --------- 2D plane visualization ----------------

	//create a plane for bathymetry
	batiGeometry = new THREE.PlaneGeometry(planeWidth,planeWidth/2.0);
	batiPlane = new THREE.Mesh(batiGeometry, batiMaterial);
	batiPlane.position.z = -0.001;
	// viewScene.add(batiPlane);

	var viewGeometry = new THREE.PlaneGeometry(planeWidth , planeHeight);
	viewPlane = new THREE.Mesh( viewGeometry, screenMaterial );
	viewPlane.position.z = 0.01;
	// viewScene.add( viewPlane );
}

function createLights(){
	// ----------------- Lights ---------------------

	var light	= new THREE.AmbientLight( 0xffffff,0.99);
	viewScene.add( light );

	var light	= new THREE.DirectionalLight( 0xffffff, 1 )
	light.position.set(3,3,5)
	light.name = "directional Light";
	viewScene.add( light );

}

function doFaultModel(){
	simulationPlane.material = initialMaterial;
	setView(mUniforms.cn.value,mUniforms.ce.value);
	renderer.render(simulationScene, simulationCamera, mTextureBuffer1, true);
	renderer.render(simulationScene, simulationCamera, mTextureBuffer2, true);
  mUniforms.t.value = 0.0;
}

function renderSimulation(){
	if (paused != 1){
		simulationPlane.material = modelMaterial;
		for (var i=0; i<Math.floor(speed); i++){
			writeTimeStamp();
			if (!toggleBuffer){
				mUniforms.tSource.value = mTextureBuffer1;
				renderer.render(simulationScene, simulationCamera, mTextureBuffer2, true);
			}
			else{
				mUniforms.tSource.value = mTextureBuffer2;
			  renderer.render(simulationScene, simulationCamera, mTextureBuffer1, true);
			}

			toggleBuffer = !toggleBuffer;
		}

	if (toggleBuffer){
			mUniforms.tSource.value = mTextureBuffer1;
		}
		else{
			mUniforms.tSource.value = mTextureBuffer2;
		}

  }

	simulationPlane.material = screenMaterial;
	// orbitControls.update();
	trackBallControls.update();
	renderer.render(viewScene, viewCamera);

  mUniforms.t.value = mUniforms.t.value +1;
	requestAnimationFrame(renderSimulation);
}

function writeTimeStamp(){
	nstep = nstep+1;
	time = nstep*dt;
	var timetext = "";

	var hours = Math.floor(time/60/60),
        minutes = Math.floor((time - (hours * 60 * 60))/60),
        seconds = Math.round(time - (hours * 60 * 60) - (minutes * 60));
    var timetext = timetext.concat(hours + ':' +
    					((minutes < 10) ? '0' + minutes : minutes) + ':' +
    					((seconds < 10) ? '0' + seconds : seconds));
    var hoursText = ((hours < 10) ? '0' + hours : hours)
    var minutesText = ((minutes < 10) ? '0' + minutes : minutes)
	var hoursElement = document.getElementById("time-hours");
	var minutesElement = document.getElementById("time-minutes");
	hoursElement.textContent = hoursText;
	minutesElement.textContent = minutesText;
}

function setColorMapBar(cmap_bati, cmap_water){
	//requires colormap.js

	var watermap = getColormapArray(cmap_water,1,0);
	mUniforms.colors.value = watermap;

	//setup colorbar
	var cbwater  = document.getElementById('cbwater');
	cbwater.width = screenWidth/5;
  	cbwater.height = 60

	colorbar(watermap,cbwater,0.0);
}
