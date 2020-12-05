// Forked from 200615 by Nick Nedashkovskiy

    let sh;
    const ballNum = 12;

    function setup() {
        var mycanvas = createCanvas(windowWidth, windowHeight,WEBGL);
        mycanvas.parent("canvasid")
        //shader
        sh = createShader(vert,frag);
        this.shader(sh);
        pixelDensity(1);
        sh.setUniform("u_resolution", [width*pixelDensity(),height*pixelDensity()]);
        noStroke();
    }

    function draw() {
        randomSeed(0);
        let ratio = 1/(min(width,height)/2);
        let data = [];
        let unit = height/10;
        for(let i = 0 ; i < ballNum; i++){
            let radius = unit * random(0.9,1.2);
            let x = random(-width*0.4, width*0.4) + sin(frameCount/random(70,100))*radius;
            let y = (random(height*2) + frameCount * random(unit/25,unit/8)) % (height*2) -height;
            let z = sin(frameCount/random(15,30))*unit;

            data.push(x * ratio, y * ratio, z * ratio, radius * ratio);
        }
        sh.setUniform("u_mataBall",data);
        sh.setUniform("u_time", millis()/1000);
        rect(-width/2,-height/2,width,height);
    }

    var vert = `
		precision highp float;

    // attributes, in
    attribute vec3 aPosition;
    attribute vec3 aNormal;
    attribute vec2 aTexCoord;

    // attributes, out
    varying vec3 var_vertPos;
    varying vec3 var_vertNormal;
    varying vec2 var_vertTexCoord;
		varying vec4 var_centerGlPosition;//原点
    
    // matrices
    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;
    uniform mat3 uNormalMatrix;
		uniform float u_time;


    void main() {
      vec3 pos = aPosition;
			vec4 posOut = uProjectionMatrix * uModelViewMatrix * vec4(pos, 1.0);
      gl_Position = posOut;

      // set out value
      var_vertPos      = pos;
      var_vertNormal   =  aNormal;
      var_vertTexCoord = aTexCoord;
			var_centerGlPosition = uProjectionMatrix * uModelViewMatrix * vec4(0., 0., 0.,1.0);
    }
`;


    var frag = `

precision highp float;

#define PI 3.14159265359

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
uniform vec4 u_mataBall[${ballNum}];


vec3 rotate(vec3 p, float angle, vec3 axis){
    vec3 a = normalize(axis);
    float s = sin(angle);
    float c = cos(angle);
    float r = 1.0 - c;
    mat3 m = mat3(
        a.x * a.x * r + c,
        a.y * a.x * r + a.z * s,
        a.z * a.x * r - a.y * s,
        a.x * a.y * r - a.z * s,
        a.y * a.y * r + c,
        a.z * a.y * r + a.x * s,
        a.x * a.z * r + a.y * s,
        a.y * a.z * r - a.x * s,
        a.z * a.z * r + c
    );
    return m * p;
}


//distFunc
float opSmoothUnion( float d1, float d2, float k ) {
    float h = clamp( 0.5 + 0.5*(d2-d1)/k, 0.0, 1.0 );
    return mix( d2, d1, h ) - k*h*(1.0-h); 
}


float sdSphere( vec3 p, float s )
{
  return length(p)-s;
}


float sdBox( vec3 p, vec3 b )
{
  vec3 q = abs(p) - b;
  return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0);
}


//texture
float random (in vec2 st) {
   	highp float a = 12.9898;
    highp float b = 78.233;
    highp float c = 43758.5453;
    highp float dt= dot(st.xy ,vec2(a,b));
    highp float sn= mod(dt,3.14);
    return fract(sin(sn) * c);
}

float noise(vec2 st) {
    vec2 i = vec2(0.);
		i = floor(st);
    vec2 f = vec2(0.);
		f = fract(st);
    vec2 u =  vec2(0.);
		u = f*f*(3.0-2.0*f);
    return mix( mix( random( i + vec2(0.0,0.0) ),
                     random( i + vec2(1.0,0.0) ), u.x),
                mix( random( i + vec2(0.0,1.0) ),
                     random( i + vec2(1.0,1.0) ), u.x), u.y);
}


//combined Function
float dist_func(vec3 p)
{
    float d = sdSphere(u_mataBall[0].xyz+p, u_mataBall[0].w);
    for(int i = 1;  i < ${ballNum}; i++){
        float sph = sdSphere(u_mataBall[i].xyz+p, u_mataBall[i].w);
        d = opSmoothUnion(d, sph, 0.6);
    }
    return d;
}

vec3 getNormal(vec3 pos)
{
    float ep = 0.001;
    return normalize(vec3(
        dist_func(pos) - dist_func(vec3(pos.x - ep, pos.y, pos.z)),
        dist_func(pos) - dist_func(vec3(pos.x, pos.y - ep, pos.z)),
        dist_func(pos) - dist_func(vec3(pos.x, pos.y, pos.z - ep))
    ));
}


//variables
vec3 lightDir = normalize(vec3(0.1, -0.5, -1.0));
vec3 bgCol = vec3(0.97,0.96,0.94);
vec3 objCol = vec3(0.98,0.87,0.87);
vec3 shadowCol = vec3(0.98,0.22,0);


void main() {
   vec2 pos = (gl_FragCoord.xy*2.0 - u_resolution.xy)/max(u_resolution.x,u_resolution.y);
    
    //camera
    float angleY = 0.0;
    float angleX = 0.0;
    vec3 camera_dir = rotate(rotate(vec3(0.0, 0.0, 1.0), angleY, vec3(0.0,1.0,0.0)), angleX, vec3(1.0,0.0,0.0)); 
    vec3 cameraPos = vec3(0.0, 0.0, -2.0);
    vec3 camera_up = rotate(rotate(vec3(0.0, 1.0, 0.0), angleY, vec3(0.0,1.0,0.0)), angleX, vec3(1.0,0.0,0.0)); 
    vec3 camera_side = cross(camera_up, camera_dir); 
    
    //ray
	 vec3 n = vec3(0,0,0);
    float d = 0.0;
    vec3 rayDir = normalize(-pos.x * camera_side - pos.y * camera_up + camera_dir);
   
    vec3 currentPos = cameraPos;
   for(int i = 0; i < 60; i++){
       d = dist_func(currentPos);
       if (d < 0.001)
       {
           n = getNormal(currentPos);
           break;
       }
       currentPos += rayDir * d;
   }
	    
   //diffuse
    float diff = d < 0.001 ? dot(n, lightDir) : -1.0 ;
    diff = (diff / 2.0) + 0.5;
    vec3 diifCol = diff * objCol + (1.0- diff)* mix(objCol, objCol*(bgCol-0.5), 0.6);
    vec3 col = d < 0.001 ? vec3(diifCol) : bgCol;
    float noise = random(pos);
    float noisedDiff =  step(noise,diff);
		col = d < 0.001 ? col * noisedDiff + vec3(1.0 - noisedDiff) * shadowCol : bgCol;
  
		//col += shadowCol * 0.07 * (pos.y + 1.0);
    
    gl_FragColor = vec4(vec3(col), 1.0);
}

`;
