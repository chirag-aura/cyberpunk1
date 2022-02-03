import * as THREE from 'three';

import { RGBELoader } from '../examples/jsm/loaders/RGBELoader.js';
import { VRButton } from '../examples/jsm/webxr/VRButton.js';
import { OrbitControls } from '../examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from '../examples/jsm/loaders/GLTFLoader.js';
import { XRControllerModelFactory } from '../examples/jsm/webxr/XRControllerModelFactory.js';
import { PointerLockControls } from '../examples/jsm/controls/PointerLockControls.js'

import { GUI } from '../examples/jsm/libs/lil-gui.module.min.js';

let camera, scene, renderer;
let group;
//let controller1, controller2;
//let controllerGrip1, controllerGrip2;
const intersected = [];
var selectedModel = new THREE.Object3D;
const tempMatrix = new THREE.Matrix4();
var i = 0;
var firsttime = true;
var clickMouse = new THREE.Vector2();
var moveMouse = new THREE.Vector2();
var raycaster = new THREE.Raycaster();
var ocontrols = null;
var cameraTarget = new THREE.Vector3(0, 1.6, 0);


//init();
checkForXR();
animate();

function checkForXR() {
    console.log(navigator.xr)
    if (navigator.xr.ondevicechange === null) {
        enableKeyboardMouse();
        console.log("WebXR Device API is not supported in this browser");
        return;
    }

    navigator.xr.isSessionSupported('immersive-vr').then(() => {
        console.log("VR supported")
        init()
    }).catch((err) => {
        //this._enableKeyboardMouse();
        console.log("VR Immersive not supported: " + err);
    });
}

function enableKeyboardMouse() {
    console.log("Mouse and keyboard enable");
    const pointerLock = hasPointerLock();
    if (!pointerLock) {
        console.log('Pointer is Locked')
        return;
    }

    scene = new THREE.Scene();
    group = new THREE.Group();
    scene.add(group);

    new RGBELoader()
        .setPath('textures/')
        .load('venice_sunset_1k.hdr', function (texture) {
            texture.mapping = THREE.EquirectangularReflectionMapping;

            texture.dispose()
            //scene.background = texture;
            scene.environment = texture;

            // Room Model
            const loader = new GLTFLoader().setPath('models/');
            loader.load('room_in_latest.glb', function (gltf) {
                group.add(gltf.scene);
                render();
            });
        });

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.autoClear = false;
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    //document.body.appendChild(VRButton.createButton(renderer));

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.25, 100);
    camera.position.set(0, 1.6, 1);
    console.log(scene)

    const ambientLight = new THREE.AmbientLight( 0x404040 ); // soft white light
    scene.add( ambientLight );
    ocontrols = new OrbitControls(camera, renderer.domElement);
    ocontrols.addEventListener('change', render); // use if there is no animation loop
    ocontrols.minDistance = 1;
    ocontrols.maxDistance = 10;
    
    ocontrols.minPolarAngle = Math.PI/2; // radians
    ocontrols.maxPolarAngle = Math.PI/2;
    ocontrols.minAzimuthAngle = - Infinity; // radians
    ocontrols.maxAzimuthAngle = Infinity;
    ocontrols.target.set(0, 1.6, 0);
    //ocontrols.target.set(new THREE.Vector3(camera.position.x, camera.position.y, camera.position.z));
    
    ocontrols.update();

    const controls = new PointerLockControls(camera, document.body);
    scene.add(controls.getObject());
    controls.getObject().position.y = 1;
    //camera.lookAt(new THREE.Vector3(0, 1, 1));

    document.addEventListener( 'mousedown', onMousedown, false );
    document.addEventListener( 'mousemove', onMouseMove, false );

}

function onMouseMove(event){
    moveMouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	moveMouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

}

function dragObject(){
    //console.log(selectedModel);
    if(selectedModel!= null){
        raycaster.setFromCamera(moveMouse, camera);
        const found = raycaster.intersectObjects(scene.children)
        //console.log(found)
        if(found.length>0){
            for(let o of found){
                if (o.object.name!=='floor_tiles')
                continue
                
                let target = found[i].point;
                selectedModel.position.x = target.x
                selectedModel.position.z = target.z
            }
        }
    }
}

