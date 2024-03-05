import React, { useRef, useEffect } from "react";
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
    particlesData: [],
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
    renderTarget1: null,
    renderTarget2: null,
    sceneShader: new THREE.Scene(),
    sceneScreen: new THREE.Scene(),
    Ort_camera: null
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
  let positions = immutable.current.particlesData;
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
    renderer.domElement.style.display = "block";
    renderer.setPixelRatio(window.devicePixelRatio);
    container.current.appendChild(renderer.domElement);
    renderer.extensions.get("WEBGL_lose_context");

    //获取所有显示在主页的文章
    const exploreName = getExplore();
    const OSInfo = getOsInfo();
    const params = {
      exploreName,
      OSName: OSInfo.name,
      OSVersion: OSInfo.version,
    };
    getHomeShow(params).then((res) => {
      if (res.data.success) {
        immutable.current.itemNum = res.data.data.length;
        helix(res.data.data);
      }
    });

    window.addEventListener("resize", onWindowResize, false);
    window.addEventListener("mousemove", onMouseMove, false);
    window.addEventListener("touchstart", onTouchMove, false);
    window.addEventListener("touchmove", onTouchMove, false);

    addOrbitCamera();
    addLights();
    addDrawing();
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

    // const helper = new THREE.BoxHelper(
    //   new THREE.Mesh(new THREE.BoxGeometry(r, r, r))
    // );
    // helper.material.color.setHex(0x101010);
    // helper.material.blending = THREE.AdditiveBlending;
    // helper.material.transparent = true;
    // group.add(helper);

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
      particleCount: 500,
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
    ori.enableZoom = false;
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

  function addDrawing() {
    const vertexShader = `
      uniform mat4 u_matrix;

      varying vec2 v_uv;
      varying vec3 v_world_position;
      void main() {
        v_uv = uv;
        v_world_position = (u_matrix * modelMatrix * vec4(position, 1.0)).xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
      }
    `;
    const fragmentShader = `

      uniform vec3 u_position;
      uniform float u_time;

      uniform sampler2D u_texture;

      varying vec2 v_uv;
      varying vec3 v_world_position;

      float circle(vec3 pixel, vec3 center, float radius) {
        return 1.0 - smoothstep(radius - 5.0, radius + 5.0, length(pixel -  center));
      }

      void main() {
        vec3 pixel_color = texture2D(u_texture, v_uv).rgb;

        float circle_radius = 10.0;
        vec3 circle_color = vec3(0.5, 0.5, 0.8) + vec3( 0.3 * cos(u_time), 0.3 * sin(1.3 * u_time), 0.2 * cos(2.7 * u_time));
        float mix_factor = 0.8 * circle(v_world_position, u_position, circle_radius);
        pixel_color = mix(pixel_color, circle_color, mix_factor);
        gl_FragColor = vec4(vec3(pixel_color), 1.0);
      }

    `;

    const current = immutable.current;

    const options = {
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      format: THREE.RGBAFormat,
      stencilBuffer: false,
      type : /(iPad|iPhone|iPod)/g.test(navigator.userAgent) ? THREE.HalfFloatType : THREE.FloatType
    };

    current.renderTarget1 = new THREE.WebGLRenderTarget( current.renderer.domElement.clientWidth, current.renderer.domElement.clientHeight, options );
    current.renderTarget2 = new THREE.WebGLRenderTarget( current.renderer.domElement.clientWidth, current.renderer.domElement.clientHeight, options );

    current.Ort_camera = new THREE.OrthographicCamera(-1000, 1000, 1000, -1000, 0.0, 2000);

    const geo = new THREE.PlaneBufferGeometry(2000, 2000);

    const uniforms = {
      u_time: { value: 0.0 },
      u_resolution: { value: new THREE.Vector2() },
      u_position: { value: new THREE.Vector3(10000, 10000, 10000) },
      u_texture: { value: null },
      u_matrix: { value: immutable.current.camera.matrixWorld }
    };

    current.uniforms = uniforms;


    const shaderMaterial = new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: vertexShader,
      fragmentShader: fragmentShader
    });

    const materialScreen = new THREE.MeshBasicMaterial({
      // color: 0xff0
    });

    const meshShader = new THREE.Mesh(geo, shaderMaterial);
    const meshScreen = new THREE.Mesh(geo, materialScreen);


    meshShader.position.z = -1000;
    current.meshShader = meshShader;
    current.meshScreen = meshScreen;
    meshScreen.position.z = -1000;
    meshScreen.name = "drawing";

    immutable.current.sceneShader.add(meshShader);
    immutable.current.sceneScreen.add(meshScreen);

    immutable.current.camera.add(meshScreen);

    console.log(immutable.current.camera);

    scene.add(immutable.current.camera);
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

  function onMouseMove(event) {
    event.preventDefault();

    const width = immutable.current.renderer.domElement.clientWidth;
    const height = immutable.current.renderer.domElement.clientHeight;
    const uniforms = immutable.current.uniforms;
    const camera = immutable.current.camera;
    const meshScreen = immutable.current.meshScreen;

    const mouse = new THREE.Vector2();

    mouse.x = ( event.clientX / width ) * 2 - 1;
    mouse.y = - ( event.clientY / height ) * 2 + 1;

    const raycaster = new THREE.Raycaster();

    raycaster.setFromCamera( mouse, camera );

    // See if the ray from the camera into the world hits one of our meshes
    const intersects = raycaster.intersectObject( meshScreen, true );

    if(intersects.length > 0) {

      const position = intersects[0].point;
      const x = position.x;
      const y = position.y;
      const z = position.z;

      uniforms.u_position.value.set(x, y, z);


      // console.log(x, y, z);

      // const vec4 = new THREE.Vector4(x, y, z, 1).applyMatrix4(immutable.current.meshScreen.matrixWorld).applyMatrix4(immutable.current.camera.matrixWorld);

      // console.log(vec4.x, vec4.y, vec4.z);
      
      // uniforms.u_position.value.set(vec4.x, vec4.y, vec4.z);

    }
  }

  function onTouchMove(event) {

  }

  function renderAnimation() {
    const materialScreen = immutable.current.materialScreen;
    const sceneShader = immutable.current.sceneShader;
    const renderTarget1 = immutable.current.renderTarget1;
    const renderTarget2 = immutable.current.renderTarget2;
    const Ort_camera = immutable.current.Ort_camera;
    const uniforms = immutable.current.uniforms;

    const meshScreen = immutable.current.meshScreen;

    if(meshScreen) {
      if (!uniforms.u_texture.value) {
        // materialScreen.visible = false;
        renderer.setRenderTarget(renderTarget1);
        renderer.render(sceneShader, Ort_camera);
        // materialScreen.visible = true;
      }
  
      uniforms.u_time.value = immutable.current.clock.getElapsedTime();
      uniforms.u_texture.value = renderTarget1.texture;

      renderer.setRenderTarget(renderTarget2);
      renderer.render(sceneShader, Ort_camera);
      
      meshScreen.material.map = renderTarget2.texture;
      meshScreen.material.needsUpdate = true;
  
      var tmp = renderTarget1;
      immutable.current.renderTarget1 = renderTarget2;
      immutable.current.renderTarget2 = tmp;
    }

    if(immutable.current.uniforms) {
      immutable.current.uniforms.u_matrix.value = immutable.current.camera.matrixWorld;
    }

    TWEEN.update();
    renderer.setRenderTarget(null);
    renderer.render(scene, camera);
    css3dRenderer.render(scene, camera);
    particlesAnimation();
    immutable.current.animationFrame = requestAnimationFrame(renderAnimation);
  }

  function handleDoubleClick(e, type) {
    let selectObjects = immutable.current.selectObjects;
    selectObjects = intersect(e, type);
    console.log(selectObjects);
    if (selectObjects[0] && selectObjects[0].object.name === "跳转") {
      props.history.push({
        pathname: "/page",
        query: { path: "math", title: "perlin噪声" },
      });
    }
  }

  function handleTouchStart(e) {
    // const dom = e.nativeEvent.target;
    // var event = new MouseEvent('click');
    // dom.dispatchEvent(event);
  }

  function intersect(e, type) {
    const width = container.current.clientWidth;
    const height = container.current.clientHeight;
    const camera = immutable.current.camera;
    const scene = immutable.current.scene;

    const rayCaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    let offsetX, offsetY;

    offsetX = e.nativeEvent.offsetX;
    offsetY = e.nativeEvent.offsetY;
    

    mouse.x = (offsetX / width) * 2 - 1;
    mouse.y = -(offsetY / height) * 2 + 1;

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

  // 获取操作系统信息
  function getOsInfo() {
    var userAgent = navigator.userAgent.toLowerCase();
    var name = "Unknown";
    var version = "Unknown";
    if (userAgent.indexOf("win") > -1) {
      name = "Windows";
      if (userAgent.indexOf("windows nt 5.0") > -1) {
        version = "Windows 2000";
      } else if (
        userAgent.indexOf("windows nt 5.1") > -1 ||
        userAgent.indexOf("windows nt 5.2") > -1
      ) {
        version = "Windows XP";
      } else if (userAgent.indexOf("windows nt 6.0") > -1) {
        version = "Windows Vista";
      } else if (
        userAgent.indexOf("windows nt 6.1") > -1 ||
        userAgent.indexOf("windows 7") > -1
      ) {
        version = "Windows 7";
      } else if (
        userAgent.indexOf("windows nt 6.2") > -1 ||
        userAgent.indexOf("windows 8") > -1
      ) {
        version = "Windows 8";
      } else if (userAgent.indexOf("windows nt 6.3") > -1) {
        version = "Windows 8.1";
      } else if (
        userAgent.indexOf("windows nt 6.2") > -1 ||
        userAgent.indexOf("windows nt 10.0") > -1
      ) {
        version = "Windows 10";
      } else {
        version = "Unknown";
      }
    } else if (userAgent.indexOf("iphone") > -1) {
      name = "Iphone";
    } else if (userAgent.indexOf("mac") > -1) {
      name = "Mac";
    } else if (
      userAgent.indexOf("x11") > -1 ||
      userAgent.indexOf("unix") > -1 ||
      userAgent.indexOf("sunname") > -1 ||
      userAgent.indexOf("bsd") > -1
    ) {
      name = "Unix";
    } else if (userAgent.indexOf("linux") > -1) {
      if (userAgent.indexOf("android") > -1) {
        name = "Android";
      } else {
        name = "Linux";
      }
    } else {
      name = "Unknown";
    }
    return { name, version };
  }

  function getExplore() {
    var Sys = {};
    var ua = navigator.userAgent.toLowerCase();
    var s;
    // eslint-disable-next-line no-unused-expressions
    (s = ua.match(/rv:([\d.]+)\) like gecko/))
      ? (Sys.ie = s[1])
      : (s = ua.match(/msie ([\d\.]+)/))
      ? (Sys.ie = s[1])
      : (s = ua.match(/edge\/([\d\.]+)/))
      ? (Sys.edge = s[1])
      : (s = ua.match(/firefox\/([\d\.]+)/))
      ? (Sys.firefox = s[1])
      : (s = ua.match(/(?:opera|opr).([\d\.]+)/))
      ? (Sys.opera = s[1])
      : (s = ua.match(/chrome\/([\d\.]+)/))
      ? (Sys.chrome = s[1])
      : (s = ua.match(/version\/([\d\.]+).*safari/))
      ? (Sys.safari = s[1])
      : 0;

    // 根据关系进行判断
    if (Sys.ie) return "IE: " + Sys.ie;
    if (Sys.edge) return "EDGE: " + Sys.edge;
    if (Sys.firefox) return "Firefox: " + Sys.firefox;
    if (Sys.chrome) return "Chrome: " + Sys.chrome;
    if (Sys.opera) return "Opera: " + Sys.opera;
    if (Sys.safari) return "Safari: " + Sys.safari;
    return "Unkonwn";
  }

  return (
    <div
      className="home-container"
      ref={(ref) => (container.current = ref)}
      onDoubleClick={handleDoubleClick}
      onTouchStart={handleTouchStart}
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
