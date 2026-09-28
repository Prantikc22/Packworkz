import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export type MockupFormat = "mailer" | "shipping" | "carton" | "rigid" | "pouch" | "coffee" | "bottle" | "jar" | "tube";
export type ArtworkFit = "cover" | "contain" | "repeat";

type Props = {
  format: MockupFormat;
  color: string;
  brandName: string;
  finish: "matte" | "gloss";
  logoDataUrl?: string;
  artworkDataUrl?: string;
  artworkFit?: ArtworkFit;
  autoRotate?: boolean;
  stock?: PaperStock;
  backdrop?: StudioBackdrop;
  cameraView?: CameraView;
  /** Pack size in mm. Scales box formats so proportions match the real pack. */
  dimensions?: MockupDimensions;
  className?: string;
  onReady?: (renderer: THREE.WebGLRenderer) => void;
};

const MODEL_ASSETS: Partial<Record<MockupFormat, string>> = {
  pouch: "stand-up-pouch.glb",
  coffee: "coffee-bag.glb",
  jar: "jar.glb",
  tube: "cosmetic-tube.glb",
};

function drawImageFit(context: CanvasRenderingContext2D, image: HTMLImageElement, fit: ArtworkFit) {
  const size = 1024;
  if (fit === "repeat") {
    const tile = 360;
    const scale = Math.min(tile / image.width, tile / image.height);
    const width = image.width * scale;
    const height = image.height * scale;
    for (let y = -height; y < size + height; y += height) {
      for (let x = -width; x < size + width; x += width) context.drawImage(image, x, y, width, height);
    }
    return;
  }
  const scale = fit === "cover"
    ? Math.max(size / image.width, size / image.height)
    : Math.min(820 / image.width, 820 / image.height);
  const width = image.width * scale;
  const height = image.height * scale;
  context.drawImage(image, (size - width) / 2, (size - height) / 2, width, height);
}

function loadImage(dataUrl?: string): Promise<HTMLImageElement | undefined> {
  if (!dataUrl) return Promise.resolve(undefined);
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => resolve(undefined);
    image.src = dataUrl;
  });
}

export type PaperStock = "color" | "white" | "kraft";
export type StudioBackdrop = "studio" | "warm" | "night";
export type CameraView = "hero" | "front" | "side" | "top";
export type MockupDimensions = { width: number; height: number; depth: number };

const KRAFT = "#C49A6C";

function paintKraft(context: CanvasRenderingContext2D) {
  context.fillStyle = KRAFT;
  context.fillRect(0, 0, 1024, 1024);
  // Fibre speckle so kraft reads as paper, not flat tan.
  for (let index = 0; index < 5200; index += 1) {
    const shade = Math.random() > 0.5 ? "rgba(92,62,32," : "rgba(236,208,168,";
    context.fillStyle = `${shade}${(Math.random() * 0.22).toFixed(3)})`;
    context.fillRect(Math.random() * 1024, Math.random() * 1024, Math.random() * 3 + 0.6, Math.random() * 1.4 + 0.4);
  }
}

