var vshader = 'shaders/vshader.glsl';
// vshader_text = $.ajax(vshader, {async:false}).responseText;
var bFshader = 'shaders/batiFShader2.glsl';
var iFshader = 'shaders/sphericalInitFShader.glsl';
var mFshader = 'shaders/sphericalModelFShader.glsl';
var sFshader = 'shaders/screenFShader.glsl';	

vshader_text = $.ajax(vshader, {async:false}).responseText;
bFshader_text = $.ajax(bFshader,{async:false}).responseText;
iFshader_text = $.ajax(iFshader,{async:false}).responseText;
mFshader_text = $.ajax(mFshader,{async:false}).responseText;
sFshader_text = $.ajax(sFshader,{async:false}).responseText;