varying vec2 vUv;
// uniform sampler2D tSource;
uniform vec2 delta;
uniform vec4 colormap[7];
void main()
{

    float value = vUv.x;//texture2D(tSource, vUv).r;

    gl_FragColor = vec4((1.0-value)*colormap[6].a, 0.0, 0.0, 1.0);
    // gl_FragColor = vec4((1.0-value), 0.0, 0.0, 1.0);
}
