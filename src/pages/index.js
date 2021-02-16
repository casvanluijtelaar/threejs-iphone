import React from "react";
import Scene from "../components/scene";

export default function Home() {
  return (
    <Scene model='./model/scene.gltf' video='./video.mp4' width='100vw' height='100vh' />
  )
}