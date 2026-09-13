import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import type { ObjectId, StudioState } from '../state';
import { byId } from '../content';

type MaterialRecord={material:THREE.MeshStandardMaterial;color:THREE.Color;emission:THREE.Color;intensity:number;name:string;mesh:THREE.Mesh};
export class Studio {
  readonly renderer:THREE.WebGLRenderer;
  readonly scene=new THREE.Scene();
  readonly camera:THREE.OrthographicCamera;
  readonly controls:OrbitControls;
  readonly roots=new Map<string,THREE.Object3D>();
  private records=new Map<string,MaterialRecord[]>();
  private raycaster=new THREE.Raycaster();
  private clock=new THREE.Clock();
  private observer:ResizeObserver;
  private target=new THREE.Vector3(0,1.65,0);
  private cameraGoal=new THREE.Vector3(-10,9.4,12);
  private tweening=false;
  private zoomGoal=1;
  private latest?:StudioState;
  private chairPivot=new THREE.Group();
  private blindPivot=new THREE.Group();
  private drawerStart=new THREE.Vector3();
  private selected?:ObjectId;
  private key=new THREE.DirectionalLight(0xfff2db,3.5);
  private fill=new THREE.DirectionalLight(0xffffff,1.7);
  private ambient=new THREE.HemisphereLight(0xeaf3ff,0x806343,1.7);
  private windowLight=new THREE.PointLight(0xe4f5ff,14,9,2);
  private taskLight=new THREE.PointLight(0xffd295,1.8,2.3,2);
  private coves:THREE.PointLight[]=[];
  private fanPivots:THREE.Group[]=[];
  private selectionRing?:THREE.Mesh;
  private hidden=false;
  onSelect:(id:ObjectId)=>void=()=>{};
  onHover:(id:ObjectId|null)=>void=()=>{};
  onFrame:()=>void=()=>{};
  onContextLoss:()=>void=()=>{};
  private pointerStart?:{x:number;y:number};

