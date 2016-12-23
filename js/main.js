var container;

// function that initializes the cesium display

function init() {

    viewer = new Cesium.Viewer('cesiumContainer', {
        imageryProvider: new Cesium.ArcGisMapServerImageryProvider({
            url: 'http://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer'
        }),
        baseLayerPicker: false,
        sceneMode: Cesium.SceneMode.SCENE2D
    });

    viewer.scene.debugShowFramesPerSecond = true;

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
                    fabric: {
                        type: 'Image',
                        uniforms: {
                            image: im
                        },
                        source:
                    `
czm_material czm_getMaterial(czm_materialInput materialInput)
{
    vec2 vUv = materialInput.st;
    vec4 color =  texture2D(image, vUv);


    return czm_material(color.rgb, 1.0, 100.0, materialInput.normalEC, vec3(0.0), color.a);
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
            // console.log(rectangle.appearance.material.uniforms.image)
            number += 1;
            if (number == 100) {
                console.timeEnd("tick");
            }
            requestAnimationFrame(tick);
        }
        tick();
    }

}
