





function simulationControls(){

	this.x = 0;

	this.pause = function(){
	     paused = 1-paused;
	}

	this.restart = function(){
		doFaultModel();
	    simulationPlane.material = screenMaterial;
	    nstep = 0;
	    renderer.render(simulationScene,viewCamera); 
	    //orb_controls.reset();
	    writeTimeStamp(); 
	}

	this.snapshot = function(){
		var dataURL = container.toDataURL("image/png");
		window.open(dataURL, "tsunami-"+Math.random());
	}	

}