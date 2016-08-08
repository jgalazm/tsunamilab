



console.log("new_gui.js");


function init_new_gui(){


	console.log(simulationControls);
	console.log(simulationControls.x);


	console.log("function new_gui.js");

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
	});

	$("#btn-restart").click(function(){
		simulationControls.restart();
	});




};





