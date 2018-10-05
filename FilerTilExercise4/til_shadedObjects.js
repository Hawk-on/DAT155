
let gl;
//let ViewMatrix;
//let cubeMap;
let program, program2;
window.onload = function init() {
    "use strict";

    let canvas = document.getElementById("canvas");
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) {
        alert("WebGL isn't available");
    }

    // Use this object to listen for key inputs
    let keyboardState = new THREEx.KeyboardState();

    // The camera object control's the position and orientation of the... camera
    let camera = new Camera(keyboardState);

    // Create the root SceneNode of the scene graph.
    let scene = new SceneNode(null);

    //
    // Set up our models
    //

    camera.setPosition(vec3(0, 0, 5));
    camera.forwardDirection = subtract(vec3(0,0,-1), camera.position);

    let ProjectionMatrix = perspective(60, canvas.width/canvas.height, 0.01, 1000);


    // SCENE GRAPH CODE

    //Create the sphere and add it to the scene graph
    let sphereData = generateSphere(16, 16);
    let sphereNode = new SceneNode(scene);	// scene as parent
    sphereNode.scale([100, 100, 100]);

    let boxData = generateCube();

    let sunNode = new SceneNode(scene);
    sunNode.scale([1, 1, 1]);

    // Create a non-drawable node rotating all its children around the node's point
    // in space (in this case the origo since we do not translate it). This will let us controll
    // the oribit speed instead of it following the rotation of the parent (the sun).
    let mercuryOrbitNode = new SceneNode(scene);

    let venusOrbitNode = new SceneNode(scene);
    venusOrbitNode.scale([1.5, 1.5, 1.5]);

    //Mercury
    let mercuryNode = new SceneNode(mercuryOrbitNode);
    //..
	
    //...
    //Venus
    

    //Satelite
    let satelliteData = generateCube();
    let satelliteNode = new SceneNode(moonOrbit);
    //...

    //
    //  Configure WebGL
    //

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    gl.enable(gl.DEPTH_TEST);


    //  Load shaders and initialize attribute buffers

     program = initShaders(gl, "vertex-shader", "fragment-shader");
    program2 = initShaders(gl, "vertex-shader2", "fragment-shader2");
    //let program = initShaders(gl, "vertex-shader", "fragment-shader");

    gl.useProgram(program);

    // Get all relevant uniform locations
    let ProjectionMatLocation = gl.getUniformLocation(program, "ProjectionMatrix");
    let ViewMatLocation = gl.getUniformLocation(program, "ViewMatrix");
    let ColorLocation = gl.getUniformLocation(program, "Color");
    let WorldMatLocation = gl.getUniformLocation(program, "WorldMatrix");
    let NormalMatLocation = gl.getUniformLocation(program, "NormalMatrix");
    let TextureLocation = gl.getUniformLocation(program, "texture");
    let SkyBoxLocation = gl.getUniformLocation(program, "skybox");
    let UsingLightLocation = gl.getUniformLocation(program, "usingLight");
    let LightLocation = gl.getUniformLocation(program, "light");

    let AmbientLocation = gl.getUniformLocation(program, "ambient");
    let DiffuseLocation = gl.getUniformLocation(program, "diffuse");
    let SpecularLocation = gl.getUniformLocation(program, "specular");

    // Get all relevant attribute locations
    let vPositionLocation = gl.getAttribLocation(program, "vPosition");
    let vNormalLocation = gl.getAttribLocation(program, "vNormal");
    let vTexCoordLocation = gl.getAttribLocation(program, "vTexCoord");

    let programInfo = {
        program: program,
        attributeLocations: {
            vPosition: vPositionLocation,
            vNormal: vNormalLocation,
            vTexCoord: vTexCoordLocation
        },
        uniformLocations: {
            // Uniforms set once during lifetime?
            projectionMatrix: ProjectionMatLocation,
            light: LightLocation,

            // Set once per per program
            viewMatrix: ViewMatLocation,

            // Uniforms set every draw call
            worldMatrix: WorldMatLocation,
            normalMatrix: NormalMatLocation,
            texture: TextureLocation,
            color: ColorLocation,
            usingLight: UsingLightLocation,

            // Materials
            ambientLocation: AmbientLocation,
            diffuseLocation: DiffuseLocation,
            specularLocation: SpecularLocation
        }
    };

    // Usually only need to set the projection matrix once
    gl.uniformMatrix4fv(programInfo.uniformLocations.projectionMatrix, false, flatten(ProjectionMatrix));

    // Point light
    gl.uniform4fv(programInfo.uniformLocations.light, flatten(vec4(0, 0, 0, 1)));
   
    /* Load the data into the GPU in 2 separate buffers.
     * Avoid creation of unnecessary buffers (containing exactly the same data). */

    let sphereBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, sphereBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(
        flatten([].concat(sphereData.points, sphereData.normals, sphereData.texCoords))), gl.STATIC_DRAW);

    let sphereBufferInfo = {
        buffer: sphereBuffer,
        numVertices: sphereData.numVertices
    };

    let cubeBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(
        flatten([].concat(satelliteData.points, satelliteData.normals, satelliteData.texCoords))), gl.STATIC_DRAW);

    let cubeBufferInfo = {
        buffer: cubeBuffer,
        numVertices: satelliteData.numVertices
    };



    // Load textures
    let sunTexture = configureTexture(document.getElementById("sunTexture"));
    let moonTexture = configureTexture(document.getElementById("moonTexture"));
    //...
    //
    // Add drawinfo to the SceneNodes
    //

    sunNode.addDrawable({
        bufferInfo: sphereBufferInfo,
        programInfo: programInfo,
        // Will be uploaded as uniforms
        uniformInfo: {
            color: vec4(0, 1, 1, 1),
            texture: sunTexture,
            usingLight: false,

            ambient: vec3(0, 0, 0),
            diffuse: vec3(1, 1, 1),
            specular: vec3(0, 0, 0)
        }
    });

    mercuryNode.addDrawable({
        bufferInfo: sphereBufferInfo,
        programInfo: programInfo,
        // Will be uploaded as uniforms
        uniformInfo: {
            color: vec4(0, 1, 1, 1),
            texture: mercuryTexture,
            usingLight: true,

            ambient: vec3(0, 0, 0),
            diffuse: vec3(1, 1, 1),
            specular: vec3(0, 0, 0)
        }
    });

    //...
    

   

    satelliteNode.addDrawable({
        bufferInfo: cubeBufferInfo,
        programInfo : programInfo,
        // Will be uploaded as uniforms
        uniformInfo: {
            color: vec4(1, 0, 0, 1),
            texture: satelliteTexture,
            usingLight: true,

            ambient: vec3(0, 0, 0),
            diffuse: vec3(1, 1, 1),
            specular: vec3(0, 0, 0)
        }
    });


    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    gl.enable(gl.DEPTH_TEST);

    gl.useProgram( program2 );

    let ProjectionLocation = gl.getUniformLocation(program2, "ProjectionMatrix");
    let ViewLocation = gl.getUniformLocation(program2, "ViewMatrix");
    let WorldLocation = gl.getUniformLocation(program2, "WorldMatrix");
    //let TextureLoc = gl.getUniformLocation(program, "texture");
    let SkyLocation = gl.getUniformLocation(program2, "skybox");

    // Get all relevant attribute locations
    let PositionLocation = gl.getAttribLocation(program2, "vPosition");
    let vNormalLoc = gl.getAttribLocation(program2, "vNormal");

    let programInfo2 = {
        program: program2,
        attributeLocations: {
            vPosition: PositionLocation,
            vNormal: vNormalLoc,
        },
        uniformLocations: {
            projectionMatrix: ProjectionLocation,

            // Set once per per program
            viewMatrix: ViewLocation,

            // Uniforms set every draw call
            worldMatrix: WorldLocation,
            texture: SkyLocation
        }
    };

    // Usually only need to set the projection matrix once
    gl.uniformMatrix4fv(programInfo2.uniformLocations.projectionMatrix, false, flatten(ProjectionMatrix));

    let skyBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, skyBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(flatten([].concat(boxData.points, boxData.normals))), gl.STATIC_DRAW);

    let skyBufferInfo = {
        buffer: skyBuffer,
        numVertices: boxData.numVertices
    };

    let skyBox = configureCubeMap();

    sphereNode.addDrawable({
        skyBox: true,
        bufferInfo: skyBufferInfo,
        programInfo: programInfo2,
        // Will be uploaded as uniforms
        uniformInfo: {
            texture: skyBox
        }
    });


    gl.useProgram(program);

    //
    // Set up and start the render loop
    //

    let prevTimestamp = 0;

    function step(timestamp) {

        let deltaTimestamp = timestamp - prevTimestamp;
        prevTimestamp = timestamp;

        let seconds = timestamp/1000;
        let diffSeconds = deltaTimestamp/1000;

        camera.update(deltaTimestamp);
        let ViewMatrix = camera.getViewMatrix();



        // Rotate sphereNode around itself
        sunNode.rotate([0,3600/60*diffSeconds,0]);

        // Rotate the orbitNode around itself. This will propagate to all its children(sphereNode2)
        // so they will orbit the orbitNode.
        mercuryOrbitNode.rotate([0,3600/60*diffSeconds,0]);

        //...
		
        // Update the world matrices of the entire scene graph (Since we are starting at the root node).
        scene.updateMatrices();

        
            render(SceneNode.getDrawableNodes(), ViewMatLocation, ViewLocation, ViewMatrix);

        // Ask the the browser to draw when it's convenient
        window.requestAnimationFrame(step);
    }
    // Ask the the browser to draw when it's convenient
    window.requestAnimationFrame(step);
};

