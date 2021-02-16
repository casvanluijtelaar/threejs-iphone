import React from "react"
import * as THREE from "three"
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
const OrbitControls = require('three-orbit-controls')(THREE)



class Scene extends React.Component {


    componentDidMount() {

        const scene = new THREE.Scene();

        const fov = 60;
        const aspect = this.mount.offsetWidth / this.mount.offsetHeight;
        const near = 0.1;
        const far = 1500;

        this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        this.camera.position.set(0, 0, - 10);

        this.renderer = new THREE.WebGLRenderer({ alpha: false });
        this.renderer.setPixelRatio(this.mount.devicePixelRatio);
        this.renderer.setSize(this.mount.offsetWidth, this.mount.offsetHeight);
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.mount.appendChild(this.renderer.domElement);

        const light = new THREE.SpotLight(0xffffff);
        light.position.copy(this.camera.position);
        light.lookAt(scene.position);
        scene.add(light);

        const ambient = new THREE.AmbientLight(0xffffff, 1);
        light.position.copy(this.camera.position);
        light.lookAt(scene.position);
        scene.add(ambient);

        // we need to render the video to the DOM in order to
        // display it in a material.
        const video = document.createElement('video');
        video.src = this.props.video;
        video.loop = true;
        // most browsers will only allow autoplay when the video
        // is muted
        video.muted = true;
        
        video.load();
        video.play();

        const videoImage = document.createElement('canvas');
        videoImage.width = 2024;
        videoImage.height = 3840;

        const videoImageContext = videoImage.getContext('2d');
        videoImageContext.fillStyle = '#0000000';
        videoImageContext.fillRect(0, 0, videoImage.width, videoImage.height);

        const videoTexture = new THREE.Texture(videoImage);
        videoTexture.minFilter = THREE.LinearFilter;
        videoTexture.magFilter = THREE.LinearFilter;

        const loader = new GLTFLoader();

        loader.load(this.props.model, function (gltf) {

            scene.add(gltf.scene);
            // rotate and move the model to center and
            // center and face the camera
            gltf.scene.rotation.x = Math.PI / 2;
            gltf.scene.rotation.z = Math.PI;
            gltf.scene.position.y = -2;

            // loop through all model elements
            gltf.scene.traverse(child => {
                // find the "screen" and replace its material
                // with the video material
                if (child.name === 'Screen_0') {
                    child.material.map = videoTexture;
                }
                // ambient light currently does not support the material
                // metalness property, so set it to a low number
                if (child.material) child.material.metalness = 0.5;

            });

        }, undefined, function (error) {
            console.error(error);
        });


        // setup camera to orbit around the center of the scene.
        const controls = new OrbitControls(this.camera, this.renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 1.8;
        controls.enableZoom = false;
        controls.enablePan = false;




        this.animate = function () {
            requestAnimationFrame(this.animate.bind(this));

            // instead rotating the object, the camera rotates around
            // the scene. that messes with the lights. I could fix this
            // properly and just rotate the object *OR* just link the light
            // to the camera :) 
            light.position.copy(this.camera.position);
            light.lookAt(scene.position);

            // draw and update the video 
            if (video.readyState === video.HAVE_ENOUGH_DATA) {
                videoImageContext.drawImage(video, 0, 0);
                if (videoTexture) videoTexture.needsUpdate = true;
            }

            this.renderer.render(scene, this.camera);
        };

        this.animate();
        // scene size is linked to the html element size its linked too. so we need to update the scene
        // size when the element size changes
        window.addEventListener('resize', this.onWindowResize.bind(this), false);
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
            <div ref={ref => (this.mount = ref)} style={{ width: this.props.width, height: this.props.height }}></div>
        )
    }
}

export default Scene;