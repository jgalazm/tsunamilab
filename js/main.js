var container;

// function that initializes the cesium display

function init() {

    viewer = new Cesium.Viewer('cesiumContainer', {
        imageryProvider: new Cesium.ArcGisMapServerImageryProvider({
            url: 'http://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer'
        }),
        baseLayerPicker: false,
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

    var a = 8;
    viewer.camera.flyTo({
      destination: Cesium.Rectangle.fromDegrees(-80-3*a,-45-3*a,-70+3*a,-35+3*a)
    });

document.getElementsByClassName('cesium-widget-credits')[0].remove()
    // capa con el mapa
    var layers = viewer.scene.imageryLayers;

    var imagen = layers.addImageryProvider(new Cesium.SingleTileImageryProvider({
        url: 'img.png',
        rectangle: Cesium.Rectangle.fromDegrees(0, 0, 15, 15)
    }));

    csscene = viewer.scene;

    c1 = document.getElementById('container');

    shadersCode = shadersCode('tsunami');

    var bathymetry = {
        imgURL: "img/batiWorld.jpg",
        metadataURL: "img/batiWorld.txt"
    }



    var totalFilesToLoad = 2;
    var filesProgress = 0;
     imgPreload = new Image();
    $(imgPreload).attr({
        src: 'img/batiWorld.jpg'
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
            startSimulation();
        };
    }


    $.ajax({
        dataType: "text",
        url: bathymetry.metadataURL,
        async: true,
        success: function (data) {
            console.log('metadaata loaded')
            bathymetry.metadata = data.split('\n');
            if (++filesProgress == totalFilesToLoad) {
                console.log('Files loaded', bathymetry)
                startSimulation();
            };
        }
    });

    var startSimulation = function () {
        var d = 0;
        var k = 1;

        params = {
            shaders: shadersCode,
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

        d1 = DiffuseModel(params, c1);

        im = d1.renderScreen();

        var bbox = d1.simulationData.bbox;


        rectangle = csscene.primitives.add(new Cesium.Primitive({
            geometryInstances: new Cesium.GeometryInstance({
                geometry: new Cesium.RectangleGeometry({
                    rectangle: Cesium.Rectangle.fromDegrees(bbox[0][0],
                                                            bbox[0][1],
                                                            bbox[1][0],
                                                            bbox[1][1]),
                    vertexFormat: Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT
                })
            }),
            appearance: new Cesium.EllipsoidSurfaceAppearance({
                aboveGround: false,
                material: new Cesium.Material({
                  // fabric: {
                  //   type:'DiffuseMap',
                  //   uniforms:{
                  //     image: im
                  //   },
                  //   components:{
                  //     diffuse: 'texture2D(image, materialInput.st).rgb',
                  //     alpha: 'texture2D(image, materialInput.st).a'
                  //   }
                  // }

//                   fabric: {
//                     type: 'tsunami',
//                     materials:{
//                       waveMap: {
//                         type: 'DiffuseMaterial',
//                         uniforms: {image: im}
//                       }
//                     },
//                     source: {
//                         wave:
// `
// czm_material czm_getMaterial(czm_materialInput materialInput)
// {renderer =
//     vec2 vUv = materialInput.st;
//     vec4 color =  texture2D(waveMap.image, vUv);
//
//
//     return czm_material(color.rgb, 1.0, 1000.0, materialInput.normalEC, vec3(0.0), color.a);
// }
// `
//                   }
//                 }
                      fabric : {
                        uniforms: {image: im},
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


    return czm_material(color.rgb, 1.0, 100.0, normalEC, vec3(0.0), color.a);
}
`
                    }


                })
              })
            }));

      // float repeat = 1.0;
      // vec2 centerPixel = fract(repeat * st);
      // float centerBump = texture2D(image, centerPixel).channel;
      //
      // float imageWidth = float(imageDimensions.x);
      // vec2 rightPixel = fract(repeat * (st + vec2(1.0 / imageWidth, 0.0)));
      // float rightBump = texture2D(image, rightPixel).channel;
      //
      // float imageHeight = float(imageDimensions.y);
      // vec2 leftPixel = fract(repeat * (st + vec2(0.0, 1.0 / imageHeight)));
      // float topBump = texture2D(image, leftPixel).channel;
      //
      // vec3 normalTangentSpace = normalize(vec3(centerBump - rightBump, centerBump - topBump, clamp(1.0 - strength, 0.1, 1.0)));
      // vec3 normalEC = materialInput.tangentToEyeMatrix * normalTangentSpace;
      //
      // material.normal = normalEC;
      // material.diffuse = vec3(0.01);
      //
      // return material;


//               })0
//             })
//           }));
//                     }
//                   }
//                     fabric : {
//                         uniforms: {image: im},
//                         source:
// `
// czm_material czm_getMaterial(czm_materialInput materialInput)
// {
//     vec2 vUv = materialInput.st;
//     vec4 color =  texture2D(image, vUv);
//
//
//     return czm_material(color.rgb, 1.0, 1000.0, materialInput.normalEC, vec3(0.0), color.a);
// }
// `
        //             }
        //         })
        //     })
        // }));
        var number = 0;
        console.log(viewer.scene)
        console.log(rectangle.appearance.material)
        console.time("tick");
        console.log('tick')
        function tick() {
            d1.renderSimulation();
            rectangle.appearance.material.uniforms.image = d1.renderScreen();
            console.log('asdf');
            // console.log(rectangle.appearance.material.uniforms.image)
            number += 1;
            // if (number < 3) {
            //     requestAnimationFrame(tick);
            // }
            requestAnimationFrame(tick);
        }
        tick();
    }

}


function getGLData(){
  var gl = d1.renderer.domElement.getContext("experimental-webgl", {preserveDrawingBuffer: true});
  var left = 0;
  var right = 0;
  var width = 512*2*2;
  var height = 512*2
  var pixelData = new Uint8Array(width * height * 4);
  gl.readPixels(left, top, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixelData);

  var canvas = document.createElement("canvas");
  document.body.appendChild(canvas);
  canvas.width = width;
  canvas.height = height;

  var ctx = canvas.getContext("2d");
  var imgData = ctx.getImageData(0,0,width,height);
  for(var i=0;i<width;i++){
    for(var j=0;j<height;j++){
      var index = (i * 4) + j * imgData.width * 4;
      imgData.data[index + 0] = pixelData[index + 0];
    	imgData.data[index + 1] = pixelData[index + 1];
    	imgData.data[index + 2] = pixelData[index + 2];
    	imgData.data[index + 3] = pixelData[index + 3];
    }
  }
  ctx.putImageData(imgData, 0, 0);



}



//c = d1.renderer.domElement.getContext('experimental-webgl' )
// http://stackoverflow.com/questions/9470043/is-an-imagedata-canvaspixelarray-directly-available-to-a-canvas-webgl-context

// You can use gl.readPixels:
//
// // Render your scene first then...

//gl = d1.renderer.domElement.getContext("experimental-webgl", {preserveDrawingBuffer: true})

// var left = 0;
// var top = 0;
// var width = canvas.width;
// var height = canvas.height;
// var pixelData = new Uint8Array(width * height * 4);
// gl.readPixels(left, top, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixelData);
// pixelData now contains the scene's pixel data as unsigned bytes (0-255) laid out as [R, G, B, A, R, G, B, A...] Should be the same data as getImageData but at a much lower cost.
// //
// // [EDIT:]
// //
// // I forgot to mention that if you're going to be doing this, you'll want to create your WebGL context with the preserveDrawingBuffer option, like so:
// //
// // var gl = canvas.getContext("experimental-webgl", {preserveDrawingBuffer: true});
// // This prevents WebGL's inner workings from clearing the buffer before you get to it (which would result in you reading a whole lot of empty pixels). Enabling this option has the potential to slow down your rendering, but it should still be loads faster than 5-8 FPS! :)
