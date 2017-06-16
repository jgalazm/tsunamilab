var TsunamiView = function(params){
  var containerID0 = params.containerID0;
  var containerID1 = params.containerID1;
  var containerID2 = params.containerID2;
  var containerID3 = params.containerID3;
  var containerID4 = params.containerID4;
  var initialImage = params.initialImage; //output de model.renderScreen()
  var bbox = params.bbox;
  var zmin = params.zmin;
  var zmax = params.zmax;
  var historicalData = params.historicalData;
  var videoElement = params.videoElement;
  var currentPin = undefined;

  var createViewer = function(canvasID){
    Cesium.BingMapsApi.defaultKey = 'AhuWKTWDw_kUhGKOyx9PgQlV3fdXfFt8byGqQrLVNCMKc0Bot9LS7UvBW7VW4-Ym';
    var viewer = new Cesium.Viewer(canvasID, {
      // sceneMode: Cesium.SceneMode.SCENE2D,
      imageryProvider : new Cesium.createTileMapServiceImageryProvider({
          url : '/node_modules/cesium/Build/Cesium/Assets/Textures/NaturalEarthII'
      }),
      baseLayerPicker : false,
      animation: false,
      baseLayerPicker: true,
      fullscreenButton: false,
      scene3DOnly: true,
      geocoder: false,
      homeButton: false,
      infoBox: false,
      sceneModePicker: false,
      selectionIndicator: false,
      timeline: false,
      shadows: true,
      skyAtmosphere: false,
      navigationHelpButton: false,
      navigationInstructionsInitiallyVisible: false
    });
    viewer.scene.globe.enableLighting = true;
    viewer.scene.debugShowFramesPerSecond = true;
    viewer.scene.screenSpaceCameraController.inertiaSpin = 0;
    viewer.scene.screenSpaceCameraController.inertiaTranslate = 0;
    viewer.scene.screenSpaceCameraController.inertiaZoom = 0;
    // viewer.scene.imageryLayers.removeAll(); // optional
    // viewer.imageryLayers.addImageryProvider(new Cesium.BingMapsImageryProvider({
    //   url : 'https://dev.virtualearth.net',
    //   key : 'AhuWKTWDw_kUhGKOyx9PgQlV3fdXfFt8byGqQrLVNCMKc0Bot9LS7UvBW7VW4-Ym',
    //   culture: 'es-MX',
    //   mapStyle : Cesium.BingMapsStyle.AERIAL_WITH_LABELS
    // }));
    viewer.imageryLayers.addImageryProvider(new Cesium.createTileMapServiceImageryProvider({
        url : '/node_modules/cesium/Build/Cesium/Assets/Textures/NaturalEarthII'
    }));
    viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

    // viewer.scene.primitives.add(new Cesium.DebugModelMatrixPrimitive({
    //   modelMatrix : viewer.scene.primitives._primitives[0].modelMatrix,  // primitive to debug
    //   length : 100000000000000.0,
    //   width : 10.0
    // }));
    viewer.terrainProvider = new Cesium.CesiumTerrainProvider({
                url : 'https://assets.agi.com/stk-terrain/v1/tilesets/world/tiles',
                requestWaterMask : true
            });
    viewer.scene.globe.depthTestAgainstTerrain = true

    var videoLayer = viewer.entities.add({
      rectangle : {
        coordinates : Cesium.Rectangle.fromDegrees(bbox[0][0],Math.max(bbox[0][1],-89.99999),
        bbox[1][0],Math.min(bbox[1][1],89.99999)),
        height: 0,
        material : videoElement,
        asynchronous: true
      }
    });
    videoLayer.rectangle.material.transparent = true;

    return viewer;
  }

  viewer = createViewer(containerID0);
  viewer1 = createViewer(containerID1);
  viewer2 = createViewer(containerID2);
  viewer3 = createViewer(containerID3);
  viewer4 = createViewer(containerID4);

  var setSlaves = function(masterCamera, slaveCamera, slaveViewer, offset){
    console.log(masterCamera);
    slaveViewer.scene.preRender.addEventListener(function(){
      Cesium.Cartesian3.clone(masterCamera.position, slaveCamera.position);
      Cesium.Cartesian3.clone(masterCamera.direction, slaveCamera.direction);
      Cesium.Cartesian3.clone(masterCamera.up, slaveCamera.up);
      Cesium.Cartesian3.clone(masterCamera.write, slaveCamera.write);
      slaveCamera.lookAtTransform(masterCamera.transform);
      var height = masterCamera.positionCartographic.height;
      var offsetFactor1 = Math.min(1, Math.pow(height/50000000, 1.5));
      var offsetFactor2 = Math.min(1, Math.pow(height/10000000, 0.5));
      // console.log(offsetFactor1, offsetFactor2);
      // console.log('offsetFactor1', slaveCamera.up);
    //   if(offset == 180)
    //     offsetFactor1 = 1;
    //   slaveCamera.rotate(slaveCamera.up, offsetFactor1*offset/180*Math.PI);
    //   if(offset != 180)
    //     slaveCamera.setView({
    //         orientation: {
    //             heading : Cesium.Math.toRadians(90.0), // east, default value is 0.0 (north)
    //             pitch : Cesium.Math.toRadians(-90+(1-offsetFactor2)*offset/1.3),    // default value (looking down)
    //             roll : Cesium.Math.toRadians(-90)                           // default value
    //         }
    //     });
    });
  }

  setSlaves(viewer.camera, viewer1.camera, viewer1, 0);
  setSlaves(viewer.camera, viewer2.camera, viewer2, 0);//;-90);
  setSlaves(viewer.camera, viewer3.camera, viewer3, 0);//;180);
  setSlaves(viewer.camera, viewer4.camera, viewer4, 0);//;90);

  var previousTime = Date.now();

  viewer.scene.postRender.addEventListener(function (scene, time){
      var spinRate = 0.1;
      var currentTime = Date.now();
      var delta = -( currentTime - previousTime ) / 1000 *0.5;
      previousTime = currentTime;
      viewer.scene.camera.rotate(Cesium.Cartesian3.UNIT_Z, -spinRate * delta);
  });

  var flyTo = function (viewer,lat, lng, scale) {
    var scale = scale ? scale : 8;
    viewer.camera.flyTo({
      destination: Cesium.Rectangle.fromDegrees((lng-5) - 3 * scale, (lat-5) - 3 * scale,
                                                (lng+5) + 3 * scale, (lat+5) + 3 * scale)
    });
  }

  // flyTo(viewer2,0,90,10);
  // flyTo(viewer,0,0,10);

  var setColormap = function(cmap, labelsMap, canvas){
    var cbwater  = canvas;

    //setup colorbar
    if(typeof cmap == "string"){
      var watermap = getColormapArray(cmap,1,0);
    }else{
      var watermap = cmap;
    }
    cbwater.width = Math.min(window.innerWidth/4,300);
    cbwater.height = 50;

    colorbar(watermap,labelsMap,cbwater);
  }

  var addCesiumPin = function(lat=-45,lon=-75.59777, usgsKey=""){
    var pin = viewer.entities.add({
      position : Cesium.Cartesian3.fromDegrees(lon, lat,1000),
      billboard : {
        width: 48,
        height: 51,
        image : 'img/pin2.svg',//,
        scaleByDistance :  new Cesium.NearFarScalar(1.5e1, 1.5, 4.0e7, 0.0)
      }
    });
    pin.isPin = true;
    pin.usgsKey = usgsKey;
  }

  var addAllPins = function(){
    for(var k = 0;k < Object.keys(historicalData).length;k++){

      var key = Object.keys(historicalData)[k];
      var scenario = historicalData[key];
      var wetFraction = scenario.wetFraction;

      if (scenario.cn != undefined && scenario.ce!=undefined){
        var lat = scenario.cn;
        var lon = scenario.ce;
      }
      if (wetFraction>0.01){
        addCesiumPin(lat,lon,key);
      }
    }
  }

  var createPopover = function(){
    $('[data-toggle="popover"]').popover({container:'body'});

    var popover =  document.createElement("div");
    popover.id = "pin-info";
    document.body.appendChild(popover);

    $('#pin-info').css({ position:'absolute' });

    $('#pin-info').popover({
      html: true,
      trigger:'manual',
      placement:'auto top',
      animation:false});
  }

  var setPinContent = function(entity){
    // show info for selected scenario
    var escenario = entity.usgsKey;
    var magnitud = historicalData[entity.usgsKey].Mw;
    var fecha = historicalData[entity.usgsKey].date;
    var profundidad  = historicalData[entity.usgsKey].depth/1000;
    var batimetria = historicalData[entity.usgsKey].bathymetry;

    // fecha = fecha.toLocaleDateString({weekday: 'long'});
    var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    fecha = fecha.toLocaleDateString('es-CL', options);
    fecha = fecha.charAt(0).toUpperCase() + fecha.slice(1);

    var heridos = historicalData[entity.usgsKey].injuries;
    var muertos = historicalData[entity.usgsKey].deaths;
    var dolares = historicalData[entity.usgsKey]["mill usd damage"];
    var url = historicalData[entity.usgsKey].noaaURL;


    // format strings:
    //from http://stackoverflow.com/questions/149055/how-can-i-format-numbers-as-money-in-javascript
    // heridos = parseInt(heridos).toString().replace(/(\d)(?=(\d{3})+\.)/g, '$1,');



    if(heridos==undefined || heridos == "Null"){
      heridos = "No hay datos disponibles"
    }
    else {
      heridos = heridos.replace(/./g, function(c, i, a) {
          return i && c !== "." && ((a.length - i) % 3 === 0) ? '.' + c : c;
      });
    }

    if(muertos==undefined || muertos == "Null"){
      muertos = "No hay datos disponibles"
    }
    else{
      muertos = muertos.replace(/./g, function(c, i, a) {
          return i && c !== "." && ((a.length - i) % 3 === 0) ? '.' + c : c;
      });
    }

    if(dolares==undefined || dolares == "Null"){
      dolares = "No hay datos disponibles"
    }
    else{
      dolares = dolares.replace(/./g, function(c, i, a) {
          return i && c !== "." && ((a.length - i) % 3 === 0) ? '.' + c : c;
      });
      dolares = '$'+dolares
    }

    // var casas = historicalData[entity.]

    var pinContent =
    `
    <div class="row">
      <div class="col-xs-5"><strong>Fecha</strong></div>
      <div class="col-xs-7">${fecha}</div>
    </div>
    <div class="row">
      <div class="col-xs-5"><strong>Magnitud</strong></div>
      <div class="col-xs-7">${magnitud} Mw </div>
    </div>
    <div class="row">
      <div class="col-xs-5"><strong>Profundidad</strong></div>
      <div class="col-xs-7">${profundidad} km </div>
    </div>
    <div class="row">
      <div class="col-xs-5"><strong>Profundidad del mar</strong></div>
      <div class="col-xs-7">${batimetria} mm </div>
    </div>

    <div class="row">
      <div class="col-xs-5"><strong>N° de heridos</strong></div>
      <div class="col-xs-7">${heridos}</div>
    </div>
    <div class="row">
      <div class="col-xs-5"><strong>N° de fallecidos</strong></div>
      <div class="col-xs-7">${muertos}</div>
    </div>
    <div class="row">
      <div class="col-xs-5"><strong>Pérdidas en USD</strong></div>
      <div class="col-xs-7">${dolares}</div>
    </div>
    `

    if(url!=undefined){
      pinContent+=
      `
      <div class="row">
        <div class="col-xs-12"><a href="${url}">Más información<a></div>
      </div>
      `
    }
    pinContent+=
    `
    <div class="row text-center">
      <div class="col-xs-12">
        <div id="popover-btn-simular" class="btn btn-info btn-pin-info"
         onclick="simular('${escenario}')"> Simular </div>
      </div>
    </div>
    `

    $('#pin-info').data('bs.popover').options.animation = true;
    $('#pin-info').attr('data-original-title', '<b>'+entity.usgsKey+'</b>' +`
    <button type="button" id="close" class="close" onclick="$(&quot;#pin-info&quot;).popover(&quot;hide&quot;);">&times;</button>
    `);//http://stackoverflow.com/questions/13413057/how-to-insert-close-button-in-popover-for-bootstrap
    $('#pin-info').attr('data-content',pinContent);

    $('#pin-info').popover('show');
    $('#pin-info').data('bs.popover').options.animation = false;

    // $("#popover-btn-simular").click(function(){
    //   console.log('asdfasdfasdf');
    // });
  }

  var addPinsHandlers = function(){
    // If the mouse is over the billboard, change its scale and color

    var scene = viewer.scene;
    var handler = new Cesium.ScreenSpaceEventHandler(scene.canvas);


    handler.setInputAction(function(movement) { //left click event
      var pickedObject = scene.pick(movement.position);

      if(pickedObject && pickedObject.primitive.id){ //check an object is picked

        var entity = viewer.entities.getById(pickedObject.primitive.id._id);

        if(entity.isPin){ // check the picked object is a pin

          entity.billboard.image = 'img/pin2-selected.svg';

          //change pin icon if and only if clicked on a different pin
          if (currentPin != undefined && currentPin.usgsKey != entity.usgsKey){
            currentPin.billboard.image = 'img/pin2.svg';
          }


          if(currentPin == undefined || !currentPin.dragged){
            currentPin = entity;
          }

          $('#pin-info').css({
            top: movement.position.y,
            left: movement.position.x
          });

          setPinContent(currentPin);

          // deactivate animation while popover is being shown
          // so it won't "blink" when the camera moves
          // $('#pin-info').data('bs.popover').options.animation = false;
          currentPin.selected = true;
        }
        else{

          $('#pin-info').popover('hide');

          if(currentPin)  currentPin.selected = false;

          $('#pin-info').data('bs.popover').options.animation = true;

        }
      }
      else{

        $('#pin-info').popover('hide');

        if(currentPin) currentPin.selected = false;

        $('#pin-info').data('bs.popover').options.animation = true;
      }

    }, Cesium.ScreenSpaceEventType.LEFT_CLICK );

    handler.setInputAction(function(movement){ //left down
      if(currentPin && currentPin.selected){
        currentPin.dragged = true;
      }
    }, Cesium.ScreenSpaceEventType.LEFT_DOWN);

    handler.setInputAction(function(movement){ //left up
      if(currentPin && currentPin.selected){
        currentPin.dragged = false;
      }
    }, Cesium.ScreenSpaceEventType.LEFT_UP);

    var trackPin = function(movement){ //move and hide pin when necessary
      var visible = $('#pin-info').data()['bs.popover'].tip().hasClass('in');
      if(currentPin && currentPin.selected && currentPin.dragged && visible){

        //move div
        var coord = Cesium.SceneTransforms.wgs84ToWindowCoordinates(viewer.scene, currentPin.position._value) ;
        $('#pin-info').css({top: coord.y, left: coord.x });

        //show pin if on top of globe
        var pickedObject = scene.pick(coord);

        if(pickedObject && pickedObject.primitive && pickedObject.primitive.id){
          var pickedEntity = viewer.entities.getById(pickedObject.primitive.id._id);

          if(pickedEntity.usgsKey == currentPin.usgsKey){
            $('#pin-info').popover('show');
          }
          else{
            $('#pin-info').popover('hide');
          }
        }
        else{
          $('#pin-info').popover('hide');
        }

      }
    }

    handler.setInputAction(trackPin, Cesium.ScreenSpaceEventType.MOUSE_MOVE)

    viewer.camera.moveEnd.addEventListener(function(){
      trackPin();
    });

    handler.setInputAction(function(movement){
      if(currentPin && currentPin.selected){
        console.log(movement);
        var coord = Cesium.SceneTransforms.wgs84ToWindowCoordinates(viewer.scene, currentPin.position._value) ;

        $('#pin-info').css({top: coord.y, left: coord.x })
        $('#pin-info').popover('show');

      }
    }, Cesium.ScreenSpaceEventType.WHEEL)
  }

  var getCurrentPin = function(){
    return currentPin;
  }

    createPopover();

    // addAllPins();

    addPinsHandlers();


    return {
      viewers : [viewer,viewer1,viewer2,viewer3,viewer4],
      viewer: viewer,
      setColormap: setColormap,
      getCurrentPin: getCurrentPin
    };
  }
