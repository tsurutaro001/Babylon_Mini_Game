// Babylon.js mini game: WASD to move, Q/E rotate, Space to jump
(() => {
  const canvas = document.getElementById("gameCanvas");
  const engine = new BABYLON.Engine(canvas, true);

  const createScene = function () {
    const scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color4(0.02, 0.04, 0.08, 1);

    const hemi = new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(0, 1, 0), scene);
    hemi.intensity = 0.8;
    const dir = new BABYLON.DirectionalLight("dir", new BABYLON.Vector3(-0.5, -1, -0.3), scene);
    dir.position = new BABYLON.Vector3(10, 20, 10);
    dir.intensity = 0.6;

    const ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 50, height: 50, subdivisions: 2 }, scene);
    const groundMat = new BABYLON.StandardMaterial("gmat", scene);
    groundMat.diffuseColor = new BABYLON.Color3(0.15, 0.3, 0.15);
    ground.material = groundMat;

    const body = BABYLON.MeshBuilder.CreateCylinder("body", { height: 1.6, diameter: 1.0 }, scene);
    const head = BABYLON.MeshBuilder.CreateSphere("head", { diameter: 1.0 }, scene);
    head.position.y = 1.3;
    const feet = BABYLON.MeshBuilder.CreateSphere("feet", { diameter: 1.0 }, scene);
    feet.position.y = -1.3;
    const player = BABYLON.Mesh.MergeMeshes([body, head, feet], true, undefined, undefined, false, true);
    player.position = new BABYLON.Vector3(0, 1.0, 0);
    const pMat = new BABYLON.StandardMaterial("pmat", scene);
    pMat.diffuseColor = new BABYLON.Color3(0.8, 0.2, 0.2);
    player.material = pMat;

    scene.gravity = new BABYLON.Vector3(0, -0.5, 0);
    scene.collisionsEnabled = true;
    ground.checkCollisions = true;
    player.checkCollisions = true;
    player.ellipsoid = new BABYLON.Vector3(0.4, 0.9, 0.4);
    player.ellipsoidOffset = new BABYLON.Vector3(0, 0.9, 0);

    const camera = new BABYLON.FollowCamera("follow", new BABYLON.Vector3(0, 5, -10), scene, player);
    camera.radius = 6;
    camera.heightOffset = 2;
    camera.rotationOffset = 180;
    camera.attachControl(canvas, true);

    const gui = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("ui");
    const label = new BABYLON.GUI.TextBlock();
    label.text = "WASD: Move   Q/E: Rotate   SPACE: Jump";
    label.color = "white";
    label.fontSize = 18;
    label.top = "-45%";
    gui.addControl(label);

    const keys = { w: false, a: false, s: false, d: false, q: false, e: false, space: false };
    scene.onKeyboardObservable.add((kbInfo) => {
      const k = kbInfo.event.key.toLowerCase();
      const isDown = kbInfo.type === BABYLON.KeyboardEventTypes.KEYDOWN;
      if (k in keys) keys[k] = isDown;
    });

    let vy = 0;
    const speed = 0.12;
    const rotSpeed = 2.0;
    const jumpPower = 0.22;
    const gravity = 0.01;

    scene.registerBeforeRender(() => {
      if (keys.q) player.rotation.y -= BABYLON.Angle.FromDegrees(rotSpeed).radians();
      if (keys.e) player.rotation.y += BABYLON.Angle.FromDegrees(rotSpeed).radians();

      const forward = new BABYLON.Vector3(Math.sin(player.rotation.y), 0, Math.cos(player.rotation.y) * -1);
      const right = new BABYLON.Vector3(forward.z, 0, -forward.x);
      let move = BABYLON.Vector3.Zero();

      if (keys.w) move = move.add(forward);
      if (keys.s) move = move.subtract(forward);
      if (keys.a) move = move.subtract(right);
      if (keys.d) move = move.add(right);
      if (!move.equals(BABYLON.Vector3.Zero())) move = move.normalize().scale(speed);

      const isGrounded = Math.abs(player.position.y - 1.0) < 0.02;
      if (keys.space && isGrounded) vy = jumpPower;
      vy -= gravity;
      move.y = vy;

      player.moveWithCollisions(move);
      if (player.position.y < 1.0) { player.position.y = 1.0; vy = 0; }
    });

    for (let i = 0; i < 20; i++) {
      const box = BABYLON.MeshBuilder.CreateBox("box" + i, { size: 1.5 }, scene);
      box.position = new BABYLON.Vector3((Math.random()-0.5)*30, 0.75, (Math.random()-0.5)*30);
      box.checkCollisions = true;
      const m = new BABYLON.StandardMaterial("bm"+i, scene);
      m.diffuseColor = new BABYLON.Color3(0.2, 0.2 + Math.random()*0.6, 0.6);
      box.material = m;
    }

    return scene;
  };

  const scene = createScene();
  engine.runRenderLoop(() => scene.render());
  window.addEventListener("resize", () => engine.resize());
})();