function render(drawableObjects, viewMatLocation, viewLocation, ViewMatrix) {
    "use strict";

    gl.useProgram(program2);
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.uniformMatrix4fv(viewLocation, false, flatten(ViewMatrix));

    gl.useProgram(program);
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.uniformMatrix4fv(viewMatLocation, false, flatten(ViewMatrix));

    drawableObjects.forEach(function(object) {
        renderDrawable(object, ViewMatrix); // Render a drawable.
    });
}

function renderDrawable(drawable, ViewMatrix) {
    "use strict";

    let programInfo = drawable.drawInfo.programInfo;
    let attributeLocations = programInfo.attributeLocations;
    let uniformLocations = programInfo.uniformLocations;

    let bufferInfo = drawable.drawInfo.bufferInfo;
    let uniformInfo = drawable.drawInfo.uniformInfo;
    let box = drawable.drawInfo.skyBox;

    if(box){
        gl.useProgram(programInfo.program);

        gl.bindBuffer(gl.ARRAY_BUFFER, bufferInfo.buffer);

        // Set up the vertex attributes
        gl.vertexAttribPointer(attributeLocations.vPosition, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(attributeLocations.vPosition);

        if (attributeLocations.vNormal > -1) {
            // Does shader make use of normals?
            gl.vertexAttribPointer(attributeLocations.vNormal, 3, gl.FLOAT, false, 0, sizeof.vec4*bufferInfo.numVertices);
            gl.enableVertexAttribArray(attributeLocations.vNormal);
        }

        if (attributeLocations.vTexCoord > -1) {
            // Does the shader make use of texture corrdinates?
            gl.vertexAttribPointer(attributeLocations.vTexCoord, 2, gl.FLOAT, false, 0, (sizeof.vec4 + sizeof.vec3)*bufferInfo.numVertices);
            gl.enableVertexAttribArray(attributeLocations.vTexCoord);
        }

        // Upload uniforms

        // Pass the world matrix of the current object to the shader.
        gl.uniformMatrix4fv(uniformLocations.worldMatrix, false, flatten(drawable._worldMatrix));

        //if(uniformInfo.texture){
        if(box){
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, uniformInfo.texture);
            gl.uniform1i(uniformLocations.texture, 0);
        }
        // Then draw
        gl.drawArrays(gl.TRIANGLES, 0, bufferInfo.numVertices);
    } else {
        // We will use out program on a given buffer
        gl.useProgram(programInfo.program);

        gl.bindBuffer(gl.ARRAY_BUFFER, bufferInfo.buffer);

        // Set up the vertex attributes
        gl.vertexAttribPointer(attributeLocations.vPosition, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(attributeLocations.vPosition);

        if (attributeLocations.vNormal > -1) {
            // Does shader make use of normals?
            gl.vertexAttribPointer(attributeLocations.vNormal, 3, gl.FLOAT, false, 0, sizeof.vec4*bufferInfo.numVertices);
            gl.enableVertexAttribArray(attributeLocations.vNormal);
        }

        if (attributeLocations.vTexCoord > -1) {
            // Does the shader make use of texture corrdinates?
            gl.vertexAttribPointer(attributeLocations.vTexCoord, 2, gl.FLOAT, false, 0, (sizeof.vec4 + sizeof.vec3)*bufferInfo.numVertices);
            gl.enableVertexAttribArray(attributeLocations.vTexCoord);
        }

        // Upload uniforms

        // Pass the world matrix of the current object to the shader.
        gl.uniformMatrix4fv(uniformLocations.worldMatrix, false, flatten(drawable._worldMatrix));

        gl.uniform4fv(uniformLocations.color, new Float32Array(uniformInfo.color));
        //Alt benytte NomalMatrix fra MVnew.js 
        let NormalMatrix = transpose(inverse4(mult(ViewMatrix, drawable._worldMatrix)));
        let NormalMatrix3 = mat3(vec3(NormalMatrix[0]), vec3(NormalMatrix[1]), vec3(NormalMatrix[2]));

        gl.uniformMatrix3fv(uniformLocations.normalMatrix, false, flatten(NormalMatrix3));

        //if(uniformInfo.texture){
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, uniformInfo.texture);
        gl.uniform1i(uniformLocations.texture, 0);

        gl.uniform1i(uniformLocations.usingLight, uniformInfo.usingLight);

        // Set materials
        gl.uniform3fv(uniformLocations.ambientLocation, new Float32Array(uniformInfo.ambient));
        gl.uniform3fv(uniformLocations.diffuseLocation, new Float32Array(uniformInfo.diffuse));
        gl.uniform3fv(uniformLocations.specularLocation, new Float32Array(uniformInfo.specular));
        //}

        // Then draw
        gl.drawArrays(gl.TRIANGLES, 0, bufferInfo.numVertices);
    }
}

