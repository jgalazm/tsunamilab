// function that initializes the cesium display
$('#init_modal').modal();

var init = function() {

  var tsunamiShaders = shadersCode('tsunami');

  var bathymetry = {
    imgURL: 'img/batiWorld.jpg',
    metadataURL: 'img/batiWorld.txt'
  }

  var totalFilesToLoad = 2;
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
    if (++filesProgress == totalFilesToLoad) {
      console.log('Files loaded', bathymetry)
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
        console.log('Files loaded', bathymetry)
        startMVC();
      };
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

      var view = TsunamiView(viewParams);

      document.getElementsByClassName('cesium-widget-credits')[0].remove()
    }

  }