async function makeArtworkTexture(
  color: string,
  brandName: string,
  logoDataUrl?: string,
  artworkDataUrl?: string,
  artworkFit: ArtworkFit = "cover",
  stock: PaperStock = "color",
) {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1024;
  const context = canvas.getContext("2d");
  if (!context) return undefined;
  const [logo, artwork] = await Promise.all([loadImage(logoDataUrl), loadImage(artworkDataUrl)]);
  // On colour stock the brand colour floods the pack and print is white.
  // On white or kraft stock the brand colour becomes the ink.
  const ink = stock === "color" ? "#ffffff" : color;

  if (stock === "kraft") paintKraft(context);
  else {
    context.fillStyle = stock === "white" ? "#F7F6F2" : color;
    context.fillRect(0, 0, 1024, 1024);
  }

  if (artwork) {
    drawImageFit(context, artwork, artworkFit);
    if (artworkFit === "contain") {
      context.strokeStyle = "rgba(255,255,255,.35)";
      context.strokeRect(86, 86, 852, 852);
    }
  } else {
    context.globalAlpha = stock === "color" ? 0.16 : 0.1;
    context.strokeStyle = ink;
    context.lineWidth = 2;
    for (let i = -512; i < 1536; i += 96) {
      context.beginPath();
      context.moveTo(i, 0);
      context.lineTo(i + 512, 1024);
      context.stroke();
    }
    context.globalAlpha = 1;
    if (logo) {
      const scale = Math.min(260 / logo.width, 180 / logo.height);
      context.drawImage(logo, (1024 - logo.width * scale) / 2, 185, logo.width * scale, logo.height * scale);
    } else {
      context.fillStyle = ink;
      context.globalAlpha = 0.94;
      context.beginPath();
      context.arc(512, 250, 66, 0, Math.PI * 2);
      context.fill();
      context.globalAlpha = 1;
      context.fillStyle = stock === "color" ? color : stock === "kraft" ? KRAFT : "#F7F6F2";
      context.font = "800 72px Arial";
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillText(brandName.trim().slice(0, 1).toUpperCase() || "P", 512, 255);
    }
    context.fillStyle = ink;
    context.textAlign = "center";
    context.textBaseline = "alphabetic";
    context.font = "800 82px Arial";
    context.fillText(brandName.trim().slice(0, 18) || "Your Brand", 512, 472);
    context.font = "600 27px Arial";
    context.fillText("PACKAGED WITH INTENTION", 512, 530);
    context.globalAlpha = 0.8;
    context.fillRect(390, 590, 244, 5);
    context.globalAlpha = 1;
    context.font = "500 24px Arial";
    context.fillText("Designed on Packworkz", 512, 660);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

function pouchGeometry() {
  const shape = new THREE.Shape();
  shape.moveTo(-1.24, -2.06);
  shape.quadraticCurveTo(-1.47, -1.96, -1.5, -1.64);
  shape.lineTo(-1.42, 1.68);
  shape.quadraticCurveTo(-1.4, 1.92, -1.18, 2.02);
  shape.lineTo(1.18, 2.02);
  shape.quadraticCurveTo(1.4, 1.92, 1.42, 1.68);
  shape.lineTo(1.5, -1.64);
  shape.quadraticCurveTo(1.47, -1.96, 1.24, -2.06);
  shape.quadraticCurveTo(0, -2.18, -1.24, -2.06);
  shape.closePath();
  const geometry = new THREE.ExtrudeGeometry(shape, { depth: 0.24, bevelEnabled: true, bevelSegments: 5, bevelSize: 0.045, bevelThickness: 0.035 });
  geometry.center();
  normalizePlanarUvs(geometry);
  return geometry;
}

function normalizePlanarUvs(geometry: THREE.BufferGeometry) {
  geometry.computeBoundingBox();
  const bounds = geometry.boundingBox;
  const position = geometry.attributes.position;
  const uv = geometry.attributes.uv;
  if (!bounds || !uv) return;
  const width = Math.max(0.001, bounds.max.x - bounds.min.x);
  const height = Math.max(0.001, bounds.max.y - bounds.min.y);
  for (let index = 0; index < position.count; index += 1) {
    uv.setXY(index, (position.getX(index) - bounds.min.x) / width, (position.getY(index) - bounds.min.y) / height);
  }
  uv.needsUpdate = true;
}

function cosmeticTubeGeometry() {
  const shape = new THREE.Shape();
  shape.moveTo(-0.57, -1.5);
  shape.quadraticCurveTo(-0.82, -1.42, -0.98, -1.08);
  shape.quadraticCurveTo(-1.08, -0.64, -1.12, 0.1);
  shape.lineTo(-1.24, 1.7);
  shape.quadraticCurveTo(-1.24, 1.9, -1.04, 1.96);
  shape.lineTo(1.04, 1.96);
  shape.quadraticCurveTo(1.24, 1.9, 1.24, 1.7);
  shape.lineTo(1.12, 0.1);
  shape.quadraticCurveTo(1.08, -0.64, 0.98, -1.08);
  shape.quadraticCurveTo(0.82, -1.42, 0.57, -1.5);
  shape.closePath();
  const geometry = new THREE.ExtrudeGeometry(shape, { depth: 0.68, bevelEnabled: true, bevelSegments: 10, bevelSize: 0.13, bevelThickness: 0.13 });
  geometry.center();
  normalizePlanarUvs(geometry);
  return geometry;
}

function bottleGeometry() {
  const profile = [
    [1.1, -2.05], [1.17, -1.95], [1.18, -1.55], [1.18, 0.82],
    [1.14, 1.05], [1.02, 1.28], [0.77, 1.55], [0.52, 1.68],
    [0.48, 1.94], [0.48, 2.05],
  ].map(([radius, y]) => new THREE.Vector2(radius, y));
  return new THREE.LatheGeometry(profile, 72);
}

function mesh(geometry: THREE.BufferGeometry, material: THREE.Material, y = 0) {
  const item = new THREE.Mesh(geometry, material);
  item.position.y = y;
  item.castShadow = true;
  item.receiveShadow = true;
  return item;
}

function buildProduct(format: MockupFormat, material: THREE.MeshPhysicalMaterial, color: string) {
  // "color" here is the base colour of unprinted surfaces (sides, lids).
  const group = new THREE.Group();
  const dark = new THREE.MeshStandardMaterial({ color: "#0D1B2A", roughness: 0.32 });
  const side = new THREE.MeshPhysicalMaterial({ color, roughness: material.roughness, clearcoat: material.clearcoat });
  const seamColor = new THREE.Color(color).lerp(new THREE.Color("#ffffff"), 0.26);
  const seam = new THREE.MeshStandardMaterial({ color: seamColor, roughness: 0.65, transparent: true, opacity: 0.72 });

  if (format === "mailer") {
    group.add(mesh(new THREE.BoxGeometry(4.6, 1.45, 3.25, 4, 2, 4), material));
    const lidLine = mesh(new THREE.BoxGeometry(4.64, 0.035, 3.29), dark, 0.56);
    lidLine.material = new THREE.MeshStandardMaterial({ color: "#ffffff", transparent: true, opacity: 0.25 });
    group.add(lidLine);
  } else if (format === "shipping") {
    group.add(mesh(new THREE.BoxGeometry(4.1, 3, 3.3, 4, 3, 3), material));
    const tape = mesh(new THREE.BoxGeometry(0.42, 3.04, 3.34), new THREE.MeshStandardMaterial({ color: "#D6A136", roughness: 0.6 }));
    tape.rotation.z = Math.PI / 2;
    tape.position.y = 1.49;
    group.add(tape);
  } else if (format === "carton") {
    group.add(mesh(new THREE.BoxGeometry(2.75, 4.15, 1.6, 4, 5, 2), material));
  } else if (format === "rigid") {
    const base = new THREE.Group();
    base.add(mesh(new RoundedBoxGeometry(3.78, 0.28, 3.08, 5, 0.08), side, -1.06));
    base.add(mesh(new RoundedBoxGeometry(3.78, 1.35, 0.2, 4, 0.06), side, -0.52));
    const backWall = mesh(new RoundedBoxGeometry(3.78, 1.35, 0.2, 4, 0.06), side, -0.52);
    backWall.position.z = -1.44;
    base.children[1].position.z = 1.44;
    base.add(backWall);
    const leftWall = mesh(new RoundedBoxGeometry(0.2, 1.35, 2.72, 4, 0.06), side, -0.52);
    leftWall.position.x = -1.79;
    base.add(leftWall);
    const rightWall = leftWall.clone();
    rightWall.position.x = 1.79;
    base.add(rightWall);
    const insert = mesh(new RoundedBoxGeometry(3.28, 0.14, 2.58, 4, 0.06), new THREE.MeshStandardMaterial({ color: "#E9E1D3", roughness: 0.88 }), -0.87);
    base.add(insert);
    group.add(base);

    const lid = new THREE.Group();
    lid.add(mesh(new RoundedBoxGeometry(3.96, 0.24, 3.28, 5, 0.08), material));
    const lidLip = mesh(new RoundedBoxGeometry(3.76, 0.22, 3.08, 4, 0.06), side, -0.18);
    lid.add(lidLip);
    lid.position.set(0, 1.65, -1.65);
    lid.rotation.x = -0.72;
    group.add(lid);
  } else if (format === "pouch" || format === "coffee") {
    group.add(mesh(pouchGeometry(), material));
    const topSeal = mesh(new RoundedBoxGeometry(2.66, 0.2, 0.3, 4, 0.025), seam, 1.91);
    topSeal.position.z = 0.04;
    group.add(topSeal);
    [1.58, 1.49].forEach((y) => {
      const zipper = mesh(new RoundedBoxGeometry(2.44, 0.035, 0.03, 3, 0.008), dark, y);
      zipper.position.z = 0.165;
      group.add(zipper);
    });
    const gussetCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-1.18, -1.88, 0.15),
      new THREE.Vector3(-0.62, -2.04, 0.19),
      new THREE.Vector3(0, -2.1, 0.2),
      new THREE.Vector3(0.62, -2.04, 0.19),
      new THREE.Vector3(1.18, -1.88, 0.15),
    ]);
    const bottomGusset = mesh(new THREE.TubeGeometry(gussetCurve, 32, 0.035, 8, false), seam);
    group.add(bottomGusset);
    [-1.43, 1.43].forEach((x) => {
      const sideSeal = mesh(new RoundedBoxGeometry(0.055, 3.35, 0.28, 3, 0.015), seam, -0.05);
      sideSeal.position.x = x;
      group.add(sideSeal);
    });
  } else if (format === "bottle") {
    group.add(mesh(bottleGeometry(), material));
    const collar = mesh(new THREE.CylinderGeometry(0.54, 0.54, 0.16, 64), side, 2.08);
    group.add(collar);
    const cap = mesh(new THREE.CylinderGeometry(0.59, 0.59, 0.64, 64, 3), dark, 2.48);
    group.add(cap);
    for (let index = 0; index < 4; index += 1) {
      const capRing = mesh(new THREE.TorusGeometry(0.592, 0.018, 8, 64), seam, 2.26 + index * 0.14);
      capRing.rotation.x = Math.PI / 2;
      group.add(capRing);
    }
  } else if (format === "jar") {
    group.add(mesh(new THREE.CylinderGeometry(1.48, 1.48, 2.55, 64), material, -0.25));
    group.add(mesh(new THREE.CylinderGeometry(1.52, 1.52, 0.48, 64), dark, 1.28));
  } else {
    group.add(mesh(cosmeticTubeGeometry(), material, 0));
    const crimp = mesh(new RoundedBoxGeometry(2.35, 0.18, 0.78, 4, 0.04), seam, 1.96);
    group.add(crimp);
    for (let index = -9; index <= 9; index += 1) {
      const rib = mesh(new RoundedBoxGeometry(0.035, 0.085, 0.8, 2, 0.008), seam, 1.995);
      rib.position.x = index * 0.115;
      group.add(rib);
    }
    group.add(mesh(new THREE.CylinderGeometry(0.5, 0.64, 0.34, 64), side, -1.68));
    const capMaterial = new THREE.MeshPhysicalMaterial({ color: "#F4F5F2", roughness: 0.38, clearcoat: 0.25 });
    const cap = mesh(new THREE.CylinderGeometry(0.72, 0.72, 0.72, 64), capMaterial, -2.2);
    group.add(cap);
    for (let index = 0; index < 2; index += 1) {
      const capLine = mesh(new THREE.TorusGeometry(0.722, 0.016, 8, 64), seam, -2.06 - index * 0.24);
      capLine.rotation.x = Math.PI / 2;
      group.add(capLine);
    }
    const hinge = mesh(new RoundedBoxGeometry(0.3, 0.12, 0.12, 3, 0.025), side, -2.31);
    hinge.position.z = 0.7;
    group.add(hinge);
  }
  return group;
}

