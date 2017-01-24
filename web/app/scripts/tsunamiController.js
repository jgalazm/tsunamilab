function TsunamiController(model, view){
  var paused = true;

  var flyTo = function(){
    // TODO: set location as input
    var a = 8;
    view.viewer.camera.flyTo({
      destination: Cesium.Rectangle.fromDegrees(-80-3*a,-45-3*a,-70+3*a,-35+3*a)
    });
  }

  var tick = function() {
    if (paused){
      model.renderSimulation();
      view.rectangle.appearance.material.uniforms.image = model.renderScreen();
    }
    requestAnimationFrame(tick);
  }

  var play = function(){
    paused = false;
  }
  var pause = function(){
    paused = true;
  }
  return {
    play: play,
    pause: pause,
    flyTo: flyTo,
    tick: tick
  }
}
