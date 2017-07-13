// function that initializes the cesium display
$('#init_modal').modal();

var resizeCanvas = function(windowwidth, windowheight, d){
  // if(!popup)
  //   popup = window;
  // var windowheight = popup.innerHeight;;
  // var windowwidth = popup.innerWidth;
  // var d = 0.10*windowheight;
  var centerTop = 0.5*windowheight;
  var centerLeft = 0.5*windowwidth;

  var canvasWidth = windowwidth*0.6; //45°
  var canvasHeight  = windowheight/2.0 - d;
  // var canvasHeight  = 1.5*windowheight/2.0 - d;

  var top1 = centerTop - d-canvasHeight;
  var left1 = centerLeft - canvasWidth/2;

  var top2 = centerTop - canvasHeight/2;
  var left2 = centerLeft + d + canvasHeight/2 - canvasWidth/2;

  var top3 = centerTop + d;
  var left3 = centerLeft - canvasWidth/2;

  var top4 = centerTop - canvasHeight/2;
  var left4 = centerLeft - d - canvasHeight/2 - canvasWidth/2;


  var coords = {
    top1: top1,
    left1: left1,
    top2: top2,
    left2: left2,
    top3: top3,
    left3: left3,
    top4: top4,
    left4: left4
  }

  placeSlaveCanvas(d,canvasWidth,canvasHeight,coords);
  // $(popup.document.getElementById('draggableHelper'))[0].top = top3;
}

 var placeSlaveCanvas = function(d,canvasWidth,canvasHeight,coords){

    var top1 = coords.top1,
    left1 = coords.left1,
    top2 = coords.top2,
    left2 = coords.left2,
    top3 = coords.top3,
    left3 = coords.left3,
    top4 = coords.top4,
    left4 = coords.left4;

    $(popup.document.getElementById('cesiumContainer1')).css({
      top: top1,
      left: left1,
      position:'absolute',
      'clip-path': 'polygon(' + (canvasWidth/2-(canvasHeight+d)) + 'px  100%, '
                              + (canvasWidth/2+(canvasHeight+d)) + 'px 100%, '
                              + (canvasWidth+2*d)/2 + 'px 0%, '
                              + (canvasWidth-2*d)/2 + 'px 0%)',
      width: canvasWidth,
      height: canvasHeight});

    $(popup.document.getElementById('cesiumContainer2')).css({
      top: top2,
      left: left2,
      position:'absolute',
      'clip-path': 'polygon(' + (canvasWidth/2-(canvasHeight+d)) + 'px  100%, '
                              + (canvasWidth/2+(canvasHeight+d)) + 'px 100%, '
                              + (canvasWidth+2*d)/2 + 'px 0%, '
                              + (canvasWidth-2*d)/2 + 'px 0%)',
      width: canvasWidth,
      height: canvasHeight});
    $(popup.document.getElementById('cesiumContainer3')).css({
      top: top3,
      left: left3,
      position:'absolute',
      'clip-path': 'polygon(' + (canvasWidth/2-(canvasHeight+d)) + 'px  100%, '
                              + (canvasWidth/2+(canvasHeight+d)) + 'px 100%, '
                              + (canvasWidth+2*d)/2 + 'px 0%, '
                              + (canvasWidth-2*d)/2 + 'px 0%)',
      width: canvasWidth,
      height: canvasHeight});

      $(popup.document.getElementById('cesiumContainer4')).css({
        top: top4,
        left: left4,
        position:'absolute',
        'clip-path': 'polygon(' + (canvasWidth/2-(canvasHeight+d)) + 'px  100%, '
                        + (canvasWidth/2+(canvasHeight+d)) + 'px 100%, '
                        + (canvasWidth+2*d)/2 + 'px 0%, '
                        + (canvasWidth-2*d)/2 + 'px 0%)',
        width: canvasWidth,
        height: canvasHeight});

  }

