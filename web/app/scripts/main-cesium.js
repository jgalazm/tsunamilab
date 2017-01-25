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

      var finished =  usgsapi.makeUSGSQuery();

      $.when(finished).done(function(){
        if (++filesProgress == totalFilesToLoad) {
          startMVC();
        }
      });
    }
  });

  var startMVC = function () {
    var d = 0;
    var k = 1;

    modelParams = {
      shaders: tsunamiShaders,
      rendererSize: {
        width: 1024,
        height: 512
      },
      bathymetry: bathymetry,
      colormap: [ new THREE.Vector4(0, 0, 0.4, (-1.0-d)*k),
        new THREE.Vector4(1.0, 1.0, 1.0, (0.0-d)*k),
        new THREE.Vector4(1.0, 0, 0.0, (1.0-d)*k),
        new THREE.Vector4(1.0, 0, 0.0, (1.0-d)*k),
        new THREE.Vector4(1.0, 0, 0.0, (1.0-d)*k),
        new THREE.Vector4(1.0, 0, 0.0, (1.0-d)*k),
        new THREE.Vector4(1.0, 0, 0.0, (1.0-d)*k),
        new THREE.Vector4(1.0, 0, 0.0, (1.0-d)*k),
        new THREE.Vector4(1.0, 0, 0.0, (1.0-d)*k),
        new THREE.Vector4(1.0, 0, 0.0, (1.0-d)*k),
        new THREE.Vector4(1.0, 0, 0.0, (1.0-d)*k),
        new THREE.Vector4(1.0, 0, 0.0, (1.01-d)*k),
        new THREE.Vector4(1.0, 0, 0.0, (1.0-d)*k),
        new THREE.Vector4(1.0, 0, 0.0, (1.0-d)*k),
        new THREE.Vector4(1.0, 0, 0.0, (1.0-d)*k),
        new THREE.Vector4(1.0, 0, 0.0, (1.0-d)*k)]
      }

      // initialize Model

      var model = TsunamiModel(modelParams);

      // initialize View

      var initialImage = model.renderScreen();

      var bbox = model.simulationData.bbox;

      var viewParams = {
        containerID: 'cesiumContainer',
        initialImage: initialImage,
        bbox: bbox
      };

      view = TsunamiView(viewParams);

      // initialize Controller

      var controllerParams = {
        historicalData: usgsapi.historicalData
      }

      var controller = TsunamiController(model, view, controllerParams);

      // var historicalData;


      // initialize Controller

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

      var controller = TsunamiController(model, view);
      // controller.tick();
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

      var processFrame = function(){
        var time = controller.tick();
        setTime(time)
        requestAnimationFrame(processFrame);
      }
      processFrame();
      document.getElementsByClassName('cesium-widget-credits')[0].remove()


    }

  }
