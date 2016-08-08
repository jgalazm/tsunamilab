



console.log("new_gui.js");


function init_new_gui(){


	console.log(simulationControls);
	console.log(simulationControls.x);


	console.log("function new_gui.js");

	if(paused){
		$("#icon-play").show();
		$("#icon-pause").hide();
	}
	else{
		$("#icon-play").hide();
		$("#icon-pause").show();
	}

	$(".movable").mousedown(function(){

		console.log("mousedown!!!");
		
		$(this).mousemove(function(e){

			console.log(e.pageX, e.pageY);
			$(this).css("left", e.pageX-25);
			$(this).css("top", e.pageY-25);

		});
		
	});

	$(".movable").mouseup(function(){

		console.log("mouseup");



		$(this).unbind("mousemove");

	});

	console.log("init_new_gui()");



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




};