function onMousedown(event){

    if(selectedModel){
        console.log(selectedModel)
        selectedModel = null;
        return;
    }

    clickMouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	clickMouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    //var intersection = itemIntersection(mouse, group.children[0].children[0].children[0].children);
    
    raycaster.setFromCamera( clickMouse, camera );
    
    const intersects = raycaster.intersectObjects( scene.children );
    
    if(intersects.length>0){
        if(intersects[0].object.name!=='floor_tiles'){    
            selectedModel = intersects[0].object;
        }
        else{
            // camera.position.x = intersects[0].point.x;
            // camera.position.z = intersects[0].point.z;
            cameraTarget.set(intersects[0].point.x, 1.6, intersects[0].point.z);
            //camera.position.lerp(cameraTarget, .1)
            ocontrols.target.set(camera.position.x, 1.6, camera.position.z);
        }
    }
    
    // ocontrols.update();
    // selectedModel.push(intersects[0].object)
    //console.log(selectedModel)
    //selectedModel.material.emissive.b = 1;
    // console.log(selectedModel);

}

function hasPointerLock() {
    let havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;
    return havePointerLock;
}

function init() {

    scene = new THREE.Scene();
    group = new THREE.Group();
    scene.add(group);

    new RGBELoader()
        .setPath('textures/')
        .load('venice_sunset_1k.hdr', function (texture) {
            texture.mapping = THREE.EquirectangularReflectionMapping;

            texture.dispose()
            scene.background = texture;
            scene.environment = texture;

            // Room Model
            const loader = new GLTFLoader().setPath('models/');
            loader.load('room_in_latest.glb', function (gltf) {
                group.add(gltf.scene);
                render();
            });
        });

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.25, 200);
    camera.position.set(- 1.8, 0.6, 2.7);

    const light = new THREE.AmbientLight(1); // soft white light
    scene.add(light);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.autoClear = false;
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true;
    document.body.appendChild(renderer.domElement);

    document.body.appendChild(VRButton.createButton(renderer));

    window.addEventListener('resize', onWindowResize);

    //

    const geometry = new THREE.BufferGeometry();
    geometry.setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, - 5)]);

    const controller1 = renderer.xr.getController(0);
    controller1.addEventListener('selectstart', onSelectStart);
    controller1.addEventListener('squeezestart', onSqueezeStart);

    controller1.addEventListener('selectend', onSelectEnd);
    controller1.addEventListener('squeezeend', onSqueezeEnd);
    controller1.add(new THREE.Line(geometry));
    scene.add(controller1);

    const controller2 = renderer.xr.getController(1);
    controller2.addEventListener('selectstart', onPositionSelectStart);
    controller2.addEventListener('selectend', onPositionSelectEnd);
    controller2.add(new THREE.Line(geometry));
    scene.add(controller2);

    //

    const controllerModelFactory = new XRControllerModelFactory();

    const controllerGrip1 = renderer.xr.getControllerGrip(0);
    controllerGrip1.add(controllerModelFactory.createControllerModel(controllerGrip1));
    scene.add(controllerGrip1);

    const controllerGrip2 = renderer.xr.getControllerGrip(1);
    controllerGrip2.add(controllerModelFactory.createControllerModel(controllerGrip2));
    scene.add(controllerGrip2);

    // OrbitControls

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.addEventListener('change', render); // use if there is no animation loop
    controls.minDistance = 2;
    controls.maxDistance = 10;
    controls.target.set(0, 0, - 0.2);
    controls.update();


    // const gui = new GUI( { width: 300 } );
    // gui.add( parameters, 'radius', 0.0, 1.0 ).onChange( onChange );
    // gui.add( parameters, 'tube', 0.0, 1.0 ).onChange( onChange );
    // gui.add( parameters, 'tubularSegments', 10, 150, 1 ).onChange( onChange );
    // gui.add( parameters, 'radialSegments', 2, 20, 1 ).onChange( onChange );
    // gui.add( parameters, 'p', 1, 10, 1 ).onChange( onChange );
    // gui.add( parameters, 'q', 0, 10, 1 ).onChange( onChange );
    // gui.add( parameters, 'thickness', 0, 1 ).onChange( onThicknessChange );
    // gui.domElement.style.visibility = 'hidden';

    // const group = new InteractiveGroup( renderer, camera );
    // scene.add( group );

    // const mesh = new HTMLMesh( gui.domElement );
    // mesh.position.x = - 0.75;
    // mesh.position.y = 1.5;
    // mesh.position.z = - 0.5;
    // mesh.rotation.y = Math.PI / 4;
    // mesh.scale.setScalar( 2 );
    // group.add( mesh );

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}

function onSelectStart(event) {

    const controller = event.target;

    const intersections = getIntersections(controller);
    console.log(intersections)

    if (intersections.length > 0) {

        const intersection = intersections[0];

        const object = intersection.object;
        //object.material.emissive.b = 1;
        //controller.attach(object);

        controller.userData.selected = object;


    }

}

