import * as THREE from 'three';
import { OrbitControls } from '../examples/jsm/controls/OrbitControls.js';
import { RGBELoader } from '../examples/jsm/loaders/RGBELoader.js';
import { VRButton } from '../examples/jsm/webxr/VRButton.js';
import { GLTFLoader } from '../examples/jsm/loaders/GLTFLoader.js';
import { XRControllerModelFactory } from '../examples/jsm/webxr/XRControllerModelFactory.js';

let container;
let camera, scene, renderer;
let controller1, controller2;
let controllerGrip1, controllerGrip2;

let raycaster;
const intersected = [];
const tempMatrix = new THREE.Matrix4();
var i = 0;
var firsttime = true;

let controls, group;

init();
animate();

function init() {

    container = document.createElement('div');
    document.body.appendChild(container);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x808080);

    group = new THREE.Group();
    scene.add(group);

    new RGBELoader()
    .setPath('textures/')
    .load('venice_sunset_1k.hdr', function (texture) {
        texture.mapping = THREE.EquirectangularReflectionMapping;

        texture.dispose()
        scene.background = texture;
        scene.environment = texture;

        //JSON Room Model
        // var loader = new THREE.ObjectLoader().setPath('models/');
        // loader.load("data.json", function (scene) {
        //     group.add(scene);
        //     scene.add(scene)
        // },
        // function (xhr) {
        //     console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        // },
        // function (err) {
        //     console.error('An error happened');
        // });

        //Room Model
        const loader = new GLTFLoader().setPath('models/');
        loader.load('room_in_latest.glb', function (gltf) {
            group.add(gltf.scene);
            render();
        });
    });

    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 10);
    camera.position.set(0, 1.6, 3);

    //

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.shadowMap.enabled = true;
    renderer.xr.enabled = true;
    container.appendChild(renderer.domElement);

    document.body.appendChild(VRButton.createButton(renderer));

    // controllers

    const geometry = new THREE.BufferGeometry();
    geometry.setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, - 5)]);

    controller1 = renderer.xr.getController(0);
    controller1.addEventListener('selectstart', onSelectStart);
    controller1.addEventListener('squeezestart', onSqueezeStart);

    controller1.addEventListener('selectend', onSelectEnd);
    controller1.addEventListener('squeezeend', onSqueezeEnd);
    controller1.add(new THREE.Line(geometry));
    scene.add(controller1);

    controller2 = renderer.xr.getController(1);
    controller2.addEventListener('selectstart', onPositionSelectStart);
    controller2.addEventListener('selectend', onPositionSelectEnd);
    controller2.addEventListener('squeezestart', onLeftSqueezeStart);
    controller2.add(new THREE.Line(geometry));
    scene.add(controller2);

    const controllerModelFactory = new XRControllerModelFactory();

    controllerGrip1 = renderer.xr.getControllerGrip(0);
    controllerGrip1.add(controllerModelFactory.createControllerModel(controllerGrip1));
    scene.add(controllerGrip1);

    controllerGrip2 = renderer.xr.getControllerGrip(1);
    controllerGrip2.add(controllerModelFactory.createControllerModel(controllerGrip2));
    scene.add(controllerGrip2);

    raycaster = new THREE.Raycaster();

    //
    console.log(scene);

    controls = new OrbitControls(camera, container);
    controls.target.set(0, 1.6, 0);
    controls.update();

    //

    window.addEventListener('resize', onWindowResize);

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}

function download(filename, data) {

    console.log("In download function");
    var element = document.createElement('a');
    element.setAttribute('href','data:text/json;charset=utf-8, ' + encodeURIComponent(JSON.stringify(data)));
    element.setAttribute('download', filename);
    document.body.appendChild(element);
    element.click();
    //document.body.removeChild(element);
}

function onLeftSqueezeStart(event){
    console.log(scene.children[0].children[0].children[0]);
    var sceneData = scene.toJSON();
    //console.log(sceneData)

    download('data.json', sceneData);
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
        scene.children[5].attach(object);

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
                console.log(scene)
                scene.children[5].add(gltf.scene.children[0]);
                render();
            });
        }
        i++;
        console.log(i);
        firsttime = false
        controller.userData.selected = undefined;
    }
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
    if(scene.children[5]){return raycaster.intersectObjects(scene.children[5].children, false);}

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

//

function animate() {

    renderer.setAnimationLoop(render);

}

function render() {

    cleanIntersected();

    //intersectObjects(controller1);
    //intersectObjects(controller2);

    renderer.render(scene, camera);

}