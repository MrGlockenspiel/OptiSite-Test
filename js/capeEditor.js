/**
 * every single thing here is still terrible, because im too lazy to change or even look at any of it
 * 
 * 
 * 
 * 
 * 
 */

const layerLimit = 8;

const opts = {
  doShading: true,
  editing: 0,
  preset: 0,
  custom: false,
  dragging: null,
  dragPosOld: null,
  dragPosNew: null,
  cssRule: null,
  capeData: {
    baseColor: "000000",
    layers: []
  }
}

const vp = {
  loader: null,
  cape: null,
  capeMat: null
}

import * as THREE from './three.module.js';

import { OrbitControls } from './threeOrbitControls.js';
import { OBJLoader } from './threeOBJLoader.js';



const presets = [];

const staticPatterns = [];
const patterns = [];

window.addEventListener('beforeunload', (e) => {
  if (opts.custom) {
      e.preventDefault();

      const msg = "Are you sure you want to leave? Your cape design will be lost."
      e.returnValue = msg;
      return msg;
  }
});

function hexToBytes(hex) {
  let bytes = []
  for (c = 0; c < hex.length; c += 2)
  bytes.push(parseInt(hex.substr(c, 2), 16));
  return bytes;
}

function bytesToBase64(buffer) {
  let binary = '';
  let bytes = new Uint8Array(buffer);
  let len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

function base64ToBytes(base64) {
  let binary_string = window.atob(base64);
  let len = binary_string.length;
  let bytes = [];
  for (let i = 0; i < len; i++) {
      bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes
}

function bytesToHex(bytes) {
  let hex = []
  for (i = 0; i < bytes.length; i++) {
      let current = bytes[i] < 0 ? bytes[i] + 256 : bytes[i];
      hex.push((current >>> 4).toString(16));
      hex.push((current & 0xF).toString(16));
  }
  return hex.join("");
}

document.addEventListener('DOMContentLoaded', () => {
  console.log('loaded!')

  const setup = [];
  const dir = "./img/patterns/";

  // Set up 3D viewport
  setup.push(new Promise((resolve, reject) => {
    let scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);

    vp.loader = new THREE.TextureLoader();

    
    let camera = new THREE.PerspectiveCamera( 30, 1, 1, 1000);
    camera.position.z = 45;
    let renderer = new THREE.WebGLRenderer({ antialias: true });

    document.querySelector("#viewport").appendChild( renderer.domElement );

    vp.capeMat = new THREE.MeshLambertMaterial();
    vp.capeMat.transparent = true;
    vp.capeMat.side = THREE.DoubleSide;
    vp.capeMat.depthFunc = THREE.LessEqualDepth;

    //let capeGeo = new THREE.BoxGeometry( 10, 16, 1);
    let capeGeo = new THREE.BufferGeometry()

    capeGeo.setAttribute("position", new THREE.BufferAttribute(
      new Float32Array([5,-8,-0.5,5,8,-0.5,5,8,0.5,5,-8,-0.5,5,8,0.5,5,-8,0.5,5,-8,0.5,5,8,0.5,-5,8,0.5,5,-8,0.5,-5,8,0.5,-5,-8,0.5,-5,-8,0.5,-5,8,0.5,-5,8,-0.5,-5,-8,0.5,-5,8,-0.5,-5,-8,-0.5,-5,-8,-0.5,-5,8,-0.5,5,8,-0.5,-5,-8,-0.5,5,8,-0.5,5,-8,-0.5,5,-8,0.5,-5,-8,0.5,-5,-8,-0.5,5,-8,0.5,-5,-8,-0.5,5,-8,-0.5,-5,8,0.5,5,8,0.5,5,8,-0.5,-5,8,0.5,5,8,-0.5,-5,8,-0.5]),
      3,
      false
    ));

    capeGeo.setAttribute("normal", new THREE.BufferAttribute(
      new Float32Array([1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,-1,0,0,-1,0,0,-1,0,0,-1,0,0,-1,0,0,-1,0,0,0,0,-1,0,0,-1,0,0,-1,0,0,-1,0,0,-1,0,0,-1,0,-1,0,0,-1,0,0,-1,0,0,-1,0,0,-1,0,0,-1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0]),
      3,
      false
    ));

    capeGeo.setAttribute("uv", new THREE.BufferAttribute(
      new Float32Array([0.021739,0.227273,0.021739,0.954545,0,0.954545,0.021739,0.227273,0,0.954545,0,0.227273,0.478261,0.227273,0.478261,0.954545,0.26087,0.954545,0.478261,0.227273,0.26087,0.954545,0.26087,0.227273,0.26087,0.227273,0.26087,0.954545,0.23913,0.954545,0.26087,0.227273,0.23913,0.954545,0.23913,0.227273,0.23913,0.227273,0.23913,0.954545,0.021739,0.954545,0.23913,0.227273,0.021739,0.954545,0.021739,0.227273,0.456522,1,0.23913,1,0.23913,0.954545,0.456522,1,0.23913,0.954545,0.456522,0.954545,0.23913,1,0.021739,1,0.021739,0.954545,0.23913,1,0.021739,0.954545,0.23913,0.954545]),
      2,
      false
    ));

    capeGeo.rotateY(Math.PI);

    console.log(JSON.stringify(capeGeo, null, 4));

    

    vp.cape = new THREE.Mesh(
      capeGeo,
      vp.capeMat
    );
    scene.add(vp.cape);


    scene.add(new THREE.AmbientLight(0xffffff));
    /* let light = new THREE.DirectionalLight( 0xffffff, 1 );
    light.position.set(50, 100, 200)

    scene.add(light); */

    

    window.addEventListener('resize', recalcDisplay, false);

    let controls = new OrbitControls(camera, renderer.domElement);
    //controls.maxPolarAngle = Math.PI * 0.5;
    controls.minDistance = 25;
    controls.maxDistance = 75;
    controls.enableDamping = true;
    controls.dampingFactor = 0.15;
    controls.zoomSpeed = 2;
    controls.enablePan = false;
    controls.mouseButtons = {
      LEFT: THREE.MOUSE.ROTATE,
      MIDDLE: THREE.MOUSE.DOLLY,
      RIGHT: THREE.MOUSE.ROTATE
    }

    function recalcDisplay() {
      let viewport = document.querySelector("#viewport");

      camera.aspect = viewport.clientWidth / viewport.clientHeight;
      camera.updateProjectionMatrix();

      //renderer.setPixelRatio(0.5);
      renderer.setSize(viewport.clientWidth, viewport.clientHeight);
    }

    function animate() {
      requestAnimationFrame(animate);

      controls.update();

      renderer.render(scene, camera);
    }
    animate();
    recalcDisplay();

    resolve();
    
  }))

  // Load Patterns
  setup.push(new Promise((resolve, reject) => {
    fetch(`${dir}index.json`)
    .then(response => response.json())
    .then(json => {
      console.log(json);

      let i = 0;

      (function loadNext() {
        const pattern = json[i];
        const prefix = (pattern.name != null) ? "p_" : "s_";
        const path = `${dir}${prefix}${pattern.file}.png`;
        let pOption, pInput;

        if (pattern.name != null) {
          pOption = document.createElement("label");
          pOption.classList = "pattern";
          pOption.title = pattern.name;

          pInput = document.createElement("input");
          pInput.type = "radio";
          pInput.name = "pattern"
          pInput.onchange = (e) => {
            const newIndex = Array.from(document.querySelector("#patternSelector").children).indexOf(e.target.parentNode);
            changePattern(newIndex);
          }
          pOption.appendChild(pInput);
        }
  
        console.log(`load ${path}`);
        
        Jimp.read(path).then(image => {
          pattern.jimp = image;

          if (pattern.name != null) {
            patterns.push(pattern);

            let prev = image.clone();

            prev.invert()
            .getBase64Async(Jimp.MIME_PNG)
            .then((base64) => {
              pOption.style = "background-image: url(data:image/png;"+base64+")";

              document.querySelector("#patternSelector").appendChild(pOption);

              if (i+1 === json.length) {
                resolve();
              } else {
                i++;
                loadNext();
              }
            });
          } else {
            staticPatterns.push(pattern);

            if (i+1 === json.length) {
              resolve();
            } else {
              i++;
              loadNext();
            }
          }
        })
      })();
    });
  }));

  // Load Preset Designs
  setup.push(new Promise((resolve, reject) => {
    fetch(`${dir}presets.json`)
    .then(response => response.json())
    .then(json => {
      for(let i = 0; i < json.length; i++) {
        const preset = json[i];
        presets.push(preset);

        let newPreset = document.createElement('option');
        newPreset.innerHTML = preset.name;
        if (i === 0) newPreset.selected = true;

        document.querySelector("#presets").appendChild(newPreset);
      }

      resolve();
    });
  }));

  // Get CSS texture rule
  setup.push(new Promise((resolve, reject) => {
    for(let i = 0; i < document.styleSheets.length; i++) {
      let sheet = document.styleSheets[i];
      if (sheet.title === "capeEditorCSS") {
        for(let i = 0; i < sheet.cssRules.length; i++) {
          let rule = sheet.cssRules[i];
          if (rule.selectorText === ".capeTex") {
            opts.cssRule = rule;
            break;
          }
        }
        break;
      }
    }

    resolve();
  }));

  Promise.all(setup)
  .then(() => {
    console.log(patterns);
    console.log(presets);
    document.querySelector("#loadingCircle").classList.add("loaded");
  
    document.querySelector("#shade").addEventListener("click", function(e) {
      opts.doShading = e.target.checked;
      console.warn('redraw');
      redraw();
    });
  
    document.querySelector("#presets").onchange = function (e) {
      if(opts.custom) {
        let answer = confirm("Discard all changes?");
  
        if(answer) {
          setPreset(e.target.selectedIndex-1)
  
          opts.custom = false;
        } else {
          e.target.value = e.target.children[0].value;
        }
      } else {
        setPreset(e.target.selectedIndex-1)
      }
    }
  
    document.querySelector("#patternColor").oninput = function (e) {
      e.target.value = e.target.value.replace(/[^0-9a-fA-F]/g, "").substring(0, 6);
  
      calcColorPick(e);
    }
  
    document.querySelector("#done").addEventListener("click", function (e) {
      if(document.querySelector("#patternColor").value.match(/[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4}/) != null) closePatternEditor();
    });
  
    document.querySelector("#addLayer").addEventListener("click", function (e) {
      if(opts.capeData.layers.length === layerLimit) {
        e.target.classList.remove("canAdd");
        return;
      }
      openPatternEditor(null, createLayer());
    });
  
    document.querySelector("#baseLayer .editor-input").addEventListener("click", openPatternEditor)

    document.querySelector("#colorH").oninput = calcColorPick;
    document.querySelector("#colorS").oninput = calcColorPick;
    document.querySelector("#colorV").oninput = calcColorPick;

    document.querySelector("#patternColor").onchange = function (e) {
      console.log("change");
      if(e.target.value.match(/[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4}/) != null) updateColor(e);
    }

    document.querySelector("#colorH").onchange = updateColor;
    document.querySelector("#colorS").onchange = updateColor;
    document.querySelector("#colorV").onchange = updateColor;

    setPreset(0);
  })
  .catch(err => {
    console.error(err);
  });

  function redraw(scrollToBottom) {
    console.log(opts);
    console.log(vp);
    if(!opts.custom) {
      // check if the design is now customized
      let presetData = JSON.parse(JSON.stringify(presets[opts.preset]));
      let cdata = JSON.stringify(opts.capeData)

      delete presetData.name;

      presetData = JSON.stringify(presetData);

      console.log(presetData);
      console.log(cdata);

      if(presetData === cdata) {
        console.log('same as preset')
      } else {
        console.log('custom')

        opts.custom = true;

        let preSelect = document.querySelector("#presets");
        preSelect.value = preSelect.children[0].value;
      }
    }

    opts.capeData.layers = opts.capeData.layers.splice(0, 9);

    redrawPatternSelector()

    // check layer limit and remove/add ability to add layers as needed

    if(opts.capeData.layers.length === layerLimit) {
      document.querySelector("#addLayer").classList = "cannotAdd";
      document.querySelector("#addLayer").title = "";
    } else {
      document.querySelector("#addLayer").classList = "canAdd";
      document.querySelector("#addLayer").title = "Add New Layer";
    }

    // reset graphical layers list

    document.querySelector("#baseLayer .patternPreview").style = "background-color: #"+opts.capeData.baseColor;

    let layers = document.querySelectorAll("#layers .layer:not(#baseLayer)");
    for(let i = 0; i < layers.length; i++) {
      deleteLayer(true, layers[i]);
    }

    let layerData = opts.capeData.layers;
    for(let i = 0; i < layerData.length; i++) {
      let l = layerData[i];
      createLayer(true, l.pattern, l.color, i+1, l.visible);
    }

    // move "add layer" button to end of node list

    const layersSection = document.querySelector("#layers")
    layersSection.appendChild(document.querySelector("#addLayer"));
    if (scrollToBottom) layersSection.scrollTop = layersSection.scrollHeight;

    // start compositing cape texture

    let startTime = new Date().getTime();
    let img = colorPattern(staticPatterns[0].jimp, staticPatterns[0].jimp, "#"+opts.capeData.baseColor);

    const finalRender = () => {
      img.then(function (jimpImage) {
        if(opts.doShading) {
          console.log('add shading')
          return applyPattern(jimpImage, staticPatterns[1].jimp, "#000000");
        } else {
          return Promise.resolve(jimpImage);
        }
      })
      .then(function (img) {
        img.getBase64Async(Jimp.MIME_PNG)
        .then(function(base64) {
          let timeTaken = (new Date().getTime() - startTime)+"ms";
          console.log("image rendered in "+timeTaken)

          document.querySelector("#renderTime").innerHTML = "Render Time: "+timeTaken;

          let dataURI = `data:image/png;${base64}`;

          let texture = vp.loader.load(dataURI);

          texture.minFilter = THREE.NearestFilter;
          texture.magFilter = THREE.NearestFilter;

          vp.capeMat.map = texture;
          vp.capeMat.needsUpdate = true;
          vp.cape.material = vp.capeMat;
        })
      })
    }

    for(let i = 0; i < opts.capeData.layers.length; i++) {
      let layer = opts.capeData.layers[i];

      // get preview image
      colorPattern(staticPatterns[0].jimp, patterns[layer.pattern].jimp, "#"+layer.color).then(function(preview) {
        preview.getBase64Async(Jimp.MIME_PNG)
        .then(function(base64) {
          console.log("updating "+i);
          document.querySelectorAll(".patternPreview")[i+1].style = "background-image: url(data:image/png;"+base64+")";
        });
      });

      // apply actual pattern
      img = img.then(function(jimpImage) {
        if(layer.visible) {
          return applyPattern(jimpImage, patterns[layer.pattern].jimp, "#"+layer.color);
        } else return jimpImage;
      });
    }

    finalRender();
  }

  function changePattern(index) {
    if(patterns[index] != null && patterns[index].name != null && opts.editing != null && opts.editing !== 0) {
      const patternOptions = document.querySelector("#patternSelector").children;
      for(let i = 0; i < patternOptions.length; i++) {
        patternOptions[i].classList.remove("patternSelected");
      }

      patternOptions[index].classList.add("patternSelected");
      patternOptions[index].children[0].value = "on";

      opts.capeData.layers[opts.editing-1].pattern = index;

      console.warn('redraw');
      redraw();
    }
  }

  function redrawPatternSelector() {
    console.log("redraw selector")
    console.log(opts.editing);
    if(opts.editing != null && opts.editing !== 0) {
      const patternOptions = document.querySelector("#patternSelector").children;

      for(let i = 0; i < patternOptions.length; i++) {
        colorPattern(staticPatterns[0].jimp, patterns[i].jimp, "#"+opts.capeData.layers[opts.editing-1].color).then(function(preview) {
          preview.getBase64Async(Jimp.MIME_PNG)
          .then(function(base64) {
            console.log("updating "+i);
            patternOptions[i].style = "background-image: url(data:image/png;"+base64+")";
          });
        });
      }
    }
  }

  function colorPattern(base, pattern, color) {
    return new Promise((resolve, reject) => {
      let p = pattern.clone();

      p.scan(0, 0, p.bitmap.width, p.bitmap.height, function(x, y, idx) {
        const r = this.bitmap.data[idx+0];
        const g = this.bitmap.data[idx+1];
        const b = this.bitmap.data[idx+2];

        const baseTransparency = Jimp.intToRGBA(base.getPixelColor(x, y)).a;
        const targetTransparency = (r+g+b) / 3;

        this.bitmap.data[idx+3] = Math.min(targetTransparency, baseTransparency);

        let newColor = Jimp.intToRGBA(Jimp.cssColorToHex(color));
        this.bitmap.data[idx+0] = newColor.r;
        this.bitmap.data[idx+1] = newColor.g;
        this.bitmap.data[idx+2] = newColor.b;

        //console.log("color is now "+[r, g, b].join())

        if (x === p.bitmap.width-1 && y === p.bitmap.height-1) {
          resolve(p);
        }
      });
    });
  }

  function applyPattern(img, pattern, color) {
    return new Promise((resolve, reject) => {
      colorPattern(img, pattern, color).then(function (colored) {
        resolve(img.composite(colored, 0, 0));
      })
    });
  }

  function setPreset(i) {
    console.log(i);

    opts.preset = i;
    opts.capeData = JSON.parse(JSON.stringify(presets[i]));
    delete opts.capeData.name;

    console.log(opts.capeData);

    console.warn('redraw');
    redraw();
  }

  function closePatternEditor() {
    opts.editing = null;
    document.querySelector("#patternEditor").style = "display: none";
  }

  function moveLayer(oldPos, newPos) {
    const otherLayers = opts.capeData.layers.filter(function(layer, index) {
      return index !== oldPos;
    });
    
    opts.capeData.layers = [
      ...otherLayers.slice(0, newPos),
      opts.capeData.layers[oldPos],
      ...otherLayers.slice(newPos)
    ];
  }

  function createLayer(onlyHTML, pattern, color, index, visible) {
    if(!onlyHTML && opts.capeData.layers.length === layerLimit) {
      return layerLimit-1;
    }

    const fullLayer = document.createDocumentFragment();
    const layerNum = (index != null) ? index : opts.capeData.layers.length+1;

    const colorValue = (color != null) ? color : "FFFFFF";
    const patternValue = (pattern != null) ? pattern : 0;

    console.log(index);

    let layer = document.createElement('div');
    let toggleVisible = document.createElement('input');
    let patternPreview = document.createElement('div');
    let displayName = document.createElement('span');
    let grabPoint = document.createElement('div');
    let moveWrapper = document.createElement('div');
    let moveUpLabel = document.createElement('label');
    let moveUpInput = document.createElement('input');
    let moveDownLabel = document.createElement('label');
    let moveDownInput = document.createElement('input');
    let editLabel = document.createElement('label');
    let editInput = document.createElement('input');
    let deleteLabel = document.createElement('label');
    let deleteInput = document.createElement('input');

    layer.classList = "layer itembar-spaced";
    layer.setAttribute("draggable", true);
    layer.addEventListener("dragstart", function(e) {
      opts.dragging = e.target;
      e.target.classList.add("layerDrag");
      e.target.style.opacity = 0.5;

      opts.dragPosOld = Array.from(e.target.parentNode.children).indexOf(e.target)-1;

      console.log("dragging "+opts.dragPosOld);
    });
    layer.addEventListener("dragend", function(e) {
      e.target.style.opacity = null;
      opts.dragging = null;
      opts.dragPosOld = null;
      opts.dragPosNew = null;

      let layers = document.querySelectorAll(".layer");

      for(let i = 1; i < layers.length; i++) {
        layers[i].classList.remove("layerOver", "layerDrag");
      }
    });
    layer.addEventListener("dragenter", function(e) {
      if (opts.dragging === e.target || opts.dragging == null) return;
      layer.classList.add("layerOver");
      console.log(e.target);
    });
    layer.addEventListener("dragleave", function(e) {
      if (opts.dragging === e.target || opts.dragging == null) return;
      layer.classList.remove("layerOver");
    });
    layer.addEventListener("dragover", function(e) {
      if (e.preventDefault) e.preventDefault();
      return false;
    });
    layer.addEventListener("drop", function(e) {
      if (e.preventDefault) e.preventDefault();
      e.stopPropagation();

      if (opts.dragging != null && opts.dragging !== e.target) {

        opts.dragPosNew = Array.from(e.target.parentNode.children).indexOf(e.target)-1;

        console.log("oldPos: "+opts.dragPosOld);
        console.log("newPos: "+opts.dragPosNew);

        moveLayer(opts.dragPosOld, opts.dragPosNew);

        redraw();
      }
  
      return false;
    });
    
    layer = fullLayer.appendChild(layer);

    // Toggle Visibility
    toggleVisible.type = "checkbox";
    if (visible != null && visible === true) toggleVisible.checked = true;
    toggleVisible.classList = "layerVisibility";
    toggleVisible.title = "Toggle Visibility";
    toggleVisible.addEventListener("click", function(e) {
      const pos = Array.from(document.querySelector("#layers").children).indexOf(e.target.parentNode)-1;

      opts.capeData.layers[pos].visible = e.target.checked;

      console.warn('redraw');
      redraw();
    });
    layer.appendChild(toggleVisible);

    // Pattern Preview
    patternPreview.classList = "patternPreview";
    //patternPreview.style = "background-color: #"+colorValue;
    layer.appendChild(patternPreview);

    // Layer Name
    displayName.innerHTML = `Layer ${index}`;
    layer.appendChild(displayName);

    // Move Layer Buttons Wrapper
    moveWrapper.classList = "vertical-button-wrapper";
    moveWrapper = layer.appendChild(moveWrapper)

    // Move Layer Up Button Label
    moveUpLabel.classList = "editor-button half";
    moveUpLabel.title = "Move Layer Up";
    moveUpLabel.innerHTML = "/\\";
    moveUpLabel = moveWrapper.appendChild(moveUpLabel);

    // Move Layer Up Button Input
    moveUpInput.type = "button";
    moveUpInput.classList = "editor-input";
    moveUpInput.addEventListener("click", function(e) {
      const pos = Array.from(document.querySelector("#layers").children).indexOf(e.target.closest(".layer"))-1;

      if(pos !== 0) {
        moveLayer(pos, pos-1);

        redraw();
      }
    });
    moveUpLabel.appendChild(moveUpInput);

    // Move Layer Down Button Label
    moveDownLabel.classList = "editor-button half";
    moveDownLabel.title = "Move Layer Down";
    moveDownLabel.innerHTML = "\\/";
    moveDownLabel = moveWrapper.appendChild(moveDownLabel);

    // Move Layer Down Button Input
    moveDownInput.type = "button";
    moveDownInput.classList = "editor-input";
    moveDownInput.addEventListener("click", function(e) {
      const pos = Array.from(document.querySelector("#layers").children).indexOf(e.target.closest(".layer"))-1;

      if(pos+1 !== opts.capeData.layers.length) {
        moveLayer(pos, pos+1);

        redraw();
      }
    });
    moveDownLabel.appendChild(moveDownInput);

    // Move Layer Down Button Label
    editLabel.classList = "editor-button";
    editLabel.title = "Move Layer Down";
    editLabel.innerHTML = "Edit";
    editLabel = layer.appendChild(editLabel);

    // Move Layer Down Button Input
    editInput.type = "button";
    editInput.classList = "editor-input";
    editInput.addEventListener("click", openPatternEditor);
    editLabel.appendChild(editInput);

    // Edit Layer Button Label
    editLabel.classList = "editor-button";
    editLabel.title = "Edit Pattern";
    editLabel.innerHTML = "Edit";
    editLabel = layer.appendChild(editLabel);

    // Edit Layer Button Input
    editInput.type = "button";
    editInput.classList = "editor-input";
    editInput.addEventListener("click", openPatternEditor);
    editLabel.appendChild(editInput);

    // Delete Layer Button Label
    deleteLabel.classList = "editor-button";
    deleteLabel.title = "Delete Pattern";
    deleteLabel.innerHTML = "Del";
    deleteLabel = layer.appendChild(deleteLabel);

    // Delete Layer Button Input
    deleteInput.type = "button";
    deleteInput.classList = "editor-input";
    deleteInput.addEventListener("click", function() {
      deleteLayer(false, layer);
    });
    deleteLabel.appendChild(deleteInput);

    // Layer Grab Indicator
    grabPoint.classList = "layerGrab"
    layer.appendChild(grabPoint);

    document.querySelector("#layers").appendChild(fullLayer);

    if(!onlyHTML) {
      opts.capeData.layers.push({
        color: colorValue,
        pattern: patternValue,
        visible: true
      });

      console.warn('redraw');
      redraw(true);
    }

    return layerNum;
  }

  function deleteLayer(onlyHTML, elem) {
    const index = Array.from(elem.parentNode.children).indexOf(elem);

    while (elem.lastElementChild) {
      elem.removeChild(elem.lastElementChild);
    }

    elem.parentNode.removeChild(elem);

    if(!onlyHTML) {
      console.log("removing "+(index-1))
      opts.capeData.layers.splice(index-1, 1);

      console.warn('redraw');
      redraw();
    }
  }

  function openPatternEditor(e, index) {
    if(e) {
      const layerElem = e.target.closest(".layer");

      if (layerElem != null) {
        opts.editing = Array.from(layerElem.parentNode.children).indexOf(layerElem);
      }
    }

    if(index) opts.editing = index;
    const editLayerName = document.querySelector("#patternEditor h3");

    console.log(opts.editing);

    if(opts.editing === 0) {
      editLayerName.innerHTML = "Base Layer";
      document.querySelector("#patternSelector").style = "display:none";
      document.querySelector("#patternColor").value = opts.capeData.baseColor;
    } else {
      editLayerName.innerHTML = `Layer ${opts.editing}`
      document.querySelector("#patternSelector").style = "";
      setTimeout(function() {
        document.querySelector("#patternSelector").scrollTop = document.querySelector("#patternSelector").children[opts.capeData.layers[opts.editing-1].pattern].offsetTop;
      }, 2)
      changePattern(opts.capeData.layers[opts.editing-1].pattern);

      let currentLayer = opts.capeData.layers[opts.editing-1];
      document.querySelector("#patternColor").value = currentLayer.color;
    }

    calcColorPick();

    document.querySelector("#patternEditor").style = "";
  }

  function calcColorPick(e) {
    const h = document.querySelector("#colorH");
    const s = document.querySelector("#colorS");
    const l = document.querySelector("#colorV");
    const hex = document.querySelector("#patternColor");

    if(e != null && e.target.type === "range") {
      let hv, sv, lv, r, g, b, m, c, x;

      hv = h.value;
      sv = s.value;
      lv = l.value;

      hv /= 60
      if (hv < 0) hv = 6 - (-hv % 6)
      hv %= 6

      sv = Math.max(0, Math.min(1, sv / 100))
      lv = Math.max(0, Math.min(1, lv / 100))

      c = (1 - Math.abs((2 * lv) - 1)) * sv
      x = c * (1 - Math.abs((hv % 2) - 1))

      if (hv < 1) {
        r = c
        g = x
        b = 0
      } else if (hv < 2) {
        r = x
        g = c
        b = 0
      } else if (hv < 3) {
        r = 0
        g = c
        b = x
      } else if (hv < 4) {
        r = 0
        g = x
        b = c
      } else if (hv < 5) {
        r = x
        g = 0
        b = c
      } else {
        r = c
        g = 0
        b = x
      }

      m = lv - c / 2
      r = Math.round((r + m) * 255)
      g = Math.round((g + m) * 255)
      b = Math.round((b + m) * 255)

      r = ("0"+r.toString(16)).slice(-2);
      g = ("0"+g.toString(16)).slice(-2);
      b = ("0"+b.toString(16)).slice(-2);

      hex.value = r+g+b;
    } else {
      // Convert hex to RGB first
      let r = 0, g = 0, b = 0;

      let hx = hex.value;

      console.log(hx);

      if (hx.length === 3) {
        r = hx[0] + hx[0];
        g = hx[1] + hx[1];
        b = hx[2] + hx[2];
      } else if (hx.length === 6) {
        r = hx[0] + hx[1];
        g = hx[2] + hx[3];
        b = hx[4] + hx[5];
      }

      // Then to HSL
      r = parseInt(r, 16) / 255;
      g = parseInt(g, 16) / 255;
      b = parseInt(b, 16) / 255;

      let cmin = Math.min(r, g, b);
      let cmax = Math.max(r, g, b);
      let delta = cmax - cmin;
      let hv = 0;
      let sv = 0;
      let lv = 0;

      if (delta == 0)
        hv = 0;
      else if (cmax == r)
        hv = ((g - b) / delta) % 6;
      else if (cmax == g)
        hv = (b - r) / delta + 2;
      else
        hv = (r - g) / delta + 4;

      hv = Math.round(hv * 60);

      if (hv < 0) hv += 360;

      lv = (cmax + cmin) / 2;
      sv = (delta == 0) ? 0 : delta / (1 - Math.abs(2 * lv - 1));
      sv = +(sv * 100).toFixed(1);
      lv = +(lv * 100).toFixed(1);

      h.value = hv;
      s.value = sv;
      l.value = lv;
    }

    s.style = `background: linear-gradient(90deg, hsl(0, 0%, ${l.value}%), hsl(${h.value}, 100%, ${l.value}%));`;
    l.style = `background: linear-gradient(90deg, black, hsl(${h.value}, ${s.value}%, 50%), white);`;
  }

  function updateColor(e) {
    if (opts.editing != null) {
      const color = document.querySelector("#patternColor").value;

      if (opts.editing === 0) {
        opts.capeData.baseColor = color;
      } else {
        opts.capeData.layers[opts.editing - 1].color = color;
      }

      console.warn('redraw');
      redraw();
    }
  }
});
