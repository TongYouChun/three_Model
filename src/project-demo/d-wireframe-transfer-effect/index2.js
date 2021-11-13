import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const clock = new THREE.Clock();
let mixer = null; // 存放动画的mixer
let mixer2 = null;

const orbit = new OrbitControls(camera, renderer.domElement);
const light = new THREE.HemisphereLight(0xffffff, 0xcccccc, 1);
scene.add(light);
// NOTE：camera 坐标不能全为0，否则OrbitControls异常，无法移动视觉

camera.position.set(4.5, 1, -2);
orbit.update();

const animate = function () {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
    // const delta = clock.getDelta();
    // if (mixer) {
    //     // 执行动画
    //     mixer.update(delta);
    // }
    // if (mixer2) {
    //     // 执行动画2
    //     mixer2.update(delta);
    // }
};

const loader = new GLTFLoader();
loader.load("./static/3d/whole/DL.gltf", function (gltf) {
    let object = gltf.scene;
    let object2 = object.clone();
    object.traverse(function(child) {
        if (child.isMesh) {
            child.material.emissive = child.material.color;
            child.material.emissiveMap = child.material.map;
            
            // child.material.transparent = true;
            // child.material.opacity = .7;
        }
    });

    object.updateMatrixWorld();
    const box = new THREE.Box3().setFromObject(object);
    const center = box.getCenter(new THREE.Vector3());
    object.position.x += object.position.x - center.x;
    object.position.y += object.position.y - center.y;
    object.position.z += object.position.z - center.z;
    object.scale.set(1, 1, 1)
    scene.add(object);

    object2.traverse(function(child){
        if (child.isMesh) {
            child.material.emissive = child.material.color;
            child.material.emissiveMap = child.material.map;
            child.material.depthWrite = false;
            child.material.transparent = true;
            child.material.depthFunc = THREE.GreaterDepth;
            child.material.transparent = true;
        }
    })

    object2.updateMatrixWorld();
    const box2 = new THREE.Box3().setFromObject(object2);
    const center2 = box2.getCenter(new THREE.Vector3());
    object2.position.x += object2.position.x - center2.x;
    object2.position.y += object2.position.y - center2.y;
    object2.position.z += object2.position.z - center2.z;
    object2.scale.set(1, 1, 1)

    

    // scene.add(object2);
    // scene.add(horse2);

    // 利用不同的深度计算方法来实现类型于blender里的boolean效果，但并非所有角度都可行。
    const cubeGeometry = new THREE.BoxGeometry(303, 24, 304);
    const maskMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    maskMaterial.opacity = 0;
    // maskMaterial.opacity = 0.2
    const maskCube = new THREE.Mesh(cubeGeometry, maskMaterial);
    maskCube.position.set(0, 200, 0);
    scene.add(maskCube);

    setInterval(() => {
        maskCube.position.y -= 0.9;
        if(maskCube.position.y<-100){
          maskCube.position.y = 100;
        }
      }, 50);
      console.log("scene",scene);

     // 创建mixer
//   mixer = new THREE.AnimationMixer( horse );
//   mixer2 = new THREE.AnimationMixer( horse2 );
//   console.log(mixer,mixer2);
//   const clipAction = mixer.clipAction( gltf.animations[0] );
//   clipAction.play();
//   const clipAction2 = mixer2.clipAction( gltf.animations[0] );
//   clipAction2.play();
  animate();

})
