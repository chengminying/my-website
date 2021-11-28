import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import {
  CSS3DRenderer,
  CSS3DObject,
} from "three/examples/jsm/renderers/CSS3DRenderer";
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
    renderer: new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
    }),
    css3dRenderer: new CSS3DRenderer(),
    loadManager: new THREE.LoadingManager(),
    ori: undefined, //orbitControl 只在本地有效
    raycaster: new THREE.Raycaster(
      new THREE.Vector3(),
      new THREE.Vector3(),
      0,
      10
    ),
    selectObjects: [],
    velocity: new THREE.Vector3(), //delta时间内位移的距离
    direction_v: new THREE.Vector3(), //相机位移方向

    itemNum: 0, //旋转的个数
    Objects: [],
    positionArrays: [],
    index: 0,
    isStart: true, //

    roomModel: null,
    clock: new THREE.Clock(), //时钟，取delta 也可以使用performance.now
    requestAnimationFrame:
      window.requestAnimationFrame ||
      window.mozRequestAnimationFrame ||
      window.webkitRequestAnimationFrame ||
      window.msRequestAnimationFrame,
    cancelAnimationFrame:
      window.cancelAnimationFrame || window.mozCancelAnimationFrame,
    animationFrame: undefined,
    intervals: [],

    particlesData:[],
    positions: undefined,
    colors: undefined,
    particles: undefined,
    pointCloud: undefined,
    particlePositions: undefined,
    linesMesh: undefined,
    maxParticleCount: 1000,
    particleCount: 500,
    r: 800,
    rHalf: 400,
  });

  const scene = immutable.current.scene;
  const renderer = immutable.current.renderer;
  const css3dRenderer = immutable.current.css3dRenderer;
  const camera = immutable.current.camera;
  camera.lookAt(0, 0, 0);
  camera.position.set(0, 0, 1000);

  const pathname = props.location.pathname;

  const requestAnimationFrame = immutable.current.requestAnimationFrame;

  const particlesData = immutable.current.particlesData;
  let positions = immutable.current.particlesData
  let colors = immutable.current.colors;
  let particles = immutable.current.particles;
  let pointCloud = immutable.current.pointCloud;
  let particlePositions = immutable.current.particlePositions;
  let linesMesh = immutable.current.linesMesh;
  const maxParticleCount = immutable.current.maxParticleCount;
  let particleCount = immutable.current.particleCount;
  const r = immutable.current.r;
  const rHalf = immutable.current.rHalf;

  useEffect(() => {
    scene.background = new THREE.Color(0x000000);

    const width = container.current.clientWidth; //窗口宽度
    const height = container.current.clientHeight; //窗口高度
    const k = width / height; //窗口宽高比
    camera.aspect = k;
    css3dRenderer.setSize(width, height); //设置渲染区域尺寸
    const domElement = css3dRenderer.domElement;
    domElement.style.position = "absolute";
    domElement.className = "CSS3DRenderer";
    domElement.style.top = 0 + "px";
    domElement.style.left = 0 + "px";
    domElement.style.width = "100%";
    domElement.style.height = "100%";
    container.current.appendChild(domElement); //把渲染器添加到dom中

    renderer.setSize(width, height); //设置渲染区域尺寸
    renderer.setPixelRatio(window.devicePixelRatio);
    container.current.appendChild(renderer.domElement);
    renderer.extensions.get("WEBGL_lose_context");

    //获取所有显示在主页的文章
    getHomeShow().then((res) => {
      if (res.data.success) {
        immutable.current.itemNum = res.data.data.length;
        helix(res.data.data);
      }
    });

    window.addEventListener("resize", onWindowResize, false);

    addOrbitCamera();
    // addLights();
    // addGround();
    // addAxes();
    createParticles();

    //renderer
    renderAnimation();

    return () => {
      window.removeEventListener("resize", () => {});
      scene.dispose();
      stopInterval();
      //清空当前webgl上下文
      renderer.context.canvas.addEventListener("webglcontextlost", (e) => {
        console.log(e, "webgl上下文已卸载");
      });
      renderer.forceContextLoss();
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
        props.history.push({
          pathname: "/page",
          query: { path: items[i].path, title: items[i].title },
        });
        // this.stopInterval();
      };

      const theta = (i / items.length) * Math.PI * 2;
      const objectCSS = new CSS3DObject(element);

      objectCSS.name = i;
      objectCSS.lookAt(0, 0, 1000);

      objectCSS.position.setFromCylindricalCoords(radius, theta, 0);

      immutable.current.positionArrays.push(
        new THREE.Vector3().copy(objectCSS.position)
      );
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
    if (immutable.current.index === immutable.current.itemNum)
      immutable.current.index = 0;
  }

  function stopInterval() {
    clearInterval(immutable.current.intervals);
    // this.isStart = false;
  }

  function animation() {
    const duration = 2000;
    const scale = 1.2;
    const opacity = 0.5;
    let s = {},
      t = {};
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
          immutable.current.Objects[i].position.set(
            pos["sx" + i],
            pos["sy" + i],
            pos["sz" + i]
          );
          if (i === immutable.current.itemNum - 1) {
            immutable.current.Objects[i].scale.set(
              pos.scale,
              pos.scale,
              pos.scale
            );
            immutable.current.Objects[i].element.style.opacity = pos.opacity;
          }
          if (i === 0) {
            immutable.current.Objects[i].scale.set(
              scale + 1 - pos.scale,
              scale + 1 - pos.scale,
              scale + 1 - pos.scale
            );

            immutable.current.Objects[i].element.style.opacity =
              1 - pos.opacity + opacity;
          }
        }
      })
      .onComplete(() => {
        const obj = immutable.current.Objects.pop();
        immutable.current.Objects.unshift(obj);
      })
      .start();
  }

  function createParticles() {
    // controls.minDistance = 1000;
    // controls.maxDistance = 3000;

    let group = new THREE.Group();
    scene.add(group);

    const helper = new THREE.BoxHelper(
      new THREE.Mesh(new THREE.BoxGeometry(r, r, r))
    );
    helper.material.color.setHex(0x101010);
    helper.material.blending = THREE.AdditiveBlending;
    helper.material.transparent = true;
    group.add(helper);

    const segments = maxParticleCount * maxParticleCount;

    positions = new Float32Array(segments * 3);
    colors = new Float32Array(segments * 3);

    const pMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 3,
      blending: THREE.AdditiveBlending,
      transparent: true,
      sizeAttenuation: false,
    });

    particles = new THREE.BufferGeometry();
    particlePositions = new Float32Array(maxParticleCount * 3);

    for (let i = 0; i < maxParticleCount; i++) {
      const x = Math.random() * r - r / 2;
      const y = Math.random() * r - r / 2;
      const z = Math.random() * r - r / 2;

      particlePositions[i * 3] = x;
      particlePositions[i * 3 + 1] = y;
      particlePositions[i * 3 + 2] = z;

      // add it to the geometry
      particlesData.push({
        velocity: new THREE.Vector3(
          -1 + Math.random() * 2,
          -1 + Math.random() * 2,
          -1 + Math.random() * 2
        ),
        numConnections: 0,
      });
    }

    particles.setDrawRange(0, particleCount);
    particles.setAttribute(
      "position",
      new THREE.BufferAttribute(particlePositions, 3).setUsage(
        THREE.DynamicDrawUsage
      )
    );

    // create the particle system
    pointCloud = new THREE.Points(particles, pMaterial);
    group.add(pointCloud);

    const geometry = new THREE.BufferGeometry();

    geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3).setUsage(THREE.DynamicDrawUsage)
    );
    geometry.setAttribute(
      "color",
      new THREE.BufferAttribute(colors, 3).setUsage(THREE.DynamicDrawUsage)
    );

    geometry.computeBoundingSphere();

    geometry.setDrawRange(0, 0);

    const material = new THREE.LineBasicMaterial({
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      transparent: true,
    });

    linesMesh = new THREE.LineSegments(geometry, material);
    group.add(linesMesh);
  }

  function particlesAnimation() {
    let vertexpos = 0;
    let colorpos = 0;
    let numConnected = 0;

    const effectController = {
      showDots: true,
      showLines: true,
      minDistance: 100,
      limitConnections: false,
      maxConnections: 10,
      particleCount: 500
    };

    for (let i = 0; i < particleCount; i++) particlesData[i].numConnections = 0;

    for (let i = 0; i < particleCount; i++) {
      // get the particle
      const particleData = particlesData[i];

      particlePositions[i * 3] += particleData.velocity.x;
      particlePositions[i * 3 + 1] += particleData.velocity.y;
      particlePositions[i * 3 + 2] += particleData.velocity.z;

      if (
        particlePositions[i * 3 + 1] < -rHalf ||
        particlePositions[i * 3 + 1] > rHalf
      )
        particleData.velocity.y = -particleData.velocity.y;

      if (particlePositions[i * 3] < -rHalf || particlePositions[i * 3] > rHalf)
        particleData.velocity.x = -particleData.velocity.x;

      if (
        particlePositions[i * 3 + 2] < -rHalf ||
        particlePositions[i * 3 + 2] > rHalf
      )
        particleData.velocity.z = -particleData.velocity.z;

      if (
        effectController.limitConnections &&
        particleData.numConnections >= effectController.maxConnections
      )
        continue;

      // Check collision
      for (let j = i + 1; j < particleCount; j++) {
        const particleDataB = particlesData[j];
        if (
          effectController.limitConnections &&
          particleDataB.numConnections >= effectController.maxConnections
        )
          continue;

        const dx = particlePositions[i * 3] - particlePositions[j * 3];
        const dy = particlePositions[i * 3 + 1] - particlePositions[j * 3 + 1];
        const dz = particlePositions[i * 3 + 2] - particlePositions[j * 3 + 2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (dist < effectController.minDistance) {
          particleData.numConnections++;
          particleDataB.numConnections++;

          const alpha = 1.0 - dist / effectController.minDistance;

          positions[vertexpos++] = particlePositions[i * 3];
          positions[vertexpos++] = particlePositions[i * 3 + 1];
          positions[vertexpos++] = particlePositions[i * 3 + 2];

          positions[vertexpos++] = particlePositions[j * 3];
          positions[vertexpos++] = particlePositions[j * 3 + 1];
          positions[vertexpos++] = particlePositions[j * 3 + 2];

          colors[colorpos++] = alpha;
          colors[colorpos++] = alpha;
          colors[colorpos++] = alpha;

          colors[colorpos++] = alpha;
          colors[colorpos++] = alpha;
          colors[colorpos++] = alpha;

          numConnected++;
        }
      }
    }

    linesMesh.geometry.setDrawRange(0, numConnected * 2);
    linesMesh.geometry.attributes.position.needsUpdate = true;
    linesMesh.geometry.attributes.color.needsUpdate = true;

    pointCloud.geometry.attributes.position.needsUpdate = true;
  }

  function addOrbitCamera() {
    const ori = (immutable.current.ori = new OrbitControls(
      camera,
      // renderer.domElement
      css3dRenderer.domElement
    ));
    // ori.update();
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
    immutable.current.css3dRenderer.setSize(
      window.innerWidth,
      window.innerHeight
    );
  }

  function renderAnimation() {
    TWEEN.update();
    renderer.render(scene, camera);
    css3dRenderer.render(scene, camera);
    particlesAnimation();
    immutable.current.animationFrame = requestAnimationFrame(renderAnimation);
  }

  function handleDoubleClick(e) {
    let selectObjects = immutable.current.selectObjects;
    selectObjects = intersect(e);
    if (selectObjects[0] && selectObjects[0].object.name === "跳转") {
      props.history.push({
        pathname: "/page",
        query: { path: "math", title: "perlin噪声" },
      });
    }
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
