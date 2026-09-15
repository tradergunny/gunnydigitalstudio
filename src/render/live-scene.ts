import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { hotspots, type HotspotId } from '../content';

/* The Live scene, trimmed to what the hero needs: an orthographic camera that orbits within
   fixed limits, focus on one of three objects, reset to the opening view, projection of world
   positions into the slot, a hover cursor over the objects, context-loss handling and dispose.
   Lighting is the daylight setup and never changes. This module is imported lazily by the
   Studio component, so Three is never part of the initial script. */

/** The objects the camera can focus on: the three the Hotspots sit on. */
export type ObjectId = HotspotId;

const objectPositions = Object.fromEntries(
  hotspots.map(hotspot => [hotspot.id, hotspot.position]),
) as Record<ObjectId, [number, number, number]>;

const objectIds = hotspots.map(hotspot => hotspot.id);

/** The opening view: where the camera stands, what it looks at, and how far in it is.
    The zoom is fitted so the three hotspot objects land where they sit on the poster,
    so the fade from poster to live scene does not move the room. */
const OPENING = {
  position: new THREE.Vector3(-10, 9.4, 12),
  target: new THREE.Vector3(0, 1.65, 0),
  zoom: 0.83,
};

/** Where the camera stands relative to an object it focuses on. */
const FOCUS_OFFSET = new THREE.Vector3(-7, 5, 8);
const FOCUS_ZOOM = 2.05;

export interface Projected {
  x: number;
  y: number;
  visible: boolean;
}

export class LiveScene {
  readonly renderer: THREE.WebGLRenderer;
  readonly scene = new THREE.Scene();
  readonly camera: THREE.OrthographicCamera;
  readonly controls: OrbitControls;

  /** Called after every rendered frame, for anything anchored to projected positions. */
  onFrame: () => void = () => {};
  /** Called as the pointer moves over an object, or off all of them. */
  onHover: (id: ObjectId | null) => void = () => {};
  /** Called once when the browser takes the WebGL context away. */
  onContextLoss: () => void = () => {};

  private roots = new Map<ObjectId, THREE.Object3D>();
  private raycaster = new THREE.Raycaster();
  private clock = new THREE.Clock();
  private observer: ResizeObserver;
  private target = OPENING.target.clone();
  private cameraGoal = OPENING.position.clone();
  private zoomGoal = OPENING.zoom;
  private tweening = false;
  private focused: ObjectId | null = null;
  private hidden = false;

  constructor(private container: HTMLElement) {
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.12;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.prepend(this.renderer.domElement);

    this.camera = new THREE.OrthographicCamera(-5, 5, 4, -4, 0.1, 70);
    this.camera.position.copy(OPENING.position);
    this.camera.zoom = OPENING.zoom;
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.target.copy(OPENING.target);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.07;
    this.controls.enablePan = false;
    this.controls.minZoom = 0.75;
    this.controls.maxZoom = 2.9;
    this.controls.minPolarAngle = 0.32;
    this.controls.maxPolarAngle = 1.37;
    this.controls.minAzimuthAngle = -Math.PI / 2 + 0.08;
    this.controls.maxAzimuthAngle = 0.23;
    this.controls.addEventListener('start', () => {
      this.tweening = false;
    });

    this.light();

    this.observer = new ResizeObserver(() => this.resize());
    this.observer.observe(container);
    this.resize();

    const canvas = this.renderer.domElement;
    canvas.addEventListener('pointermove', this.pointerMove);
    canvas.addEventListener('pointerleave', this.pointerLeave);
    canvas.addEventListener('webglcontextlost', this.contextLost);
    document.addEventListener('visibilitychange', this.visibilityChange);
    this.renderer.setAnimationLoop(this.tick);
  }

