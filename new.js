import * as THREE from 'three';

import { RGBELoader } from './RGBELoader.js';
import { GLTFLoader } from './GLTFLoader.js';
import { IndoorControls } from './IndoorControl.js';

let camera, scene, renderer;
let group;
var controls = null;
//init();
checkForXR();


function checkForXR() {
    console.log("navigator.xr")
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
            scene.background = texture;
            scene.environment = texture;

            // Room Model
            const loader = new GLTFLoader().setPath('models/');
            loader.load('cyberpunk.glb', function (gltf) {
                group.add(gltf.scene);
                gltf.scene.traverse(function (child) {
                    if (child.name === 'floor_tiles')
                        controls.ground.push(child);
                });
            });
        });

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.autoClear = false;
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 1.6, 0);
    console.log(scene)

    controls = new IndoorControls(camera, renderer.domElement);
    let helperMaterial = new THREE.MeshBasicMaterial();
    helperMaterial.transparent = true;
    helperMaterial.opacity = 0.2;
    let helperGeometry = new THREE.CircleBufferGeometry(0.2, 64);
    let mouseHelper = new THREE.Mesh(helperGeometry, helperMaterial);

    let ringMaterial = new THREE.MeshBasicMaterial();
    ringMaterial.transparent = true;
    ringMaterial.opacity = 0.8;
    let ringGeometry = new THREE.RingBufferGeometry(0.2, 0.22, 64);
    let ring = new THREE.Mesh(ringGeometry, ringMaterial);
    mouseHelper.add(ring);
    mouseHelper.visible = false;
    mouseHelper.renderOrder = 1;
    scene.add(mouseHelper);

    controls.addEventListener('move', function (event) {
        let intersect = event.intersect;
        let normal = intersect.face.normal;
        console.log(normal);
        if (normal.y > 1) {
            mouseHelper.visible = false;
            controls.enabled_move = false;

        } else {
            console.log(normal);
            mouseHelper.position.set(0, 0, 0);
            mouseHelper.lookAt(normal);
            mouseHelper.position.copy(intersect.point);
            mouseHelper.position.addScaledVector(normal, 0.001);
            mouseHelper.visible = true;
            controls.enabled_move = true;
        }
    });

}

function hasPointerLock() {
    let havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;
    return havePointerLock;
}

function animate() {
    controls.update();
    requestAnimationFrame(animate);
    render();
}

function render() {
    renderer.render(scene, camera);
}

animate();