var a = 8;
viewer.camera.flyTo({
  destination: Cesium.Rectangle.fromDegrees(-80-3*a,-45-3*a,-70+3*a,-35+3*a)
});


function tick() {
  d1.renderSimulation();
  rectangle.appearance.material.uniforms.image = d1.renderScreen();
  requestAnimationFrame(tick);
}
tick();
