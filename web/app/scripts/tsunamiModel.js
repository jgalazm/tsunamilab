/*
* params:
*/

// rendererSize
// shaders
// colormap



var TsunamiModel = function (params, container) {
    var R_earth = 6378000.0,
        rad_deg = 0.01745329252,
        rad_min = 0.000290888208665721,
        cori_w = 7.2722e-5;
    var nstep = 0;
    var shaders = params.shaders;
    var rendererSize = params.rendererSize;
    var colormap = params.colormap;
    var bathymetry = params.bathymetry;
    bathymetry.texture = new THREE.Texture(bathymetry.img);
    bathymetry.texture.needsUpdate = true;
    var filesProgress = 0;
    var totalFilesToLoad = 2;
    var faultParameters = params.faultParameters;


    var width = rendererSize.width;
    var height = rendererSize.height;

    var rendererArguments = {
        alpha: true,
        preserveDrawingBuffer: true
    }

    if(container){
      rendererArguments.canvas = container
    }

    var renderer = new THREE.WebGLRenderer(rendererArguments);

    renderer.setClearColor( 0xffffff, 0.0 );
    renderer.setSize(width*2, height*2);

    var scene = new THREE.Scene();

    var camera = new THREE.OrthographicCamera(-0.5 * width, 0.5 * width,
        0.5 * height, -0.5 * height, -500, 1000);

    var simulation = {
        toggleBuffer1: false,
        speed: 10,
        paused: true,

        uniforms: {
            texel: {
                type: "v2",
                value: undefined
            },
            delta: {
                type: "v2",
                value: undefined
            },
            colormap: {
                type: "v4v",
                value: colormap
            },
            t: { type: "f", value: 0.0 },
            texel: { type: "v2", value: undefined },
            delta: { type: "v2", value: undefined },
            tSource: { type: "t", value: undefined },
            tBati: { type: "t", value: undefined },

            //sim params
            //TODO Integrar a fragment shader las constantes
            rad_min: { type: 'f', value: rad_min },
            rad_deg: { type: 'f', value: rad_deg },
            gx: { type: 'f', value: 0.01 },
            dx: { type: 'f', value: undefined },
            dy: { type: 'f', value: undefined },
            RR: { type: 'f', value: undefined },
            RS: { type: 'f', value: undefined },
            g: { type: 'f', value: 9.81 },
            xmin: { type: "f", value: 0.0 },
            xmax: { type: "f", value: 1.0 },
            ymin: { type: "f", value: 0.0 },
            ymax: { type: "f", value: 1.0 },
            zmin: { type: "f", value: 0.0 },
            zmax: { type: "f", value: 1.0 },

            //fault params
            L: { type: 'f', value: undefined},
            W: { type: 'f', value: undefined},
            depth: { type: 'f', value: undefined},
            slip: { type: 'f', value: undefined},
            strike: { type: 'f', value: undefined},
            dip: { type: 'f', value: undefined},
            rake: { type: 'f', value: undefined},
            U3: { type: 'f', value: undefined},
            cn: { type: 'f', value: undefined},   //centroid N coordinate, 18zone
            ce: { type: 'f', value: undefined},    //centroid E coordinate, 18zone

            //misc
            pause: { type: 'i', value: 0 }
        }

    }

    var mTextureBuffer1 = new THREE.WebGLRenderTarget(
        width, height,
        {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            format: THREE.RGBAFormat,
            type: THREE.FloatType,
            wrapS: THREE.RepeatWrapping,
            wrapT: THREE.ClampToEdgeWrapping,
            needsUpdate: true
        });

    var mTextureBuffer2 = new THREE.WebGLRenderTarget(
        width, height,
        {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            format: THREE.RGBAFormat,
            type: THREE.FloatType,
            wrapS: THREE.RepeatWrapping,
            wrapT: THREE.ClampToEdgeWrapping,
            needsUpdate: true
        });

    simulation.mTextureBuffer1 = mTextureBuffer1;
    simulation.mTextureBuffer2 = mTextureBuffer2;
    simulation.uniforms.delta.value = new THREE.Vector2(1 / width, 1 / height);

    var materials = {
        initialMaterial: new THREE.ShaderMaterial({
            uniforms: simulation.uniforms,
            vertexShader: shaders.vshader,
            fragmentShader: shaders.iFshader,
        }),

        modelMaterial: new THREE.ShaderMaterial({
            uniforms: simulation.uniforms,
            vertexShader: shaders.vshader,
            fragmentShader: shaders.mFshader,
        }),

        screenMaterial: new THREE.ShaderMaterial({
            uniforms: simulation.uniforms,
            vertexShader: shaders.vshader,
            fragmentShader: shaders.sFshader,
        }),
        phongMaterial: new THREE.MeshBasicMaterial({
            map: bathymetry.texture
        })
    };

    var objects = {
        planeScreen: new THREE.Mesh(
            new THREE.PlaneGeometry(width, height),
            materials.phongMaterial
        )
    };

    var setColormap = function (colormap) {
        simulation.uniforms.colormap.value = colormap;
    };

    setColormap(colormap);
    scene.add(camera);
    scene.add(objects.planeScreen);


    var renderSimulation = function () {
        objects.planeScreen.material = materials.modelMaterial;
        for (var i = 0; i < Math.floor(simulation.speed * 1); i++) {
            nstep++;
            if (simulation.toggleBuffer1) {
                simulation.uniforms.tSource.value =
                    simulation.mTextureBuffer1;

                renderer.render(
                    scene,
                    camera,
                    simulation.mTextureBuffer2,
                    true
                );
            }
            else {
                simulation.uniforms.tSource.value =
                    simulation.mTextureBuffer2;

                renderer.render(
                    scene,
                    camera,
                    simulation.mTextureBuffer1,
                    true
                );
            }

            simulation.toggleBuffer1 = !simulation.toggleBuffer1;
        }
    };

    var renderScreen = function () {
        renderScreenVoid();
        return renderer.domElement.toDataURL("image/png", 0.98);
    };

    var renderScreenVoid = function () {
        objects.planeScreen.material = materials.screenMaterial;

        renderer.render(
            scene,
            camera
        );
    }

    var setInitialCondition = function(faultParameters){
      nstep = 0;
      simulation.uniforms.L.value = faultParameters.L;
      simulation.uniforms.W.value = faultParameters.W;
      simulation.uniforms.depth.value = faultParameters.depth;
      simulation.uniforms.slip.value = faultParameters.slip;
      simulation.uniforms.strike.value = faultParameters.strike;
      simulation.uniforms.dip.value = faultParameters.dip;
      simulation.uniforms.rake.value = faultParameters.rake;
      simulation.uniforms.U3.value = faultParameters.U3;
      simulation.uniforms.cn.value = faultParameters.cn;
      simulation.uniforms.ce.value = faultParameters.ce;

      objects.planeScreen.material = materials.initialMaterial;
      renderer.render(
          scene,
          camera,
          simulation.mTextureBuffer1,
          true
      );
      renderer.render(
          scene,
          camera,
          simulation.mTextureBuffer2,
          true
      );
      simulation.uniforms.tSource.value = simulation.mTextureBuffer1;
      renderScreenVoid();
    }

    var setSimulation = function () {
        // bathymetry

        simulation.uniforms.xmin.value = parseFloat(bathymetry.metadata[2].split(':')[1]);
        simulation.uniforms.xmax.value = parseFloat(bathymetry.metadata[3].split(':')[1]);
        simulation.uniforms.ymin.value = parseFloat(bathymetry.metadata[4].split(':')[1]);
        var ymin = parseFloat(bathymetry.metadata[4].split(':')[1]);
        simulation.uniforms.ymax.value = parseFloat(bathymetry.metadata[5].split(':')[1]);
        var ymax = parseFloat(bathymetry.metadata[5].split(':')[1]);
        simulation.uniforms.zmin.value = parseFloat(bathymetry.metadata[6].split(':')[1]);
        simulation.uniforms.zmax.value = parseFloat(bathymetry.metadata[7].split(':')[1]);

        if (simulation.uniforms.zmin.value > 0.0) {
            var e = new Error('zmin positive on bathymetry image file');
            throw e;
        }

        // numerical grid / domain

        simNx = width;
        simNy = height;

        simulation.uniforms.xmin.value = 0.0;
        simulation.uniforms.xmax.value = 360 - 360 / simNx / 2.0;

        planeHeight = 1.0;
        planeWidth = planeHeight * simNx / simNy;
        simulation.uniforms.texel.value = new THREE.Vector2(1 / simNx, 1 / simNy)

        var dx = (simulation.uniforms.xmax.value - simulation.uniforms.xmin.value) / (simNx) * 60.0;
        var dy = (simulation.uniforms.ymax.value - simulation.uniforms.ymin.value) / (simNy) * 60.0;
        simulation.uniforms.dx.value = dx;
        simulation.uniforms.dy.value = dy;

        // ymin = simulation.uniforms.ymin.value
        var lat_max = 85;//Math.max(Math.abs(ymin),Math.abs(ymax));
        var dx_real = R_earth * Math.cos(lat_max * rad_deg) * dx * rad_min;
        var dy_real = R_earth * dy * rad_min;

        var dt = 0.5 * Math.min(dx_real, dy_real) / Math.sqrt(-9.81 * simulation.uniforms.zmin.value);

        // shallow water equation constants
        simulation.uniforms.RR.value = dt / R_earth;
        simulation.uniforms.RS.value = 9.81 * simulation.uniforms.RR.value;

        simulation.uniforms.tBati.value = bathymetry.texture;



        // simulation data
        simulationData.timeStep = dt;
        simulationData.gridSize = [simNx, simNy];
        simulationData.bbox = [[simulation.uniforms.xmin.value,
                                simulation.uniforms.ymin.value],
                                [simulation.uniforms.xmax.value,
                                simulation.uniforms.ymax.value]];
        setInitialCondition(faultParameters);
    }


    var getTime = function() {
        return nstep*simulationData.timeStep;
    }

    var getCanvas = function (){
        return renderer.domElement;
    }

    var simulationData = {};

    setSimulation();

    return {
        renderSimulation: renderSimulation,
        setSimulation: setSimulation,
        setInitialCondition: setInitialCondition,
        renderScreen: renderScreen,
        renderScreenVoid: renderScreenVoid,
        simulation: simulation,
        zlimits: [simulation.uniforms.zmin.value, simulation.uniforms.zmax.value],
        simulationData: simulationData,
        renderer : renderer,
        getCanvas: getCanvas,
        getTime: getTime
    };
};
