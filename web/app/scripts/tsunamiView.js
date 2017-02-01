var TsunamiView = function(params){
  var containerID = params.containerID;
  var initialImage = params.initialImage; //output de model.renderScreen()
  var bbox = params.bbox;
  var zmin = params.zmin;
  var zmax = params.zmax;

  var viewer = new Cesium.Viewer(containerID, {
    imageryProvider: new Cesium.ArcGisMapServerImageryProvider({
      url: 'http://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer'
    }),
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

  var csscene = viewer.scene;

  var rectangle = csscene.primitives.add(new Cesium.Primitive({
    geometryInstances: new Cesium.GeometryInstance({
      geometry: new Cesium.RectangleGeometry({
        rectangle: Cesium.Rectangle.fromDegrees(bbox[0][0],Math.max(bbox[0][1],-89),
        bbox[1][0],Math.min(bbox[1][1],89)),
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

            vec3 normalTangentSpace = normalize(vec3(centerBump - rightBump, centerBump - topBump, clamp(1.0 - strength, 0.1, 1.0)));
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
      var cmap_water = cmap;
      var watermap = getColormapArray(cmap,1,0);
    }else{
      var watermap = cmap; 
    }
    cbwater.width = Math.min(window.innerWidth/4,300);
    cbwater.height = 50;	
    
    colorbar(watermap,labelsMap,cbwater);
  }

  return {
    viewer: viewer,
    setColormap: setColormap,
    rectangle: rectangle
  };
}
