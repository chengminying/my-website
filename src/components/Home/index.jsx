import React, { useRef, useEffect } from "react";
import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import "./index.less";
import { withRouter } from "react-router-dom";
import { Modal } from "antd";

export default withRouter(function Home(props) {
  console.log(props);
  const container = useRef(null);
  const immutable = useRef({
    scene: null,
    camera: null,
    renderer: null,
    selectObjects: [],
  })

  useEffect(() => {
    let scene = new THREE.Scene();
    immutable.current.scene = scene;
    scene.background = new THREE.Color(0xb9d3ff);
    const width = container.current.clientWidth; //窗口宽度
    const height = container.current.clientHeight; //窗口高度
    const k = width / height; //窗口宽高比
    let camera = new THREE.PerspectiveCamera(45, k, 0.1, 1000);
    immutable.current.camera = camera;
    camera.position.set(20, 30, 20); //设置相机位置
    camera.lookAt(camera.position); //设置相机方向(指向的场景对象)
    var point = new THREE.PointLight(0xffffff);
    point.position.set(40, 20, 30); //点光源位置
    scene.add(point); //点光源添加到场景中
    //环境光
    const ambient = new THREE.AmbientLight(0x888888, 1);
    scene.add(ambient);
    let renderer = new THREE.WebGLRenderer({ antialias: true });
    immutable.current.renderer = renderer;
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

    const canvas = document.createElement('canvas');
    canvas.setAttribute('width', 512);
    canvas.setAttribute('height', 256);
    canvas.style.position = 'absolute';

    const str = '双击击跳转文章';
    const ctx = canvas.getContext('2d');
    ctx.font = "Bold 45px Arial"; 
    ctx.textAlign="center";
    ctx.fillStyle = '#ff0000'
    ctx.fillText(str, 256, 128);

    const planeGeometry = new THREE.PlaneBufferGeometry(10, 10);
    const planeMaterial = new THREE.MeshLambertMaterial({
      side: THREE.DoubleSide,
      map: new THREE.CanvasTexture(canvas),
      // transparent: true,
      // opacity: 0.8
    });

    const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
    planeMesh.position.y = 5;
    planeMesh.name = "跳转"
    scene.add(planeMesh);

    renderAnimation();

    return () => {
      window.removeEventListener("resize", () => {});
      scene.dispose();
      renderer.dispose();
      //清空当前webgl上下文
      const gl = renderer.domElement.getContext("webgl");
      gl && gl.getExtension("WEBGL_lose_context").loseContext();
    };
  }, []);

  function handleDoubleClick (e) {
    let selectObjects = immutable.current.selectObjects;
    selectObjects = intersect(e);
    if(selectObjects[0] && selectObjects[0].object.name === "跳转") {
      props.history.push("page")
    }
    console.log(selectObjects);
  }

  function intersect(e) {
    const width = container.current.clientWidth;
    const height = container.current.clientHeight;
    const camera = immutable.current.camera;
    const scene = immutable.current.scene;
      
  
    const rayCaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    mouse.x = (e.nativeEvent.offsetX / width) * 2 - 1;
    mouse.y = -(e.nativeEvent.offsetY / height) * 2 + 1;

    if (!camera) return [];
    //通过鼠标点击的位置 和 当前相机矩阵 计算射线的位置
    rayCaster.setFromCamera(mouse, camera);
    //获取射线相交的对象数组, 其中元素按照距离排序

    return rayCaster.intersectObjects(scene.children, true);
  }

  function touchStart() {
    Modal.error({
      title: "暂不支持移动端",
      content: "请使用电脑端访问"
    })
  }

  return (
    <div className="home-container" ref={(ref) => (container.current = ref)} onDoubleClick={handleDoubleClick} onTouchStart={touchStart}>
      {/* <Link to="/page">文章</Link> */}
    </div>
  );
})
