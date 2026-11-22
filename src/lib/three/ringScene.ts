import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

/**
 * 3D gold ring with a diamond, built entirely in code (no model file).
 * The ring spins slowly and reacts to the scroll progress of the hero (0 to 1).
 */

type Options = {
  getProgress: () => number;
  reducedMotion: boolean;
  /** Arabic layout: the text is on the right, so the ring moves to the left on wide screens. */
  rtl: boolean;
  onFirstFrame?: () => void;
};

/** Closed rounded-rectangle profile (x = radius, y = height) for the ring band. */
function bandProfile(center: number, halfThick: number, halfWidth: number, r: number) {
  const pts: THREE.Vector2[] = [];
  const arc = (cx: number, cy: number, from: number) => {
    for (let i = 0; i <= 6; i++) {
      const a = from + (i / 6) * (Math.PI / 2);
      pts.push(new THREE.Vector2(cx + Math.cos(a) * r, cy + Math.sin(a) * r));
    }
  };
  const x0 = center - halfThick;
  const x1 = center + halfThick;
  arc(x1 - r, -halfWidth + r, -Math.PI / 2); // bottom-outer corner
  arc(x1 - r, halfWidth - r, 0); // top-outer corner
  arc(x0 + r, halfWidth - r, Math.PI / 2); // top-inner corner
  arc(x0 + r, -halfWidth + r, Math.PI); // bottom-inner corner
  pts.push(pts[0].clone());
  return pts;
}

function buildRing() {
  const ring = new THREE.Group();

  const gold = new THREE.MeshStandardMaterial({
    color: new THREE.Color("#e2b45c"),
    metalness: 1,
    roughness: 0.17,
    envMapIntensity: 1.5,
    side: THREE.DoubleSide,
  });

  const diamond = new THREE.MeshStandardMaterial({
    color: new THREE.Color("#f3f6ff"),
    metalness: 1,
    roughness: 0.03,
    envMapIntensity: 3.2,
    flatShading: true,
  });

  // Band: lathe around Y, then turned to face the camera like the letter O.
  const band = new THREE.Mesh(new THREE.LatheGeometry(bandProfile(0.93, 0.07, 0.13, 0.05), 160), gold);
  band.rotation.x = Math.PI / 2;
  ring.add(band);

  // Setting (collar) on top of the band.
  const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.07, 0.2, 32), gold);
  collar.position.y = 1.06;
  ring.add(collar);

  // Four prongs holding the stone.
  for (let i = 0; i < 4; i++) {
    const a = Math.PI / 4 + (i * Math.PI) / 2;
    const prong = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.024, 0.34, 10), gold);
    prong.position.set(Math.cos(a) * 0.2, 1.27, Math.sin(a) * 0.2);
    prong.rotation.set(Math.sin(a) * 0.35, 0, -Math.cos(a) * 0.35);
    ring.add(prong);
  }

  // Brilliant-cut diamond: a faceted lathe (culet, girdle, crown, table).
  const stoneProfile = [
    new THREE.Vector2(0.0001, -0.3),
    new THREE.Vector2(0.27, 0),
    new THREE.Vector2(0.27, 0.025),
    new THREE.Vector2(0.16, 0.15),
    new THREE.Vector2(0.0001, 0.15),
  ];
  const stone = new THREE.Mesh(new THREE.LatheGeometry(stoneProfile, 16), diamond);
  stone.position.y = 1.32;
  ring.add(stone);

  return { ring, stone };
}

export function createRingScene(canvas: HTMLCanvasElement, opts: Options) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envTexture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = envTexture;
  pmrem.dispose();

  // Warm key light and a soft rim so the gold edges glow on the black page.
  const key = new THREE.DirectionalLight(0xfff1d6, 2.2);
  key.position.set(3, 4, 5);
  scene.add(key);
  const rim = new THREE.PointLight(0xd4a64a, 18, 12);
  rim.position.set(-3, -1, -2);
  scene.add(rim);

  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  const { ring, stone } = buildRing();
  const pivot = new THREE.Group();
  pivot.add(ring);
  ring.position.y = -0.25; // center the whole piece (band + stone)
  scene.add(pivot);

  const resize = () => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // Keep the ring fully visible on narrow phones.
    camera.position.set(0, 0, Math.max(7.2, 5.5 / camera.aspect));
    camera.updateProjectionMatrix();
  };
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);

  let smooth = opts.getProgress();
  let running = true;
  let first = true;
  let raf = 0;
  const clock = new THREE.Clock();

  const frame = () => {
    raf = requestAnimationFrame(frame);
    if (!running) return;
    const t = clock.getElapsedTime();
    smooth += (opts.getProgress() - smooth) * 0.08;
    const p = smooth;
    const idle = opts.reducedMotion ? 0 : t;

    pivot.rotation.y = 0.5 + idle * 0.35 + p * Math.PI * 2.2;
    pivot.rotation.x = -0.18 + p * 0.75 + Math.sin(idle * 0.6) * 0.04;
    pivot.rotation.z = Math.sin(idle * 0.4) * 0.05;
    // The ring makes room for the headline before it appears (done at p = 0.35).
    const move = Math.min(1, p / 0.35);
    const ease = move * move * (3 - 2 * move);
    if (camera.aspect > 1.1 && canvas.clientWidth >= 768) {
      // Wide screens: the ring slides to the side, the headline appears on the other side.
      pivot.position.set((opts.rtl ? -1 : 1) * ease * 1.65, 0.05, 0);
      pivot.scale.setScalar(1 - ease * 0.12);
    } else {
      // Phones: the ring rises and shrinks, the headline appears below it.
      pivot.position.set(0, 0.05 + ease * 0.9, 0);
      pivot.scale.setScalar(1 - ease * 0.28);
    }
    stone.rotation.y = idle * 0.8; // facets catch the light

    renderer.render(scene, camera);
    if (first) {
      first = false;
      opts.onFirstFrame?.();
    }
  };
  raf = requestAnimationFrame(frame);

  return {
    setRunning(value: boolean) {
      running = value;
    },
    dispose() {
      cancelAnimationFrame(raf);
      ro.disconnect();
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          (obj.material as THREE.Material).dispose();
        }
      });
      envTexture.dispose();
      renderer.dispose();
    },
  };
}