function onSqueezeStart(event) {

    const controller = event.target;
    const intersections = getSqueezeIntersections(controller);
    console.log(intersections)

    if (intersections.length > 0) {
        const intersection = intersections[0];
        const object = intersection.object;
        //object.material.emissive.b = 1;
        controller.attach(object);

        controller.userData.selected = object;
        //selectedModel.push(object)
    }

}

function onSqueezeEnd(event) {

    const controller = event.target;

    if (controller.userData.selected !== undefined) {

        const object = controller.userData.selected;
        object.material.emissive.b = 0;
        scene.children[6].attach(object);

        console.log(scene)
        controller.userData.selected = undefined;

    }

}

function onPositionSelectStart(event) {

    const controller = event.target;

    const intersections = getFloorIntersections(controller);

    if (intersections.length > 0) {

        const intersection = intersections[0];

        const object = intersection.object;
        object.material.emissive.b = 1;
        //controller.attach(object);

        controller.userData.selected = object;


    }

}

function onSelectEnd(event) {

    const controller = event.target;

    if (controller.userData.selected !== undefined) {

        const object = controller.userData.selected;
        object.material.emissive.b = 0;
        var textureLoader = new THREE.TextureLoader();
        var texture = textureLoader.load('lensflare.png');
        object.material.map = texture;
        group.attach(object);


        controller.userData.selected = undefined;

    }


}

function onPositionSelectEnd(event) {

    const controller = event.target;

    const available = ['star.glb', 'bomb.glb', 'microplane.glb']

    if (controller.userData.selected !== undefined) {

        const object = controller.userData.selected;
        object.material.emissive.b = 0;
        //var textureLoader = new THREE.TextureLoader();
        //var texture = textureLoader.load( 'lensflare.png' );
        //object.material.map = texture;
        //group.attach(object);
        if (firsttime) {
            const loader = new GLTFLoader().setPath('models/');
            loader.load(available[i], function (gltf) {

                gltf.scene.scale.set(0.3, 0.3, 0.3);
                scene.add(gltf.scene);
                render();

            });
        }
        else {
            const loader = new GLTFLoader().setPath('models/');
            loader.load(available[i], function (gltf) {

                gltf.scene.scale.set(0.3, 0.3, 0.3);
                scene.children[6].add(gltf.scene.children[0]);
                console.log(scene)
                render();
            });
        }
        i++;
        console.log(i);
        firsttime = false
        controller.userData.selected = undefined;
    }
}

function getIntersections(controller) {

    tempMatrix.identity().extractRotation(controller.matrixWorld);

    raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
    raycaster.ray.direction.set(0, 0, - 1).applyMatrix4(tempMatrix);

    console.log(group.children[0].children[0].children[0].children)

    return raycaster.intersectObjects(group.children[0].children[0].children[0].children, false);

}

function getSqueezeIntersections(controller) {

    tempMatrix.identity().extractRotation(controller.matrixWorld);

    raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
    raycaster.ray.direction.set(0, 0, - 1).applyMatrix4(tempMatrix);

    //console.log(scene.children)//[1].children)

    return raycaster.intersectObjects(scene.children[6].children, false);

}

function getFloorIntersections(controller) {

    tempMatrix.identity().extractRotation(controller.matrixWorld);

    raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
    raycaster.ray.direction.set(0, 0, - 1).applyMatrix4(tempMatrix);

    return raycaster.intersectObjects(group.children[0].children[0].children[0].children, false);

}

function intersectObjects(controller) {

    // Do not highlight when already selected

    if (controller.userData.selected !== undefined) return;

    const line = controller.getObjectByName('line');
    const intersections = getIntersections(controller);

    if (intersections.length > 0) {

        const intersection = intersections[0];

        const object = intersection.object;
        object.material.emissive.r = 1;
        intersected.push(object);

        line.scale.z = intersection.distance;

    } else {

        line.scale.z = 5;

    }

}

function cleanIntersected() {

    while (intersected.length) {

        const object = intersected.pop();
        object.material.emissive.r = 0;

    }

}

function animate() {
    //renderer.setAnimationLoop(render);
    requestAnimationFrame(animate)
}

function render() {
    camera.position.lerp(cameraTarget, 0.1);
    cleanIntersected();
    //dragObject();
    // intersectObjects(controller1);
    // intersectObjects(controller2);
    renderer.render(scene, camera);

}