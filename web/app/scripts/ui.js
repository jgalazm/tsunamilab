
function tsunamiControls(){
    
    // Changed by function in simulation.js 
	this.pause = function(){
         //paused = 1-paused;
         simulationControls.pause();
	}

	this.speed = speed;

    /* Changed by function in simulation.js
	this.restart = function(){
		doFaultModel();
        planeScreen.material = screenMaterial;
        nstep = 0;
        renderer.render(calc_scene,view_camera); 
        //orb_controls.reset();
        writeTimeStamp(); 
	}
    */
    this.restart = simulationControls.restart;
    // Function is in simulation.js now
	this.snapshot = simulationControls.snapshot;
    
    this.colormap = "wave2";
    this.scenario = "valdivia1960";

    this.L = mUniforms.L.value;
    this.W = mUniforms.W.value;
    this.depth = mUniforms.depth.value;
    this.slip = mUniforms.slip.value;
    this.strike = mUniforms.strike.value;
    this.dip = mUniforms.dip.value;
    this.rake = mUniforms.rake.value;
    this.U3 = mUniforms.U3.value;
    this.cn = mUniforms.cn.value;
    this.ce = mUniforms.ce.value;
}
function initControls() {
    var controls = new tsunamiControls;


    dat.GUI.TEXT_CLOSED = 'Close Advanced Controls';
    dat.GUI.TEXT_OPEN = 'Open Advanced Controls';
    var gui = new dat.GUI({
        autoPlace: false

    });



    // gui.remember(controls);
    //folders    
    var folderGeneral = gui.addFolder('General Controls');
    var folderFault = gui.addFolder('Fault model');


    //speed
    speedControl = folderGeneral.add(controls, "speed", 1, 20).name('Speed');
    speedControl.onChange(function(value){
    	speed = Math.floor(value);
    });  
        
    //pause
    pauseControl = folderGeneral.add(controls, "pause").name('Start/Pause');

    //restart simulation control

 	restartControl = folderGeneral.add(controls, "restart").name("Restart");


    //snapshot control

 	snapshotControl = folderGeneral.add(controls, "snapshot").name("Snapshot");

    //colormap control

    colormapControl = folderGeneral.add(controls, "colormap",
        ["jet","seismic","wave","wave2"]).name("Colormap");
    colormapControl.onChange(function(value){
        setColorMapBar('batitopo',value);
    });

    //scenario control

    scenarioControl = folderGeneral.add(controls, "scenario",
        Object.keys(historicalData))
    scenarioControl.onChange(function(value){
        changeScenario(value);
        // view_camera.position.y = Math.sin(mUniforms.cn.value*Math.PI/180.0);
        // view_camera.position.z = Math.cos(mUniforms.cn.value*Math.PI/180.0);
    });

    //---fault model controls-----
    fNorthingControl = folderFault.add(controls, "cn",-90,90).name('Northing (m)').step(0.5);
    fNorthingControl.onChange(function(value){
        mUniforms.cn.value = value;
        controls.restart();
    }); 

    fEastingControl = folderFault.add(controls, "ce", -240.0,120.1   ).name('Easting (m)').step(0.1);
    fEastingControl.onChange(function(value){
        mUniforms.ce.value = value;
        controls.restart();
    });     
    fLengthControl = folderFault.add(controls, "L", 1, 1000000).name('Length (m)');
    fLengthControl.onChange(function(value){
        mUniforms.L.value = Math.floor(value);
        controls.restart();
    });  

    fWidthControl = folderFault.add(controls, "W", 1, 1000000).name('Width (m)');
    fWidthControl.onChange(function(value){
        mUniforms.W.value = Math.floor(value);
        controls.restart();
    }); 

    fDepthControl = folderFault.add(controls, "depth", 1, 100000).name('Depth (m)');
    fDepthControl.onChange(function(value){
        mUniforms.depth.value = Math.floor(value);
        controls.restart();
    }); 

    fSlipControl = folderFault.add(controls, "slip", 0, 20).name('Slip (m)');
    fSlipControl.onChange(function(value){
        mUniforms.slip.value = Math.floor(value);
        controls.restart();
    }); 
    
    fStrikeControl = folderFault.add(controls, "strike", 0,360).name('Strike (degrees)');
    fStrikeControl.onChange(function(value){
        mUniforms.strike.value = Math.floor(value);
        controls.restart();
    }); 
    fDipControl = folderFault.add(controls, "dip", 0,360).name('Dip (degrees)');
    fDipControl.onChange(function(value){
        mUniforms.dip.value = Math.floor(value);
        controls.restart();
    });
    fRakeControl = folderFault.add(controls, "rake", 0,360).name('Rake (degrees)');
    fRakeControl.onChange(function(value){
        mUniforms.rake.value = Math.floor(value);
        controls.restart();
    });   
    fTensileControl = folderFault.add(controls, "U3", 0,20).name('Tensile (m)');
    fTensileControl.onChange(function(value){
        mUniforms.U3.value = Math.floor(value);
        controls.restart();
    });     

    // folders are open initially
    
    folderGeneral.open();
    // folderSimulation.open();
    // folderExtSource.open();

    //own separate container

    var customContainer = document.getElementById('controls');
    customContainer.appendChild(gui.domElement);


    console.log(gui.closed);
    gui.closed = true;

    //gui.TEXT_OPEN = "Advanced Controls";

    

    //$(".close-button").text("Advanced Controls");


}

/*
function snapshot(){
	var dataURL = container.toDataURL("image/png");
	window.open(dataURL, "tsunami-"+Math.random());
}	*/