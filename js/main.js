var container;

// function that initializes the cesium display

function init(){

  viewer = new Cesium.Viewer('cesiumContainer', {
      imageryProvider : new Cesium.ArcGisMapServerImageryProvider({
          url : 'http://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer'
      }),
      baseLayerPicker : false,
      sceneMode: Cesium.SceneMode.COLUMBUS_VIEW
  });

  viewer.scene.debugShowFramesPerSecond = true;

  // capa con el mapa
  var layers = viewer.scene.imageryLayers;

  var imagen = layers.addImageryProvider(new Cesium.SingleTileImageryProvider({
      url : 'img.png',
      rectangle : Cesium.Rectangle.fromDegrees(0, 0, 15, 15)
  }));

  csscene = viewer.scene;

    c1 = document.getElementById( 'container' );
    
        shadersCode = shadersCode();
        params = {
            shaders: shadersCode,
            rendererSize: {
                width: 255,
                height: 128
            },
            colormap: [new THREE.Vector4(1, 1, 1, -10),
				new THREE.Vector4(0, 1, 1, -6.6),
				new THREE.Vector4(0, 0, 1, -3.3),
				new THREE.Vector4(0, 0, 0, 0.0),
				new THREE.Vector4(1, 0, 0, 3.3),
				new THREE.Vector4(1, 1, 0, 6.6),
				new THREE.Vector4(1, 1, 1, 9.9)]
        }
    d1 = DiffuseModel(params, c1);

    im = d1.renderScreen();


    rectangle = csscene.primitives.add(new Cesium.Primitive({
            geometryInstances : new Cesium.GeometryInstance({
                geometry : new Cesium.RectangleGeometry({
                    rectangle : Cesium.Rectangle.fromDegrees(0, -85, 360, 85),
                    vertexFormat : Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT
                })
            }),
            appearance : new Cesium.EllipsoidSurfaceAppearance({
                aboveGround : false,
                material : new Cesium.Material({
                    fabric : {
                        type : 'Image',
                        uniforms : {
                            image : im
                        },
                        source:  
`
czm_material czm_getMaterial(czm_materialInput materialInput)
{
    vec2 vUv = materialInput.st;
    vec3 color =  texture2D(image, vUv).rgb;
    return czm_material(color, 1.0, 100.0, materialInput.normalEC, vec3(0.0), 1.0);
}
`
                    }
                })
            })
        }));
    var number = 0;
    console.log(viewer.scene)
    console.log(rectangle.appearance.material)
    console.time("tick");
    console.log('tick')
    function tick() {
      d1.renderSimulation();
      rectangle.appearance.material.uniforms.image = d1.renderScreen();

      number += 1;
      if(number== 100){
          console.timeEnd("tick");
      }
      requestAnimationFrame(tick);
    }
    tick();
   

  // la simulacion

//   im = initsim(0.0);
//   var img = new Image;
//   img.src = im;

//   rectangle = csscene.primitives.add(new Cesium.Primitive({
//         geometryInstances : new Cesium.GeometryInstance({
//             geometry : new Cesium.RectangleGeometry({
//                 rectangle : Cesium.Rectangle.fromDegrees(0, -85, 360, 85),
//                 vertexFormat : Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT
//             })
//         }),
//         appearance : new Cesium.EllipsoidSurfaceAppearance({
//             aboveGround : false,
//             material : new Cesium.Material({
//                 fabric : {
//                     type : 'Image',
//                     uniforms : {
//                         image : im
//                     },
//                     components:{
//                       alpha: 'pow(texture2D(image, materialInput.st).r,3.0)'
//                     }
//                 }
//              })
//         })
//     }));
//     var t = 0;
//     function tick() {
//       t++;
//       csscene.render();
//       rectangle.appearance.material.uniforms.image = rendersim(t);
//       requestAnimationFrame(tick);
//     }
//     tick();

}



// function initsim(t){
//   // routine that initialices the threejs calculation scene
  
//   // escena threejs
//   // renderer
//   container = document.getElementById( 'container' );

//   renderer = new THREE.WebGLRenderer({canvas:container, preserveDrawingBuffer: true});
//   renderer.setClearColor( 0xffffff );
//   renderer.setSize(256, 256);

//   //scene
//   scene = new THREE.Scene();

//   // light
//   var light = new THREE.PointLight(0xffffff, 1.0);
//   light.position.set(0.0,12.5,0.0);
//   scene.add(light);

//   // cacu
//   calc_camera = new THREE.OrthographicCamera( -0.5, 0.5,
// 					0.5, -0.5, - 500, 1000 );
// 	calc_camera.rotateX(-Math.PI/2);
// 	// calc_camera.rotateZ(-Math.PI/2);
// 	calc_camera.position.x = 1.0;
// 	scene.add(calc_camera);

//   //material
// 	var vshader = "shaders/vshader.glsl";
// 	var mFshader = "shaders/mFshader.glsl";


//   mUniforms = {
// 		t: {type: 'f', value:t}
// 	}
// 	modelMaterial = new THREE.ShaderMaterial({
// 		uniforms: mUniforms,
// 		vertexShader: $.ajax(vshader, {async:false}).responseText,
// 		fragmentShader: $.ajax(mFshader,{async:false}).responseText
// 	});

// 	mTextureBuffer = new THREE.WebGLRenderTarget( 256, 256,
// 			 					{minFilter: THREE.LinearFilter,
// 		                         magFilter: THREE.LinearFilter,
// 		                         format: THREE.RGBAFormat,
// 		                         type: THREE.FloatType});


// 	//geometry
// 	var geometry2 = new THREE.PlaneGeometry(1 , 1, 32*2*2,32*2*2	);
// 	plane2Material = new THREE.MeshPhongMaterial( { color: 0x000000,
// 					specular: 0x00ffff, shininess: 120.0*4.0,side: THREE.DoubleSide} );
// 	planeScreen2 = new THREE.Mesh( geometry2, modelMaterial );
// 	planeScreen2.rotateX(-3.14/2);
// 	// planeScreen2.rotateZ(-3.14/2);
// 	planeScreen2.position.x = 1.0;
// 	scene.add( planeScreen2 );

// 	renderer.render(scene, calc_camera, mTextureBuffer, true);
//   renderer.render(scene, calc_camera);

//   return renderer.domElement.toDataURL("image/png")

// }

// // routine that runs the simulation

// function rendersim(t){
//   mUniforms.t.value = t;
//   renderer.render(scene, calc_camera);
//   return renderer.domElement.toDataURL("image/png");
// }
