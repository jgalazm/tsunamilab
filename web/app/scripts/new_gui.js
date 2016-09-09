




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

	$("#btn-info").click(function(){
		$("#init_modal").modal("show");
	});

	$("#scenarios").change(function(value){
		console.log($(this).val())
		changeScenario($(this).val());
	});

	$("#btn-minus").click(function(){
		speed = Math.max(speed - 1, 1);
	});

	$("#btn-plus").click(function(){
		speed = Math.min(speed +1, 20);
	});
};





