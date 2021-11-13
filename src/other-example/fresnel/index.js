import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import Stats from "three/examples/jsm/libs/stats.module.js";

// 使用其支持 github pages 
const url = window.location.host.includes("github.io") ? "https://media.githubusercontent.com/media/alwxkxk/threejs-example/master/static/lfs/car.glb" : "./static/lfs/car.glb";


const scene = new THREE.Scene();
const stats = new Stats();
document.body.appendChild(stats.dom);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(-3, 3, 3);
window.debugScene = scene;
window.debugCamera = camera;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

new OrbitControls(camera, renderer.domElement);
const light = new THREE.HemisphereLight(0xffffff, 0xcccccc, 1);
scene.add(light);

const animate = function () {
  renderer.render(scene, camera);

  requestAnimationFrame(animate);
  stats.update();
};
const loader = new GLTFLoader();
function handleProgress(progressEvent) {
  console.log("handleProgress", progressEvent.loaded, progressEvent.total);
  document.getElementById("loadingText").innerText = `加载模型中:${(progressEvent.loaded / progressEvent.total * 100).toFixed(0)}%`;
}

// 由于fresnel需要normal来进行计算，所以模型导出时必须带有normal。
loader.load('./static/3d/car.glb', function (gltf) {
  let object = gltf.scene;
  // // 颜色
  gltf.scene.traverse(function (child) {
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
  document.getElementById("loadingText").style.display = "none";
  console.log(gltf.scene)
  const list = [...gltf.scene.children];
  list.forEach(item => {
    changeMat(item);
  });
  scene.add(gltf.scene);

  animate();

}, handleProgress);



const vertexShader = `
varying vec3 vNormal;
varying vec3 vPositionNormal;
void main() 
{
  vNormal = normalize( normalMatrix * normal ); // 转换到视图空间
  vPositionNormal = normalize(( modelViewMatrix * vec4(position, 1.0) ).xyz);
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}
`;

const fragmentShader = `
uniform vec3 glowColor;
uniform float b;
uniform float p;
uniform float s;
varying vec3 vNormal;
varying vec3 vPositionNormal;
void main() 
{
  float a = pow( b + s * abs(dot(vNormal, vPositionNormal)), p );
  gl_FragColor = vec4( glowColor, a );
}
`;

var customMaterial = new THREE.ShaderMaterial({
  uniforms:
  {
    "s": { type: "f", value: -1.0 },
    "b": { type: "f", value: 1.0 },
    "p": { type: "f", value: 2.0 },
    glowColor: { type: "c", value: new THREE.Color(0x00ffff) }
  },
  vertexShader: vertexShader,
  fragmentShader: fragmentShader,
  side: THREE.FrontSide,
  blending: THREE.AdditiveBlending,
  transparent: true
});

function changeMat(object3d) {
  object3d.traverse(item => {
    if (item.material) {
      item.material = customMaterial;
    }
  });
}


// var geometry = new THREE.TorusKnotBufferGeometry( 10, 3, 100, 32 );
// var torusKnot = new THREE.Mesh( geometry, customMaterial );
// torusKnot.position.y = -30;
// scene.add( torusKnot );

// var geometry2 = new THREE.BoxGeometry(10,10,10);
// var cube = new THREE.Mesh( geometry2, customMaterial );
// cube.position.y = 30;
// scene.add( cube );