/**
 * Load an image. If a HTML-supplied image is used the width and height attributes are optional.
 * @param image {array|html img} an image to load
 * @param [width] {Number} the width of the image, optional if image is html image
 * @param [height] {Number} the heihgt of the image, optional if image is html image
 * @returns {WebGLTexture}
 */
function configureTexture(image, width, height) {
    "use strict";

    let texture = gl.createTexture();
    gl.bindTexture( gl.TEXTURE_2D, texture );
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

    if (arguments.length > 1) {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, image);
    } else {
        // We've probably been given a HTML image
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    }

    gl.generateMipmap( gl.TEXTURE_2D );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
        gl.NEAREST_MIPMAP_LINEAR );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );

    return texture;
}

function configureCubeMap(urls) {
    var ct = 0;
    var image = new Array(6);
    let cubeMap = gl.createTexture();
    var urls = [
        "images/MilkyWay/dark-s_px.jpg", "images/MilkyWay/dark-s_nx.jpg",
        "images/MilkyWay/dark-s_ny.jpg", "images/MilkyWay/dark-s_py.jpg",
        "images/MilkyWay/dark-s_pz.jpg", "images/MilkyWay/dark-s_nz.jpg"
    ];

    for(var i = 0; i < 6; i++){
        image[i] = new Image();
        image[i].onload = function () {
            ct++;
            if(ct == 6){
                //cubeMap = gl.createTexture();
                gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubeMap);
                gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
                var targets = [
                    gl.TEXTURE_CUBE_MAP_POSITIVE_X, gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
                    gl.TEXTURE_CUBE_MAP_POSITIVE_Y, gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
                    gl.TEXTURE_CUBE_MAP_POSITIVE_Z, gl.TEXTURE_CUBE_MAP_NEGATIVE_Z
                ];
                for (var j = 0; j < 6; j++) {
                    gl.texImage2D(targets[j], 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image[j]);
                    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                    gl.texParameterf(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
                }
                gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
            }
        };
        image[i].src = urls[i];
    }
    return cubeMap;
}