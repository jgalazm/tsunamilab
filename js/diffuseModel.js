/*
* params:
*/

// rendererSize
// shaders
// colormap

var DiffuseModel = function (params, container) {
    var R_earth = 6378000.0,
        rad_deg = 0.01745329252,
        rad_min = 0.000290888208665721,
        cori_w = 7.2722e-5;

    var shaders = params.shaders;
    var rendererSize = params.rendererSize;
    var colormap = params.colormap;
    var bathymetry = params.bathymetry;
    bathymetry.texture = new THREE.Texture(bathymetry.img);
    bathymetry.texture.needsUpdate = true;
    var filesProgress = 0;
    var totalFilesToLoad = 2;


    var width = rendererSize.width;
    var height = rendererSize.height;

    var renderer = new THREE.WebGLRenderer({
        canvas: container,
        preserveDrawingBuffer: true
    });
    renderer.setSize(width, height);

    var scene = new THREE.Scene();

    var camera = new THREE.OrthographicCamera(-0.5 * width, 0.5 * width,
        0.5 * height, -0.5 * height, -500, 1000);

    var simulation = {
        toggleBuffer1: false,
        speed: 1,
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
            L: { type: 'f', value: 850000.0 },
            W: { type: 'f', value: 130000.0 },
            depth: { type: 'f', value: 63341.44 },
            slip: { type: 'f', value: 17.0 },
            strike: { type: 'f', value: 7.0 },
            dip: { type: 'f', value: 20.0 },
            rake: { type: 'f', value: 105.0 },
            U3: { type: 'f', value: 0.0 },
            cn: { type: 'f', value: -41.0 },   //centroid N coordinate, 18zone
            ce: { type: 'f', value: -75.0 },    //centroid E coordinate, 18zone

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
            wrapS: THREE.ClampToEdgeWrapping,
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
            wrapS: THREE.ClampToEdgeWrapping,
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

        for (var i = 0; i < Math.floor(simulation.speed * 10); i++) {
            if (!simulation.toggleBuffer1) {
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
        objects.planeScreen.material = materials.screenMaterial;

        renderer.render(
            scene,
            camera
        );
        // return bufferTexture;
        return renderer.domElement.toDataURL();
    };

    var setSimulation = function () {
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

        simNx = parseInt(bathymetry.metadata[1].split(':')[1]);//parseInt(batidata.nx);
        simNy = parseInt(bathymetry.metadata[0].split(':')[1]);//parseInt(batidata.nx);
        if (simNx > 1000) {
            simNx = simNx / 5;
            simNy = simNy / 5;
        }

        // set simNx and simNy as the nearest power of two
        // this is needed by THREE.RepeatWrapping
        var xpower = Math.floor(Math.log(simNx) / Math.log(2));
        var ypower = Math.floor(Math.log(simNy) / Math.log(2));

        if (simNx - Math.pow(2, xpower) < Math.pow(2, xpower + 1) - simNx) {
            simNx = Math.pow(2, xpower);
        }
        else {
            simNx = Math.pow(2, xpower + 1)
        }

        if (simNy - Math.pow(2, ypower) < Math.pow(2, ypower + 1) - simNy) {
            simNy = Math.pow(2, ypower);
        }
        else {
            simNy = Math.pow(2, ypower + 1)
        }


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

        simulation.uniforms.RR.value = dt / R_earth;
        simulation.uniforms.RS.value = 9.81 * simulation.uniforms.RR.value;

        simulation.uniforms.tBati.value = bathymetry.texture;


        objects.planeScreen.material = materials.initialMaterial;
        renderer.render(
            scene,
            camera,
            simulation.mTextureBuffer1,
            true
        );
        simulation.uniforms.tSource.value = simulation.mTextureBuffer1;

        simulationData.timeStep = dt;
        simulationData.gridSize = [simNx, simNy];
        simulationData.bbox = [[simulation.uniforms.xmin.value, 
                                simulation.uniforms.ymin.value],
                                [simulation.uniforms.xmax.value, 
                                simulation.uniforms.ymax.value]];
    }

    var simulationData = {};

    setSimulation();

    return {
        renderSimulation: renderSimulation,
        renderScreen: renderScreen,
        simulation: simulation,
        simulationData: simulationData
    };
};
