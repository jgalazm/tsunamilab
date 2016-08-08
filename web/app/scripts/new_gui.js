




//console.log("new_gui.js");


function init_new_gui(){



	//console.log("function new_gui.js");

	if(paused){
		$("#icon-play").show();
		$("#icon-pause").hide();
	}
	else{
		$("#icon-play").hide();
		$("#icon-pause").show();
	}



	$("#btn-play").click(function(){
		simulationControls.pause();

		if(paused){
			$("#icon-play").show();
			$("#icon-pause").hide();
		}
		else{
			$("#icon-play").hide();
			$("#icon-pause").show();
		}

	});

	$("#btn-restart").click(function(){
		simulationControls.restart();
	});

	$("#btn-snapshot").click(function(){
		simulationControls.snapshot();
	});

	$("#scenarios").change(function(value){
		console.log($(this).val())
		changeScenario($(this).val());
	});

};





