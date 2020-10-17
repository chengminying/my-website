import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import "./index.less";
import { withRouter, Link } from "react-router-dom";
import { Modal, Button } from "antd";

const queryParam = "/cheng76735206";

const URL = "https://chengmy.oss-cn-hangzhou.aliyuncs.com/MyWebsite/";

export default withRouter(function Home(props) {
  const container = useRef(null);
  const managePage = useRef(null);

  const immutable = useRef({
    scene: new THREE.Scene(),
    camera: new THREE.PerspectiveCamera(45, 1, 0.1, 1000),
    renderer: new THREE.WebGLRenderer({ antialias: true }),
    loadManager: new THREE.LoadingManager(),
    selectObjects: [],
    moveBackward: false,
    moveForward: false,
    moveLeft: false,
    moveRight: false,
  });

  const scene = immutable.current.scene;
  const renderer = immutable.current.renderer;
  const camera = immutable.current.camera;

  const pathname = props.location.pathname;

  useEffect(() => {
    scene.background = new THREE.Color(0xb9d3ff);

    const width = container.current.clientWidth; //窗口宽度
    const height = container.current.clientHeight; //窗口高度
    const k = width / height; //窗口宽高比
    camera.aspect = k;
    camera.position.set(20, 30, 20); //设置相机位置
    camera.lookAt(camera.position); //设置相机方向(指向的场景对象)

    renderer.setSize(width, height); //设置渲染区域尺寸

    container.current.appendChild(renderer.domElement); //把渲染器添加到dom中
    immutable.current.control = new PointerLockControls(camera, renderer.domElement);

    window.addEventListener("resize", onWindowResize, false);

    addLights();
    addGround();
    addAxes();
    drawCanvas();
    loadRoom();

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

  
  function loadRoom() {
    const fbxLoader = new FBXLoader(immutable.current.loadManager).setPath(URL);
    fbxLoader.load("CMYRoom.fbx", fbx => {
      fbx.scale.multiplyScalar(0.5);
      fbx.traverse(v => {
        if(!v.isMesh) return;
        v.material = new THREE.MeshPhysicalMaterial({
          side: THREE.DoubleSide,
          color: 0xffffff,
        })
      })
      fbx.position.y = 0;
      console.log(fbx);
      scene.add(fbx);
    })
  }

  function keyboardEvents () {
    let moveBackward = immutable.current.moveBackward;
    let moveForward = immutable.current.moveForward;
    let moveLeft = immutable.current.moveLeft;
    let moveRight = immutable.current.moveRight;
    
    const onKeyDown = function ( event ) {
      switch ( event.keyCode ) {
        case 38: // up
        case 87: // w
          moveForward = true;
          break;
        case 37: // left
        case 65: // a
          moveLeft = true;
          break;
        case 40: // down
        case 83: // s
          moveBackward = true;
          break;
        case 39: // right
        case 68: // d
          moveRight = true;
          break;
        // case 32: // space
        //   if ( canJump === true ) velocity.y += 350;
        //   canJump = false;
        //   break;
        default: 
        break;
      }
    };

    const onKeyUp = function ( event ) {
      switch ( event.keyCode ) {
        case 38: // up
        case 87: // w
          moveForward = false;
          break;
        case 37: // left
        case 65: // a
          moveLeft = false;
          break;
        case 40: // down
        case 83: // s
          moveBackward = false;
          break;
        case 39: // right
        case 68: // d
          moveRight = false;
          break;
        default: break;
      }
    };

    document.addEventListener( 'keydown', onKeyDown, false );
    document.addEventListener( 'keyup', onKeyUp, false );
  }

  function drawCanvas() {
    const canvas = document.createElement("canvas");
    canvas.setAttribute("width", 512);
    canvas.setAttribute("height", 256);
    canvas.style.position = "absolute";

    const str = "双击击跳转文章";
    const ctx = canvas.getContext("2d");
    ctx.font = "Bold 45px Arial";
    ctx.textAlign = "center";
    ctx.fillStyle = "#ff0000";
    ctx.fillText(str, 256, 128);

    const planeGeometry = new THREE.PlaneBufferGeometry(10, 10);
    const planeMaterial = new THREE.MeshLambertMaterial({
      side: THREE.DoubleSide,
      map: new THREE.CanvasTexture(canvas),
    });

    const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
    planeMesh.position.y = 5;
    planeMesh.name = "跳转";
    scene.add(planeMesh);
  }

  function addLights() {
    //环境光
    const ambient = new THREE.AmbientLight(0x888888, 0.5);
    scene.add(ambient);
    const d = new THREE.DirectionalLight(0xffffff, 0.9);
    d.position.set(80, 60, 70);
    scene.add(d);
  }

  function addGround() {
    const geo = new THREE.PlaneBufferGeometry(400, 400);
    console.log(geo);
    const mat = new THREE.MeshStandardMaterial({
      color: 0x09d3ff,
    });
    const m = new THREE.Mesh(geo, mat);
    m.rotateX(-Math.PI / 2);
    scene.add(m);
  }

  function addAxes() {
    const a = new THREE.AxesHelper(2000);
    scene.add(a);
  }

  function onWindowResize() {
    immutable.current.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  function renderAnimation() {
    requestAnimationFrame(renderAnimation);
    const renderer = immutable.current.renderer;
    const scene = immutable.current.scene;
    const camera = immutable.current.camera;
  
    renderer.render(scene, camera);
  }

  function handleDoubleClick(e) {
    let selectObjects = immutable.current.selectObjects;
    selectObjects = intersect(e);
    if (selectObjects[0] && selectObjects[0].object.name === "跳转") {
      props.history.push("page");
    }
    // console.log(selectObjects);
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
      content: "请使用电脑端访问",
    });
  }

  return (
    <div
      className="home-container"
      ref={(ref) => (container.current = ref)}
      onDoubleClick={handleDoubleClick}
      onTouchStart={touchStart}
    >
      {pathname === queryParam ? (
        <Button
          type="primary"
          className="link-to-manage"
          ref={(ref) => (managePage.current = ref)}
        >
          <Link to="manage">跳转到后台</Link>
        </Button>
      ) : null}
    </div>
  );
});
