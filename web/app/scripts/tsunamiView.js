var TsunamiView = function(params){
  var containerID = params.containerID;
  var initialImage = params.initialImage; //output de model.renderScreen()
  var bbox = params.bbox;
  var zmin = params.zmin;
  var zmax = params.zmax;
  var historicalData = params.historicalData;


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
  viewer.scene.imageryLayers.removeAll(); // optional
  viewer.imageryLayers.addImageryProvider(new Cesium.BingMapsImageryProvider({
    url : 'https://dev.virtualearth.net',
    key : 'AhuWKTWDw_kUhGKOyx9PgQlV3fdXfFt8byGqQrLVNCMKc0Bot9LS7UvBW7VW4-Ym',
    culture: 'es-MX',
    mapStyle : Cesium.BingMapsStyle.AERIAL_WITH_LABELS
  }));

  var rectangle = viewer.scene.primitives.add(new Cesium.Primitive({
    geometryInstances: new Cesium.GeometryInstance({
      geometry: new Cesium.RectangleGeometry({
        rectangle: Cesium.Rectangle.fromDegrees(bbox[0][0],Math.max(bbox[0][1],-89.99999),
        bbox[1][0],Math.min(bbox[1][1],89.99999)),
        vertexFormat: Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT
      })
    }),
    appearance: new Cesium.EllipsoidSurfaceAppearance({
      aboveGround: false,
      material: new Cesium.Material({
        fabric : {
          uniforms: {image: initialImage},
          source:
          `
          czm_material czm_getMaterial(czm_materialInput materialInput)
          {
            vec2 vUv = materialInput.st;
            vec4 color =  texture2D(image, vUv);

            // bump mapping
            vec2 st = materialInput.st;
            float repeat = 1.0;
            float strength = 1.0;

            vec2 centerPixel = fract(repeat * st);
            float centerBump = texture2D(image, centerPixel).r;

            float imageWidth = float(imageDimensions.x);
            vec2 rightPixel = fract(repeat * (st + vec2(1.0 / imageWidth, 0.0)));
            float rightBump = texture2D(image, rightPixel).r;

            float imageHeight = float(imageDimensions.y);
            vec2 leftPixel = fract(repeat * (st + vec2(0.0, 1.0 / imageHeight)));
            float topBump = texture2D(image, leftPixel).r;

            vec3 normalTangentSpace = normalize(vec3(centerBump - rightBump,
              centerBump - topBump, clamp(1.0 - strength, 0.1, 1.0)));

            vec3 normalEC = materialInput.tangentToEyeMatrix * normalTangentSpace;



            return czm_material(color.rgb, 1.0, 10000.0, normalEC, vec3(0.0), color.a);
          }
          `
          }
      })
    })
  }));

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
              height: 48,
              image : 'img/pin.svg',//,
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

      var addPinsHandlers = function(){
        // If the mouse is over the billboard, change its scale and color

        var scene = viewer.scene;
        var handler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
        var currentPin = undefined;

        handler.setInputAction(function(movement) {

          var pickedObject = scene.pick(movement.position);


          if(pickedObject && pickedObject.primitive.id){ //check an object is picked

            var entity = viewer.entities.getById(pickedObject.primitive.id._id);

            if(entity.isPin){ // check the picked object is a pin

              entity.billboard.image = 'img/pin-selected.svg';

              //change pin icon if and only if clicked on a different pin
              if (currentPin != undefined && currentPin.usgsKey != entity.usgsKey){
                currentPin.billboard.image = 'img/pin.svg';
              }

              currentPin = entity;

              $('#pin-info').css({
                top: movement.position.y,
                left: movement.position.x
              });

              // show info for selected scenario
              $('#pin-info').data('bs.popover').options.animation = true;
              $('#pin-info').attr('data-original-title', '<b>'+entity.usgsKey+'</b>');
              $('#pin-info').attr('data-content',

              ` <div class="row">
                  <div class="col-xs-5"><strong>Magnitud</strong></div>
                  <div class="col-xs-7">9.0</div>
                </div>
                <div class="row">
                  <div class="col-xs-5"><strong>Fecha</strong></div>
                  <div class="col-xs-7">6 de febrero 2017</div>
                </div>
                <div class="row">
                  <div class="col-xs-5"><strong>N° de heridos</strong></div>
                  <div class="col-xs-7">6 de febrero 2017</div>
                </div>
                <div class="row">
                  <div class="col-xs-5"><strong>N° de muertos</strong></div>
                  <div class="col-xs-7">6 de febrero 2017</div>
                </div>
                <div class="row">
                  <div class="col-xs-5"><strong>Pérdidas en USD</strong></div>
                  <div class="col-xs-7">6 de febrero 2017</div>
                </div>
                <div class="row text-center">
                  <div class="col-xs-12">
                    <div class="btn btn-info btn-pin-info"> Simular</div>
                  </div>
                </div>
               </div>`);

              $('#pin-info').popover('show');
              $('#pin-info').data('bs.popover').options.animation = false;

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

        handler.setInputAction(function(movement){
          if(currentPin && currentPin.selected){
            currentPin.dragged = true;
          }
        }, Cesium.ScreenSpaceEventType.LEFT_DOWN);

        handler.setInputAction(function(movement){
          if(currentPin && currentPin.selected){
            currentPin.dragged = false;
          }
        }, Cesium.ScreenSpaceEventType.LEFT_UP);

        handler.setInputAction(function(movement){
          if(currentPin && currentPin.selected && currentPin.dragged){

            //move div
            var coord = Cesium.SceneTransforms.wgs84ToWindowCoordinates(viewer.scene, currentPin.position._value) ;
            $('#pin-info').css({top: coord.y, left: coord.x })

            //show pin if on top of globe
            var pickedObject = scene.pick(coord);

            if(pickedObject && pickedObject.primitive && pickedObject.primitive.id){
              var pickedEntity = viewer.entities.getById(pickedObject.primitive.id._id);

              // var pickedEntity = scene.pick(coord):
              console.log(pickedEntity.usgsKey);
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
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)

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
          setColormap: setColormap,
          rectangle: rectangle
        };
      }
