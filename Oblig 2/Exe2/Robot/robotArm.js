"use strict";

var canvas, gl, program;

var NumVertices = 36; //(6 faces)(2 triangles/face)(3 vertices/triangle)

var points = [];
var colors = [];
var auto = false;
var scaleNum = 15;
var rotSpeed = 0.2;
var vertices = [
    vec4( -0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5,  0.5,  0.5, 1.0 ),
    vec4(  0.5,  0.5,  0.5, 1.0 ),
    vec4(  0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5, -0.5, -0.5, 1.0 ),
    vec4( -0.5,  0.5, -0.5, 1.0 ),
    vec4(  0.5,  0.5, -0.5, 1.0 ),
    vec4(  0.5, -0.5, -0.5, 1.0 )
];

// RGBA colors
var vertexColors = [
    vec4( 0.0, 0.0, 0.0, 1.0 ),  // black
    vec4( 1.0, 0.0, 0.0, 1.0 ),  // red
    vec4( 1.0, 1.0, 0.0, 1.0 ),  // yellow
    vec4( 0.0, 1.0, 0.0, 1.0 ),  // green
    vec4( 0.0, 0.0, 1.0, 1.0 ),  // blue
    vec4( 1.0, 0.0, 1.0, 1.0 ),  // magenta
    vec4( 1.0, 0.5, 1.0, 1.0 ),  // white
    vec4( 0.0, 1.0, 1.0, 1.0 )   // cyan
];


// Parameters controlling the size of the Robot's arm

var BASE_HEIGHT      = 2.0;
var BASE_WIDTH       = 5.0;
var LOWER_ARM_HEIGHT = 5.0;
var LOWER_ARM_WIDTH  = 0.5;
var UPPER_ARM_HEIGHT = 5.0;
var UPPER_ARM_WIDTH  = 0.5;
var LOWER_CLAW_HEIGHT  = 1.0;
var LOWER_CLAW_WIDTH  = 0.2;
var MID_CLAW_HEIGHT  = 1.0;
var MID_CLAW_WIDTH  = 0.2;
var UPPER_CLAW_HEIGHT  = 1.5;
var UPPER_CLAW_WIDTH  = 0.2;

// Shader transformation matrices

var modelViewMatrix = [];
var projectionMatrix;

// Array of rotation angles (in degrees) for each rotation axis

var Base = 0;
var LowerArm = 1;
var UpperArm = 2;
var LowerClaw = 3;
var MidClaw = 4;
var UpperClaw = 5;
var LowerClawRot = 6;


var theta= [ 0, 0, 0, 90, 0, 0];

var minTheta = [ -360, -90, -90, 30, -90 , -60, 0];
var maxTheta = [ 360, 90, 90, 150, 0, 0, 360];
var thetaInc = [1, 1, 1, 1, 0, 0, 1];

var angle = 0;

var modelViewMatrixLoc;

var vBuffer, cBuffer;

//----------------------------------------------------------------------------

function quad(  a,  b,  c,  d ) {
    colors.push(vertexColors[a]);
    points.push(vertices[a]);
    colors.push(vertexColors[a]);
    points.push(vertices[b]);
    colors.push(vertexColors[a]);
    points.push(vertices[c]);
    colors.push(vertexColors[a]);
    points.push(vertices[a]);
    colors.push(vertexColors[a]);
    points.push(vertices[c]);
    colors.push(vertexColors[a]);
    points.push(vertices[d]);
}


function colorCube() {
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}


//--------------------------------------------------