function disposeMaterial(material: THREE.Material | THREE.Material[]) {
  (Array.isArray(material) ? material : [material]).forEach((item) => {
    const candidate = item as THREE.MeshStandardMaterial;
    candidate.map?.dispose();
    candidate.normalMap?.dispose();
    candidate.roughnessMap?.dispose();
    candidate.metalnessMap?.dispose();
    item.dispose();
  });
}

function addArtworkPanel(format: MockupFormat, root: THREE.Group, material: THREE.MeshPhysicalMaterial) {
  root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(root);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  let panel: THREE.Mesh;

  if (format === "jar") {
    const radius = size.x * 0.505;
    const arc = Math.PI * 0.7;
    panel = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, size.y * 0.49, 64, 1, true, -arc / 2, arc), material);
    panel.position.set(center.x, center.y - size.y * 0.17, center.z);
  } else {
    const width = size.x * (format === "tube" ? 0.48 : 0.82);
    const height = size.y * (format === "tube" ? 0.5 : format === "coffee" ? 0.64 : 0.66);
    panel = new THREE.Mesh(new THREE.PlaneGeometry(width, height, 8, 8), material);
    panel.position.set(center.x, center.y - size.y * (format === "tube" ? 0.03 : 0.04), box.max.z + size.z * 0.008);
  }

  panel.name = "Packworkz artwork preview";
  panel.userData.packworkz_role = "artwork-panel";
  panel.castShadow = false;
  panel.receiveShadow = false;
  panel.renderOrder = 3;
  root.add(panel);
}

