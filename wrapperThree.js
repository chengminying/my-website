(function(global) {
  if(!THREE) {
    alert("没有引入Three.js文件");
    return;
  }

  global.scene = new THREE.Scene();
  global.camera = new THREE.PerspectiveCamera(75, global.innerWidth / global.innerHeight, 0.1, 1000);
  global.renderer = new THREE.WebGLRenderer({
    antialias: true
  });
  global.renderer.setPixelRatio(window.devicePixelRatio);
  global.renderer.setSize(global.innerWidth, global.innerHeight);
  document.body.appendChild(global.renderer.domElement);

  //辅助线
  var axesHelper = new THREE.AxesHelper(5000);
  scene.add(axesHelper);
  //网格
  var gridHelperSize = 100;
  var gridHelperDivisions = 100;
  var gridHelper = new THREE.GridHelper(gridHelperSize, gridHelperDivisions);
  scene.add(gridHelper);

  document.body.onresize = debounce();

  function debounce () {
    var timer = null;
    return function () {
      if(timer) clearTimeout(timer);
      timer = setTimeout(() => {
        const w = document.body.clientWidth;
        const h = document.body.clientHeight;
        global.camera.aspect = w / h;
        global.camera.updateProjectionMatrix();
        global.renderer.setSize(w, h);
      }, 200);
    }
  }
})(window);