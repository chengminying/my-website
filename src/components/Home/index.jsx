import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { CSS3DRenderer, CSS3DSprite, CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer';
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import TWEEN from "@tweenjs/tween.js";
import "./index.less";
import { withRouter, Link } from "react-router-dom";
import { Modal, Button } from "antd";
import { getHomeShow } from "../../axios/http";

const queryParam = "/cheng76735206";

const URL = "https://chengmy.oss-cn-hangzhou.aliyuncs.com/MyWebsite/";

const isDevelopment = process.env.NODE_ENV === "development";

export default withRouter(function Home(props) {

  const container = useRef(null);
  const managePage = useRef(null);

  const immutable = useRef({
    scene: new THREE.Scene(),
    camera: new THREE.PerspectiveCamera(45, 1, 0.1, 10000),
    // renderer: new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance", }),
    renderer: new CSS3DRenderer(),
    loadManager: new THREE.LoadingManager(),
    ori: undefined, //orbitControl 只在本地有效
    raycaster: new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(), 0, 10),
    selectObjects: [],
    velocity: new THREE.Vector3(), //delta时间内位移的距离 
    direction_v: new THREE.Vector3(), //相机位移方向
    // direction: { //键盘输入的方向
    //   forward: false,
    //   backward: false,
    //   left: false,
    //   right: false
    // },

    itemNum: 0, //旋转的个数
    Objects: [],
    positionArrays: [],
    index: 0,
    isStart: true, //

    roomModel: null,
    clock: new THREE.Clock(), //时钟，取delta 也可以使用performance.now
    requestAnimationFrame: window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame,
    cancelAnimationFrame: window.cancelAnimationFrame || window.mozCancelAnimationFrame,
    animationFrame: undefined,
    intervals: []
  });

  const [isModalVisible, setIsModalVisible] = useState(true);
  // const [modelButton, setModelButton] = useState(false);


  const scene = immutable.current.scene;
  const renderer = immutable.current.renderer;
  const camera = immutable.current.camera;
  camera.lookAt(0, 0, 0);
  camera.position.set(0, 0, 1000);

  const pathname = props.location.pathname;

  const requestAnimationFrame = immutable.current.requestAnimationFrame;
  const cancelAnimationFrame = immutable.current.cancelAnimationFrame;


  // const showModal = () => {
  //   setModelButton(true);
  // };

  // const hideModal = () => {
  //   const control = immutable.current.control;
  //   if(!control) return ;
  //   control.lock();
    
  // }

  // const startRoaming = () => {
  //   setIsModalVisible(false);
  //   const control = immutable.current.control;
  //   if(!control) return ;
  //   control.lock();
  // }

  useEffect(() => {
    scene.background = new THREE.Color(0x000000);

    const width = container.current.clientWidth; //窗口宽度
    const height = container.current.clientHeight; //窗口高度
    const k = width / height; //窗口宽高比
    camera.aspect = k;

    renderer.setSize(width, height); //设置渲染区域尺寸
    const domElement = renderer.domElement;
    domElement.style.position = 'absolute';
    domElement.className = "CSS3DRenderer"
    domElement.style.top = 0  + "px";
    domElement.style.left = 0  + "px";
    domElement.style.width = "100%";
    domElement.style.height = "100%";
    container.current.appendChild(domElement); //把渲染器添加到dom中
    // renderer.extensions.get("WEBGL_lose_context");

    //第三人称漫游相机
    // const control = immutable.current.control = new PointerLockControls(camera, renderer.domElement);

    // control.addEventListener( 'lock', function () {
    //   setModelButton(false);
    // })

    // control.addEventListener( 'unlock', function () {
    //   showModal();
    // } );

    //获取所有显示在主页的文章
    getHomeShow().then(res => {
      if(res.data.success) {
        immutable.current.itemNum = res.data.data.length;
        helix(res.data.data)
      }
    });

    window.addEventListener("resize", onWindowResize, false);

    addOrbitCamera();
    // addLights();
    // addGround();
    // addAxes();
    // drawCanvas();

    //renderer
    renderAnimation();

    return () => {
      window.removeEventListener("resize", () => {});
      cancelAnimationFrame(immutable.current.animationFrame);
      scene.dispose();
      stopInterval();
      //清空当前webgl上下文
      // renderer.context.canvas.addEventListener("webglcontextlost", e => {
      //   console.log(e, "webgl上下文已卸载");
      // })
      // renderer.forceContextLoss();
      
    };
  }, []);

  function helix(items) {
    const radius = 400;
    const group = new THREE.Group();
    group.name = "图例";
    for (let i = 0; i < items.length; i++) {
      const element = document.createElement("div");
      element.className = "objectCSS-ele";
      element.style.width = "10rem";
      element.style.height = "7rem";
      element.style.backgroundRepeat = "no-repeat";
      element.style.backgroundSize = "100% 100%";
      element.style.backgroundImage = `url(${items[i].imageURL})`;
      element.style.cursor = "pointer";
      element.style.opacity = 0.5;

      element.id = items[i].title;

      element.onclick = () => {
        props.history.push({"pathname": "/page", "query": {path: items[i].path, title: items[i].title}});
        // this.stopInterval();
        // this.handleRelative(element.id, 'tab');
      }

      const theta = (i / items.length) * Math.PI * 2;
      const objectCSS = new CSS3DObject(element);

      objectCSS.name = i;
      objectCSS.lookAt(0, 0, 1000);

      objectCSS.position.setFromCylindricalCoords(radius, theta, 0);

      immutable.current.positionArrays.push(new THREE.Vector3().copy(objectCSS.position));
      immutable.current.Objects.push(objectCSS);

      group.add(objectCSS);
      // immutable.current.scene.add(objectCSS);
      
      //第一个开始的透明度 为1 其他的 为默认值
      immutable.current.Objects[0].element.style.opacity = 1;
    }

    const scale = 1.2;
    immutable.current.Objects[0].scale.set(scale, scale, scale);
    immutable.current.scene.add(group);

    //开始的时候发送回调

    //循环
    startInterval();

  }

  function startInterval() {
    immutable.current.intervals = setInterval(() => {
      move();
    }, 4000);
  }

   function move() {
    // this.isStart = true;
    animation();
    immutable.current.index++;
    if(immutable.current.index === immutable.current.itemNum) immutable.current.index = 0;
  }

  function stopInterval() {
    clearInterval(immutable.current.intervals);
    // this.isStart = false;
  }

  function animation() {
    const duration = 2000;
    const scale = 1.2;
    const opacity = 0.5;
    let s = {}, t = {};
    for (let i = 0; i < immutable.current.itemNum; i++) {

      s["sx" + i] = immutable.current.positionArrays[i].x;
      s["sy" + i] = immutable.current.positionArrays[i].y; 
      s["sz" + i] = immutable.current.positionArrays[i].z;

      const n = i + 1 > immutable.current.itemNum - 1 ? 0 : i + 1;
      t["sx" + i] = immutable.current.positionArrays[n].x;
      t["sy" + i] = immutable.current.positionArrays[n].y; 
      t["sz" + i] = immutable.current.positionArrays[n].z;

    }

    new TWEEN.Tween({ ...s, scale: 1, opacity })
      .to({ ...t, scale, opacity: 1 }, duration)
      .onUpdate((pos) => {
        for (let i = 0; i < immutable.current.itemNum; i++) {
          immutable.current.Objects[i].position.set(pos["sx" + i], pos["sy" + i], pos["sz" + i]);
          if(i === immutable.current.itemNum - 1) {
            immutable.current.Objects[i].scale.set(pos.scale, pos.scale, pos.scale);
            immutable.current.Objects[i].element.style.opacity = pos.opacity;
          }
          if(i === 0) {
            immutable.current.Objects[i].scale.set(scale + 1 - pos.scale, scale + 1 - pos.scale, scale + 1 - pos.scale);

            immutable.current.Objects[i].element.style.opacity = 1 - pos.opacity + opacity;

          }
        }
      })
      .onComplete(() => {
        const obj = immutable.current.Objects.pop();
        immutable.current.Objects.unshift(obj);
      })
      .start();
  }


  function addOrbitCamera () {
    const ori = immutable.current.ori = new OrbitControls(camera, renderer.domElement);
    ori.update();
  }
  
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
      fbx.position.y = 50;
      immutable.current.roomModel = fbx;
      // console.log(fbx);
      scene.add(fbx);
    })
  }

  // function keyboardEvents () {
  //   const direction = immutable.current.direction;
    
  //   const onKeyDown = function ( event ) {
  //     const control = immutable.current.control;
  //     if(!control.isLocked) return;
  //     switch ( event.keyCode ) {
  //       case 38: // up
  //       case 87: // w
  //         direction.forward = true;
  //         break;
  //       case 37: // left
  //       case 65: // a
  //         direction.left = true;
  //         break;
  //       case 40: // down
  //       case 83: // s
  //         direction.backward = true;
  //         break;
  //       case 39: // right
  //       case 68: // d
  //         direction.right = true;
  //         break;
  //       default: 
  //       break;
  //     }
  //   };

  //   const onKeyUp = function ( event ) {
  //     const control = immutable.current.control;
  //     if(!control.isLocked) return;
  //     switch ( event.keyCode ) {
  //       case 38: // up
  //       case 87: // w
  //         direction.forward = false;
  //         break;
  //       case 37: // left
  //       case 65: // a
  //         direction.left = false;
  //         break;
  //       case 40: // down
  //       case 83: // s
  //         direction.backward = false;
  //         break;
  //       case 39: // right
  //       case 68: // d
  //         direction.right = false;
  //         break;
  //       default: break;
  //     }
  //   };

  //   document.addEventListener( 'keydown', onKeyDown, false );
  //   document.addEventListener( 'keyup', onKeyUp, false );
  // }

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
    // console.log(geo);
    const mat = new THREE.MeshStandardMaterial({
      color: 0x09d3ff,
    });
    const m = new THREE.Mesh(geo, mat);
    m.rotateX(-Math.PI / 2);
    // scene.add(m);
  }

  function addAxes() {
    const a = new THREE.AxesHelper(2000);
    scene.add(a);
  }

  function onWindowResize() {
    immutable.current.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  // function moveCamera() {

  //   const direction = new THREE.Vector3();
  //   // const velocity = immutable.current.velocity;
  //   const velocity = new THREE.Vector3();
  //   const delta = immutable.current.clock.getDelta();
  //   // console.log(immutable.current.direction);
  //   const { forward, backward, left, right } = immutable.current.direction;
  //   // console.log(forward, backward, left, right);
  //   if(!forward && !backward && !left && !right) return;
  //   velocity.x = velocity.x * delta;                       
  //   velocity.z = velocity.z * delta;
  //   direction.x = Number(right) - Number(left);
  //   direction.z = Number(forward) - Number(backward);

  //   console.log(camera);
  //   //检测碰撞
  //   const model = immutable.current.roomModel;
  //   const control = immutable.current.control;
  //   const raycaster = immutable.current.raycaster;
  //   let intersectObjects = [];
  //   let intersectObjects_long = [];
  //   raycaster.ray.origin.copy(immutable.current.camera.position); //位置
  //   raycaster.ray.direction = new THREE.Vector3(direction.x, 0, direction.z).applyMatrix4(immutable.current.camera.matrix); //方向
  //   // raycaster.ray.direction.y = 0;
  //   //新创建一个射线，防止一条射线 检测碰撞时 遇到卡死问题
  //   const ray_long = new THREE.Raycaster(raycaster.ray.origin, raycaster.ray.direction, 0, 12);
    
  //   if(model) intersectObjects = raycaster.intersectObject(model, true);
  //   if(model) intersectObjects_long = ray_long.intersectObject(model, true);

  //   console.log(raycaster.ray.direction);
  //   // console.log(intersectObjects);
  //   // console.log(intersectObjects_long, "----long----");
  //   if(intersectObjects.length === 0 && intersectObjects_long.length > 0) {
  //     // console.log(raycaster.ray.direction, "direction");
  //     // console.log(intersectObjects.length);
  //     //射线碰到第一个物体的距离
  //     // console.log(intersectObjects[0]);
  //     return ;
  //   } ;

   

  //   if(forward || backward) velocity.z = direction.z * 40 * delta;
  //   if(left || right) velocity.x = direction.x * 40 * delta;

  //   // console.log(velocity.x);
  //   control.moveRight(velocity.x);
  //   control.moveForward(velocity.z);
  // }

  function renderAnimation() {
    TWEEN.update();
    renderer.render(scene, camera);
    immutable.current.animationFrame = requestAnimationFrame(renderAnimation);
  }

  function handleDoubleClick(e) {
    let selectObjects = immutable.current.selectObjects;
    selectObjects = intersect(e);
    if (selectObjects[0] && selectObjects[0].object.name === "跳转") {
      props.history.push({"pathname": "/page", "query": {path: "math", title: "perlin噪声"}});
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
      {/* <video muted autoPlay src="" /> */}
      {/* <Modal
        visible={isModalVisible}
        footer={null}
        closable={false}
        maskClosable={false}
        centered={true}
        keyboard={false}
        width="22rem"
        bodyStyle={{display: "flex", flexDirection: "column"}}
      >
        <p style={{textAlign: "center"}}>点击开始漫游，按ESC退出漫游</p>
        <img style={{width: "20rem", height: "10rem"}} src="http://chengmy.oss-cn-hangzhou.aliyuncs.com/MyWebsite/wasd.png" alt=""/>
        <p>使用WASD或者上⬆下⬇左⬅右➡来控制移动方向</p>
        <p>使用鼠标控制镜头朝向</p>
        <p>需要点击时，退出漫游点击即可</p>
        <Button onClick={startRoaming}>开始漫游</Button>
      </Modal> */}
      {/* <Modal
        visible={modelButton}
        footer={null}
        closable={false}
        maskClosable={false}
        keyboard={false}
        width={0}
        mask={false}
        style={{marginTop: '-5rem', marginLeft: "1rem"}}
      >
        <Button onClick={hideModal}>开始漫游</Button>
      </Modal> */}
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