  /** The daylight setup the room shipped with (mood day, light 80, blind half down), fixed. */
  private light() {
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    const room = new RoomEnvironment();
    this.scene.environment = pmrem.fromScene(room, 0.04).texture;
    this.scene.environmentIntensity = 0.38;
    room.dispose();
    pmrem.dispose();

    const key = new THREE.DirectionalLight(0xfff1dc, 2.7);
    key.position.set(-4, 9, 5);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    Object.assign(key.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6, near: 0.1, far: 25 });
    key.shadow.normalBias = 0.035;
    key.shadow.bias = -0.00015;

    const fill = new THREE.DirectionalLight(0xffffff, 1.8);
    fill.position.set(2, 5, 6);
    const ambient = new THREE.HemisphereLight(0xeaf3ff, 0x806343, 1.85);

    const window = new THREE.PointLight(0xe4f5ff, 6.9, 9, 2);
    window.position.set(2.6, 2.25, -1.2);
    const task = new THREE.PointLight(0xffd295, 2.8, 2.3, 2);
    task.position.set(-2.25, 2.24, -1.66);
    this.scene.add(key, fill, ambient, window, task);

    for (const [x, y, z] of [
      [-1, 3.8, -2.4],
      [2.55, 3.8, 0.7],
      [0, 1.2, -1.5],
    ]) {
      const cove = new THREE.PointLight(0xffce8c, 2.24, 5, 2);
      cove.position.set(x, y, z);
      this.scene.add(cove);
    }

    const shadow = new THREE.Mesh(
      new THREE.PlaneGeometry(200, 200),
      new THREE.ShadowMaterial({ color: 0x483b2c, opacity: 0.14 }),
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = -0.305;
    shadow.receiveShadow = true;
    this.scene.add(shadow);
  }

  /** Fetches the model, reporting progress in per cent, and places it in the scene. */
  async load(progress: (percent: number) => void) {
    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);
    const gltf = await loader.loadAsync(`${import.meta.env.BASE_URL}models/studio.glb`, event => {
      // `total` is the Content-Length while `loaded` counts decoded bytes, so a compressed
      // response overshoots; the last five per cent are the parse.
      if (event.total) progress(Math.min(95, (event.loaded / event.total) * 95));
    });
    const model = gltf.scene;
    this.scene.add(model);

    for (const id of objectIds) {
      const root = model.getObjectByName(id);
      if (root) this.roots.set(id, root);
    }

    model.traverse(object => {
      if (!(object instanceof THREE.Mesh)) return;
      object.castShadow = true;
      object.receiveShadow = true;
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      for (const material of materials as THREE.MeshStandardMaterial[]) {
        const name = material.name.toLowerCase().replace(/[^a-z0-9]+/g, '_');
        material.envMapIntensity = 0.6;
        if (name.includes('glass')) {
          material.transparent = true;
          material.opacity = 0.13;
          material.depthWrite = false;
          material.side = THREE.DoubleSide;
          object.castShadow = false;
          object.renderOrder = 2;
        }
        if (name.includes('foliage') || name.includes('leaf')) material.side = THREE.DoubleSide;
        // Every screen, indicator and light strip is on in daylight.
        if (name.includes('ice_blue')) material.emissiveIntensity = 2;
        if (name.includes('warm_led')) material.emissiveIntensity = 3.8;
      }
    });
    const cove = model.getObjectByName('cove');
    cove?.traverse(object => {
      if (!(object instanceof THREE.Mesh)) return;
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      for (const material of materials as THREE.MeshStandardMaterial[]) material.emissiveIntensity = 1.6;
    });

