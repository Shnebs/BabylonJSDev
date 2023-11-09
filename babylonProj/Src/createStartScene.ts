import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import {
  Scene,
  ArcRotateCamera,
  Vector3,
  HemisphericLight,
  MeshBuilder,
  Mesh,
  Light,
  Camera,
  Engine,
  SceneLoader,
  ActionManager,
  ExecuteCodeAction,
  AnimationPropertiesOverride,
} from "@babylonjs/core";
import { anaglyphPixelShader } from "@babylonjs/core/Shaders/anaglyph.fragment";
//----------------------------------------------------------------------------------

//----------------------------------------------------------------------------------

let keyDownMap: any[] = [];
function importPlayerMesh(scene, x: number, y: number) {
  let tempItem = { flag: false }
  let item = SceneLoader.ImportMesh(
    "",
    "./Model/",
    "dummy3.babylon",
    scene,
    function (newMeshes,particleSystems, skeletons) {
      let mesh = newMeshes[0];
      let skeleton = skeletons[0];
      skeleton.animationPropertiesOverride = new AnimationPropertiesOverride();
      skeleton.animationPropertiesOverride.enableBlending = true;
      skeleton.animationPropertiesOverride.blendingSpeed = 0.05;
      skeleton.animationPropertiesOverride.loopMode = 1;

      let walkRange: any = skeleton.getAnimationRange("YBot_Walk");
      // let runRange: any = skeleton.getAnimationRange("YBot_Run");
      // let leftRange: any = skeleton.getAnimationRange("YBot_LeftStrafeWalk");
      // let rightRange: any = skeleton.getAnimationRange("YBot_RightStrafeWalk");
      // let idleRange: any = skeleton.getAnimationRange("YBot_Idle");

      let animating: boolean = false;
      
      scene.onBeforeRenderObservable.add(()=> {
      
        let keydown: boolean = false;
        if (keyDownMap["w"] || keyDownMap["ArrowUp"]) {
          mesh.position.z += 0.1;
          mesh.rotation.y = 0;
          keydown = true;
        }
        if (keyDownMap["a"] || keyDownMap["ArrowLeft"]) {
          mesh.position.x -= 0.1;
          mesh.rotation.y = 3 * Math.PI / 2;
          keydown = true;
        }
        if (keyDownMap["s"] || keyDownMap["ArrowDown"]) {
          mesh.position.z -= 0.1;
          mesh.rotation.y = 2 * Math.PI / 2;
          keydown = true;
        }
        if (keyDownMap["d"] || keyDownMap["ArrowRight"]) {
          mesh.position.x += 0.1;
          mesh.rotation.y = Math.PI / 2;
          keydown = true;
        }

        if (keydown) {
          if (!animating) {
            animating = true;
            scene.beginAnimation(skeleton, walkRange.from, walkRange.to, true);
          }
          } else {
            animating = false;
            scene.stopAnimation(skeleton);
          }
        });
      });
  return item;
}

function actionManager(scene: Scene) {
  scene.actionManager = new ActionManager(scene);
  scene.actionManager.registerAction(
    new ExecuteCodeAction(
      {
        trigger: ActionManager.OnKeyDownTrigger,
        //parameters: 'w'
      },
      function (evt) {
        keyDownMap[evt.sourceEvent.key] = true;
      }
    )
  );
  scene.actionManager.registerAction(
    new ExecuteCodeAction(
      {
        trigger: ActionManager.OnKeyUpTrigger,
      },
      function (evt) {
        keyDownMap[evt.sourceEvent.key] = false;
      }
    )
  );
  return scene.actionManager;
}



function createLight(scene: Scene) {
  const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
  light.intensity = 0.7;
  return light;
}

function createGround(scene: Scene) {
  let ground = MeshBuilder.CreateGround(
    "ground",
    { width: 12, height: 6 },
    scene
  );
  return ground;
}

function createArcRotateCamera(scene: Scene) {
  let camAlpha = -Math.PI / 2,
    camBeta = Math.PI / 2.5,
    camDist = 10,
    camTarget = new Vector3(0, 0, 0);
  let camera = new ArcRotateCamera(
    "camera1",
    camAlpha,
    camBeta,
    camDist,
    camTarget,
    scene
  );
  camera.attachControl(true);
  return camera;
}

export default function createStartScene(engine: Engine) {
  interface SceneData {
    scene: Scene;
    box?: Mesh;
    light?: Light;
    sphere?: Mesh;
    ground?: Mesh;
    camera?: Camera;
    importMesh?: any;
    actionManager?: any;
    ExecuteCodeAction?: any;
  }

  let that: SceneData = { scene: new Scene(engine) };
  that.scene.debugLayer.show();
  that.light = createLight(that.scene);
  that.importMesh = importPlayerMesh(that.scene, 0, 0);
  that.ground = createGround(that.scene);
  that.camera = createArcRotateCamera(that.scene);
  that.actionManager = actionManager(that.scene);
  return that;
}