function prepareLoadedProduct(
  format: MockupFormat,
  root: THREE.Group,
  bodyMaterial: THREE.MeshPhysicalMaterial,
  artworkMaterial: THREE.MeshPhysicalMaterial,
) {
  let artworkApplied = false;
  root.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    object.castShadow = true;
    object.receiveShadow = true;
    if (object.userData.packworkz_role === "artwork") {
      disposeMaterial(object.material);
      object.material = bodyMaterial;
      artworkApplied = true;
    }
  });

  // Older exports may omit custom properties. Keep the preview useful by applying
  // artwork to the largest mesh instead of silently showing a blank model.
  if (!artworkApplied) {
    let largest: THREE.Mesh | undefined;
    let largestVolume = 0;
    root.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      object.geometry.computeBoundingBox();
      const size = object.geometry.boundingBox?.getSize(new THREE.Vector3());
      const volume = size ? size.x * size.y * size.z : 0;
      if (volume > largestVolume) {
        largest = object;
        largestVolume = volume;
      }
    });
    if (largest) {
      disposeMaterial(largest.material);
      largest.material = bodyMaterial;
    }
  }

  addArtworkPanel(format, root, artworkMaterial);
  root.rotation.y = ["tube", "pouch", "coffee", "jar"].includes(format) ? 0.34 : -0.38;
  root.updateMatrixWorld(true);
  const initialBox = new THREE.Box3().setFromObject(root);
  const initialSize = initialBox.getSize(new THREE.Vector3());
  const targetHeight = format === "jar" ? 3.45 : format === "coffee" ? 4.65 : 4.4;
  const scale = targetHeight / Math.max(0.001, initialSize.y);
  root.scale.setScalar(scale);
  root.updateMatrixWorld(true);

  const box = new THREE.Box3().setFromObject(root);
  const center = box.getCenter(new THREE.Vector3());
  root.position.x -= center.x;
  root.position.z -= center.z;
  root.position.y += -2.43 - box.min.y;
  return root;
}