window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );

    gl = canvas.getContext('webgl2');
    if (!gl) { alert( "WebGL 2.0 isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );

    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    gl.enable( gl.DEPTH_TEST );

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader" );

    gl.useProgram( program );

    colorCube();

    // Load shaders and use the resulting shader program

    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // Create and initialize  buffer objects

    vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    var positionLoc = gl.getAttribLocation( program, "aPosition" );
    gl.vertexAttribPointer( positionLoc, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( positionLoc );

    cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );

    var colorLoc = gl.getAttribLocation( program, "aColor" );
    gl.vertexAttribPointer( colorLoc, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( colorLoc );

    document.getElementById("slider1").onchange = function(event) {
        theta[0] = event.target.value;
    };
    document.getElementById("slider2").onchange = function(event) {
         theta[1] = event.target.value;
    };
    document.getElementById("slider3").onchange = function(event) {
         theta[2] =  event.target.value;
    };
    document.getElementById("slider4").onchange = function(event) {
         theta[3] =  event.target.value;
    };
    document.getElementById("slider5").onchange = function(event) {
         theta[4] =  event.target.value;
    }; 
    document.getElementById("slider6").onchange = function(event) {
         theta[5] =  event.target.value;
    };
    document.getElementById("slider7").onchange = function(event) {
         theta[6] =  event.target.value;
    };
    
    document.getElementById("auto").onchange = function(event) {
         auto =  !auto;
    };

    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");

    projectionMatrix = ortho(-scaleNum, scaleNum, -scaleNum, scaleNum, -scaleNum, scaleNum);
    gl.uniformMatrix4fv( gl.getUniformLocation(program, "projectionMatrix"),  false, flatten(projectionMatrix) );

    render();
}

//----------------------------------------------------------------------------


function base() {
    var s = scale(BASE_WIDTH, BASE_HEIGHT, BASE_WIDTH);
    //console.log("s", s);
    var instanceMatrix = mult( translate( 0.0, 0.5 * BASE_HEIGHT, 0.0 ), s);
    //var instanceMatrix = mult(s,  translate( 0.0, 0.5 * BASE_HEIGHT, 0.0 ));

    //console.log("instanceMatrix", instanceMatrix);

    var t = mult(modelViewMatrix[modelViewMatrix.length-1], instanceMatrix);
    gl.uniformMatrix4fv(modelViewMatrixLoc,  false, flatten(t)  );
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );

    //console.log("base", t);
}

//----------------------------------------------------------------------------


function upperArm() {
    var s = scale(UPPER_ARM_WIDTH, UPPER_ARM_HEIGHT, UPPER_ARM_WIDTH);
    //console.log("s", s);

    var instanceMatrix = mult(translate( 0.0, 0.5 * UPPER_ARM_HEIGHT, 0.0 ),s);
    //var instanceMatrix = mult(s, translate(  0.0, 0.5 * UPPER_ARM_HEIGHT, 0.0 ));

    //console.log("instanceMatrix", instanceMatrix);

    var t = mult(modelViewMatrix[modelViewMatrix.length-1], instanceMatrix);

    //console.log("upper arm mv", modelViewMatrix);

    gl.uniformMatrix4fv( modelViewMatrixLoc,  false, flatten(t)  );
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );

    //console.log("upper arm t", t);

}

//----------------------------------------------------------------------------


function lowerArm()
{
    var s = scale(LOWER_ARM_WIDTH, LOWER_ARM_HEIGHT, LOWER_ARM_WIDTH);
    var instanceMatrix = mult( translate( 0.0, 0.5 * LOWER_ARM_HEIGHT, 0.0 ), s);


    var t = mult(modelViewMatrix[modelViewMatrix.length-1], instanceMatrix);
    gl.uniformMatrix4fv( modelViewMatrixLoc,  false, flatten(t)   );
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );

}

//----------------------------------------------------------------------------

function lowerClaw()
{
    var s = scale(LOWER_CLAW_WIDTH, LOWER_CLAW_HEIGHT, LOWER_CLAW_WIDTH);
    var instanceMatrix = mult( translate( 0, 0.5 * LOWER_CLAW_HEIGHT, 0.0 ), s);


    var t = mult(modelViewMatrix[modelViewMatrix.length-1], instanceMatrix);
    gl.uniformMatrix4fv( modelViewMatrixLoc,  false, flatten(t)   );
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );

}

//----------------------------------------------------------------------------

function midClaw()
{
    var s = scale(LOWER_CLAW_WIDTH, LOWER_CLAW_HEIGHT, LOWER_CLAW_WIDTH);
    var instanceMatrix = mult( translate( 0, 0.5 * LOWER_CLAW_HEIGHT, 0.0 ), s);


    var t = mult(modelViewMatrix[modelViewMatrix.length-1], instanceMatrix);
    gl.uniformMatrix4fv( modelViewMatrixLoc,  false, flatten(t)   );
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );

}

//----------------------------------------------------------------------------

function upperClaw()
{
    var s = scale(UPPER_CLAW_WIDTH, UPPER_CLAW_HEIGHT, UPPER_CLAW_WIDTH);
    var instanceMatrix = mult( translate( 0, 0.5 * UPPER_CLAW_HEIGHT, 0.0 ), s);


    var t = mult(modelViewMatrix[modelViewMatrix.length-1], instanceMatrix);
    gl.uniformMatrix4fv( modelViewMatrixLoc,  false, flatten(t)   );
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );

}

//----------------------------------------------------------------------------