var init = function() {

  var windowheight = window.innerHeight;;
  var windowwidth = window.innerWidth;
  var d = 0.10*windowheight;
  var centerTop = 0.5*windowheight;
  var centerLeft = 0.5*windowwidth;

  var canvasWidth = windowwidth*0.6; //45°
  var canvasHeight  = 1.5*windowheight/2.0 - d;

  var top1 = centerTop - d-canvasHeight;
  var left1 = centerLeft - canvasWidth/2;

  var top2 = centerTop - canvasHeight/2;
  var left2 = centerLeft + d + canvasHeight/2 - canvasWidth/2;

  var top3 = centerTop + d;
  var left3 = centerLeft - canvasWidth/2;

  var top4 = centerTop - canvasHeight/2;
  var left4 = centerLeft - d - canvasHeight/2 - canvasWidth/2;

  popup = window.open('popup.html', 'secondary', `width=${window.outerWidth},height=${window.outerHeight}`);
  popup.document.write(
`<head>
    <link rel="stylesheet" type="text/css" href="css/main.css">
    <link rel="stylesheet" href="//code.jquery.com/ui/1.12.1/themes/base/jquery-ui.css">
    <script src="../bower_components/jquery/dist/jquery.min.js"></script>
    <script src="https://code.jquery.com/ui/1.12.1/jquery-ui.js"></script>


    <style>
        @import url(../../node_modules/cesium/Build/Cesium/Widgets/widgets.css);
        html, body  {
            width: 100%; height: 100%; margin: 0; padding: 0; overflow: hidden;
        }

    #cesiumContainer1 {
            margin: 0; padding: 0; overflow: hidden;
            transform: scale(1, -1);
    }
    #cesiumContainer2 {
        margin: 0; padding: 0; overflow: hidden;
        transform: rotate(90deg) scale(1, -1);

    }
    #cesiumContainer3 {
        margin: 0; padding: 0; overflow: hidden;
        transform: rotate(180deg) scale(1, -1);

    }
    #cesiumContainer4 {
        margin: 0; padding: 0; overflow: hidden;
        transform: rotate(270deg) scale(1, -1);
    }
    body{

      background-color:#222
    }
    </style>

  </head>
  <body>
    <div id="cesiumContainer1"></div>
    <div id="cesiumContainer2"></div>
    <div id="cesiumContainer3"></div>
    <div id="cesiumContainer4"></div>




  </body>
`);

  $(popup).resize(function(){
    var windowheight = popup.innerHeight;
    var windowwidth = popup.innerWidth;
    if(!popup.d)
      popup.d = 0.10*windowheight;

    resizeCanvas(windowwidth, windowheight, popup.d);
  });

  $("#cesiumContainer0").css({
    top: 0,
    left: 0,
    position:'absolute',
    width: window.innerWidth,
    height: window.innerHeight});



  var coords = {
    top1: top1,
    left1: left1,
    top2: top2,
    left2: left2,
    top3: top3,
    left3: left3,
    top4: top4,
    left4: left4
  }

  placeSlaveCanvas(d,canvasWidth,canvasHeight,coords);

  $( window ).unload(function() {
    popup.close();
  });

  $(popup.document.body).bind('mousewheel', function(e) {
    console.log(e.originalEvent.wheelDelta);
    var windowheight = popup.innerHeight;
    var windowwidth = popup.innerWidth;

    if(e.originalEvent.wheelDelta > 0)
      popup.d += 5;
    else
      popup.d -= 5;

    resizeCanvas(windowwidth, windowheight, popup.d);
  });

  var tsunamiShaders = shadersCode('tsunami');

  var bathymetry = {
    imgURL: 'img/batiWorld.jpg',
    metadataURL: 'img/batiWorld.txt'
  }

  var historicalData;

  var totalFilesToLoad = 3;
  var filesProgress = 0;
  imgPreload = new Image();
  $(imgPreload).attr({
    src: bathymetry.imgURL
  })

  imgPreload.onload = function(){
    var canvas = document.createElement('CANVAS');
    var ctx = canvas.getContext('2d');
    var dataURL;
    canvas.height = this.height;
    canvas.width = this.width;
    ctx.drawImage(this, 0, 0);
    document.body.appendChild(canvas);

    bathymetry.img = canvas;
    console.log('Files loaded', bathymetry)
    if (++filesProgress == totalFilesToLoad) {
      startMVC();
    };
  }


  $.ajax({
    dataType: 'text',
    url: bathymetry.metadataURL,
    async: true,
    success: function (data) {
      console.log('metadaata loaded')
      bathymetry.metadata = data.split('\n');
      if (++filesProgress == totalFilesToLoad) {
        startMVC();
      };
    }
  });

  // var usgsapi;

  $.ajax({
    dataType: "json",
    url: "data/historicalData.json",
    async: false,
    success: function(data) {
      data;
      usgsapi = USGSAPI(data);

      Object.keys(data).forEach(function(val){
        data[val].date = new Date(data[val].time);
      })
      var finished =  usgsapi.makeUSGSQuery();

      $.when(finished).done(function(){
        if (++filesProgress == totalFilesToLoad) {
          startMVC();
        }
      });
    }
  });

  var startMVC = function () {
    var d = 0.5;
    var k = 3;

    var colormapArray = getColormapArray('bwr',k,d);
    var modelParams = {
      shaders: tsunamiShaders,
      rendererSize: {
        width: 1024,
        height: 512
      },
      bathymetry: bathymetry,
      colormap: colormapArray,
      faultParameters:{
        L:  850000.0 ,
        W:  130000.0 ,
        depth:  63341.44 ,
        slip:  17.0 ,
        strike:  7.0 ,
        dip:  20.0 ,
        rake:  105.0 ,
        U3:  0.0 ,
        cn:  -41.0 ,   //centroid N coordinate, e
        ce:  -75.
      }
    }

    // initialize Model
    var rendererCanvas = document.getElementById('container');
    model = TsunamiModel(modelParams, rendererCanvas);
    var initialImage = model.renderScreen();

    // Assign bathymetry values for the epicenter of each

    var dx = model.simulation.uniforms.dx.value/60;
    var dy = model.simulation.uniforms.dy.value/60;
    var xmin = model.simulation.uniforms.xmin.value;
    var xmax = model.simulation.uniforms.xmax.value;
    var ymin = model.simulation.uniforms.ymin.value;
    var ymax = model.simulation.uniforms.ymax.value;
    var zmin = model.simulation.uniforms.zmin.value;
    var zmax = model.simulation.uniforms.zmax.value;

    // default "%" operator is wrong for negative numbers
    // http://stackoverflow.com/questions/4467539/javascript-modulo-not-behaving
    var mod = function(n, m) {
        return ((n % m) + m) % m;
    }


    Object.keys(usgsapi.historicalData).forEach(function(scenario){
      var R_earth = 6378000.0;
      var cn = usgsapi.historicalData[scenario].cn;
      var ce = usgsapi.historicalData[scenario].ce;
      var strike = usgsapi.historicalData[scenario].strike;

      // get pixel of the epicenter
      var i = mod(ce-xmin,xmax-xmin)/dx; //  what if mod(ce,360)>xmax?:
      var j = mod(cn-ymin,ymax-ymin)/dy; //  assume mod(ce,360) \in[xmax,xmin]
      i = Math.floor(i+0.5);
      j = Math.floor(j+0.5);
      usgsapi.historicalData[scenario].gridCoord = [i,j];
      var pixelsData = model.getSimulationPixels(i,j,1,1);
      usgsapi.historicalData[scenario].bathymetry =pixelsData[3]*(zmax-zmin)+zmin;

      // now get % of wet cells in the fault rectangle
      var cn = usgsapi.historicalData[scenario].cn;
      var ce = usgsapi.historicalData[scenario].ce;
      var strike = usgsapi.historicalData[scenario].strike;

      // get pixel of the epicenter
      var i = mod(ce-xmin,xmax-xmin)/dx; //  what if mod(ce,360)>xmax?:
      var j = mod(cn-ymin,ymax-ymin)/dy; //  assume mod(ce,360) \in[xmax,xmin]
      i = Math.floor(i+0.5);
      j = Math.floor(j+0.5);

      if( Math.abs(strike%90)< 45){
        // fault is pointing to the north; is "vertical"
        var L = usgsapi.historicalData[scenario].L;
        var W = usgsapi.historicalData[scenario].W;
      }
      else{
        // fault is "horizontal"
        var L = usgsapi.historicalData[scenario].W;
        var W = usgsapi.historicalData[scenario].L;
      }

      var degree2meters_lon = R_earth*Math.cos(cn*Math.PI/180.0)*Math.PI/180.0;
      var degree2meters_lat = R_earth*Math.PI/180.0;
      var Lpix = parseInt(4*L/(dx*degree2meters_lat));
      var Wpix = parseInt(4*W/(dy*degree2meters_lon));

      var ilower = Math.max(parseInt(i-Lpix/2),0);
      var jlower = Math.max(parseInt(j-Wpix/2),0);

      var pixelsData2 = model.getSimulationPixels(ilower,jlower,Lpix,Wpix);

      var nwet = 0;
      for(var ipix =0; ipix<pixelsData2.length; ipix=ipix+4){
        if(pixelsData2[ipix+3]*(zmax-zmin)+zmin<=0){
          nwet = nwet+1;
        }
      }
      var fwet = nwet/(pixelsData2.length/4);

      usgsapi.historicalData[scenario].wetFraction = fwet;

    });


    // initialize View
    var bbox = model.simulationData.bbox;
    var videoElement = document.getElementById('videoElement');
    var viewParams = {
      containerID0: 'cesiumContainer0',
      initialImage: initialImage,
      bbox: bbox,
      historicalData: usgsapi.historicalData,
      videoElement: videoElement
    };


    view = TsunamiView(viewParams);

    view.viewers = view.viewers.concat(view.makeSlaves(
        popup.document.getElementById('cesiumContainer1'),
        popup.document.getElementById('cesiumContainer2'),
        popup.document.getElementById('cesiumContainer3'),
        popup.document.getElementById('cesiumContainer4'))
      );

    // initialize Controller

    controller = TsunamiController(model, view);

    simular = function(escenario){
      model.setInitialCondition(usgsapi.historicalData[escenario]);
      $('#pin-info').popover('hide');
      var currentPin = view.getCurrentPin();
      currentPin.selected = false;
      controller.flyHome();
    }

    function writeTimeStamp(time){
      var timetext = "";

      var hours = Math.floor(time/60/60),
            minutes = Math.floor((time - (hours * 60 * 60))/60),
            seconds = Math.round(time - (hours * 60 * 60) - (minutes * 60));
        var timetext = timetext.concat(hours + ':' +
                  ((minutes < 10) ? '0' + minutes : minutes) + ':' +
                  ((seconds < 10) ? '0' + seconds : seconds));
        var hoursText = ((hours < 10) ? '0' + hours : hours)
        var minutesText = ((minutes < 10) ? '0' + minutes : minutes)
      var hoursElement = document.getElementById("current-time-hours");
      var minutesElement = document.getElementById("current-time-minutes");
      hoursElement.textContent = hoursText;
      minutesElement.textContent = minutesText;
      // console.log(hoursText, minutesText)
    }

    function setSliderTime(time){
      $('#timeline-slider').slider({
          id: 'timeline-slider',
          value : time,
          min: 0,
          max: 20*3600,
          tooltip: 'hide'
      });
    }

    function setTime(time){
      writeTimeStamp(time);
      setSliderTime(time);
    }
    $( "#reset-view-button" ).click(function() {
      controller.flyHome();
    });


    $( "#step-backward-button" ).click(function() {
      controller.reset();
      controller.resetSpeed();
      $("#speed-multiplier").text(controller.getSpeed()/10);
    });
    $( "#backward-button" ).click(function() {
      controller.decreaseSpeed();
      $("#speed-multiplier").text(controller.getSpeed()/10);
    });
    $( "#play-button" ).click(function() {
      $(this).toggleClass('hidden');
      $("#pause-button").toggleClass('hidden');
      controller.play();
    });
    $( "#pause-button" ).click(function() {
      $("#play-button").toggleClass('hidden');
      $(this).toggleClass('hidden');
      controller.pause();
    });

    $( "#forward-button" ).click(function() {
      controller.increaseSpeed();
      $("#speed-multiplier").text(controller.getSpeed()/10);
    });


    canvas = model.getCanvas();
    var video = document.getElementById('videoElement');
    var stream = canvas.captureStream(15);
    video.srcObject = stream;
    var options = {mimeType: 'video/webm'};

    mediaRecorder = new MediaRecorder(stream, options);
    mediaRecorder.ondataavailable = handleDataAvailable;


    function handleDataAvailable(event) {
      if (event.data && event.data.size > 0) {
        recordedBlobs.push(event.data);
      }
    }
    recordedBlobs = [];

    play = function() {
      var video = document.getElementById('videoPlayback');
      var superBuffer = new Blob(recordedBlobs, {type: 'video/webm'});
      video.src = window.URL.createObjectURL(superBuffer);
      video.controls = true;
    }
    var processFrame = function(){
      var time = controller.tick();
      if(!controller.isPaused()){
        setTime(time);
        if(mediaRecorder.state != 'recording')
          mediaRecorder.start(100);
      }
      requestAnimationFrame(processFrame);
    }

    var k = 4;
    var d = 0;
    var colormapLabels = [
      [true, 0/16],
      [false, 1/16],
      [true, 2/16],
      [false, 3/16],
      [true, 4/16],
      [false, 5/16],
      [true, 6/16],
      [false, 7/16],
      [true, 8/16],
      [false, 9/16],
      [true, 10/16],
      [false, 11/16],
      [true, 12/16],
      [false, 13/16],
      [true, 14/16],
      [true, 1]
    ];
    // var colormapLabels = [
    //   [true, 0/16],
    //   [false, 1.999/16],
    //   [true, 2.0/16],
    //   [false, 3.999/16],
    //   [true, 4.0/16],
    //   [true, 6/16],
    //   [false, 6.01/16],
    //   [true, 8/16],
    //   [true, 8.01/16],
    //   [true, 10/16],
    //   [false, 10.01/16],
    //   [true, 12/16],
    //   [false, 12.01/16],
    //   [true, 14/16],
    //   [false, 14.01/16],
    //   [true, 1]
    // ];
    view.setColormap(colormapArray,
                    colormapLabels,
                    document.getElementById('cbwater'));

    document.getElementsByClassName('cesium-widget-credits')[0].remove()
    processFrame();
    controller.flyHome();
  }

}