const BOX_FORMATS = new Set<MockupFormat>(["mailer", "shipping", "carton", "rigid"]);
const DEFAULT_DIMENSIONS: Partial<Record<MockupFormat, MockupDimensions>> = {
  mailer: { width: 230, height: 80, depth: 160 },
  shipping: { width: 300, height: 220, depth: 220 },
  carton: { width: 75, height: 140, depth: 45 },
  rigid: { width: 240, height: 75, depth: 190 },
};

const BACKDROPS: Record<StudioBackdrop, { sky: string; floor: string; hemi: string; ground: string; rim: string }> = {
  studio: { sky: "#E8EEF3", floor: "#D5DEE7", hemi: "#ffffff", ground: "#7B8FA3", rim: "#75B8EC" },
  warm: { sky: "#F3ECE1", floor: "#E4D8C6", hemi: "#fff6ea", ground: "#9C8A73", rim: "#F2B134" },
  night: { sky: "#0E1A27", floor: "#172636", hemi: "#c9d8ea", ground: "#0b1520", rim: "#F2B134" },
};

const CAMERA_VIEWS: Record<CameraView, [number, number, number]> = {
  hero: [7.1, 4.9, 8.4],
  front: [0, 1.2, 10.4],
  side: [10.2, 1.6, 1.4],
  top: [0.4, 10.8, 3.2],
};

const gltfCache = new Map<string, Promise<THREE.Group>>();
function loadModel(asset: string) {
  if (!gltfCache.has(asset)) {
    const loader = new GLTFLoader();
    gltfCache.set(asset, loader.loadAsync(`${import.meta.env.BASE_URL}models/packaging/${asset}`).then((gltf) => gltf.scene));
  }
  return gltfCache.get(asset)!.then((scene) => scene.clone(true));
}

function disposeObject(root: THREE.Object3D, keepMaterials: Set<THREE.Material>) {
  root.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    object.geometry.dispose();
    (Array.isArray(object.material) ? object.material : [object.material]).forEach((item: THREE.Material) => {
      if (!keepMaterials.has(item)) item.dispose();
    });
  });
}