  constructor(private container:HTMLElement){
    this.renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance',preserveDrawingBuffer:true});
    this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));
    this.renderer.setClearColor(0x000000,0);
    this.renderer.toneMapping=THREE.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.15;
    this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=THREE.PCFSoftShadowMap;
    this.renderer.domElement.setAttribute('aria-label','โมเดลห้องทำงาน 3 มิติ ลากเพื่อหมุน เลื่อนเพื่อซูม หรือเลือกวัตถุจากรายการอุปกรณ์');
    this.renderer.domElement.setAttribute('role','img');
    container.prepend(this.renderer.domElement);
    this.camera=new THREE.OrthographicCamera(-5,5,4,-4,.1,70);this.camera.position.copy(this.cameraGoal);
    this.controls=new OrbitControls(this.camera,this.renderer.domElement);
    this.controls.target.copy(this.target);this.controls.enableDamping=true;this.controls.dampingFactor=.07;
    this.controls.enablePan=false;this.controls.minZoom=.75;this.controls.maxZoom=2.9;
    this.controls.minPolarAngle=.32;this.controls.maxPolarAngle=1.37;
    this.controls.minAzimuthAngle=-Math.PI/2+.08;this.controls.maxAzimuthAngle=.23;
    this.controls.autoRotateSpeed=.45;this.controls.addEventListener('start',()=>{this.tweening=false;});
    const pmrem=new THREE.PMREMGenerator(this.renderer);const room=new RoomEnvironment();
    this.scene.environment=pmrem.fromScene(room,.04).texture;room.dispose();pmrem.dispose();this.scene.environmentIntensity=.38;
    this.key.position.set(-4,9,5);this.key.castShadow=true;this.key.shadow.mapSize.set(2048,2048);
    Object.assign(this.key.shadow.camera,{left:-6,right:6,top:6,bottom:-6,near:.1,far:25});this.key.shadow.normalBias=.035;this.key.shadow.bias=-.00015;
    this.fill.position.set(2,5,6);this.scene.add(this.key,this.fill,this.ambient);
    this.windowLight.position.set(2.6,2.25,-1.2);this.taskLight.position.set(-2.25,2.24,-1.66);this.scene.add(this.windowLight,this.taskLight);
    for(const [x,y,z] of [[-1,3.8,-2.4],[2.55,3.8,.7],[0,1.2,-1.5]]){
      const light=new THREE.PointLight(0xffce8c,2.5,5,2);light.position.set(x,y,z);this.scene.add(light);this.coves.push(light);
    }
    const shadow=new THREE.Mesh(new THREE.PlaneGeometry(200,200),new THREE.ShadowMaterial({color:0x483b2c,opacity:.14}));
    shadow.rotation.x=-Math.PI/2;shadow.position.y=-.305;shadow.receiveShadow=true;this.scene.add(shadow);
    this.observer=new ResizeObserver(()=>this.resize());this.observer.observe(container);this.resize();
    this.renderer.domElement.addEventListener('pointerdown',this.pointerDown);
    this.renderer.domElement.addEventListener('pointerup',this.pointerUp);
    this.renderer.domElement.addEventListener('pointermove',this.pointerMove);
    this.renderer.domElement.addEventListener('pointerleave',()=>this.onHover(null));
    this.renderer.domElement.addEventListener('webglcontextlost',this.contextLost);
    document.addEventListener('visibilitychange',this.visibilityChange);
    this.renderer.setAnimationLoop(this.tick);
  }
  async load(progress:(percent:number)=>void){
    const loader=new GLTFLoader();loader.setMeshoptDecoder(MeshoptDecoder);
    const gltf=await loader.loadAsync(`${import.meta.env.BASE_URL}models/studio.glb`,event=>{if(event.total)progress(event.loaded/event.total*95);});
    const model=gltf.scene;this.scene.add(model);
    for(const id of ['room','cove',...Object.keys(byId)]){
      const root=model.getObjectByName(id);if(!root)continue;this.roots.set(id,root);
      const records:MaterialRecord[]=[];
      root.traverse(object=>{
        if(!(object instanceof THREE.Mesh))return;
        object.castShadow=true;object.receiveShadow=true;object.userData.interaction=byId[id as ObjectId]?id:undefined;
        const materials=Array.isArray(object.material)?object.material:[object.material];
        const clones=materials.map(original=>{
          const material=original.clone() as THREE.MeshStandardMaterial;
          const name=material.name.toLowerCase().replace(/[^a-z0-9]+/g,'_');
          material.envMapIntensity=.6;
          if(name.includes('glass')){material.transparent=true;material.opacity=.13;material.depthWrite=false;material.side=THREE.DoubleSide;object.castShadow=false;object.renderOrder=2;}
          if(name.includes('foliage')||name.includes('leaf'))material.side=THREE.DoubleSide;
          records.push({material,color:material.color.clone(),emission:material.emissive.clone(),intensity:material.emissiveIntensity,name,mesh:object});return material;
        });
        object.material=Array.isArray(object.material)?clones:clones[0];
      });this.records.set(id,records);
    }
    this.scene.updateMatrixWorld(true);
    this.chairPivot.position.set(-.89,.1,-.26);this.scene.add(this.chairPivot);
    if(this.roots.get('chair'))this.chairPivot.attach(this.roots.get('chair')!);
    this.blindPivot.position.set(2.85,3.50,-1.2);this.scene.add(this.blindPivot);
    if(this.roots.get('blind'))this.blindPivot.attach(this.roots.get('blind')!);
    this.drawerStart.copy(this.roots.get('drawer')?.position||new THREE.Vector3());
    for(const y of [.41,.80]){
      const pivot=new THREE.Group();pivot.position.set(1.06,y,-1.605);
      for(let i=0;i<6;i++){
        const blade=new THREE.Mesh(new THREE.BoxGeometry(.075,.021,.004),new THREE.MeshStandardMaterial({color:0x242e30,metalness:.4,roughness:.4}));
        const a=i*Math.PI/3;blade.position.set(Math.cos(a)*.079,Math.sin(a)*.079,0);blade.rotation.z=a+.6;pivot.add(blade);
      }this.scene.add(pivot);this.fanPivots.push(pivot);
    }
    progress(100);if(this.latest)this.update(this.latest);
  }
  update(state:StudioState){
    this.latest=state;
    const night=state.mood==='night',warm=state.mood==='warm',level=state.light/100;
    this.key.intensity=(night?.55:warm?2.1:3.1)*(.35+.65*level);
    this.key.color.set(night?0x98b9ef:warm?0xffd2a0:0xfff1dc);
    this.fill.intensity=night?.6:warm?1.3:1.8;
    this.ambient.intensity=night?.8:warm?1.35:1.85;
    this.scene.environmentIntensity=night?.22:.38;
    this.windowLight.intensity=(night?1:12)*(1-state.blind/130);
    this.taskLight.intensity=state.lamp?2.8:0;
    this.coves.forEach(l=>l.intensity=(night?5.7:2.8)*level);
    this.renderer.toneMappingExposure=night?1.0:1.12;
    for(const [role,records] of this.records){
      for(const record of records){
        const {material,name,color,emission,intensity,mesh}=record;
        material.color.copy(color);material.emissive.copy(emission);material.emissiveIntensity=intensity;mesh.visible=true;
        const display=['workstation','laptop'].includes(role)&&/chart|editor_blue|display_midnight|warm_ivory/.test(name);
        const on=role==='workstation'?state.monitors:state.laptop;
        if(display&&!on){material.color.multiplyScalar(.015);material.emissiveIntensity=0;if(!name.includes('display_midnight'))mesh.visible=false;}
        if(role==='pc'&&name.includes('ice_blue')){material.emissiveIntensity=state.pc?2:.0;if(!state.pc)material.color.multiplyScalar(.18);}
        if(role==='server'&&name.includes('ice_blue')){material.emissiveIntensity=state.server?2:0;if(!state.server)material.color.multiplyScalar(.1);}
        if(role==='lamp'&&name.includes('warm_led')){material.emissiveIntensity=state.lamp?3.8:0;if(!state.lamp)material.color.multiplyScalar(.18);}
        if(role==='cove')material.emissiveIntensity=level*(night?4:2);
      }
    }
  }
  focus(id:ObjectId){
    this.selected=id;const pos=new THREE.Vector3(...byId[id].position);this.target.copy(pos);
    this.cameraGoal.copy(pos).add(new THREE.Vector3(-7,5,8));this.zoomGoal=2.05;this.tweening=true;this.controls.autoRotate=false;
  }
  select(id?:ObjectId){this.selected=id;}
  reset(){this.selected=undefined;this.target.set(0,1.65,0);this.cameraGoal.set(-10,9.4,12);this.zoomGoal=1;this.tweening=true;this.controls.autoRotate=false;}
  toggleOrbit(){this.controls.autoRotate=!this.controls.autoRotate;return this.controls.autoRotate;}
  project(position:[number,number,number]){
    const p=new THREE.Vector3(...position).project(this.camera);
    return {x:(p.x*.5+.5)*this.container.clientWidth,y:(-.5*p.y+.5)*this.container.clientHeight,visible:p.z<1&&p.x>-1&&p.x<1&&p.y>-1&&p.y<1};
  }
  snapshot(){this.renderer.render(this.scene,this.camera);return this.renderer.domElement.toDataURL('image/png');}
  stats(){return {drawCalls:this.renderer.info.render.calls,triangles:this.renderer.info.render.triangles,geometries:this.renderer.info.memory.geometries,textures:this.renderer.info.memory.textures};}
  private pick(event:PointerEvent){
    const rect=this.renderer.domElement.getBoundingClientRect();
    this.raycaster.setFromCamera(new THREE.Vector2((event.clientX-rect.left)/rect.width*2-1,-(event.clientY-rect.top)/rect.height*2+1),this.camera);
    const meshes=[...this.roots.values()];
    const hits=this.raycaster.intersectObjects(meshes,true);
    for(const hit of hits){
      if(!(hit.object instanceof THREE.Mesh)||!hit.object.visible)continue;
      const mat=hit.object.material as THREE.MeshStandardMaterial;if(mat.transparent&&mat.opacity<.3)continue;
      return hit.object.userData.interaction as ObjectId|undefined;
    }return undefined;
  }
  private pointerDown=(e:PointerEvent)=>{this.pointerStart={x:e.clientX,y:e.clientY};};
  private pointerUp=(e:PointerEvent)=>{if(this.pointerStart&&Math.hypot(e.clientX-this.pointerStart.x,e.clientY-this.pointerStart.y)<6){const id=this.pick(e);if(id)this.onSelect(id);}this.pointerStart=undefined;};
  private pointerMove=(e:PointerEvent)=>{if(this.pointerStart)return;const id=this.pick(e);this.renderer.domElement.style.cursor=id?'pointer':'grab';this.onHover(id||null);};
  private contextLost=(event:Event)=>{event.preventDefault();this.renderer.setAnimationLoop(null);this.onContextLoss();};
  private visibilityChange=()=>{this.hidden=document.hidden;};
  private resize(){
    const w=this.container.clientWidth,h=this.container.clientHeight;if(!w||!h)return;
    const aspect=w/h,vertical=Math.max(7.65,8.95/aspect);
    this.camera.left=-vertical*aspect/2;this.camera.right=vertical*aspect/2;this.camera.top=vertical/2;this.camera.bottom=-vertical/2;this.camera.updateProjectionMatrix();this.renderer.setSize(w,h);
  }
  private tick=()=>{
    const dt=Math.min(this.clock.getDelta(),.05);if(this.hidden)return;
    if(this.tweening){
      const blend=1-Math.exp(-dt*5);this.camera.position.lerp(this.cameraGoal,blend);this.controls.target.lerp(this.target,blend);this.camera.zoom=THREE.MathUtils.lerp(this.camera.zoom,this.zoomGoal,blend);this.camera.updateProjectionMatrix();
      if(this.camera.position.distanceTo(this.cameraGoal)<.006&&Math.abs(this.camera.zoom-this.zoomGoal)<.003)this.tweening=false;
    }
    if(this.latest){
      const k=1-Math.exp(-dt*7),state=this.latest;
      this.chairPivot.rotation.y=THREE.MathUtils.lerp(this.chairPivot.rotation.y,state.chair*Math.PI/180,k);
      this.blindPivot.scale.y=THREE.MathUtils.lerp(this.blindPivot.scale.y,.04+state.blind/55*.96,k);
      const drawer=this.roots.get('drawer');if(drawer)drawer.position.z=THREE.MathUtils.lerp(drawer.position.z,this.drawerStart.z+(state.drawer?.38:0),k);
      if(state.pc)this.fanPivots.forEach(p=>p.rotation.z-=dt*5);
    }
    this.controls.update();this.renderer.render(this.scene,this.camera);this.onFrame();
  };
  dispose(){this.renderer.setAnimationLoop(null);this.observer.disconnect();this.controls.dispose();document.removeEventListener('visibilitychange',this.visibilityChange);this.scene.traverse(o=>{if(o instanceof THREE.Mesh){o.geometry.dispose();const ms=Array.isArray(o.material)?o.material:[o.material];ms.forEach(m=>m.dispose());}});this.scene.environment?.dispose();this.renderer.dispose();}
}