    this.scene.updateMatrixWorld(true);
    progress(100);
  }

  /** Moves the camera to look at one of the objects. */
  focus(id: ObjectId) {
    this.focused = id;
    const position = new THREE.Vector3(...objectPositions[id]);
    this.target.copy(position);
    this.cameraGoal.copy(position).add(FOCUS_OFFSET);
    this.zoomGoal = FOCUS_ZOOM;
    this.tweening = true;
  }

  /** Returns the camera to the opening view. */
  reset() {
    this.focused = null;
    this.target.copy(OPENING.target);
    this.cameraGoal.copy(OPENING.position);
    this.zoomGoal = OPENING.zoom;
    this.tweening = true;
  }

  /** The object the camera was last asked to focus on, or null after a reset. */
  current(): ObjectId | null {
    return this.focused;
  }

  /** True while the camera is still moving towards its goal. */
  moving() {
    return this.tweening;
  }

  /** Where a world position lands in the slot, in CSS pixels from its top-left corner. */
  project(position: [number, number, number]): Projected {
    const p = new THREE.Vector3(...position).project(this.camera);
    return {
      x: (p.x * 0.5 + 0.5) * this.container.clientWidth,
      y: (-0.5 * p.y + 0.5) * this.container.clientHeight,
      visible: p.z < 1 && p.x > -1 && p.x < 1 && p.y > -1 && p.y < 1,
    };
  }

  stats() {
    return {
      drawCalls: this.renderer.info.render.calls,
      triangles: this.renderer.info.render.triangles,
    };
  }

  private pick(event: PointerEvent): ObjectId | null {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.raycaster.setFromCamera(
      new THREE.Vector2(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        (-(event.clientY - rect.top) / rect.height) * 2 + 1,
      ),
      this.camera,
    );
    for (const [id, root] of this.roots) {
      const hits = this.raycaster.intersectObject(root, true);
      for (const hit of hits) {
        if (!(hit.object instanceof THREE.Mesh) || !hit.object.visible) continue;
        const material = hit.object.material as THREE.MeshStandardMaterial;
        if (material.transparent && material.opacity < 0.3) continue;
        return id;
      }
    }
    return null;
  }

  private pointerMove = (event: PointerEvent) => {
    if (event.buttons) return;
    const id = this.pick(event);
    this.renderer.domElement.style.cursor = id ? 'pointer' : 'grab';
    this.onHover(id);
  };

  private pointerLeave = () => this.onHover(null);

  /* No preventDefault: we never ask the browser to restore the context, the Studio goes
     back to the poster instead. */
  private contextLost = () => {
    this.renderer.setAnimationLoop(null);
    this.onContextLoss();
  };

  private visibilityChange = () => {
    this.hidden = document.hidden;
  };

  private resize() {
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    if (!w || !h) return;
    const aspect = w / h;
    const vertical = Math.max(7.65, 8.95 / aspect);
    this.camera.left = (-vertical * aspect) / 2;
    this.camera.right = (vertical * aspect) / 2;
    this.camera.top = vertical / 2;
    this.camera.bottom = -vertical / 2;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  private tick = () => {
    const dt = Math.min(this.clock.getDelta(), 0.05);
    if (this.hidden) return;
    if (this.tweening) {
      const blend = 1 - Math.exp(-dt * 5);
      this.camera.position.lerp(this.cameraGoal, blend);
      this.controls.target.lerp(this.target, blend);
      this.camera.zoom = THREE.MathUtils.lerp(this.camera.zoom, this.zoomGoal, blend);
      this.camera.updateProjectionMatrix();
      if (
        this.camera.position.distanceTo(this.cameraGoal) < 0.006 &&
        Math.abs(this.camera.zoom - this.zoomGoal) < 0.003
      ) {
        this.tweening = false;
      }
    }
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
    this.onFrame();
  };

  /** Stops rendering, frees GPU resources and removes the canvas from the slot. */
  dispose() {
    this.renderer.setAnimationLoop(null);
    this.observer.disconnect();
    this.controls.dispose();
    const canvas = this.renderer.domElement;
    canvas.removeEventListener('pointermove', this.pointerMove);
    canvas.removeEventListener('pointerleave', this.pointerLeave);
    canvas.removeEventListener('webglcontextlost', this.contextLost);
    document.removeEventListener('visibilitychange', this.visibilityChange);
    this.scene.traverse(object => {
      if (!(object instanceof THREE.Mesh)) return;
      object.geometry.dispose();
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      for (const material of materials) material.dispose();
    });
    this.scene.environment?.dispose();
    this.renderer.dispose();
    canvas.remove();
  }
}
