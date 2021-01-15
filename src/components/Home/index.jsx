import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import "./index.less";
import { withRouter, Link } from "react-router-dom";
import { Modal, Button } from "antd";

const queryParam = "/cheng76735206";

const URL = "https://chengmy.oss-cn-hangzhou.aliyuncs.com/MyWebsite/";

const isDevelopment = process.env.NODE_ENV === "development";

export default withRouter(function Home(props) {
  const container = useRef(null);
  const managePage = useRef(null);

  const immutable = useRef({
    scene: new THREE.Scene(),
    camera: new THREE.PerspectiveCamera(45, 1, 0.1, 1000),
    renderer: new THREE.WebGLRenderer({ antialias: true }),
    loadManager: new THREE.LoadingManager(),
    ori: undefined, //orbitControl 只在本地有效
    raycaster: new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(), 0, 10),
    selectObjects: [],
    velocity: new THREE.Vector3(), //delta时间内位移的距离 
    direction_v: new THREE.Vector3(), //相机位移方向
    direction: { //键盘输入的方向
      forward: false,
      backward: false,
      left: false,
      right: false
    },
    roomModel: null,
    clock: new THREE.Clock(), //时钟，取delta 也可以使用performance.now
  });

  const [isModalVisible, setIsModalVisible] = useState(true);
  const [modelButton, setModelButton] = useState(false);


  const scene = immutable.current.scene;
  const renderer = immutable.current.renderer;
  const camera = immutable.current.camera;

  const pathname = props.location.pathname;


  const showModal = () => {
    setModelButton(true);
  };

  const hideModal = () => {
    const control = immutable.current.control;
    if(!control) return ;
    control.lock();
    
  }

  const startRoaming = () => {
    setIsModalVisible(false);
    const control = immutable.current.control;
    if(!control) return ;
    control.lock();
  }

  useEffect(() => {
    scene.background = new THREE.Color(0xb9d3ff);

    const width = container.current.clientWidth; //窗口宽度
    const height = container.current.clientHeight; //窗口高度
    const k = width / height; //窗口宽高比
    camera.aspect = k;
    camera.position.set(10, 20, 0); //设置相机位置
    camera.lookAt(camera.position); //设置相机方向(指向的场景对象)

    renderer.setSize(width, height); //设置渲染区域尺寸

    container.current.appendChild(renderer.domElement); //把渲染器添加到dom中

    //第三人称漫游相机
    const control = immutable.current.control = new PointerLockControls(camera, renderer.domElement);
    control.addEventListener( 'lock', function () {
      setModelButton(false);
    })

    control.addEventListener( 'unlock', function () {
      showModal();
    } );



    window.addEventListener("resize", onWindowResize, false);

    // if(isDevelopment) addOrbitCamera();
    addLights();
    addGround();
    addAxes();
    drawCanvas();
    loadRoom();
    keyboardEvents();

    //renderer
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
      fbx.position.y = 0;
      immutable.current.roomModel = fbx;
      console.log(fbx);
      scene.add(fbx);
    })
  }

  function keyboardEvents () {
    const direction = immutable.current.direction;
    
    const onKeyDown = function ( event ) {
      const control = immutable.current.control;
      if(!control.isLocked) return;
      switch ( event.keyCode ) {
        case 38: // up
        case 87: // w
          direction.forward = true;
          break;
        case 37: // left
        case 65: // a
          direction.left = true;
          break;
        case 40: // down
        case 83: // s
          direction.backward = true;
          break;
        case 39: // right
        case 68: // d
          direction.right = true;
          break;
        default: 
        break;
      }
    };

    const onKeyUp = function ( event ) {
      const control = immutable.current.control;
      if(!control.isLocked) return;
      switch ( event.keyCode ) {
        case 38: // up
        case 87: // w
          direction.forward = false;
          break;
        case 37: // left
        case 65: // a
          direction.left = false;
          break;
        case 40: // down
        case 83: // s
          direction.backward = false;
          break;
        case 39: // right
        case 68: // d
          direction.right = false;
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

  function moveCamera() {


    


    const direction = new THREE.Vector3();
    // const velocity = immutable.current.velocity;
    const velocity = new THREE.Vector3();
    const delta = immutable.current.clock.getDelta();
    const { forward, backward, left, right } = immutable.current.direction;
    velocity.x = velocity.x * delta;
    velocity.z = velocity.z * delta;
    direction.x = Number(right) - Number(left);
    direction.z = Number(forward) - Number(backward);

    //检测碰撞
    const model = immutable.current.roomModel;
    const control = immutable.current.control;
    const raycaster = immutable.current.raycaster;
    let intersectObjects = [];
    raycaster.ray.origin.copy(control.getObject().position); //位置
    raycaster.ray.direction = new THREE.Vector3(direction.x, 0, direction.z).applyMatrix4(control.getObject().matrixWorld).normalize(); //方向
    // raycaster.ray.direction.y = 0;

    if(model) intersectObjects = raycaster.intersectObject(model, true);

    if(intersectObjects.length > 0) {
      console.log(raycaster.ray.direction, "direction");
      console.log(intersectObjects.length);
      // console.log(intersectObjects[0]);
      return ;
    } ;

   

    if(forward || backward) velocity.z = direction.z * 20 * delta;
    if(left || right) velocity.x = direction.x * 20 * delta;

    // console.log(velocity.x);
    control.moveRight(velocity.x);
    control.moveForward(velocity.z);
  }

  function renderAnimation() {
    requestAnimationFrame(renderAnimation);
    const renderer = immutable.current.renderer;
    const scene = immutable.current.scene;
    const camera = immutable.current.camera;
  
    moveCamera();
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
      <Modal
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
      </Modal>
      <Modal
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
      </Modal>
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
