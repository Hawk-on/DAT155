"use strict";

let shadedCube2 = function() {

let canvas;
let gl;

let numVertices  = 36;

let pointsArray = [];
let normalsArray = [];

let vertices = [
        vec4( -0.5, -0.5,  0.5, 1.0 ),
        vec4( -0.5,  0.5,  0.5, 1.0 ),
        vec4( 0.5,  0.5,  0.5, 1.0 ),
        vec4( 0.5, -0.5,  0.5, 1.0 ),
        vec4( -0.5, -0.5, -0.5, 1.0 ),
        vec4( -0.5,  0.5, -0.5, 1.0 ),
        vec4( 0.5,  0.5, -0.5, 1.0 ),
        vec4( 0.5, -0.5, -0.5, 1.0 )
    ];


    let lightPosition = vec4(1.0, 1.0, 1.0, 0.0 );
    let lightAmbient = vec4(0.2, 0.2, 0.2, 1.0 );
    let lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
    let lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );


    // Polished silver
    let materialAmbient = vec4( 0.23125, 0.23125, 0.23125, 1.0 );
    let materialDiffuse = vec4( 0.2775, 0.2775, 0.2775, 1.0);
    let materialSpecular = vec4( 0.773911, 0.773911, 0.773911, 1.0 );
    let materialShininess = 89.6;


let ctm;
let ambientColor, diffuseColor, specularColor;
let modelViewMatrix, projectionMatrix;
let viewerPos;
let program;

let xAxis = 0;
let yAxis = 1;
let zAxis = 2;
let axis = 0;
let theta = vec3(0, 0, 0);

let thetaLoc;

let flag = false;

function quad(a, b, c, d) {

     let t1 = subtract(vertices[b], vertices[a]);
     let t2 = subtract(vertices[c], vertices[b]);
     let normal = cross(t1, t2);
     normal = vec3(normal);


     pointsArray.push(vertices[a]);
     normalsArray.push(normal);
     pointsArray.push(vertices[b]);
     normalsArray.push(normal);
     pointsArray.push(vertices[c]);
     normalsArray.push(normal);
     pointsArray.push(vertices[a]);
     normalsArray.push(normal);
     pointsArray.push(vertices[c]);
     normalsArray.push(normal);
     pointsArray.push(vertices[d]);
     normalsArray.push(normal);
}


function colorCube()
{
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}


window.onload = function init() {
    canvas = document.getElementById( "gl-canvas" );

    gl = canvas.getContext('webgl2');
    if (!gl) { alert( "WebGL 2.0 isn't available" ); }


    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders2( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    colorCube();

    let nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW );

    let normalLoc = gl.getAttribLocation( program, "aNormal" );
    gl.vertexAttribPointer( normalLoc, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( normalLoc );

    let vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW );

    let positionLoc = gl.getAttribLocation(program, "aPosition");
    gl.vertexAttribPointer(positionLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);

    thetaLoc = gl.getUniformLocation(program, "theta");

    viewerPos = vec3(0.0, 0.0, -20.0 );

    projectionMatrix = ortho(-1, 1, -1, 1, -100, 100);

    let ambientProduct = mult(lightAmbient, materialAmbient);
    let diffuseProduct = mult(lightDiffuse, materialDiffuse);
    let specularProduct = mult(lightSpecular, materialSpecular);

    document.getElementById("ButtonX").onclick = function(){axis = xAxis;};
    document.getElementById("ButtonY").onclick = function(){axis = yAxis;};
    document.getElementById("ButtonZ").onclick = function(){axis = zAxis;};
    document.getElementById("ButtonT").onclick = function(){flag = !flag;};

    gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"),
       ambientProduct);
    gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"),
       diffuseProduct );
    gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"),
       specularProduct );
    gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"),
       lightPosition );

    gl.uniform1f(gl.getUniformLocation(program,
       "shininess"),materialShininess);

    gl.uniformMatrix4fv( gl.getUniformLocation(program, "projectionMatrix"),
       false, flatten(projectionMatrix));
    render();
};

let render = function(){

    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    if(flag) theta[axis] += 2.0;

    modelViewMatrix = mat4();
    modelViewMatrix = mult(modelViewMatrix, rotate(theta[xAxis], vec3(1, 0, 0)));
    modelViewMatrix = mult(modelViewMatrix, rotate(theta[yAxis], vec3(0, 1, 0)));
    modelViewMatrix = mult(modelViewMatrix, rotate(theta[zAxis], vec3(0, 0, 1)));

    //console.log(modelView);

    gl.uniformMatrix4fv( gl.getUniformLocation(program,
            "modelViewMatrix"), false, flatten(modelViewMatrix) );

    gl.drawArrays( gl.TRIANGLES, 0, numVertices );


    requestAnimationFrame(render);
}

};

shadedCube2();