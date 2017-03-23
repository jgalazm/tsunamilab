var TsunamiView = function(params){
  var containerID = params.containerID;
  var initialImage = params.initialImage; //output de model.renderScreen()
  var bbox = params.bbox;
  var zmin = params.zmin;
  var zmax = params.zmax;
  var historicalData = params.historicalData;
  var videoElement = params.videoElement;


  Cesium.BingMapsApi.defaultKey = 'AhuWKTWDw_kUhGKOyx9PgQlV3fdXfFt8byGqQrLVNCMKc0Bot9LS7UvBW7VW4-Ym';
  var viewer = new Cesium.Viewer(containerID, {
    // sceneMode: Cesium.SceneMode.SCENE2D,
    animation: false,
    baseLayerPicker: false,
    fullscreenButton: false,
    geocoder: true,
    homeButton: false,
    infoBox: false,
    sceneModePicker: false,
    selectionIndicator: false,
    timeline: false,
    navigationHelpButton: false,
    navigationInstructionsInitiallyVisible: false
  });
  viewer.scene.debugShowFramesPerSecond = true;
  viewer.scene.screenSpaceCameraController.inertiaSpin = 0;
  viewer.scene.screenSpaceCameraController.inertiaTranslate = 0;
  viewer.scene.screenSpaceCameraController.inertiaZoom = 0;
  viewer.scene.imageryLayers.removeAll(); // optional
  viewer.imageryLayers.addImageryProvider(new Cesium.BingMapsImageryProvider({
    url : 'https://dev.virtualearth.net',
    key : 'AhuWKTWDw_kUhGKOyx9PgQlV3fdXfFt8byGqQrLVNCMKc0Bot9LS7UvBW7VW4-Ym',
    culture: 'es-MX',
    mapStyle : Cesium.BingMapsStyle.AERIAL_WITH_LABELS
  }));

  var videoLayer = viewer.entities.add({
    rectangle : {
      coordinates : Cesium.Rectangle.fromDegrees(bbox[0][0],Math.max(bbox[0][1],-89.99999),
      bbox[1][0],Math.min(bbox[1][1],89.99999)),
      material : videoElement,
      asynchronous: true
    }
  });
  videoLayer.rectangle.material.transparent = true;

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
      position : Cesium.Cartesian3.fromDegrees(lon, lat,100000),
      billboard : {
        width: 48,
        height: 51,
        image : 'img/pin2.svg',//,
        scaleByDistance :  new Cesium.NearFarScalar(1.5e1, 1.5, 4.0e7, 0.0)
        // translucencyByDistance : new Cesium.NearFarScalar(1.5e2, 2.0, 1.5e7, 0.5)
      }
    });
    pin.isPin = true;
    pin.usgsKey = usgsKey;
  }

  var addAllPins = function(){
    for(var k = 0;k < Object.keys(historicalData).length;k++){

      var key = Object.keys(historicalData)[k];
      var scenario = historicalData[key];

      if (scenario.cn != undefined && scenario.ce!=undefined){
        var lat = scenario.cn;
        var lon = scenario.ce;
      }

      addCesiumPin(lat,lon,key);
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
    // fecha = fecha.toLocaleDateString({weekday: 'long'});
    var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    fecha = fecha.toLocaleDateString('es-CL', options);
    fecha = fecha.charAt(0).toUpperCase() + fecha.slice(1);

    var heridos = historicalData[entity.usgsKey].injuries;
    var muertos = historicalData[entity.usgsKey].deaths;
    var dolares = historicalData[entity.usgsKey]["mill usd damage"];
    var url = historicalData[entity.usgsKey].noaaURL;

    if(heridos==undefined || heridos == "Null"){
      heridos = "No hay datos disponibles"
    }

    if(muertos==undefined || muertos == "Null"){
      muertos = "No hay datos disponibles"
    }

    if(dolares==undefined || dolares == "Null"){
      dolares = "No hay datos disponibles"
    }

    // var casas = historicalData[entity.]

    var pinContent =
    `
    <div class="row">
      <div class="col-xs-5"><strong>Magnitud</strong></div>
      <div class="col-xs-7">${magnitud} Mw </div>
    </div>
    <div class="row">
      <div class="col-xs-5"><strong>Profundidad</strong></div>
      <div class="col-xs-7">${profundidad} km </div>
    </div>
    <div class="row">
      <div class="col-xs-5"><strong>Fecha</strong></div>
      <div class="col-xs-7">${fecha}</div>
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
    $('#pin-info').attr('data-original-title', '<b>'+entity.usgsKey+'</b>');
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
    var currentPin = undefined;

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

          currentPin = entity;

          $('#pin-info').css({
            top: movement.position.y,
            left: movement.position.x
          });

          setPinContent(entity);

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
      if(currentPin && currentPin.selected && currentPin.dragged){

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


    createPopover();

    addAllPins();

    addPinsHandlers();


    return {
      viewer: viewer,
      setColormap: setColormap
    };
  }
