/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/app.ts":
/*!********************!*\
  !*** ./src/app.ts ***!
  \********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var three__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! three */ "./node_modules/three/build/three.module.js");
/* harmony import */ var three_examples_jsm_controls_OrbitControls__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! three/examples/jsm/controls/OrbitControls */ "./node_modules/three/examples/jsm/controls/OrbitControls.js");
// 23FI078 永井颯胡


class ThreeJSContainer {
    scene;
    light;
    particleVelocity;
    particleCount = 10000;
    basePositions = [];
    targetPositions = [];
    renderer;
    camera;
    raycaster = new three__WEBPACK_IMPORTED_MODULE_1__.Raycaster();
    mouse = new three__WEBPACK_IMPORTED_MODULE_1__.Vector2();
    skullOffset = new three__WEBPACK_IMPORTED_MODULE_1__.Vector3(0, 0, 0);
    triggered = false;
    progress = 0;
    imagePaths = ["骸骨_2D.png", "star.png", "neko.png"];
    imageIndex = 0;
    rotationDuration = 1.0;
    rotationPause = 3.0;
    rotationTimer = 0;
    isRotating = false;
    currentColor = new three__WEBPACK_IMPORTED_MODULE_1__.Color(0xffffff);
    targetColor = new three__WEBPACK_IMPORTED_MODULE_1__.Color(0xffffff);
    rotationAngle = 0;
    center = new three__WEBPACK_IMPORTED_MODULE_1__.Vector3(0, 0, 0);
    // 爆発演出
    explosionTimers = [];
    explosionVectors = [];
    explosionDurations = [];
    // 衝撃波リング
    shockwaves = [];
    isExplosionInProgress() {
        return this.explosionTimers.some(t => t > 0);
    }
    constructor() { }
    createRendererDOM = (width, height, cameraPos) => {
        this.renderer = new three__WEBPACK_IMPORTED_MODULE_1__.WebGLRenderer();
        this.renderer.setSize(width, height);
        this.renderer.setClearColor(new three__WEBPACK_IMPORTED_MODULE_1__.Color(0x000000));
        this.renderer.shadowMap.enabled = true;
        this.camera = new three__WEBPACK_IMPORTED_MODULE_1__.PerspectiveCamera(75, width / height, 0.1, 1000);
        this.camera.position.copy(cameraPos);
        this.camera.lookAt(new three__WEBPACK_IMPORTED_MODULE_1__.Vector3(0, 0, 0));
        const orbitControls = new three_examples_jsm_controls_OrbitControls__WEBPACK_IMPORTED_MODULE_0__.OrbitControls(this.camera, this.renderer.domElement);
        this.createScene();
        const render = () => {
            orbitControls.update();
            this.renderer.render(this.scene, this.camera);
            requestAnimationFrame(render);
        };
        requestAnimationFrame(render);
        const handleInput = (clientX, clientY) => {
            const rect = this.renderer.domElement.getBoundingClientRect();
            this.mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
            this.mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;
            this.raycaster.setFromCamera(this.mouse, this.camera);
            const planeZ = new three__WEBPACK_IMPORTED_MODULE_1__.Plane(new three__WEBPACK_IMPORTED_MODULE_1__.Vector3(0, 0, 1), 0);
            const intersect = new three__WEBPACK_IMPORTED_MODULE_1__.Vector3();
            this.raycaster.ray.intersectPlane(planeZ, intersect);
            this.skullOffset.copy(intersect);
            let hitParticle = false;
            const maxExplosionDelay = 0.5;
            const maxExplosionDuration = 0.6;
            this.scene.children.forEach((obj, setIdx) => {
                if (obj instanceof three__WEBPACK_IMPORTED_MODULE_1__.Points) {
                    const geom = obj.geometry;
                    const positions = geom.getAttribute("position");
                    const count = positions.count;
                    for (let i = 0; i < count; i++) {
                        const px = positions.getX(i);
                        const py = positions.getY(i);
                        const pz = positions.getZ(i);
                        const p = new three__WEBPACK_IMPORTED_MODULE_1__.Vector3(px, py, pz);
                        const dist = this.skullOffset.distanceTo(p);
                        if (dist < 2.5) {
                            hitParticle = true;
                            const globalIdx = setIdx * count + i;
                            const delay = (dist / 2.5) * maxExplosionDelay;
                            const duration = maxExplosionDuration + delay;
                            const dir = new three__WEBPACK_IMPORTED_MODULE_1__.Vector3((Math.random() - 0.5), (Math.random() - 0.5), (Math.random() - 0.5)).clone().normalize().clone().multiplyScalar(3.0);
                            this.explosionTimers[globalIdx] = -delay;
                            this.explosionVectors[globalIdx] = dir;
                            this.explosionDurations[globalIdx] = duration;
                        }
                    }
                }
            });
            if (hitParticle) {
                const wave = new Shockwave(this.skullOffset.clone(), this.currentColor.clone());
                this.scene.add(wave.mesh);
                this.shockwaves.push(wave);
                return;
            }
            this.scene.children.forEach((obj, idx) => {
                if (obj instanceof three__WEBPACK_IMPORTED_MODULE_1__.Points) {
                    const geom = obj.geometry;
                    const positions = geom.getAttribute("position");
                    const base = new Float32Array(positions.array.length);
                    base.set(positions.array);
                    this.basePositions[idx] = base;
                }
            });
            const path = this.imagePaths[this.imageIndex];
            this.imageIndex = (this.imageIndex + 1) % this.imagePaths.length;
            if (path.includes("骸骨"))
                this.targetColor.set(0xff0000);
            else if (path.includes("star"))
                this.targetColor.set(0x00ff00);
            else if (path.includes("neko"))
                this.targetColor.set(0xff00ff);
            this.getTargetPositionsFromImage(path, 128, 128).then(skullPoints => {
                this.targetPositions = [];
                let offset = 0;
                this.scene.children.forEach((obj, index) => {
                    if (obj instanceof three__WEBPACK_IMPORTED_MODULE_1__.Points) {
                        const count = obj.geometry.getAttribute("position").count * 3;
                        const target = new Float32Array(count);
                        for (let i = 0; i < count; i += 3) {
                            const srcIdx = (offset + i) % skullPoints.length;
                            target[i] = skullPoints[srcIdx];
                            target[i + 1] = skullPoints[srcIdx + 1];
                            target[i + 2] = skullPoints[srcIdx + 2];
                        }
                        this.targetPositions.push(target);
                        offset += count;
                    }
                });
                this.triggered = true;
                this.progress = 0;
                this.rotationAngle = 0;
            });
        };
        this.renderer.domElement.addEventListener("click", (e) => handleInput(e.clientX, e.clientY));
        this.renderer.domElement.addEventListener("touchstart", (e) => {
            if (e.touches.length > 0) {
                handleInput(e.touches[0].clientX, e.touches[0].clientY);
            }
        });
        return this.renderer.domElement;
    };
    createScene() {
        this.scene = new three__WEBPACK_IMPORTED_MODULE_1__.Scene();
        const textureLoader = new three__WEBPACK_IMPORTED_MODULE_1__.TextureLoader();
        const clock = new three__WEBPACK_IMPORTED_MODULE_1__.Clock();
        const texturePaths = ['num0.png', 'num1-1.png'];
        const particlesPerTexture = Math.floor(this.particleCount / texturePaths.length);
        this.particleVelocity = [];
        for (let t = 0; t < texturePaths.length; t++) {
            const texture = textureLoader.load(texturePaths[t]);
            const geometry = new three__WEBPACK_IMPORTED_MODULE_1__.BufferGeometry();
            const positions = new Float32Array(particlesPerTexture * 3);
            const basePoint = new Float32Array(particlesPerTexture * 3);
            for (let i = 0; i < particlesPerTexture; i++) {
                const x = (Math.random() - 0.5) * 20;
                const y = Math.random() * 10;
                const z = (Math.random() - 0.5) * 20;
                positions[i * 3] = x;
                positions[i * 3 + 1] = y;
                positions[i * 3 + 2] = z;
                basePoint[i * 3] = x;
                basePoint[i * 3 + 1] = y;
                basePoint[i * 3 + 2] = z;
                this.particleVelocity.push(Math.random() * 0.5 + 0.2);
                this.explosionTimers.push(0);
                this.explosionVectors.push(new three__WEBPACK_IMPORTED_MODULE_1__.Vector3());
            }
            geometry.setAttribute('position', new three__WEBPACK_IMPORTED_MODULE_1__.BufferAttribute(positions, 3));
            this.basePositions.push(basePoint);
            const material = new three__WEBPACK_IMPORTED_MODULE_1__.PointsMaterial({
                size: 1.5,
                map: texture,
                blending: three__WEBPACK_IMPORTED_MODULE_1__.AdditiveBlending,
                color: this.currentColor.clone(),
                depthWrite: false,
                transparent: true
            });
            const points = new three__WEBPACK_IMPORTED_MODULE_1__.Points(geometry, material);
            this.scene.add(points);
        }
        this.light = new three__WEBPACK_IMPORTED_MODULE_1__.DirectionalLight(0xffffff);
        this.light.position.set(1, 1, 1).clone().normalize();
        this.scene.add(this.light);
        const update = () => {
            const deltaTime = clock.getDelta();
            const elapsed = clock.elapsedTime;
            if (this.triggered && this.progress < 1) {
                this.progress += deltaTime / 5;
                this.progress = Math.min(this.progress, 1);
            }
            if (this.progress >= 1) {
                this.rotationTimer += deltaTime;
                if (this.isRotating) {
                    const t = this.rotationTimer / this.rotationDuration;
                    if (t >= 1.0) {
                        this.rotationTimer = 0;
                        this.isRotating = false;
                    }
                    else {
                        const eased = easeInOutSine(t);
                        this.rotationAngle = eased * Math.PI * 2;
                    }
                }
                else if (this.rotationTimer >= this.rotationPause) {
                    this.rotationTimer = 0;
                    this.isRotating = true;
                }
            }
            let velocityIndex = 0;
            let particleSetIndex = 0;
            const cosA = Math.cos(this.rotationAngle);
            const sinA = Math.sin(this.rotationAngle);
            const cx = this.center.x;
            const cy = this.center.y;
            const cz = this.center.z;
            this.scene.children.forEach(obj => {
                if (obj instanceof three__WEBPACK_IMPORTED_MODULE_1__.Points) {
                    const geom = obj.geometry;
                    const positions = geom.getAttribute('position');
                    const base = this.basePositions[particleSetIndex];
                    const target = this.targetPositions[particleSetIndex] || base;
                    const material = obj.material;
                    material.color.lerp(this.targetColor, deltaTime * 0.5);
                    this.currentColor.copy(material.color);
                    for (let i = 0; i < positions.count; i++) {
                        const ix = i * 3;
                        const x0 = base[ix];
                        const y0 = base[ix + 1];
                        const z0 = base[ix + 2];
                        const tx = target[ix];
                        const ty = target[ix + 1];
                        const tz = target[ix + 2];
                        let x, y, z;
                        if (this.progress < 1) {
                            const waveSpeed = this.particleVelocity[velocityIndex];
                            const yWave = Math.sin(elapsed * waveSpeed + x0 * 0.5 + z0 * 0.5) * 1.5;
                            x = x0 * (1 - this.progress) + tx * this.progress;
                            y = y0 * (1 - this.progress) + ty * this.progress + yWave;
                            z = z0 * (1 - this.progress) + tz * this.progress;
                        }
                        else {
                            const dx = tx - cx;
                            const dz = tz - cz;
                            const waveSpeed = this.particleVelocity[velocityIndex];
                            const yWave = Math.sin(elapsed * waveSpeed + x0 * 0.5 + z0 * 0.5) * 1.5;
                            x = dx * cosA - dz * sinA + cx;
                            y = ty + yWave;
                            z = dx * sinA + dz * cosA + cz;
                        }
                        const globalIdx = particleSetIndex * positions.count + i;
                        if (this.explosionTimers[globalIdx] !== 0) {
                            this.explosionTimers[globalIdx] += deltaTime;
                            if (this.explosionTimers[globalIdx] > 0) {
                                const dir = this.explosionVectors[globalIdx];
                                const duration = this.explosionDurations[globalIdx] || 0.6;
                                if (this.explosionTimers[globalIdx] <= duration) {
                                    const t = this.explosionTimers[globalIdx];
                                    x += dir.x * t * 5;
                                    y += dir.y * t * 5;
                                    z += dir.z * t * 5;
                                }
                                else {
                                    this.explosionTimers[globalIdx] = 0;
                                }
                            }
                        }
                        positions.setXYZ(i, x, y, z);
                        velocityIndex++;
                    }
                    positions.needsUpdate = true;
                    particleSetIndex++;
                }
            });
            // 衝撃波リングの更新
            this.shockwaves = this.shockwaves.filter(wave => {
                const expired = wave.update(deltaTime);
                if (expired) {
                    this.scene.remove(wave.mesh);
                }
                return !expired;
            });
            requestAnimationFrame(update);
        };
        requestAnimationFrame(update);
    }
    getTargetPositionsFromImage = (path, width, height) => {
        return new Promise((resolve) => {
            const img = new Image();
            img.src = path;
            img.onload = () => {
                const canvas = document.createElement("canvas");
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, width, height);
                const data = ctx.getImageData(0, 0, width, height).data;
                const points = [];
                let sumX = 0, sumY = 0, sumZ = 0;
                for (let y = 0; y < height; y++) {
                    for (let x = 0; x < width; x++) {
                        const idx = (y * width + x) * 4;
                        const r = data[idx], g = data[idx + 1], b = data[idx + 2];
                        const brightness = (r + g + b) / 3;
                        if (brightness > 128) {
                            const px = (x / width - 0.5) * 20 + this.skullOffset.x;
                            const py = (1 - y / height - 0.5) * 20 + this.skullOffset.y;
                            const pz = 0 + this.skullOffset.z;
                            points.push(px, py, pz);
                            sumX += px;
                            sumY += py;
                            sumZ += pz;
                        }
                    }
                }
                const len = points.length / 3;
                this.center.set(sumX / len, sumY / len, sumZ / len);
                resolve(new Float32Array(points));
            };
        });
    };
}
// 衝撃波クラス
class Shockwave {
    mesh;
    life = 1.0;
    constructor(center, color) {
        const geometry = new three__WEBPACK_IMPORTED_MODULE_1__.RingGeometry(0.5, 0.55, 64);
        const material = new three__WEBPACK_IMPORTED_MODULE_1__.MeshBasicMaterial({
            color: color.clone(),
            transparent: true,
            opacity: 0.5,
            side: three__WEBPACK_IMPORTED_MODULE_1__.DoubleSide,
            depthWrite: false
        });
        this.mesh = new three__WEBPACK_IMPORTED_MODULE_1__.Mesh(geometry, material);
        this.mesh.rotation.x = -Math.PI / 2;
        this.mesh.position.copy(center);
        this.mesh.scale.set(0.1, 0.1, 0.1);
    }
    update(deltaTime) {
        this.life -= deltaTime;
        const scale = 1.0 + (1.0 - this.life) * 30.0;
        this.mesh.scale.set(scale, scale, scale);
        this.mesh.material.opacity = this.life;
        return this.life <= 0;
    }
}
function easeInOutSine(t) {
    return -(Math.cos(Math.PI * t) - 1) / 2;
}
function init() {
    const container = new ThreeJSContainer();
    const cameraPosition = new three__WEBPACK_IMPORTED_MODULE_1__.Vector3(0, 5, 20);
    const viewport = container.createRendererDOM(640, 480, cameraPosition);
    document.body.appendChild(viewport);
}
window.addEventListener("DOMContentLoaded", init);


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/chunk loaded */
/******/ 	(() => {
/******/ 		var deferred = [];
/******/ 		__webpack_require__.O = (result, chunkIds, fn, priority) => {
/******/ 			if(chunkIds) {
/******/ 				priority = priority || 0;
/******/ 				for(var i = deferred.length; i > 0 && deferred[i - 1][2] > priority; i--) deferred[i] = deferred[i - 1];
/******/ 				deferred[i] = [chunkIds, fn, priority];
/******/ 				return;
/******/ 			}
/******/ 			var notFulfilled = Infinity;
/******/ 			for (var i = 0; i < deferred.length; i++) {
/******/ 				var [chunkIds, fn, priority] = deferred[i];
/******/ 				var fulfilled = true;
/******/ 				for (var j = 0; j < chunkIds.length; j++) {
/******/ 					if ((priority & 1 === 0 || notFulfilled >= priority) && Object.keys(__webpack_require__.O).every((key) => (__webpack_require__.O[key](chunkIds[j])))) {
/******/ 						chunkIds.splice(j--, 1);
/******/ 					} else {
/******/ 						fulfilled = false;
/******/ 						if(priority < notFulfilled) notFulfilled = priority;
/******/ 					}
/******/ 				}
/******/ 				if(fulfilled) {
/******/ 					deferred.splice(i--, 1)
/******/ 					var r = fn();
/******/ 					if (r !== undefined) result = r;
/******/ 				}
/******/ 			}
/******/ 			return result;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/jsonp chunk loading */
/******/ 	(() => {
/******/ 		// no baseURI
/******/ 		
/******/ 		// object to store loaded and loading chunks
/******/ 		// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 		// [resolve, reject, Promise] = chunk loading, 0 = chunk loaded
/******/ 		var installedChunks = {
/******/ 			"main": 0
/******/ 		};
/******/ 		
/******/ 		// no chunk on demand loading
/******/ 		
/******/ 		// no prefetching
/******/ 		
/******/ 		// no preloaded
/******/ 		
/******/ 		// no HMR
/******/ 		
/******/ 		// no HMR manifest
/******/ 		
/******/ 		__webpack_require__.O.j = (chunkId) => (installedChunks[chunkId] === 0);
/******/ 		
/******/ 		// install a JSONP callback for chunk loading
/******/ 		var webpackJsonpCallback = (parentChunkLoadingFunction, data) => {
/******/ 			var [chunkIds, moreModules, runtime] = data;
/******/ 			// add "moreModules" to the modules object,
/******/ 			// then flag all "chunkIds" as loaded and fire callback
/******/ 			var moduleId, chunkId, i = 0;
/******/ 			if(chunkIds.some((id) => (installedChunks[id] !== 0))) {
/******/ 				for(moduleId in moreModules) {
/******/ 					if(__webpack_require__.o(moreModules, moduleId)) {
/******/ 						__webpack_require__.m[moduleId] = moreModules[moduleId];
/******/ 					}
/******/ 				}
/******/ 				if(runtime) var result = runtime(__webpack_require__);
/******/ 			}
/******/ 			if(parentChunkLoadingFunction) parentChunkLoadingFunction(data);
/******/ 			for(;i < chunkIds.length; i++) {
/******/ 				chunkId = chunkIds[i];
/******/ 				if(__webpack_require__.o(installedChunks, chunkId) && installedChunks[chunkId]) {
/******/ 					installedChunks[chunkId][0]();
/******/ 				}
/******/ 				installedChunks[chunkId] = 0;
/******/ 			}
/******/ 			return __webpack_require__.O(result);
/******/ 		}
/******/ 		
/******/ 		var chunkLoadingGlobal = self["webpackChunkcgprendering"] = self["webpackChunkcgprendering"] || [];
/******/ 		chunkLoadingGlobal.forEach(webpackJsonpCallback.bind(null, 0));
/******/ 		chunkLoadingGlobal.push = webpackJsonpCallback.bind(null, chunkLoadingGlobal.push.bind(chunkLoadingGlobal));
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module depends on other loaded chunks and execution need to be delayed
/******/ 	var __webpack_exports__ = __webpack_require__.O(undefined, ["vendors-node_modules_three_examples_jsm_controls_OrbitControls_js"], () => (__webpack_require__("./src/app.ts")))
/******/ 	__webpack_exports__ = __webpack_require__.O(__webpack_exports__);
/******/ 	
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBQUEsZUFBZTtBQUNnQjtBQUMyQztBQUUxRSxNQUFNLGdCQUFnQjtJQUNWLEtBQUssQ0FBYztJQUNuQixLQUFLLENBQWM7SUFDbkIsZ0JBQWdCLENBQVc7SUFDM0IsYUFBYSxHQUFHLEtBQUssQ0FBQztJQUN0QixhQUFhLEdBQW1CLEVBQUUsQ0FBQztJQUNuQyxlQUFlLEdBQW1CLEVBQUUsQ0FBQztJQUNyQyxRQUFRLENBQXNCO0lBQzlCLE1BQU0sQ0FBMEI7SUFDaEMsU0FBUyxHQUFHLElBQUksNENBQWUsRUFBRSxDQUFDO0lBQ2xDLEtBQUssR0FBRyxJQUFJLDBDQUFhLEVBQUUsQ0FBQztJQUM1QixXQUFXLEdBQUcsSUFBSSwwQ0FBYSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDekMsU0FBUyxHQUFHLEtBQUssQ0FBQztJQUNsQixRQUFRLEdBQUcsQ0FBQyxDQUFDO0lBQ2IsVUFBVSxHQUFHLENBQUMsV0FBVyxFQUFFLFVBQVUsRUFBRSxVQUFVLENBQUMsQ0FBQztJQUNuRCxVQUFVLEdBQUcsQ0FBQyxDQUFDO0lBQ2YsZ0JBQWdCLEdBQUcsR0FBRyxDQUFDO0lBQ3ZCLGFBQWEsR0FBRyxHQUFHLENBQUM7SUFDcEIsYUFBYSxHQUFHLENBQUMsQ0FBQztJQUNsQixVQUFVLEdBQUcsS0FBSyxDQUFDO0lBQ25CLFlBQVksR0FBRyxJQUFJLHdDQUFXLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDekMsV0FBVyxHQUFHLElBQUksd0NBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUN4QyxhQUFhLEdBQUcsQ0FBQyxDQUFDO0lBQ2xCLE1BQU0sR0FBRyxJQUFJLDBDQUFhLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUU1QyxPQUFPO0lBQ0MsZUFBZSxHQUFhLEVBQUUsQ0FBQztJQUMvQixnQkFBZ0IsR0FBb0IsRUFBRSxDQUFDO0lBQ3ZDLGtCQUFrQixHQUFhLEVBQUUsQ0FBQztJQUUxQyxTQUFTO0lBQ0QsVUFBVSxHQUFnQixFQUFFLENBQUM7SUFFN0IscUJBQXFCO1FBQ3pCLE9BQU8sSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDakQsQ0FBQztJQUVELGdCQUFnQixDQUFDO0lBRVYsaUJBQWlCLEdBQUcsQ0FBQyxLQUFhLEVBQUUsTUFBYyxFQUFFLFNBQXdCLEVBQUUsRUFBRTtRQUNuRixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksZ0RBQW1CLEVBQUUsQ0FBQztRQUMxQyxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDckMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsSUFBSSx3Q0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7UUFDdkQsSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztRQUV2QyxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksb0RBQXVCLENBQUMsRUFBRSxFQUFFLEtBQUssR0FBRyxNQUFNLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ3pFLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUNyQyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLDBDQUFhLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRS9DLE1BQU0sYUFBYSxHQUFHLElBQUksb0ZBQWEsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDL0UsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBRW5CLE1BQU0sTUFBTSxHQUF5QixHQUFHLEVBQUU7WUFDdEMsYUFBYSxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQ3ZCLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQzlDLHFCQUFxQixDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ2xDLENBQUMsQ0FBQztRQUNGLHFCQUFxQixDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBRTlCLE1BQU0sV0FBVyxHQUFHLENBQUMsT0FBZSxFQUFFLE9BQWUsRUFBRSxFQUFFO1lBQ3JELE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLHFCQUFxQixFQUFFLENBQUM7WUFDOUQsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDNUQsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUM3RCxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUV0RCxNQUFNLE1BQU0sR0FBRyxJQUFJLHdDQUFXLENBQUMsSUFBSSwwQ0FBYSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDOUQsTUFBTSxTQUFTLEdBQUcsSUFBSSwwQ0FBYSxFQUFFLENBQUM7WUFDdEMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLE1BQU0sRUFBRSxTQUFTLENBQUMsQ0FBQztZQUNyRCxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUdqQyxJQUFJLFdBQVcsR0FBRyxLQUFLLENBQUM7WUFDeEIsTUFBTSxpQkFBaUIsR0FBRyxHQUFHLENBQUM7WUFDOUIsTUFBTSxvQkFBb0IsR0FBRyxHQUFHLENBQUM7WUFFakMsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsR0FBRyxFQUFFLE1BQU0sRUFBRSxFQUFFO2dCQUN4QyxJQUFJLEdBQUcsWUFBWSx5Q0FBWSxFQUFFO29CQUM3QixNQUFNLElBQUksR0FBRyxHQUFHLENBQUMsUUFBZ0MsQ0FBQztvQkFDbEQsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxVQUFVLENBQUMsQ0FBQztvQkFDaEQsTUFBTSxLQUFLLEdBQUcsU0FBUyxDQUFDLEtBQUssQ0FBQztvQkFFOUIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssRUFBRSxDQUFDLEVBQUUsRUFBRTt3QkFDNUIsTUFBTSxFQUFFLEdBQUcsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQzt3QkFDN0IsTUFBTSxFQUFFLEdBQUcsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQzt3QkFDN0IsTUFBTSxFQUFFLEdBQUcsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQzt3QkFDN0IsTUFBTSxDQUFDLEdBQUcsSUFBSSwwQ0FBYSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7d0JBQ3hDLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO3dCQUU1QyxJQUFJLElBQUksR0FBRyxHQUFHLEVBQUU7NEJBQ1osV0FBVyxHQUFHLElBQUksQ0FBQzs0QkFDbkIsTUFBTSxTQUFTLEdBQUcsTUFBTSxHQUFHLEtBQUssR0FBRyxDQUFDLENBQUM7NEJBQ3JDLE1BQU0sS0FBSyxHQUFHLENBQUMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxHQUFHLGlCQUFpQixDQUFDOzRCQUMvQyxNQUFNLFFBQVEsR0FBRyxvQkFBb0IsR0FBRyxLQUFLLENBQUM7NEJBRTlDLE1BQU0sR0FBRyxHQUFHLElBQUksMENBQWEsQ0FDekIsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsR0FBRyxDQUFDLEVBQ3JCLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLEdBQUcsQ0FBQyxFQUNyQixDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FDeEIsU0FBQyxTQUFTLEVBQUUsU0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLENBQUM7NEJBRWxDLElBQUksQ0FBQyxlQUFlLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUM7NEJBQ3pDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLENBQUMsR0FBRyxHQUFHLENBQUM7NEJBQ3ZDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxTQUFTLENBQUMsR0FBRyxRQUFRLENBQUM7eUJBQ2pEO3FCQUNKO2lCQUNKO1lBQ0wsQ0FBQyxDQUFDLENBQUM7WUFFSCxJQUFJLFdBQVcsRUFBRTtnQkFDYixNQUFNLElBQUksR0FBRyxJQUFJLFNBQVMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztnQkFDaEYsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUMxQixJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDM0IsT0FBTzthQUNWO1lBR0QsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUFFO2dCQUNyQyxJQUFJLEdBQUcsWUFBWSx5Q0FBWSxFQUFFO29CQUM3QixNQUFNLElBQUksR0FBRyxHQUFHLENBQUMsUUFBZ0MsQ0FBQztvQkFDbEQsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxVQUFVLENBQUMsQ0FBQztvQkFDaEQsTUFBTSxJQUFJLEdBQUcsSUFBSSxZQUFZLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztvQkFDdEQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUM7b0JBQzFCLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDO2lCQUNsQztZQUNMLENBQUMsQ0FBQyxDQUFDO1lBRUgsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDOUMsSUFBSSxDQUFDLFVBQVUsR0FBRyxDQUFDLElBQUksQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUM7WUFFakUsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQztnQkFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztpQkFDbkQsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQztnQkFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztpQkFDMUQsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQztnQkFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUUvRCxJQUFJLENBQUMsMkJBQTJCLENBQUMsSUFBSSxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEVBQUU7Z0JBQ2hFLElBQUksQ0FBQyxlQUFlLEdBQUcsRUFBRSxDQUFDO2dCQUMxQixJQUFJLE1BQU0sR0FBRyxDQUFDLENBQUM7Z0JBQ2YsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsR0FBRyxFQUFFLEtBQUssRUFBRSxFQUFFO29CQUN2QyxJQUFJLEdBQUcsWUFBWSx5Q0FBWSxFQUFFO3dCQUM3QixNQUFNLEtBQUssR0FBRyxHQUFHLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxVQUFVLENBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDO3dCQUM5RCxNQUFNLE1BQU0sR0FBRyxJQUFJLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQzt3QkFDdkMsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFOzRCQUMvQixNQUFNLE1BQU0sR0FBRyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsR0FBRyxXQUFXLENBQUMsTUFBTSxDQUFDOzRCQUNqRCxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDOzRCQUNoQyxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLFdBQVcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7NEJBQ3hDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsV0FBVyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQzt5QkFDM0M7d0JBQ0QsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7d0JBQ2xDLE1BQU0sSUFBSSxLQUFLLENBQUM7cUJBQ25CO2dCQUNMLENBQUMsQ0FBQyxDQUFDO2dCQUNILElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDO2dCQUN0QixJQUFJLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQztnQkFDbEIsSUFBSSxDQUFDLGFBQWEsR0FBRyxDQUFDLENBQUM7WUFDM0IsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDLENBQUM7UUFFRixJQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1FBQzdGLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLGdCQUFnQixDQUFDLFlBQVksRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFO1lBQzFELElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO2dCQUN0QixXQUFXLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQzthQUMzRDtRQUNMLENBQUMsQ0FBQyxDQUFDO1FBRUgsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQztJQUNwQyxDQUFDO0lBRU8sV0FBVztRQUNmLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSx3Q0FBVyxFQUFFLENBQUM7UUFDL0IsTUFBTSxhQUFhLEdBQUcsSUFBSSxnREFBbUIsRUFBRSxDQUFDO1FBQ2hELE1BQU0sS0FBSyxHQUFHLElBQUksd0NBQVcsRUFBRSxDQUFDO1FBQ2hDLE1BQU0sWUFBWSxHQUFHLENBQUMsVUFBVSxFQUFFLFlBQVksQ0FBQyxDQUFDO1FBQ2hELE1BQU0sbUJBQW1CLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsYUFBYSxHQUFHLFlBQVksQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNqRixJQUFJLENBQUMsZ0JBQWdCLEdBQUcsRUFBRSxDQUFDO1FBRTNCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxZQUFZLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQzFDLE1BQU0sT0FBTyxHQUFHLGFBQWEsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDcEQsTUFBTSxRQUFRLEdBQUcsSUFBSSxpREFBb0IsRUFBRSxDQUFDO1lBQzVDLE1BQU0sU0FBUyxHQUFHLElBQUksWUFBWSxDQUFDLG1CQUFtQixHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQzVELE1BQU0sU0FBUyxHQUFHLElBQUksWUFBWSxDQUFDLG1CQUFtQixHQUFHLENBQUMsQ0FBQyxDQUFDO1lBRTVELEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxtQkFBbUIsRUFBRSxDQUFDLEVBQUUsRUFBRTtnQkFDMUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDO2dCQUNyQyxNQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxDQUFDO2dCQUM3QixNQUFNLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUM7Z0JBQ3JDLFNBQVMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUNyQixTQUFTLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQ3pCLFNBQVMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDekIsU0FBUyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQ3JCLFNBQVMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDekIsU0FBUyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUN6QixJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUM7Z0JBQ3RELElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUM3QixJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLElBQUksMENBQWEsRUFBRSxDQUFDLENBQUM7YUFDbkQ7WUFFRCxRQUFRLENBQUMsWUFBWSxDQUFDLFVBQVUsRUFBRSxJQUFJLGtEQUFxQixDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzNFLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBRW5DLE1BQU0sUUFBUSxHQUFHLElBQUksaURBQW9CLENBQUM7Z0JBQ3RDLElBQUksRUFBRSxHQUFHO2dCQUNULEdBQUcsRUFBRSxPQUFPO2dCQUNaLFFBQVEsRUFBRSxtREFBc0I7Z0JBQ2hDLEtBQUssRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssRUFBRTtnQkFDaEMsVUFBVSxFQUFFLEtBQUs7Z0JBQ2pCLFdBQVcsRUFBRSxJQUFJO2FBQ3BCLENBQUMsQ0FBQztZQUVILE1BQU0sTUFBTSxHQUFHLElBQUkseUNBQVksQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFDcEQsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7U0FDMUI7UUFFRCxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksbURBQXNCLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDbEQsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLFNBQUMsU0FBUyxFQUFFLENBQUM7UUFDN0MsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBRTNCLE1BQU0sTUFBTSxHQUF5QixHQUFHLEVBQUU7WUFDdEMsTUFBTSxTQUFTLEdBQUcsS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQ25DLE1BQU0sT0FBTyxHQUFHLEtBQUssQ0FBQyxXQUFXLENBQUM7WUFFbEMsSUFBSSxJQUFJLENBQUMsU0FBUyxJQUFJLElBQUksQ0FBQyxRQUFRLEdBQUcsQ0FBQyxFQUFFO2dCQUNyQyxJQUFJLENBQUMsUUFBUSxJQUFJLFNBQVMsR0FBRyxDQUFDLENBQUM7Z0JBQy9CLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDO2FBQzlDO1lBRUQsSUFBSSxJQUFJLENBQUMsUUFBUSxJQUFJLENBQUMsRUFBRTtnQkFDcEIsSUFBSSxDQUFDLGFBQWEsSUFBSSxTQUFTLENBQUM7Z0JBQ2hDLElBQUksSUFBSSxDQUFDLFVBQVUsRUFBRTtvQkFDakIsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUM7b0JBQ3JELElBQUksQ0FBQyxJQUFJLEdBQUcsRUFBRTt3QkFDVixJQUFJLENBQUMsYUFBYSxHQUFHLENBQUMsQ0FBQzt3QkFDdkIsSUFBSSxDQUFDLFVBQVUsR0FBRyxLQUFLLENBQUM7cUJBQzNCO3lCQUFNO3dCQUNILE1BQU0sS0FBSyxHQUFHLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQzt3QkFDL0IsSUFBSSxDQUFDLGFBQWEsR0FBRyxLQUFLLEdBQUcsSUFBSSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7cUJBQzVDO2lCQUNKO3FCQUFNLElBQUksSUFBSSxDQUFDLGFBQWEsSUFBSSxJQUFJLENBQUMsYUFBYSxFQUFFO29CQUNqRCxJQUFJLENBQUMsYUFBYSxHQUFHLENBQUMsQ0FBQztvQkFDdkIsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUM7aUJBQzFCO2FBQ0o7WUFFRCxJQUFJLGFBQWEsR0FBRyxDQUFDLENBQUM7WUFDdEIsSUFBSSxnQkFBZ0IsR0FBRyxDQUFDLENBQUM7WUFFekIsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7WUFDMUMsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7WUFDMUMsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFDekIsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFDekIsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFFekIsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFO2dCQUM5QixJQUFJLEdBQUcsWUFBWSx5Q0FBWSxFQUFFO29CQUM3QixNQUFNLElBQUksR0FBRyxHQUFHLENBQUMsUUFBZ0MsQ0FBQztvQkFDbEQsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxVQUFVLENBQUMsQ0FBQztvQkFDaEQsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO29CQUNsRCxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLGdCQUFnQixDQUFDLElBQUksSUFBSSxDQUFDO29CQUM5RCxNQUFNLFFBQVEsR0FBRyxHQUFHLENBQUMsUUFBZ0MsQ0FBQztvQkFFdEQsUUFBUSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxTQUFTLEdBQUcsR0FBRyxDQUFDLENBQUM7b0JBQ3ZELElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQztvQkFFdkMsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxFQUFFLEVBQUU7d0JBQ3RDLE1BQU0sRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7d0JBQ2pCLE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQzt3QkFDcEIsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQzt3QkFDeEIsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQzt3QkFDeEIsTUFBTSxFQUFFLEdBQUcsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDO3dCQUN0QixNQUFNLEVBQUUsR0FBRyxNQUFNLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO3dCQUMxQixNQUFNLEVBQUUsR0FBRyxNQUFNLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO3dCQUMxQixJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO3dCQUVaLElBQUksSUFBSSxDQUFDLFFBQVEsR0FBRyxDQUFDLEVBQUU7NEJBQ25CLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxhQUFhLENBQUMsQ0FBQzs0QkFDdkQsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEdBQUcsU0FBUyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQzs0QkFDeEUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7NEJBQ2xELENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQzs0QkFDMUQsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7eUJBQ3JEOzZCQUFNOzRCQUNILE1BQU0sRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUM7NEJBQ25CLE1BQU0sRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUM7NEJBQ25CLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxhQUFhLENBQUMsQ0FBQzs0QkFDdkQsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEdBQUcsU0FBUyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQzs0QkFDeEUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxJQUFJLEdBQUcsRUFBRSxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7NEJBQy9CLENBQUMsR0FBRyxFQUFFLEdBQUcsS0FBSyxDQUFDOzRCQUNmLENBQUMsR0FBRyxFQUFFLEdBQUcsSUFBSSxHQUFHLEVBQUUsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO3lCQUNsQzt3QkFFRCxNQUFNLFNBQVMsR0FBRyxnQkFBZ0IsR0FBRyxTQUFTLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQzt3QkFDekQsSUFBSSxJQUFJLENBQUMsZUFBZSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsRUFBRTs0QkFDdkMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxTQUFTLENBQUMsSUFBSSxTQUFTLENBQUM7NEJBQzdDLElBQUksSUFBSSxDQUFDLGVBQWUsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLEVBQUU7Z0NBQ3JDLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLENBQUMsQ0FBQztnQ0FDN0MsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFNBQVMsQ0FBQyxJQUFJLEdBQUcsQ0FBQztnQ0FDM0QsSUFBSSxJQUFJLENBQUMsZUFBZSxDQUFDLFNBQVMsQ0FBQyxJQUFJLFFBQVEsRUFBRTtvQ0FDN0MsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxTQUFTLENBQUMsQ0FBQztvQ0FDMUMsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztvQ0FDbkIsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztvQ0FDbkIsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztpQ0FDdEI7cUNBQU07b0NBQ0gsSUFBSSxDQUFDLGVBQWUsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUM7aUNBQ3ZDOzZCQUNKO3lCQUNKO3dCQUVELFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7d0JBQzdCLGFBQWEsRUFBRSxDQUFDO3FCQUNuQjtvQkFFRCxTQUFTLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQztvQkFDN0IsZ0JBQWdCLEVBQUUsQ0FBQztpQkFDdEI7WUFDTCxDQUFDLENBQUMsQ0FBQztZQUVILFlBQVk7WUFDWixJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFO2dCQUM1QyxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDO2dCQUN2QyxJQUFJLE9BQU8sRUFBRTtvQkFDVCxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7aUJBQ2hDO2dCQUNELE9BQU8sQ0FBQyxPQUFPLENBQUM7WUFDcEIsQ0FBQyxDQUFDLENBQUM7WUFFSCxxQkFBcUIsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNsQyxDQUFDLENBQUM7UUFDRixxQkFBcUIsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUNsQyxDQUFDO0lBRU8sMkJBQTJCLEdBQUcsQ0FBQyxJQUFZLEVBQUUsS0FBYSxFQUFFLE1BQWMsRUFBeUIsRUFBRTtRQUN6RyxPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUU7WUFDM0IsTUFBTSxHQUFHLEdBQUcsSUFBSSxLQUFLLEVBQUUsQ0FBQztZQUN4QixHQUFHLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQztZQUNmLEdBQUcsQ0FBQyxNQUFNLEdBQUcsR0FBRyxFQUFFO2dCQUNkLE1BQU0sTUFBTSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7Z0JBQ2hELE1BQU0sQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO2dCQUNyQixNQUFNLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztnQkFDdkIsTUFBTSxHQUFHLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDcEMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUM7Z0JBQ3hDLE1BQU0sSUFBSSxHQUFHLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDO2dCQUN4RCxNQUFNLE1BQU0sR0FBRyxFQUFFLENBQUM7Z0JBQ2xCLElBQUksSUFBSSxHQUFHLENBQUMsRUFBRSxJQUFJLEdBQUcsQ0FBQyxFQUFFLElBQUksR0FBRyxDQUFDLENBQUM7Z0JBRWpDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7b0JBQzdCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxLQUFLLEVBQUUsQ0FBQyxFQUFFLEVBQUU7d0JBQzVCLE1BQU0sR0FBRyxHQUFHLENBQUMsQ0FBQyxHQUFHLEtBQUssR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7d0JBQ2hDLE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQzt3QkFDMUQsTUFBTSxVQUFVLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQzt3QkFDbkMsSUFBSSxVQUFVLEdBQUcsR0FBRyxFQUFFOzRCQUNsQixNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUMsR0FBRyxLQUFLLEdBQUcsR0FBRyxDQUFDLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDOzRCQUN2RCxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsTUFBTSxHQUFHLEdBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQzs0QkFDNUQsTUFBTSxFQUFFLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDOzRCQUNsQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7NEJBQ3hCLElBQUksSUFBSSxFQUFFLENBQUM7NEJBQ1gsSUFBSSxJQUFJLEVBQUUsQ0FBQzs0QkFDWCxJQUFJLElBQUksRUFBRSxDQUFDO3lCQUNkO3FCQUNKO2lCQUNKO2dCQUVELE1BQU0sR0FBRyxHQUFHLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO2dCQUM5QixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEdBQUcsR0FBRyxFQUFFLElBQUksR0FBRyxHQUFHLEVBQUUsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDO2dCQUNwRCxPQUFPLENBQUMsSUFBSSxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUN0QyxDQUFDLENBQUM7UUFDTixDQUFDLENBQUMsQ0FBQztJQUNQLENBQUMsQ0FBQztDQUNMO0FBRUQsU0FBUztBQUNULE1BQU0sU0FBUztJQUNKLElBQUksQ0FBYTtJQUNqQixJQUFJLEdBQVcsR0FBRyxDQUFDO0lBRTFCLFlBQVksTUFBcUIsRUFBRSxLQUFrQjtRQUNqRCxNQUFNLFFBQVEsR0FBRyxJQUFJLCtDQUFrQixDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDdkQsTUFBTSxRQUFRLEdBQUcsSUFBSSxvREFBdUIsQ0FBQztZQUN6QyxLQUFLLEVBQUUsS0FBSyxDQUFDLEtBQUssRUFBRTtZQUNwQixXQUFXLEVBQUUsSUFBSTtZQUNqQixPQUFPLEVBQUUsR0FBRztZQUNaLElBQUksRUFBRSw2Q0FBZ0I7WUFDdEIsVUFBVSxFQUFFLEtBQUs7U0FDcEIsQ0FBQyxDQUFDO1FBQ0gsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLHVDQUFVLENBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQy9DLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ3BDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNoQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztJQUN2QyxDQUFDO0lBRU0sTUFBTSxDQUFDLFNBQWlCO1FBQzNCLElBQUksQ0FBQyxJQUFJLElBQUksU0FBUyxDQUFDO1FBQ3ZCLE1BQU0sS0FBSyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDO1FBQzdDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ3hDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBMkIsQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztRQUMzRCxPQUFPLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDO0lBQzFCLENBQUM7Q0FDSjtBQUVELFNBQVMsYUFBYSxDQUFDLENBQVM7SUFDNUIsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUM1QyxDQUFDO0FBRUQsU0FBUyxJQUFJO0lBQ1QsTUFBTSxTQUFTLEdBQUcsSUFBSSxnQkFBZ0IsRUFBRSxDQUFDO0lBQ3pDLE1BQU0sY0FBYyxHQUFHLElBQUksMENBQWEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQ25ELE1BQU0sUUFBUSxHQUFHLFNBQVMsQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLGNBQWMsQ0FBQyxDQUFDO0lBQ3ZFLFFBQVEsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ3hDLENBQUM7QUFFRCxNQUFNLENBQUMsZ0JBQWdCLENBQUMsa0JBQWtCLEVBQUUsSUFBSSxDQUFDLENBQUM7Ozs7Ozs7VUMxWmxEO1VBQ0E7O1VBRUE7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7O1VBRUE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7O1VBRUE7VUFDQTs7Ozs7V0N6QkE7V0FDQTtXQUNBO1dBQ0E7V0FDQSwrQkFBK0Isd0NBQXdDO1dBQ3ZFO1dBQ0E7V0FDQTtXQUNBO1dBQ0EsaUJBQWlCLHFCQUFxQjtXQUN0QztXQUNBO1dBQ0Esa0JBQWtCLHFCQUFxQjtXQUN2QztXQUNBO1dBQ0EsS0FBSztXQUNMO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTs7Ozs7V0MzQkE7V0FDQTtXQUNBO1dBQ0E7V0FDQSx5Q0FBeUMsd0NBQXdDO1dBQ2pGO1dBQ0E7V0FDQTs7Ozs7V0NQQTs7Ozs7V0NBQTtXQUNBO1dBQ0E7V0FDQSx1REFBdUQsaUJBQWlCO1dBQ3hFO1dBQ0EsZ0RBQWdELGFBQWE7V0FDN0Q7Ozs7O1dDTkE7O1dBRUE7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBOztXQUVBOztXQUVBOztXQUVBOztXQUVBOztXQUVBOztXQUVBOztXQUVBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLE1BQU0scUJBQXFCO1dBQzNCO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7O1dBRUE7V0FDQTtXQUNBOzs7OztVRWhEQTtVQUNBO1VBQ0E7VUFDQTtVQUNBIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vY2dwcmVuZGVyaW5nLy4vc3JjL2FwcC50cyIsIndlYnBhY2s6Ly9jZ3ByZW5kZXJpbmcvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vY2dwcmVuZGVyaW5nL3dlYnBhY2svcnVudGltZS9jaHVuayBsb2FkZWQiLCJ3ZWJwYWNrOi8vY2dwcmVuZGVyaW5nL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly9jZ3ByZW5kZXJpbmcvd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly9jZ3ByZW5kZXJpbmcvd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly9jZ3ByZW5kZXJpbmcvd2VicGFjay9ydW50aW1lL2pzb25wIGNodW5rIGxvYWRpbmciLCJ3ZWJwYWNrOi8vY2dwcmVuZGVyaW5nL3dlYnBhY2svYmVmb3JlLXN0YXJ0dXAiLCJ3ZWJwYWNrOi8vY2dwcmVuZGVyaW5nL3dlYnBhY2svc3RhcnR1cCIsIndlYnBhY2s6Ly9jZ3ByZW5kZXJpbmcvd2VicGFjay9hZnRlci1zdGFydHVwIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIDIzRkkwNzgg5rC45LqV6aKv6IOhXG5pbXBvcnQgKiBhcyBUSFJFRSBmcm9tIFwidGhyZWVcIjtcbmltcG9ydCB7IE9yYml0Q29udHJvbHMgfSBmcm9tIFwidGhyZWUvZXhhbXBsZXMvanNtL2NvbnRyb2xzL09yYml0Q29udHJvbHNcIjtcblxuY2xhc3MgVGhyZWVKU0NvbnRhaW5lciB7XG4gICAgcHJpdmF0ZSBzY2VuZTogVEhSRUUuU2NlbmU7XG4gICAgcHJpdmF0ZSBsaWdodDogVEhSRUUuTGlnaHQ7XG4gICAgcHJpdmF0ZSBwYXJ0aWNsZVZlbG9jaXR5OiBudW1iZXJbXTtcbiAgICBwcml2YXRlIHBhcnRpY2xlQ291bnQgPSAxMDAwMDtcbiAgICBwcml2YXRlIGJhc2VQb3NpdGlvbnM6IEZsb2F0MzJBcnJheVtdID0gW107XG4gICAgcHJpdmF0ZSB0YXJnZXRQb3NpdGlvbnM6IEZsb2F0MzJBcnJheVtdID0gW107XG4gICAgcHJpdmF0ZSByZW5kZXJlcjogVEhSRUUuV2ViR0xSZW5kZXJlcjtcbiAgICBwcml2YXRlIGNhbWVyYTogVEhSRUUuUGVyc3BlY3RpdmVDYW1lcmE7XG4gICAgcHJpdmF0ZSByYXljYXN0ZXIgPSBuZXcgVEhSRUUuUmF5Y2FzdGVyKCk7XG4gICAgcHJpdmF0ZSBtb3VzZSA9IG5ldyBUSFJFRS5WZWN0b3IyKCk7XG4gICAgcHJpdmF0ZSBza3VsbE9mZnNldCA9IG5ldyBUSFJFRS5WZWN0b3IzKDAsIDAsIDApO1xuICAgIHByaXZhdGUgdHJpZ2dlcmVkID0gZmFsc2U7XG4gICAgcHJpdmF0ZSBwcm9ncmVzcyA9IDA7XG4gICAgcHJpdmF0ZSBpbWFnZVBhdGhzID0gW1wi6aq46aqoXzJELnBuZ1wiLCBcInN0YXIucG5nXCIsIFwibmVrby5wbmdcIl07XG4gICAgcHJpdmF0ZSBpbWFnZUluZGV4ID0gMDtcbiAgICBwcml2YXRlIHJvdGF0aW9uRHVyYXRpb24gPSAxLjA7XG4gICAgcHJpdmF0ZSByb3RhdGlvblBhdXNlID0gMy4wO1xuICAgIHByaXZhdGUgcm90YXRpb25UaW1lciA9IDA7XG4gICAgcHJpdmF0ZSBpc1JvdGF0aW5nID0gZmFsc2U7XG4gICAgcHJpdmF0ZSBjdXJyZW50Q29sb3IgPSBuZXcgVEhSRUUuQ29sb3IoMHhmZmZmZmYpO1xuICAgIHByaXZhdGUgdGFyZ2V0Q29sb3IgPSBuZXcgVEhSRUUuQ29sb3IoMHhmZmZmZmYpO1xuICAgIHByaXZhdGUgcm90YXRpb25BbmdsZSA9IDA7XG4gICAgcHJpdmF0ZSBjZW50ZXIgPSBuZXcgVEhSRUUuVmVjdG9yMygwLCAwLCAwKTtcblxuICAgIC8vIOeIhueZuua8lOWHulxuICAgIHByaXZhdGUgZXhwbG9zaW9uVGltZXJzOiBudW1iZXJbXSA9IFtdO1xuICAgIHByaXZhdGUgZXhwbG9zaW9uVmVjdG9yczogVEhSRUUuVmVjdG9yM1tdID0gW107XG4gICAgcHJpdmF0ZSBleHBsb3Npb25EdXJhdGlvbnM6IG51bWJlcltdID0gW107XG5cbiAgICAvLyDooZ3mkoPms6Ljg6rjg7PjgrBcbiAgICBwcml2YXRlIHNob2Nrd2F2ZXM6IFNob2Nrd2F2ZVtdID0gW107XG5cbiAgICBwcml2YXRlIGlzRXhwbG9zaW9uSW5Qcm9ncmVzcygpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZXhwbG9zaW9uVGltZXJzLnNvbWUodCA9PiB0ID4gMCk7XG4gICAgfVxuXG4gICAgY29uc3RydWN0b3IoKSB7IH1cblxuICAgIHB1YmxpYyBjcmVhdGVSZW5kZXJlckRPTSA9ICh3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlciwgY2FtZXJhUG9zOiBUSFJFRS5WZWN0b3IzKSA9PiB7XG4gICAgICAgIHRoaXMucmVuZGVyZXIgPSBuZXcgVEhSRUUuV2ViR0xSZW5kZXJlcigpO1xuICAgICAgICB0aGlzLnJlbmRlcmVyLnNldFNpemUod2lkdGgsIGhlaWdodCk7XG4gICAgICAgIHRoaXMucmVuZGVyZXIuc2V0Q2xlYXJDb2xvcihuZXcgVEhSRUUuQ29sb3IoMHgwMDAwMDApKTtcbiAgICAgICAgdGhpcy5yZW5kZXJlci5zaGFkb3dNYXAuZW5hYmxlZCA9IHRydWU7XG5cbiAgICAgICAgdGhpcy5jYW1lcmEgPSBuZXcgVEhSRUUuUGVyc3BlY3RpdmVDYW1lcmEoNzUsIHdpZHRoIC8gaGVpZ2h0LCAwLjEsIDEwMDApO1xuICAgICAgICB0aGlzLmNhbWVyYS5wb3NpdGlvbi5jb3B5KGNhbWVyYVBvcyk7XG4gICAgICAgIHRoaXMuY2FtZXJhLmxvb2tBdChuZXcgVEhSRUUuVmVjdG9yMygwLCAwLCAwKSk7XG5cbiAgICAgICAgY29uc3Qgb3JiaXRDb250cm9scyA9IG5ldyBPcmJpdENvbnRyb2xzKHRoaXMuY2FtZXJhLCB0aGlzLnJlbmRlcmVyLmRvbUVsZW1lbnQpO1xuICAgICAgICB0aGlzLmNyZWF0ZVNjZW5lKCk7XG5cbiAgICAgICAgY29uc3QgcmVuZGVyOiBGcmFtZVJlcXVlc3RDYWxsYmFjayA9ICgpID0+IHtcbiAgICAgICAgICAgIG9yYml0Q29udHJvbHMudXBkYXRlKCk7XG4gICAgICAgICAgICB0aGlzLnJlbmRlcmVyLnJlbmRlcih0aGlzLnNjZW5lLCB0aGlzLmNhbWVyYSk7XG4gICAgICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUocmVuZGVyKTtcbiAgICAgICAgfTtcbiAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHJlbmRlcik7XG5cbiAgICAgICAgY29uc3QgaGFuZGxlSW5wdXQgPSAoY2xpZW50WDogbnVtYmVyLCBjbGllbnRZOiBudW1iZXIpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHJlY3QgPSB0aGlzLnJlbmRlcmVyLmRvbUVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgICAgICB0aGlzLm1vdXNlLnggPSAoKGNsaWVudFggLSByZWN0LmxlZnQpIC8gcmVjdC53aWR0aCkgKiAyIC0gMTtcbiAgICAgICAgICAgIHRoaXMubW91c2UueSA9IC0oKGNsaWVudFkgLSByZWN0LnRvcCkgLyByZWN0LmhlaWdodCkgKiAyICsgMTtcbiAgICAgICAgICAgIHRoaXMucmF5Y2FzdGVyLnNldEZyb21DYW1lcmEodGhpcy5tb3VzZSwgdGhpcy5jYW1lcmEpO1xuXG4gICAgICAgICAgICBjb25zdCBwbGFuZVogPSBuZXcgVEhSRUUuUGxhbmUobmV3IFRIUkVFLlZlY3RvcjMoMCwgMCwgMSksIDApO1xuICAgICAgICAgICAgY29uc3QgaW50ZXJzZWN0ID0gbmV3IFRIUkVFLlZlY3RvcjMoKTtcbiAgICAgICAgICAgIHRoaXMucmF5Y2FzdGVyLnJheS5pbnRlcnNlY3RQbGFuZShwbGFuZVosIGludGVyc2VjdCk7XG4gICAgICAgICAgICB0aGlzLnNrdWxsT2Zmc2V0LmNvcHkoaW50ZXJzZWN0KTtcblxuXG4gICAgICAgICAgICBsZXQgaGl0UGFydGljbGUgPSBmYWxzZTtcbiAgICAgICAgICAgIGNvbnN0IG1heEV4cGxvc2lvbkRlbGF5ID0gMC41O1xuICAgICAgICAgICAgY29uc3QgbWF4RXhwbG9zaW9uRHVyYXRpb24gPSAwLjY7XG5cbiAgICAgICAgICAgIHRoaXMuc2NlbmUuY2hpbGRyZW4uZm9yRWFjaCgob2JqLCBzZXRJZHgpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAob2JqIGluc3RhbmNlb2YgVEhSRUUuUG9pbnRzKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGdlb20gPSBvYmouZ2VvbWV0cnkgYXMgVEhSRUUuQnVmZmVyR2VvbWV0cnk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHBvc2l0aW9ucyA9IGdlb20uZ2V0QXR0cmlidXRlKFwicG9zaXRpb25cIik7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvdW50ID0gcG9zaXRpb25zLmNvdW50O1xuXG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY291bnQ7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcHggPSBwb3NpdGlvbnMuZ2V0WChpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHB5ID0gcG9zaXRpb25zLmdldFkoaSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBweiA9IHBvc2l0aW9ucy5nZXRaKGkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcCA9IG5ldyBUSFJFRS5WZWN0b3IzKHB4LCBweSwgcHopO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZGlzdCA9IHRoaXMuc2t1bGxPZmZzZXQuZGlzdGFuY2VUbyhwKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRpc3QgPCAyLjUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoaXRQYXJ0aWNsZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZ2xvYmFsSWR4ID0gc2V0SWR4ICogY291bnQgKyBpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGRlbGF5ID0gKGRpc3QgLyAyLjUpICogbWF4RXhwbG9zaW9uRGVsYXk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZHVyYXRpb24gPSBtYXhFeHBsb3Npb25EdXJhdGlvbiArIGRlbGF5O1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZGlyID0gbmV3IFRIUkVFLlZlY3RvcjMoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIChNYXRoLnJhbmRvbSgpIC0gMC41KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKE1hdGgucmFuZG9tKCkgLSAwLjUpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoTWF0aC5yYW5kb20oKSAtIDAuNSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApLm5vcm1hbGl6ZSgpLm11bHRpcGx5U2NhbGFyKDMuMCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmV4cGxvc2lvblRpbWVyc1tnbG9iYWxJZHhdID0gLWRlbGF5O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZXhwbG9zaW9uVmVjdG9yc1tnbG9iYWxJZHhdID0gZGlyO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZXhwbG9zaW9uRHVyYXRpb25zW2dsb2JhbElkeF0gPSBkdXJhdGlvbjtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBpZiAoaGl0UGFydGljbGUpIHtcbiAgICAgICAgICAgICAgICBjb25zdCB3YXZlID0gbmV3IFNob2Nrd2F2ZSh0aGlzLnNrdWxsT2Zmc2V0LmNsb25lKCksIHRoaXMuY3VycmVudENvbG9yLmNsb25lKCkpO1xuICAgICAgICAgICAgICAgIHRoaXMuc2NlbmUuYWRkKHdhdmUubWVzaCk7XG4gICAgICAgICAgICAgICAgdGhpcy5zaG9ja3dhdmVzLnB1c2god2F2ZSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG5cbiAgICAgICAgICAgIHRoaXMuc2NlbmUuY2hpbGRyZW4uZm9yRWFjaCgob2JqLCBpZHgpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAob2JqIGluc3RhbmNlb2YgVEhSRUUuUG9pbnRzKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGdlb20gPSBvYmouZ2VvbWV0cnkgYXMgVEhSRUUuQnVmZmVyR2VvbWV0cnk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHBvc2l0aW9ucyA9IGdlb20uZ2V0QXR0cmlidXRlKFwicG9zaXRpb25cIik7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGJhc2UgPSBuZXcgRmxvYXQzMkFycmF5KHBvc2l0aW9ucy5hcnJheS5sZW5ndGgpO1xuICAgICAgICAgICAgICAgICAgICBiYXNlLnNldChwb3NpdGlvbnMuYXJyYXkpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmJhc2VQb3NpdGlvbnNbaWR4XSA9IGJhc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGNvbnN0IHBhdGggPSB0aGlzLmltYWdlUGF0aHNbdGhpcy5pbWFnZUluZGV4XTtcbiAgICAgICAgICAgIHRoaXMuaW1hZ2VJbmRleCA9ICh0aGlzLmltYWdlSW5kZXggKyAxKSAlIHRoaXMuaW1hZ2VQYXRocy5sZW5ndGg7XG5cbiAgICAgICAgICAgIGlmIChwYXRoLmluY2x1ZGVzKFwi6aq46aqoXCIpKSB0aGlzLnRhcmdldENvbG9yLnNldCgweGZmMDAwMCk7XG4gICAgICAgICAgICBlbHNlIGlmIChwYXRoLmluY2x1ZGVzKFwic3RhclwiKSkgdGhpcy50YXJnZXRDb2xvci5zZXQoMHgwMGZmMDApO1xuICAgICAgICAgICAgZWxzZSBpZiAocGF0aC5pbmNsdWRlcyhcIm5la29cIikpIHRoaXMudGFyZ2V0Q29sb3Iuc2V0KDB4ZmYwMGZmKTtcblxuICAgICAgICAgICAgdGhpcy5nZXRUYXJnZXRQb3NpdGlvbnNGcm9tSW1hZ2UocGF0aCwgMTI4LCAxMjgpLnRoZW4oc2t1bGxQb2ludHMgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMudGFyZ2V0UG9zaXRpb25zID0gW107XG4gICAgICAgICAgICAgICAgbGV0IG9mZnNldCA9IDA7XG4gICAgICAgICAgICAgICAgdGhpcy5zY2VuZS5jaGlsZHJlbi5mb3JFYWNoKChvYmosIGluZGV4KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChvYmogaW5zdGFuY2VvZiBUSFJFRS5Qb2ludHMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvdW50ID0gb2JqLmdlb21ldHJ5LmdldEF0dHJpYnV0ZShcInBvc2l0aW9uXCIpLmNvdW50ICogMztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHRhcmdldCA9IG5ldyBGbG9hdDMyQXJyYXkoY291bnQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb3VudDsgaSArPSAzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgc3JjSWR4ID0gKG9mZnNldCArIGkpICUgc2t1bGxQb2ludHMubGVuZ3RoO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldFtpXSA9IHNrdWxsUG9pbnRzW3NyY0lkeF07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0W2kgKyAxXSA9IHNrdWxsUG9pbnRzW3NyY0lkeCArIDFdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldFtpICsgMl0gPSBza3VsbFBvaW50c1tzcmNJZHggKyAyXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudGFyZ2V0UG9zaXRpb25zLnB1c2godGFyZ2V0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9mZnNldCArPSBjb3VudDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHRoaXMudHJpZ2dlcmVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLnByb2dyZXNzID0gMDtcbiAgICAgICAgICAgICAgICB0aGlzLnJvdGF0aW9uQW5nbGUgPSAwO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5yZW5kZXJlci5kb21FbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoZSkgPT4gaGFuZGxlSW5wdXQoZS5jbGllbnRYLCBlLmNsaWVudFkpKTtcbiAgICAgICAgdGhpcy5yZW5kZXJlci5kb21FbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJ0b3VjaHN0YXJ0XCIsIChlKSA9PiB7XG4gICAgICAgICAgICBpZiAoZS50b3VjaGVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICBoYW5kbGVJbnB1dChlLnRvdWNoZXNbMF0uY2xpZW50WCwgZS50b3VjaGVzWzBdLmNsaWVudFkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gdGhpcy5yZW5kZXJlci5kb21FbGVtZW50O1xuICAgIH1cblxuICAgIHByaXZhdGUgY3JlYXRlU2NlbmUoKSB7XG4gICAgICAgIHRoaXMuc2NlbmUgPSBuZXcgVEhSRUUuU2NlbmUoKTtcbiAgICAgICAgY29uc3QgdGV4dHVyZUxvYWRlciA9IG5ldyBUSFJFRS5UZXh0dXJlTG9hZGVyKCk7XG4gICAgICAgIGNvbnN0IGNsb2NrID0gbmV3IFRIUkVFLkNsb2NrKCk7XG4gICAgICAgIGNvbnN0IHRleHR1cmVQYXRocyA9IFsnbnVtMC5wbmcnLCAnbnVtMS0xLnBuZyddO1xuICAgICAgICBjb25zdCBwYXJ0aWNsZXNQZXJUZXh0dXJlID0gTWF0aC5mbG9vcih0aGlzLnBhcnRpY2xlQ291bnQgLyB0ZXh0dXJlUGF0aHMubGVuZ3RoKTtcbiAgICAgICAgdGhpcy5wYXJ0aWNsZVZlbG9jaXR5ID0gW107XG5cbiAgICAgICAgZm9yIChsZXQgdCA9IDA7IHQgPCB0ZXh0dXJlUGF0aHMubGVuZ3RoOyB0KyspIHtcbiAgICAgICAgICAgIGNvbnN0IHRleHR1cmUgPSB0ZXh0dXJlTG9hZGVyLmxvYWQodGV4dHVyZVBhdGhzW3RdKTtcbiAgICAgICAgICAgIGNvbnN0IGdlb21ldHJ5ID0gbmV3IFRIUkVFLkJ1ZmZlckdlb21ldHJ5KCk7XG4gICAgICAgICAgICBjb25zdCBwb3NpdGlvbnMgPSBuZXcgRmxvYXQzMkFycmF5KHBhcnRpY2xlc1BlclRleHR1cmUgKiAzKTtcbiAgICAgICAgICAgIGNvbnN0IGJhc2VQb2ludCA9IG5ldyBGbG9hdDMyQXJyYXkocGFydGljbGVzUGVyVGV4dHVyZSAqIDMpO1xuXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHBhcnRpY2xlc1BlclRleHR1cmU7IGkrKykge1xuICAgICAgICAgICAgICAgIGNvbnN0IHggPSAoTWF0aC5yYW5kb20oKSAtIDAuNSkgKiAyMDtcbiAgICAgICAgICAgICAgICBjb25zdCB5ID0gTWF0aC5yYW5kb20oKSAqIDEwO1xuICAgICAgICAgICAgICAgIGNvbnN0IHogPSAoTWF0aC5yYW5kb20oKSAtIDAuNSkgKiAyMDtcbiAgICAgICAgICAgICAgICBwb3NpdGlvbnNbaSAqIDNdID0geDtcbiAgICAgICAgICAgICAgICBwb3NpdGlvbnNbaSAqIDMgKyAxXSA9IHk7XG4gICAgICAgICAgICAgICAgcG9zaXRpb25zW2kgKiAzICsgMl0gPSB6O1xuICAgICAgICAgICAgICAgIGJhc2VQb2ludFtpICogM10gPSB4O1xuICAgICAgICAgICAgICAgIGJhc2VQb2ludFtpICogMyArIDFdID0geTtcbiAgICAgICAgICAgICAgICBiYXNlUG9pbnRbaSAqIDMgKyAyXSA9IHo7XG4gICAgICAgICAgICAgICAgdGhpcy5wYXJ0aWNsZVZlbG9jaXR5LnB1c2goTWF0aC5yYW5kb20oKSAqIDAuNSArIDAuMik7XG4gICAgICAgICAgICAgICAgdGhpcy5leHBsb3Npb25UaW1lcnMucHVzaCgwKTtcbiAgICAgICAgICAgICAgICB0aGlzLmV4cGxvc2lvblZlY3RvcnMucHVzaChuZXcgVEhSRUUuVmVjdG9yMygpKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZ2VvbWV0cnkuc2V0QXR0cmlidXRlKCdwb3NpdGlvbicsIG5ldyBUSFJFRS5CdWZmZXJBdHRyaWJ1dGUocG9zaXRpb25zLCAzKSk7XG4gICAgICAgICAgICB0aGlzLmJhc2VQb3NpdGlvbnMucHVzaChiYXNlUG9pbnQpO1xuXG4gICAgICAgICAgICBjb25zdCBtYXRlcmlhbCA9IG5ldyBUSFJFRS5Qb2ludHNNYXRlcmlhbCh7XG4gICAgICAgICAgICAgICAgc2l6ZTogMS41LFxuICAgICAgICAgICAgICAgIG1hcDogdGV4dHVyZSxcbiAgICAgICAgICAgICAgICBibGVuZGluZzogVEhSRUUuQWRkaXRpdmVCbGVuZGluZyxcbiAgICAgICAgICAgICAgICBjb2xvcjogdGhpcy5jdXJyZW50Q29sb3IuY2xvbmUoKSxcbiAgICAgICAgICAgICAgICBkZXB0aFdyaXRlOiBmYWxzZSxcbiAgICAgICAgICAgICAgICB0cmFuc3BhcmVudDogdHJ1ZVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGNvbnN0IHBvaW50cyA9IG5ldyBUSFJFRS5Qb2ludHMoZ2VvbWV0cnksIG1hdGVyaWFsKTtcbiAgICAgICAgICAgIHRoaXMuc2NlbmUuYWRkKHBvaW50cyk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmxpZ2h0ID0gbmV3IFRIUkVFLkRpcmVjdGlvbmFsTGlnaHQoMHhmZmZmZmYpO1xuICAgICAgICB0aGlzLmxpZ2h0LnBvc2l0aW9uLnNldCgxLCAxLCAxKS5ub3JtYWxpemUoKTtcbiAgICAgICAgdGhpcy5zY2VuZS5hZGQodGhpcy5saWdodCk7XG5cbiAgICAgICAgY29uc3QgdXBkYXRlOiBGcmFtZVJlcXVlc3RDYWxsYmFjayA9ICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGRlbHRhVGltZSA9IGNsb2NrLmdldERlbHRhKCk7XG4gICAgICAgICAgICBjb25zdCBlbGFwc2VkID0gY2xvY2suZWxhcHNlZFRpbWU7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLnRyaWdnZXJlZCAmJiB0aGlzLnByb2dyZXNzIDwgMSkge1xuICAgICAgICAgICAgICAgIHRoaXMucHJvZ3Jlc3MgKz0gZGVsdGFUaW1lIC8gNTtcbiAgICAgICAgICAgICAgICB0aGlzLnByb2dyZXNzID0gTWF0aC5taW4odGhpcy5wcm9ncmVzcywgMSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0aGlzLnByb2dyZXNzID49IDEpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJvdGF0aW9uVGltZXIgKz0gZGVsdGFUaW1lO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmlzUm90YXRpbmcpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdCA9IHRoaXMucm90YXRpb25UaW1lciAvIHRoaXMucm90YXRpb25EdXJhdGlvbjtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHQgPj0gMS4wKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnJvdGF0aW9uVGltZXIgPSAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pc1JvdGF0aW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBlYXNlZCA9IGVhc2VJbk91dFNpbmUodCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnJvdGF0aW9uQW5nbGUgPSBlYXNlZCAqIE1hdGguUEkgKiAyO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLnJvdGF0aW9uVGltZXIgPj0gdGhpcy5yb3RhdGlvblBhdXNlKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucm90YXRpb25UaW1lciA9IDA7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaXNSb3RhdGluZyA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBsZXQgdmVsb2NpdHlJbmRleCA9IDA7XG4gICAgICAgICAgICBsZXQgcGFydGljbGVTZXRJbmRleCA9IDA7XG5cbiAgICAgICAgICAgIGNvbnN0IGNvc0EgPSBNYXRoLmNvcyh0aGlzLnJvdGF0aW9uQW5nbGUpO1xuICAgICAgICAgICAgY29uc3Qgc2luQSA9IE1hdGguc2luKHRoaXMucm90YXRpb25BbmdsZSk7XG4gICAgICAgICAgICBjb25zdCBjeCA9IHRoaXMuY2VudGVyLng7XG4gICAgICAgICAgICBjb25zdCBjeSA9IHRoaXMuY2VudGVyLnk7XG4gICAgICAgICAgICBjb25zdCBjeiA9IHRoaXMuY2VudGVyLno7XG5cbiAgICAgICAgICAgIHRoaXMuc2NlbmUuY2hpbGRyZW4uZm9yRWFjaChvYmogPT4ge1xuICAgICAgICAgICAgICAgIGlmIChvYmogaW5zdGFuY2VvZiBUSFJFRS5Qb2ludHMpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZ2VvbSA9IG9iai5nZW9tZXRyeSBhcyBUSFJFRS5CdWZmZXJHZW9tZXRyeTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcG9zaXRpb25zID0gZ2VvbS5nZXRBdHRyaWJ1dGUoJ3Bvc2l0aW9uJyk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGJhc2UgPSB0aGlzLmJhc2VQb3NpdGlvbnNbcGFydGljbGVTZXRJbmRleF07XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHRhcmdldCA9IHRoaXMudGFyZ2V0UG9zaXRpb25zW3BhcnRpY2xlU2V0SW5kZXhdIHx8IGJhc2U7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG1hdGVyaWFsID0gb2JqLm1hdGVyaWFsIGFzIFRIUkVFLlBvaW50c01hdGVyaWFsO1xuXG4gICAgICAgICAgICAgICAgICAgIG1hdGVyaWFsLmNvbG9yLmxlcnAodGhpcy50YXJnZXRDb2xvciwgZGVsdGFUaW1lICogMC41KTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50Q29sb3IuY29weShtYXRlcmlhbC5jb2xvcik7XG5cbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwb3NpdGlvbnMuY291bnQ7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgaXggPSBpICogMztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHgwID0gYmFzZVtpeF07XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB5MCA9IGJhc2VbaXggKyAxXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHowID0gYmFzZVtpeCArIDJdO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdHggPSB0YXJnZXRbaXhdO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdHkgPSB0YXJnZXRbaXggKyAxXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHR6ID0gdGFyZ2V0W2l4ICsgMl07XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgeCwgeSwgejtcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMucHJvZ3Jlc3MgPCAxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgd2F2ZVNwZWVkID0gdGhpcy5wYXJ0aWNsZVZlbG9jaXR5W3ZlbG9jaXR5SW5kZXhdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHlXYXZlID0gTWF0aC5zaW4oZWxhcHNlZCAqIHdhdmVTcGVlZCArIHgwICogMC41ICsgejAgKiAwLjUpICogMS41O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHggPSB4MCAqICgxIC0gdGhpcy5wcm9ncmVzcykgKyB0eCAqIHRoaXMucHJvZ3Jlc3M7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeSA9IHkwICogKDEgLSB0aGlzLnByb2dyZXNzKSArIHR5ICogdGhpcy5wcm9ncmVzcyArIHlXYXZlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHogPSB6MCAqICgxIC0gdGhpcy5wcm9ncmVzcykgKyB0eiAqIHRoaXMucHJvZ3Jlc3M7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGR4ID0gdHggLSBjeDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBkeiA9IHR6IC0gY3o7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgd2F2ZVNwZWVkID0gdGhpcy5wYXJ0aWNsZVZlbG9jaXR5W3ZlbG9jaXR5SW5kZXhdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHlXYXZlID0gTWF0aC5zaW4oZWxhcHNlZCAqIHdhdmVTcGVlZCArIHgwICogMC41ICsgejAgKiAwLjUpICogMS41O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHggPSBkeCAqIGNvc0EgLSBkeiAqIHNpbkEgKyBjeDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB5ID0gdHkgKyB5V2F2ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB6ID0gZHggKiBzaW5BICsgZHogKiBjb3NBICsgY3o7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGdsb2JhbElkeCA9IHBhcnRpY2xlU2V0SW5kZXggKiBwb3NpdGlvbnMuY291bnQgKyBpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuZXhwbG9zaW9uVGltZXJzW2dsb2JhbElkeF0gIT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmV4cGxvc2lvblRpbWVyc1tnbG9iYWxJZHhdICs9IGRlbHRhVGltZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5leHBsb3Npb25UaW1lcnNbZ2xvYmFsSWR4XSA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZGlyID0gdGhpcy5leHBsb3Npb25WZWN0b3JzW2dsb2JhbElkeF07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGR1cmF0aW9uID0gdGhpcy5leHBsb3Npb25EdXJhdGlvbnNbZ2xvYmFsSWR4XSB8fCAwLjY7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmV4cGxvc2lvblRpbWVyc1tnbG9iYWxJZHhdIDw9IGR1cmF0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB0ID0gdGhpcy5leHBsb3Npb25UaW1lcnNbZ2xvYmFsSWR4XTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHggKz0gZGlyLnggKiB0ICogNTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHkgKz0gZGlyLnkgKiB0ICogNTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHogKz0gZGlyLnogKiB0ICogNTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZXhwbG9zaW9uVGltZXJzW2dsb2JhbElkeF0gPSAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbnMuc2V0WFlaKGksIHgsIHksIHopO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmVsb2NpdHlJbmRleCsrO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgcG9zaXRpb25zLm5lZWRzVXBkYXRlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgcGFydGljbGVTZXRJbmRleCsrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvLyDooZ3mkoPms6Ljg6rjg7PjgrDjga7mm7TmlrBcbiAgICAgICAgICAgIHRoaXMuc2hvY2t3YXZlcyA9IHRoaXMuc2hvY2t3YXZlcy5maWx0ZXIod2F2ZSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXhwaXJlZCA9IHdhdmUudXBkYXRlKGRlbHRhVGltZSk7XG4gICAgICAgICAgICAgICAgaWYgKGV4cGlyZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zY2VuZS5yZW1vdmUod2F2ZS5tZXNoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuICFleHBpcmVkO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSh1cGRhdGUpO1xuICAgICAgICB9O1xuICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUodXBkYXRlKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldFRhcmdldFBvc2l0aW9uc0Zyb21JbWFnZSA9IChwYXRoOiBzdHJpbmcsIHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyKTogUHJvbWlzZTxGbG9hdDMyQXJyYXk+ID0+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBpbWcgPSBuZXcgSW1hZ2UoKTtcbiAgICAgICAgICAgIGltZy5zcmMgPSBwYXRoO1xuICAgICAgICAgICAgaW1nLm9ubG9hZCA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiY2FudmFzXCIpO1xuICAgICAgICAgICAgICAgIGNhbnZhcy53aWR0aCA9IHdpZHRoO1xuICAgICAgICAgICAgICAgIGNhbnZhcy5oZWlnaHQgPSBoZWlnaHQ7XG4gICAgICAgICAgICAgICAgY29uc3QgY3R4ID0gY2FudmFzLmdldENvbnRleHQoXCIyZFwiKTtcbiAgICAgICAgICAgICAgICBjdHguZHJhd0ltYWdlKGltZywgMCwgMCwgd2lkdGgsIGhlaWdodCk7XG4gICAgICAgICAgICAgICAgY29uc3QgZGF0YSA9IGN0eC5nZXRJbWFnZURhdGEoMCwgMCwgd2lkdGgsIGhlaWdodCkuZGF0YTtcbiAgICAgICAgICAgICAgICBjb25zdCBwb2ludHMgPSBbXTtcbiAgICAgICAgICAgICAgICBsZXQgc3VtWCA9IDAsIHN1bVkgPSAwLCBzdW1aID0gMDtcblxuICAgICAgICAgICAgICAgIGZvciAobGV0IHkgPSAwOyB5IDwgaGVpZ2h0OyB5KyspIHtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgeCA9IDA7IHggPCB3aWR0aDsgeCsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBpZHggPSAoeSAqIHdpZHRoICsgeCkgKiA0O1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgciA9IGRhdGFbaWR4XSwgZyA9IGRhdGFbaWR4ICsgMV0sIGIgPSBkYXRhW2lkeCArIDJdO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgYnJpZ2h0bmVzcyA9IChyICsgZyArIGIpIC8gMztcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChicmlnaHRuZXNzID4gMTI4KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcHggPSAoeCAvIHdpZHRoIC0gMC41KSAqIDIwICsgdGhpcy5za3VsbE9mZnNldC54O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHB5ID0gKDEgLSB5IC8gaGVpZ2h0IC0gMC41KSAqIDIwICsgdGhpcy5za3VsbE9mZnNldC55O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHB6ID0gMCArIHRoaXMuc2t1bGxPZmZzZXQuejtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwb2ludHMucHVzaChweCwgcHksIHB6KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdW1YICs9IHB4O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1bVkgKz0gcHk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3VtWiArPSBwejtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGNvbnN0IGxlbiA9IHBvaW50cy5sZW5ndGggLyAzO1xuICAgICAgICAgICAgICAgIHRoaXMuY2VudGVyLnNldChzdW1YIC8gbGVuLCBzdW1ZIC8gbGVuLCBzdW1aIC8gbGVuKTtcbiAgICAgICAgICAgICAgICByZXNvbHZlKG5ldyBGbG9hdDMyQXJyYXkocG9pbnRzKSk7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9KTtcbiAgICB9O1xufVxuXG4vLyDooZ3mkoPms6Ljgq/jg6njgrlcbmNsYXNzIFNob2Nrd2F2ZSB7XG4gICAgcHVibGljIG1lc2g6IFRIUkVFLk1lc2g7XG4gICAgcHVibGljIGxpZmU6IG51bWJlciA9IDEuMDtcblxuICAgIGNvbnN0cnVjdG9yKGNlbnRlcjogVEhSRUUuVmVjdG9yMywgY29sb3I6IFRIUkVFLkNvbG9yKSB7XG4gICAgICAgIGNvbnN0IGdlb21ldHJ5ID0gbmV3IFRIUkVFLlJpbmdHZW9tZXRyeSgwLjUsIDAuNTUsIDY0KTtcbiAgICAgICAgY29uc3QgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWwoe1xuICAgICAgICAgICAgY29sb3I6IGNvbG9yLmNsb25lKCksXG4gICAgICAgICAgICB0cmFuc3BhcmVudDogdHJ1ZSxcbiAgICAgICAgICAgIG9wYWNpdHk6IDAuNSxcbiAgICAgICAgICAgIHNpZGU6IFRIUkVFLkRvdWJsZVNpZGUsXG4gICAgICAgICAgICBkZXB0aFdyaXRlOiBmYWxzZVxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5tZXNoID0gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksIG1hdGVyaWFsKTtcbiAgICAgICAgdGhpcy5tZXNoLnJvdGF0aW9uLnggPSAtTWF0aC5QSSAvIDI7XG4gICAgICAgIHRoaXMubWVzaC5wb3NpdGlvbi5jb3B5KGNlbnRlcik7XG4gICAgICAgIHRoaXMubWVzaC5zY2FsZS5zZXQoMC4xLCAwLjEsIDAuMSk7XG4gICAgfVxuXG4gICAgcHVibGljIHVwZGF0ZShkZWx0YVRpbWU6IG51bWJlcik6IGJvb2xlYW4ge1xuICAgICAgICB0aGlzLmxpZmUgLT0gZGVsdGFUaW1lO1xuICAgICAgICBjb25zdCBzY2FsZSA9IDEuMCArICgxLjAgLSB0aGlzLmxpZmUpICogMzAuMDtcbiAgICAgICAgdGhpcy5tZXNoLnNjYWxlLnNldChzY2FsZSwgc2NhbGUsIHNjYWxlKTtcbiAgICAgICAgKHRoaXMubWVzaC5tYXRlcmlhbCBhcyBUSFJFRS5NYXRlcmlhbCkub3BhY2l0eSA9IHRoaXMubGlmZTtcbiAgICAgICAgcmV0dXJuIHRoaXMubGlmZSA8PSAwO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gZWFzZUluT3V0U2luZSh0OiBudW1iZXIpOiBudW1iZXIge1xuICAgIHJldHVybiAtKE1hdGguY29zKE1hdGguUEkgKiB0KSAtIDEpIC8gMjtcbn1cblxuZnVuY3Rpb24gaW5pdCgpIHtcbiAgICBjb25zdCBjb250YWluZXIgPSBuZXcgVGhyZWVKU0NvbnRhaW5lcigpO1xuICAgIGNvbnN0IGNhbWVyYVBvc2l0aW9uID0gbmV3IFRIUkVFLlZlY3RvcjMoMCwgNSwgMjApO1xuICAgIGNvbnN0IHZpZXdwb3J0ID0gY29udGFpbmVyLmNyZWF0ZVJlbmRlcmVyRE9NKDY0MCwgNDgwLCBjYW1lcmFQb3NpdGlvbik7XG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh2aWV3cG9ydCk7XG59XG5cbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwiRE9NQ29udGVudExvYWRlZFwiLCBpbml0KTtcbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4vLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuX193ZWJwYWNrX3JlcXVpcmVfXy5tID0gX193ZWJwYWNrX21vZHVsZXNfXztcblxuIiwidmFyIGRlZmVycmVkID0gW107XG5fX3dlYnBhY2tfcmVxdWlyZV9fLk8gPSAocmVzdWx0LCBjaHVua0lkcywgZm4sIHByaW9yaXR5KSA9PiB7XG5cdGlmKGNodW5rSWRzKSB7XG5cdFx0cHJpb3JpdHkgPSBwcmlvcml0eSB8fCAwO1xuXHRcdGZvcih2YXIgaSA9IGRlZmVycmVkLmxlbmd0aDsgaSA+IDAgJiYgZGVmZXJyZWRbaSAtIDFdWzJdID4gcHJpb3JpdHk7IGktLSkgZGVmZXJyZWRbaV0gPSBkZWZlcnJlZFtpIC0gMV07XG5cdFx0ZGVmZXJyZWRbaV0gPSBbY2h1bmtJZHMsIGZuLCBwcmlvcml0eV07XG5cdFx0cmV0dXJuO1xuXHR9XG5cdHZhciBub3RGdWxmaWxsZWQgPSBJbmZpbml0eTtcblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBkZWZlcnJlZC5sZW5ndGg7IGkrKykge1xuXHRcdHZhciBbY2h1bmtJZHMsIGZuLCBwcmlvcml0eV0gPSBkZWZlcnJlZFtpXTtcblx0XHR2YXIgZnVsZmlsbGVkID0gdHJ1ZTtcblx0XHRmb3IgKHZhciBqID0gMDsgaiA8IGNodW5rSWRzLmxlbmd0aDsgaisrKSB7XG5cdFx0XHRpZiAoKHByaW9yaXR5ICYgMSA9PT0gMCB8fCBub3RGdWxmaWxsZWQgPj0gcHJpb3JpdHkpICYmIE9iamVjdC5rZXlzKF9fd2VicGFja19yZXF1aXJlX18uTykuZXZlcnkoKGtleSkgPT4gKF9fd2VicGFja19yZXF1aXJlX18uT1trZXldKGNodW5rSWRzW2pdKSkpKSB7XG5cdFx0XHRcdGNodW5rSWRzLnNwbGljZShqLS0sIDEpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0ZnVsZmlsbGVkID0gZmFsc2U7XG5cdFx0XHRcdGlmKHByaW9yaXR5IDwgbm90RnVsZmlsbGVkKSBub3RGdWxmaWxsZWQgPSBwcmlvcml0eTtcblx0XHRcdH1cblx0XHR9XG5cdFx0aWYoZnVsZmlsbGVkKSB7XG5cdFx0XHRkZWZlcnJlZC5zcGxpY2UoaS0tLCAxKVxuXHRcdFx0dmFyIHIgPSBmbigpO1xuXHRcdFx0aWYgKHIgIT09IHVuZGVmaW5lZCkgcmVzdWx0ID0gcjtcblx0XHR9XG5cdH1cblx0cmV0dXJuIHJlc3VsdDtcbn07IiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsIi8vIG5vIGJhc2VVUklcblxuLy8gb2JqZWN0IHRvIHN0b3JlIGxvYWRlZCBhbmQgbG9hZGluZyBjaHVua3Ncbi8vIHVuZGVmaW5lZCA9IGNodW5rIG5vdCBsb2FkZWQsIG51bGwgPSBjaHVuayBwcmVsb2FkZWQvcHJlZmV0Y2hlZFxuLy8gW3Jlc29sdmUsIHJlamVjdCwgUHJvbWlzZV0gPSBjaHVuayBsb2FkaW5nLCAwID0gY2h1bmsgbG9hZGVkXG52YXIgaW5zdGFsbGVkQ2h1bmtzID0ge1xuXHRcIm1haW5cIjogMFxufTtcblxuLy8gbm8gY2h1bmsgb24gZGVtYW5kIGxvYWRpbmdcblxuLy8gbm8gcHJlZmV0Y2hpbmdcblxuLy8gbm8gcHJlbG9hZGVkXG5cbi8vIG5vIEhNUlxuXG4vLyBubyBITVIgbWFuaWZlc3RcblxuX193ZWJwYWNrX3JlcXVpcmVfXy5PLmogPSAoY2h1bmtJZCkgPT4gKGluc3RhbGxlZENodW5rc1tjaHVua0lkXSA9PT0gMCk7XG5cbi8vIGluc3RhbGwgYSBKU09OUCBjYWxsYmFjayBmb3IgY2h1bmsgbG9hZGluZ1xudmFyIHdlYnBhY2tKc29ucENhbGxiYWNrID0gKHBhcmVudENodW5rTG9hZGluZ0Z1bmN0aW9uLCBkYXRhKSA9PiB7XG5cdHZhciBbY2h1bmtJZHMsIG1vcmVNb2R1bGVzLCBydW50aW1lXSA9IGRhdGE7XG5cdC8vIGFkZCBcIm1vcmVNb2R1bGVzXCIgdG8gdGhlIG1vZHVsZXMgb2JqZWN0LFxuXHQvLyB0aGVuIGZsYWcgYWxsIFwiY2h1bmtJZHNcIiBhcyBsb2FkZWQgYW5kIGZpcmUgY2FsbGJhY2tcblx0dmFyIG1vZHVsZUlkLCBjaHVua0lkLCBpID0gMDtcblx0aWYoY2h1bmtJZHMuc29tZSgoaWQpID0+IChpbnN0YWxsZWRDaHVua3NbaWRdICE9PSAwKSkpIHtcblx0XHRmb3IobW9kdWxlSWQgaW4gbW9yZU1vZHVsZXMpIHtcblx0XHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhtb3JlTW9kdWxlcywgbW9kdWxlSWQpKSB7XG5cdFx0XHRcdF9fd2VicGFja19yZXF1aXJlX18ubVttb2R1bGVJZF0gPSBtb3JlTW9kdWxlc1ttb2R1bGVJZF07XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGlmKHJ1bnRpbWUpIHZhciByZXN1bHQgPSBydW50aW1lKF9fd2VicGFja19yZXF1aXJlX18pO1xuXHR9XG5cdGlmKHBhcmVudENodW5rTG9hZGluZ0Z1bmN0aW9uKSBwYXJlbnRDaHVua0xvYWRpbmdGdW5jdGlvbihkYXRhKTtcblx0Zm9yKDtpIDwgY2h1bmtJZHMubGVuZ3RoOyBpKyspIHtcblx0XHRjaHVua0lkID0gY2h1bmtJZHNbaV07XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGluc3RhbGxlZENodW5rcywgY2h1bmtJZCkgJiYgaW5zdGFsbGVkQ2h1bmtzW2NodW5rSWRdKSB7XG5cdFx0XHRpbnN0YWxsZWRDaHVua3NbY2h1bmtJZF1bMF0oKTtcblx0XHR9XG5cdFx0aW5zdGFsbGVkQ2h1bmtzW2NodW5rSWRdID0gMDtcblx0fVxuXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXy5PKHJlc3VsdCk7XG59XG5cbnZhciBjaHVua0xvYWRpbmdHbG9iYWwgPSBzZWxmW1wid2VicGFja0NodW5rY2dwcmVuZGVyaW5nXCJdID0gc2VsZltcIndlYnBhY2tDaHVua2NncHJlbmRlcmluZ1wiXSB8fCBbXTtcbmNodW5rTG9hZGluZ0dsb2JhbC5mb3JFYWNoKHdlYnBhY2tKc29ucENhbGxiYWNrLmJpbmQobnVsbCwgMCkpO1xuY2h1bmtMb2FkaW5nR2xvYmFsLnB1c2ggPSB3ZWJwYWNrSnNvbnBDYWxsYmFjay5iaW5kKG51bGwsIGNodW5rTG9hZGluZ0dsb2JhbC5wdXNoLmJpbmQoY2h1bmtMb2FkaW5nR2xvYmFsKSk7IiwiIiwiLy8gc3RhcnR1cFxuLy8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4vLyBUaGlzIGVudHJ5IG1vZHVsZSBkZXBlbmRzIG9uIG90aGVyIGxvYWRlZCBjaHVua3MgYW5kIGV4ZWN1dGlvbiBuZWVkIHRvIGJlIGRlbGF5ZWRcbnZhciBfX3dlYnBhY2tfZXhwb3J0c19fID0gX193ZWJwYWNrX3JlcXVpcmVfXy5PKHVuZGVmaW5lZCwgW1widmVuZG9ycy1ub2RlX21vZHVsZXNfdGhyZWVfZXhhbXBsZXNfanNtX2NvbnRyb2xzX09yYml0Q29udHJvbHNfanNcIl0sICgpID0+IChfX3dlYnBhY2tfcmVxdWlyZV9fKFwiLi9zcmMvYXBwLnRzXCIpKSlcbl9fd2VicGFja19leHBvcnRzX18gPSBfX3dlYnBhY2tfcmVxdWlyZV9fLk8oX193ZWJwYWNrX2V4cG9ydHNfXyk7XG4iLCIiXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=