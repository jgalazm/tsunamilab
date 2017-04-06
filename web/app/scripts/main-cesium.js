// function that initializes the cesium display
$('#init_modal').modal();

var init = function() {

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

  var usgsapi;

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
    var model = TsunamiModel(modelParams, rendererCanvas);

    // initialize View

    var initialImage = model.renderScreen();

    var bbox = model.simulationData.bbox;
    var videoElement = document.getElementById('videoElement');
    var viewParams = {
      containerID: 'cesiumContainer',
      initialImage: initialImage,
      bbox: bbox,
      historicalData: usgsapi.historicalData,
      videoElement: videoElement
    };

    var view = TsunamiView(viewParams);


    // initialize Controller

    var controller = TsunamiController(model, view);

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
    //   [false, 2.0/16],
    //   [false, 3.999/16],
    //   [false, 4.0/16],
    //   [false, 6/16],
    //   [false, 6.01/16],
    //   [false, 8/16],
    //   [true, 8.01/16],
    //   [false, 10/16],
    //   [false, 10.01/16],
    //   [false, 12/16],
    //   [false, 12.01/16],
    //   [false, 14/16],
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
