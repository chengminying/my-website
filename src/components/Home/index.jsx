import React, { useRef, useEffect } from "react";
import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import "./index.less";

export default function Home() {
  const container = useRef(null);

  useEffect(() => {
    let scene = new THREE.Scene();
    scene.background = new THREE.Color(0xb9d3ff);
    const width = window.innerWidth; //窗口宽度
    const height = window.innerHeight; //窗口高度
    const k = width / height; //窗口宽高比
    let camera = new THREE.PerspectiveCamera(45, k, 0.1, 1000);
    camera.position.set(20, 30, 20); //设置相机位置
    camera.lookAt(camera.position); //设置相机方向(指向的场景对象)
    var point = new THREE.PointLight(0xffffff);
    point.position.set(40, 20, 30); //点光源位置
    scene.add(point); //点光源添加到场景中
    //环境光
    const ambient = new THREE.AmbientLight(0x888888, 1);
    scene.add(ambient);
    let renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height); //设置渲染区域尺寸
    const diGeo = new THREE.PlaneBufferGeometry(400, 400);
    const diMaterial = new THREE.MeshStandardMaterial({
      color: 0x09d3ff,
    });
    const diMesh = new THREE.Mesh(diGeo, diMaterial);
    diMesh.rotateX(-Math.PI / 2);
    scene.add(diMesh);
    var axesHelper = new THREE.AxesHelper(200);
    scene.add(axesHelper);
    container.current.appendChild(renderer.domElement);
    new OrbitControls(camera, renderer.domElement);
    window.addEventListener("resize", onWindowResize, false);
    function onWindowResize() {
      renderer.setSize(window.innerWidth, window.innerHeight);
    }
    function renderAnimation() {
      requestAnimationFrame(renderAnimation);
      renderer.render(scene, camera);
    }
    renderAnimation();

    return () => {
      window.removeEventListener("resize", () => {});
      scene.dispose();

      //清空当前webgl上下文
      const gl = renderer.domElement.getContext("webgl");
      gl && gl.getExtension("WEBGL_lose_context").loseContext();

      //赋空
      scene = undefined;
      camera = undefined;
      renderer = undefined;
    };
  }, []);

  return (
    <div className="home-container" ref={(ref) => (container.current = ref)}>
    </div>
  );
}
