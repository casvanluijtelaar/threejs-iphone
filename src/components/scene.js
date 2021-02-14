import React from "react"
import * as THREE from "three"
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
const OrbitControls = require('three-orbit-controls')(THREE)



class Scene extends React.Component {

    constructor () {
        super()
        this._handleScroll = this._handleScroll.bind(this);
    }

    _handleScroll(e) {
        console.log('scrolling')
    }

    componentDidMount() {


        const scene = new THREE.Scene();

        const fov = 60;
        const aspect = this.mount.offsetWidth / this.mount.offsetHeight;
        const near = 0.1;
        const far = 1500;

        this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        this.camera.position.set(0, 0, - 20);

        this.renderer = new THREE.WebGLRenderer({alpha: true});
        this.renderer.setPixelRatio(this.mount.devicePixelRatio);
        this.renderer.setSize(this.mount.offsetWidth, this.mount.offsetHeight);
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.mount.appendChild(this.renderer.domElement);

        const light = new THREE.DirectionalLight(0xffffff, 10);
        light.position.set(20, 0, 20);
        light.lookAt(scene.position);
        scene.add(light);

        const light2 = new THREE.DirectionalLight(0xffffff, 10);
        light2.position.set(-20, 0, -20);
        light2.lookAt(scene.position);
        scene.add(light2);

        const loader = new GLTFLoader();

        loader.load('./model/scene.gltf', function (gltf) {
            scene.add(gltf.scene);
            gltf.scene.rotation.x = Math.PI / 2;

        }, undefined, function (error) {
            console.error(error);
        });

        const controls = new OrbitControls(this.camera, this.renderer.domElement);
        controls.enableDamping = true;
        controls.enableZoom = false;
        controls.enablePan = false;


        this.animate = function () {
            requestAnimationFrame(this.animate.bind(this));
            this.renderer.render(scene, this.camera);
        };

        this.animate();

        window.addEventListener('resize', this.onWindowResize.bind(this), false);
        window.addEventListener('wheel', this._handleScroll);
    }

    componentWillUnmount() {
        window.removeEventListener('wheel', this._handleScroll);
    }

    onWindowResize() {
        if (this.mount) {
            this.camera.aspect = this.mount.offsetWidth / this.mount.offsetHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(this.mount.offsetWidth, this.mount.offsetHeight);
        }
    }

    render() {
        return (
            <div ref={ref => (this.mount = ref)} style={{ width: `100vw`, height: `100vh` }}></div>
        )
    }
}

export default Scene;