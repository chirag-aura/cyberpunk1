import * as THREE from 'three';

import { RGBELoader } from '../examples/jsm/loaders/RGBELoader.js';
import { OrbitControls } from '../examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from '../examples/jsm/loaders/GLTFLoader.js';

import { GUI } from '../examples/jsm/libs/lil-gui.module.min.js';

let camera, scene, renderer;
let group;
var selectedModel = new THREE.Object3D;
var clickMouse = new THREE.Vector2();
var raycaster = new THREE.Raycaster();
var ocontrols = null;
var cameraTarget = new THREE.Vector3(0, -1.6, 0);

//init();
checkForXR();


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
            });
        });

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.autoClear = false;
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 0);
    console.log(scene.children[0])

    ocontrols = new OrbitControls(camera, renderer.domElement);
    ocontrols.enablePan = false;
    ocontrols.enableZoom = false;
    ocontrols.enableDamping = true
    ocontrols.minDistance = 1;
    //ocontrols.target.copy(0, 1.6, 0);
    //ocontrols.maxDistance = 10;
    ocontrols.minPolarAngle = Math.PI/2; // radians
    ocontrols.maxPolarAngle = Math.PI/2;
    ocontrols.update();

    // const controls = new PointerLockControls(camera, document.body);
    // scene.add(controls.getObject());
    // controls.getObject().position.y = 1;

    document.addEventListener( 'dblclick', onDoubleClick, false );

}

function onDoubleClick(event){

    clickMouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	  clickMouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    
    raycaster.setFromCamera( clickMouse, camera );
    
    const intersects = raycaster.intersectObjects( scene.children );
    console.log(intersects);
    if(intersects.length>0){
        if(intersects[0].object.name!=='floor_tiles'){    
            selectedModel = intersects[0].object;
        }
        else{
            cameraTarget.set(-intersects[0].point.x, -1.6, -intersects[0].point.z);
        }
    }

}

function hasPointerLock() {
    let havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;
    return havePointerLock;
}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}

function animate() {
    requestAnimationFrame(animate);
    ocontrols.update();
    //console.log(scene.position);
    scene.position.lerp(cameraTarget, 0.1);
    
    render();
}

function render() {
    renderer.render(scene, camera);
}

animate();