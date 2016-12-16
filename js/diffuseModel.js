/*
* params: 
*/

// rendererSize
// shaders
// colormap



var DiffuseModel = function(params, container) {
    var shaders = params.shaders;
    var rendererSize = params.rendererSize;
    var colormap = params.colormap;

    var width = rendererSize.width;
    var height = rendererSize.height;

    var renderer = new THREE.WebGLRenderer({
        canvas: container,
        preserveDrawingBuffer: true
    });
    renderer.setSize(width, height);

    var scene = new THREE.Scene();

    var camera = new THREE.OrthographicCamera(-0.5*width, 0.5*width,
                                0.5*height,-0.5*height, -500, 1000);

    var simulation = {
        toggleBuffer1: false,
        speed : 1,
        paused: false,

        uniforms : {
            texel: {
                type: "v2",
                value: undefined},
            delta: {
                type: "v2",
                value: undefined},
            tSource: {
                type: "t",
                value: undefined},
            colormap: {
                type: "v4v",
                value: colormap
            }
        }
    }

    var mTextureBuffer1 = new THREE.WebGLRenderTarget(
        width, height,
        { minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
        type: THREE.FloatType,
        wrapS: THREE.ClampToEdgeWrapping,
        wrapT: THREE.ClampToEdgeWrapping});

    var mTextureBuffer2 = new THREE.WebGLRenderTarget(
        width, height,
        { minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
        type: THREE.FloatType,
        wrapS: THREE.ClampToEdgeWrapping,
        wrapT: THREE.ClampToEdgeWrapping});

    simulation.mTextureBuffer1 = mTextureBuffer1;
    simulation.mTextureBuffer2 = mTextureBuffer2;
    simulation.uniforms.delta.value = new THREE.Vector2(1/width, 1/height);

    var materials = {
        initialMaterial : new THREE.ShaderMaterial({
            uniforms: simulation.uniforms,
            vertexShader: shaders.vshader,
            fragmentShader: shaders.iFshader,
        }),

        modelMaterial : new THREE.ShaderMaterial({
            uniforms: simulation.uniforms,
            vertexShader: shaders.vshader,
            fragmentShader: shaders.mFshader,
        }),

        screenMaterial : new THREE.ShaderMaterial({
            uniforms: simulation.uniforms,
            vertexShader: shaders.vshader,
            fragmentShader: shaders.sFshader,
        }),
        phongMaterial: new THREE.MeshPhongMaterial({
            color: 0xff0000
        })
    };

    var objects = {
        planeScreen : new THREE.Mesh(
        new THREE.PlaneGeometry(width, height),
        materials.phongMaterial
        )
    };

    var setColormap = function(colormap){
        simulation.uniforms.colormap.value = colormap;
    };

    setColormap(colormap);
    scene.add(camera);
    scene.add(objects.planeScreen);

    objects.planeScreen.material = materials.initialMaterial;
    renderer.render(
      scene,
      camera,
      simulation.mTextureBuffer1,
      true
    );
    simulation.uniforms.tSource.value = simulation.mTextureBuffer1;

    var renderSimulation = function(){
        objects.planeScreen.material = materials.modelMaterial;

        for (var i=0; i< Math.floor(simulation.speed*10);i++){
            if(!simulation.toggleBuffer1){
                simulation.uniforms.tSource.value =
                simulation.mTextureBuffer1;
        
                renderer.render(
                    scene,
                    camera,
                    simulation.mTextureBuffer2,
                    true
                );
            }
            else{
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

    var renderScreen = function(){
        objects.planeScreen.material = materials.screenMaterial;

        renderer.render(
            scene,
            camera
        );
        // return bufferTexture;
        return renderer.domElement.toDataURL();
    };
    return {
        renderSimulation: renderSimulation,
        renderScreen: renderScreen,
        simulation: simulation
    };
};