export function PackagingMockupCanvas({
  format, color, brandName, finish, logoDataUrl, artworkDataUrl, artworkFit = "cover", autoRotate = true,
  stock = "color", backdrop = "studio", cameraView = "hero", dimensions, className = "", onReady,
}: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    controls: OrbitControls;
    hemi: THREE.HemisphereLight;
    rim: THREE.DirectionalLight;
    floor: THREE.Mesh<THREE.CircleGeometry, THREE.MeshStandardMaterial>;
    cameraTarget?: THREE.Vector3;
  }>(undefined);
  const autoRotateRef = useRef(autoRotate);
  autoRotateRef.current = autoRotate;
  // One printed material and one body material live for the life of the
  // canvas. Design edits only swap textures/colours, never the renderer.
  const printMaterialRef = useRef<THREE.MeshPhysicalMaterial>(undefined);
  const bodyMaterialRef = useRef<THREE.MeshPhysicalMaterial>(undefined);
  const productRef = useRef<THREE.Group>(undefined);
  const [sceneReady, setSceneReady] = useState(false);

  // ── Scene, renderer and loop: created once ──────────────────────────────
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    camera.position.set(...CAMERA_VIEWS.hero);
    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.minDistance = 5.4;
    controls.maxDistance = 15;
    controls.autoRotateSpeed = 0.9;
    controls.target.set(0, 0.1, 0);

    const hemi = new THREE.HemisphereLight("#ffffff", "#7B8FA3", 2.35);
    scene.add(hemi);
    const key = new THREE.DirectionalLight("#ffffff", 4.8);
    key.position.set(5, 8, 6);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    scene.add(key);
    const rim = new THREE.DirectionalLight("#75B8EC", 2.1);
    rim.position.set(-5, 4, -4);
    scene.add(rim);
    const floor = mesh(new THREE.CircleGeometry(8, 96), new THREE.MeshStandardMaterial({ color: "#D5DEE7", roughness: 0.92 })) as THREE.Mesh<THREE.CircleGeometry, THREE.MeshStandardMaterial>;
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -2.55;
    scene.add(floor);

    printMaterialRef.current = new THREE.MeshPhysicalMaterial({ metalness: 0.01, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -2 });
    bodyMaterialRef.current = new THREE.MeshPhysicalMaterial({ metalness: 0.01 });
    sceneRef.current = { scene, camera, controls, hemi, rim, floor };

    const resize = () => {
      const width = Math.max(1, mount.clientWidth);
      const height = Math.max(1, mount.clientHeight);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(mount);
    resize();
    onReady?.(renderer);

    const stopTween = () => { if (sceneRef.current) sceneRef.current.cameraTarget = undefined; };
    controls.addEventListener("start", stopTween);
    let frame = 0;
    const animate = () => {
      frame = requestAnimationFrame(animate);
      const target = sceneRef.current?.cameraTarget;
      if (target) {
        camera.position.lerp(target, 0.09);
        if (camera.position.distanceTo(target) < 0.02) stopTween();
      }
      controls.autoRotate = autoRotateRef.current && !target;
      controls.update();
      renderer.render(scene, camera);
    };
    animate();
    setSceneReady(true);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      controls.removeEventListener("start", stopTween);
      controls.dispose();
      scene.traverse((object) => {
        if (!(object instanceof THREE.Mesh)) return;
        object.geometry.dispose();
        (Array.isArray(object.material) ? object.material : [object.material]).forEach((item: THREE.Material) => item.dispose());
      });
      printMaterialRef.current?.map?.dispose();
      printMaterialRef.current?.dispose();
      bodyMaterialRef.current?.dispose();
      productRef.current = undefined;
      sceneRef.current = undefined;
      renderer.dispose();
      if (renderer.domElement.parentElement === mount) mount.removeChild(renderer.domElement);
    };
  }, [onReady]);

  // ── Backdrop ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const ctx = sceneRef.current;
    if (!ctx) return;
    const palette = BACKDROPS[backdrop];
    ctx.scene.background = new THREE.Color(palette.sky);
    ctx.scene.fog = new THREE.Fog(palette.sky, 12, 22);
    ctx.floor.material.color.set(palette.floor);
    ctx.hemi.color.set(palette.hemi);
    ctx.hemi.groundColor.set(palette.ground);
    ctx.rim.color.set(palette.rim);
  }, [backdrop, sceneReady]);

  // ── Camera presets (tweened in the render loop) ──────────────────────────
  useEffect(() => {
    const ctx = sceneRef.current;
    if (!ctx) return;
    ctx.cameraTarget = new THREE.Vector3(...CAMERA_VIEWS[cameraView]);
  }, [cameraView, sceneReady]);

  // ── Surface finish and base colour ───────────────────────────────────────
  const baseColor = stock === "kraft" ? KRAFT : stock === "white" ? "#F7F6F2" : color;
  useEffect(() => {
    const print = printMaterialRef.current;
    const body = bodyMaterialRef.current;
    if (!print || !body) return;
    [print, body].forEach((item) => {
      item.roughness = finish === "matte" || stock === "kraft" ? 0.72 : 0.2;
      item.clearcoat = finish === "gloss" && stock !== "kraft" ? 0.8 : 0.05;
      item.clearcoatRoughness = finish === "gloss" ? 0.1 : 0.8;
      item.needsUpdate = true;
    });
    body.color.set(baseColor);
  }, [baseColor, finish, stock, sceneReady]);

  // ── Geometry: rebuilt only when the format, size or base colour changes ──
  const dimensionKey = dimensions ? `${dimensions.width}x${dimensions.height}x${dimensions.depth}` : "";
  useEffect(() => {
    const ctx = sceneRef.current;
    const print = printMaterialRef.current;
    const body = bodyMaterialRef.current;
    if (!ctx || !print || !body) return;
    let cancelled = false;
    const keep = new Set<THREE.Material>([print, body]);

    const place = (product: THREE.Group) => {
      if (cancelled) { disposeObject(product, keep); return; }
      const defaults = DEFAULT_DIMENSIONS[format];
      if (dimensions && defaults && BOX_FORMATS.has(format)) {
        const sx = dimensions.width / defaults.width;
        const sy = dimensions.height / defaults.height;
        const sz = dimensions.depth / defaults.depth;
        // Keep proportions exact; only shrink when a side grows past 1.5× the default.
        const largest = Math.max(sx, sy, sz);
        const fit = largest > 1.5 ? 1.5 / largest : 1;
        product.scale.set(sx * fit, sy * fit, sz * fit);
        product.updateMatrixWorld(true);
        const box = new THREE.Box3().setFromObject(product);
        product.position.y += -2.43 - box.min.y;
      }
      if (productRef.current) {
        ctx.scene.remove(productRef.current);
        disposeObject(productRef.current, keep);
      }
      productRef.current = product;
      ctx.scene.add(product);
    };

    const asset = MODEL_ASSETS[format];
    if (asset) {
      loadModel(asset)
        .then((model) => place(prepareLoadedProduct(format, model, body, print)))
        .catch((error) => {
          console.error(`[mockup] Could not load ${asset}`, error);
          const fallback = buildProduct(format, print, baseColor);
          fallback.rotation.y = 0.48;
          place(fallback);
        });
    } else {
      const product = buildProduct(format, print, baseColor);
      product.rotation.y = ["tube", "pouch", "coffee", "bottle"].includes(format) ? 0.48 : -0.42;
      place(product);
    }
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [format, dimensionKey, baseColor, sceneReady]);

  // ── Artwork texture: debounced so typing a brand name stays smooth ───────
  useEffect(() => {
    const print = printMaterialRef.current;
    if (!print) return;
    let cancelled = false;
    const timer = window.setTimeout(() => {
      void makeArtworkTexture(color, brandName, logoDataUrl, artworkDataUrl, artworkFit, stock).then((texture) => {
        if (!texture) return;
        if (cancelled) { texture.dispose(); return; }
        const previous = print.map;
        texture.flipY = true;
        texture.needsUpdate = true;
        if (format === "bottle") {
          texture.wrapS = THREE.RepeatWrapping;
          texture.offset.x = 0.39;
        }
        print.map = texture;
        print.color.set("#ffffff");
        print.needsUpdate = true;
        previous?.dispose();
      });
    }, 120);
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, [artworkDataUrl, artworkFit, brandName, color, format, logoDataUrl, stock, sceneReady]);

  return <div ref={mountRef} className={`pw-mockup-canvas ${className}`} aria-label="Interactive 3D packaging mockup" />;
}
