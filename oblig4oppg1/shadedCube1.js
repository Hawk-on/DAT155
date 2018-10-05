"use strict";

let materialAmbient = vec4(0.23125, 0.23125, 0.23125, 1.0);
let materialDiffuse = vec4(0.2775, 0.2775, 0.2775, 1.0);
let materialSpecular = vec4(0.773911, 0.773911, 0.773911, 1.0);
let materialShininess = 89.6;
let ambientLoc;
let diffuseLoc;
let specularLoc;
let shineLoc;
let lightPosition = vec4(1.0, 1.0, 1.0, 0.0);
let lightAmbient = vec4(0.2, 0.2, 0.2, 1.0);
let lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
let lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);
let ambientProduct;
let diffuseProduct;
let specularProduct;
let index = 0;
let gl;

// let bronze = new Farge(vec4(0.2125, 0.1275, 0.054, 1.0), vec4(0.714, 0.4284, 0.18144, 1.0), vec4(0.393548, 0.271906, 0.166721, 1.0), 25.6);
// let gold = new Farge(vec4(0.24725, 0.1995, 0.0745, 1.0), vec4(0.75164, 0.60648, 0.22648, 1.0), vec4(0.6282281, 0.555802, 0.366065, 1.0), 51.2);
// let silver = new Farge(vec4(0.19225, 0.19225, 0.19225, 1.0), vec4(0.50754, 0.50754, 0.50754, 1.0), vec4(0.508273, 0.508273, 0.508273, 1.0), 51.2);
// let polishedSilver = new Farge(vec4(0.23125, 0.23125, 0.23125, 1.0), vec4(0.2775, 0.2775, 0.2775, 1.0), vec4(0.773911, 0.773911, 0.773911, 1.0), 89.6);

let mAmbient = [vec4(0.2125, 0.1275, 0.054, 1.0), vec4(0.24725, 0.1995, 0.0745, 1.0), vec4(0.19225, 0.19225, 0.19225, 1.0), vec4(0.23125, 0.23125, 0.23125, 1.0)];
let mDiffuse = [vec4(0.714, 0.4284, 0.18144, 1.0), vec4(0.75164, 0.60648, 0.22648, 1.0), vec4(0.50754, 0.50754, 0.50754, 1.0), vec4(0.2775, 0.2775, 0.2775, 1.0)];
let mSpecular = [vec4(0.393548, 0.271906, 0.166721, 1.0), vec4(0.6282281, 0.555802, 0.366065, 1.0), vec4(0.508273, 0.508273, 0.508273, 1.0), vec4(0.773911, 0.773911, 0.773911, 1.0)];
let mShine = [25.6, 51.2, 51.2, 89.6];

// function setMaterial(){
//     if (document.getElementById("fargeatm") === 1) {
//         materialAmbient = vec4(0.2125, 0.1275, 0.054, 1.0);
//         materialDiffuse = vec4(0.714, 0.4284, 0.18144, 1.0);
//         materialSpecular = vec4(0.393548, 0.271906, 0.166721, 1.0);
//         materialShininess = 25.6;
//     } else if (document.getElementById("fargeatm") === 2) {
//         materialAmbient = vec4(0.24725, 0.1995, 0.0745, 1.0);
//         materialDiffuse = vec4(0.75164, 0.60648, 0.22648, 1.0);
//         materialSpecular = vec4(0.6282281, 0.555802, 0.366065, 1.0);
//         materialShininess = 51.2;
//     } else if (document.getElementById("fargeatm") === 3) {
//         materialAmbient = vec4(0.19225, 0.19225, 0.19225, 1.0);
//         materialDiffuse = vec4(0.50754, 0.50754, 0.50754, 1.0);
//         materialSpecular = vec4(0.508273, 0.508273, 0.508273, 1.0);
//         materialShininess = 51.2;
//     } else if (document.getElementById("fargeatm") === 4) {
//         materialAmbient = vec4(0.23125, 0.23125, 0.23125, 1.0);
//         materialDiffuse = vec4(0.2775, 0.2775, 0.2775, 1.0);
//         materialSpecular = vec4(0.773911, 0.773911, 0.773911, 1.0);
//         materialShininess = 89.6;
//     }
// }

function update() {

    materialAmbient = mAmbient[index];
    materialDiffuse = mDiffuse[index];
    materialSpecular = mSpecular[index];
    materialShininess = mShine[index];
    // alert(index);
    ambientProduct = mult(lightAmbient, materialAmbient);
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
    specularProduct = mult(lightSpecular, materialSpecular);
    gl.uniform1f(shineLoc, materialShininess);
    gl.uniform4fv(ambientLoc, ambientProduct);
    gl.uniform4fv(diffuseLoc, diffuseProduct);
    gl.uniform4fv(specularLoc, specularProduct);

}

let shadedCube1 = function() {

    let canvas;

    let numVertices = 36;

    let pointsArray = [];
    let normalsArray = [];

    let vertices = [
        vec4(-0.5, -0.5, 0.5, 1.0),
        vec4(-0.5, 0.5, 0.5, 1.0),
        vec4(0.5, 0.5, 0.5, 1.0),
        vec4(0.5, -0.5, 0.5, 1.0),
        vec4(-0.5, -0.5, -0.5, 1.0),
        vec4(-0.5, 0.5, -0.5, 1.0),
        vec4(0.5, 0.5, -0.5, 1.0),
        vec4(0.5, -0.5, -0.5, 1.0)
    ];


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
        program = initShaders1( gl, "vertex-shader", "fragment-shader" );

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

        ambientProduct = mult(lightAmbient, materialAmbient);
        diffuseProduct = mult(lightDiffuse, materialDiffuse);
        specularProduct = mult(lightSpecular, materialSpecular);

        document.getElementById("ButtonX").onclick = function(){axis = xAxis;};
        document.getElementById("ButtonY").onclick = function(){axis = yAxis;};
        document.getElementById("ButtonZ").onclick = function(){axis = zAxis;};
        document.getElementById("ButtonT").onclick = function(){flag = !flag;};


        ambientLoc = gl.getUniformLocation(program, "ambientProduct");
        diffuseLoc = gl.getUniformLocation(program, "diffuseProduct");
        specularLoc = gl.getUniformLocation(program, "specularProduct");
        shineLoc = gl.getUniformLocation(program, "shininess");
        gl.uniform4fv(ambientLoc, ambientProduct);
        gl.uniform4fv(diffuseLoc, diffuseProduct );
        gl.uniform4fv(specularLoc, specularProduct );
        gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"),
            lightPosition );
        gl.uniform1f(shineLoc, materialShininess);

        gl.uniformMatrix4fv( gl.getUniformLocation(program, "projectionMatrix"),
            false, flatten(projectionMatrix));
        render();
    };



    let render = function() {

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        if (flag) theta[axis] += 2.0;

        modelViewMatrix = mat4();
        modelViewMatrix = mult(modelViewMatrix, rotate(theta[xAxis], vec3(1, 0, 0)));
        modelViewMatrix = mult(modelViewMatrix, rotate(theta[yAxis], vec3(0, 1, 0)));
        modelViewMatrix = mult(modelViewMatrix, rotate(theta[zAxis], vec3(0, 0, 1)));

        //console.log(modelView);
        index = document.getElementById("Farge").value;

        gl.uniformMatrix4fv(gl.getUniformLocation(program,
            "modelViewMatrix"), false, flatten(modelViewMatrix));

        gl.drawArrays(gl.TRIANGLES, 0, numVertices);
        update();
        requestAnimationFrame(render);
    }
};

shadedCube1();