var render = function() {

    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

    modelViewMatrix.push(rotate(theta[Base], vec3(0, 1, 0 )));
    base();

    modelViewMatrix.push( mult(modelViewMatrix[modelViewMatrix.length-1], translate(0.0, BASE_HEIGHT, 0.0)) );
    modelViewMatrix.push(mult(modelViewMatrix[modelViewMatrix.length-1], rotate(theta[LowerArm], vec3(0, 0, 1 ))));
    lowerArm();

    modelViewMatrix.push(mult(modelViewMatrix[modelViewMatrix.length-1], translate(0.0, LOWER_ARM_HEIGHT, 0.0)));
    modelViewMatrix.push(mult(modelViewMatrix[modelViewMatrix.length-1], rotate(theta[UpperArm], vec3(0, 0, 1))));
    modelViewMatrix.push(mult(modelViewMatrix[modelViewMatrix.length-1], rotate(theta[LowerClawRot], vec3(0, 1, 0 ))));

    upperArm();
    
    modelViewMatrix.push(mult(modelViewMatrix[modelViewMatrix.length-1], translate(0.0, UPPER_ARM_HEIGHT, 0.0)));
    modelViewMatrix.push(mult(modelViewMatrix[modelViewMatrix.length-1], rotate(theta[LowerClaw], vec3(0, 0, 1))));

    
    lowerClaw();
    
    modelViewMatrix.push(mult(modelViewMatrix[modelViewMatrix.length-1], translate(0.0, LOWER_CLAW_HEIGHT, 0.0)));
    modelViewMatrix.push(mult(modelViewMatrix[modelViewMatrix.length-1], rotate(theta[MidClaw], vec3(0, 0, 1))));
    
    midClaw();
    
    modelViewMatrix.push(mult(modelViewMatrix[modelViewMatrix.length-1], translate(0.0, MID_CLAW_HEIGHT, 0.0)));
    modelViewMatrix.push(mult(modelViewMatrix[modelViewMatrix.length-1], rotate(theta[UpperClaw], vec3(0, 0, 1))));
    
    upperClaw();
    
    modelViewMatrix.pop();
    modelViewMatrix.pop();
    modelViewMatrix.pop();
    modelViewMatrix.pop();
    modelViewMatrix.pop();
    modelViewMatrix.pop();
    modelViewMatrix.pop();
    modelViewMatrix.pop();
    
    modelViewMatrix.push(mult(modelViewMatrix[modelViewMatrix.length-1], rotate(theta[UpperArm], vec3(0, 0, 1))));
    modelViewMatrix.push(mult(modelViewMatrix[modelViewMatrix.length-1], rotate(-theta[LowerClawRot], vec3(0, 1, 0 ))));
    
    modelViewMatrix.push(mult(modelViewMatrix[modelViewMatrix.length-1], translate(0.0, UPPER_ARM_HEIGHT, 0.0)));
    modelViewMatrix.push(mult(modelViewMatrix[modelViewMatrix.length-1], rotate(-theta[LowerClaw], vec3(0, 0, 1))));
    //modelViewMatrix.push(mult(modelViewMatrix[modelViewMatrix.length-1], rotate(-theta[LowerClawRot], vec3(1, 0, 0))));
    
    lowerClaw();
    
    modelViewMatrix.push(mult(modelViewMatrix[modelViewMatrix.length-1], translate(0.0, LOWER_CLAW_HEIGHT, 0.0)));
    modelViewMatrix.push(mult(modelViewMatrix[modelViewMatrix.length-1], rotate(-theta[MidClaw], vec3(0, 0, 1))));
    
    midClaw();
    
    modelViewMatrix.push(mult(modelViewMatrix[modelViewMatrix.length-1], translate(0.0, MID_CLAW_HEIGHT, 0.0)));
    modelViewMatrix.push(mult(modelViewMatrix[modelViewMatrix.length-1], rotate(-theta[UpperClaw], vec3(0, 0, 1))));
    
    upperClaw();
    
    if(auto){
        for(var i = 0; i < theta.length; i++){
            if(theta[i] > maxTheta[i]){
                thetaInc[i] = 0;
            }
            else if(theta[i] < minTheta[i]){
                thetaInc[i] = 1;
            }
            if(thetaInc[i] == 1){
               theta[i] += rotSpeed + 1/10;
            }
            else{
                theta[i] -= rotSpeed;
            }
        }
    }
    
    

//printm(modelViewMatrix);

    requestAnimationFrame(render);
}
