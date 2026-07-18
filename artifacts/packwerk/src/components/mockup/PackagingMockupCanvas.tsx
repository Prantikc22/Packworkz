import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export type MockupFormat = "mailer" | "shipping" | "carton" | "rigid" | "pouch" | "bottle" | "jar" | "tube";
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
  onReady?: (renderer: THREE.WebGLRenderer) => void;
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

async function makeArtworkTexture(color: string, brandName: string, logoDataUrl?: string, artworkDataUrl?: string, artworkFit: ArtworkFit = "cover") {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1024;
  const context = canvas.getContext("2d");
  if (!context) return undefined;
  const [logo, artwork] = await Promise.all([loadImage(logoDataUrl), loadImage(artworkDataUrl)]);

  context.fillStyle = color;
  context.fillRect(0, 0, 1024, 1024);
  if (artwork) {
    drawImageFit(context, artwork, artworkFit);
    if (artworkFit === "contain") {
      context.strokeStyle = "rgba(255,255,255,.35)";
      context.strokeRect(86, 86, 852, 852);
    }
  } else {
    context.globalAlpha = 0.16;
    context.strokeStyle = "#ffffff";
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
      context.fillStyle = "rgba(255,255,255,.94)";
      context.beginPath();
      context.arc(512, 250, 66, 0, Math.PI * 2);
      context.fill();
      context.fillStyle = color;
      context.font = "800 72px Arial";
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillText(brandName.trim().slice(0, 1).toUpperCase() || "P", 512, 255);
    }
    context.fillStyle = "#ffffff";
    context.textAlign = "center";
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
  shape.moveTo(-1.62, -2.08);
  shape.quadraticCurveTo(-1.76, -1.9, -1.68, -1.58);
  shape.lineTo(-1.54, 1.72);
  shape.quadraticCurveTo(-1.5, 2.08, -1.1, 2.15);
  shape.lineTo(1.1, 2.15);
  shape.quadraticCurveTo(1.5, 2.08, 1.54, 1.72);
  shape.lineTo(1.68, -1.58);
  shape.quadraticCurveTo(1.76, -1.9, 1.62, -2.08);
  shape.closePath();
  const geometry = new THREE.ExtrudeGeometry(shape, { depth: 0.3, bevelEnabled: true, bevelSegments: 4, bevelSize: 0.09, bevelThickness: 0.08 });
  geometry.center();
  return geometry;
}

function cosmeticTubeGeometry() {
  const shape = new THREE.Shape();
  shape.moveTo(-0.72, -1.58);
  shape.quadraticCurveTo(-1.03, -1.35, -1.08, -1.02);
  shape.lineTo(-1.18, 1.62);
  shape.quadraticCurveTo(-1.16, 1.82, -1.02, 1.9);
  shape.lineTo(1.02, 1.9);
  shape.quadraticCurveTo(1.16, 1.82, 1.18, 1.62);
  shape.lineTo(1.08, -1.02);
  shape.quadraticCurveTo(1.03, -1.35, 0.72, -1.58);
  shape.closePath();
  const geometry = new THREE.ExtrudeGeometry(shape, { depth: 0.5, bevelEnabled: true, bevelSegments: 5, bevelSize: 0.1, bevelThickness: 0.08 });
  geometry.center();
  return geometry;
}

function mesh(geometry: THREE.BufferGeometry, material: THREE.Material, y = 0) {
  const item = new THREE.Mesh(geometry, material);
  item.position.y = y;
  item.castShadow = true;
  item.receiveShadow = true;
  return item;
}

function buildProduct(format: MockupFormat, material: THREE.MeshPhysicalMaterial, color: string) {
  const group = new THREE.Group();
  const dark = new THREE.MeshStandardMaterial({ color: "#0D1B2A", roughness: 0.32 });
  const side = new THREE.MeshPhysicalMaterial({ color, roughness: material.roughness, clearcoat: material.clearcoat });

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
    group.add(mesh(new THREE.BoxGeometry(3.65, 1.5, 3.1), side, -0.2));
    group.add(mesh(new THREE.BoxGeometry(3.82, 0.56, 3.25), material, 0.83));
  } else if (format === "pouch") {
    group.add(mesh(pouchGeometry(), material));
    const zipper = mesh(new THREE.BoxGeometry(2.75, 0.04, 0.38), dark, 1.65);
    group.add(zipper);
  } else if (format === "bottle") {
    group.add(mesh(new THREE.CylinderGeometry(1.16, 1.24, 3.45, 64), material, -0.15));
    group.add(mesh(new THREE.CylinderGeometry(0.68, 1.16, 0.55, 64), material, 1.85));
    group.add(mesh(new THREE.CylinderGeometry(0.54, 0.54, 0.58, 64), side, 2.4));
    group.add(mesh(new THREE.CylinderGeometry(0.61, 0.61, 0.48, 64), dark, 2.92));
  } else if (format === "jar") {
    group.add(mesh(new THREE.CylinderGeometry(1.48, 1.48, 2.55, 64), material, -0.25));
    group.add(mesh(new THREE.CylinderGeometry(1.52, 1.52, 0.48, 64), dark, 1.28));
  } else {
    group.add(mesh(cosmeticTubeGeometry(), material, 0));
    const crimp = mesh(new THREE.BoxGeometry(2.12, 0.13, 0.62), side, 1.91);
    group.add(crimp);
    group.add(mesh(new THREE.CylinderGeometry(0.56, 0.68, 0.34, 48), side, -1.76));
    const cap = mesh(new THREE.CylinderGeometry(0.83, 0.83, 0.62, 64), dark, -2.22);
    group.add(cap);
    const capLine = mesh(new THREE.TorusGeometry(0.82, 0.025, 12, 64), new THREE.MeshStandardMaterial({ color: "#718297", roughness: 0.4 }), -1.94);
    capLine.rotation.x = Math.PI / 2;
    group.add(capLine);
  }
  return group;
}

export function PackagingMockupCanvas({ format, color, brandName, finish, logoDataUrl, artworkDataUrl, artworkFit = "cover", autoRotate = true, onReady }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    let disposed = false;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#E8EEF3");
    scene.fog = new THREE.Fog("#E8EEF3", 12, 22);
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    camera.position.set(7.1, 4.9, 8.4);
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
    controls.autoRotate = autoRotate;
    controls.autoRotateSpeed = 0.9;
    controls.target.set(0, 0.1, 0);

    scene.add(new THREE.HemisphereLight("#ffffff", "#7B8FA3", 2.35));
    const key = new THREE.DirectionalLight("#ffffff", 4.8);
    key.position.set(5, 8, 6);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    scene.add(key);
    const rim = new THREE.DirectionalLight("#75B8EC", 2.1);
    rim.position.set(-5, 4, -4);
    scene.add(rim);

    const floor = mesh(new THREE.CircleGeometry(8, 96), new THREE.MeshStandardMaterial({ color: "#D5DEE7", roughness: 0.92 }));
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -2.55;
    scene.add(floor);

    let product: THREE.Group | undefined;
    let texture: THREE.CanvasTexture | undefined;
    void makeArtworkTexture(color, brandName, logoDataUrl, artworkDataUrl, artworkFit).then((artwork) => {
      if (!artwork || disposed) return;
      texture = artwork;
      const material = new THREE.MeshPhysicalMaterial({
        map: artwork,
        roughness: finish === "matte" ? 0.72 : 0.2,
        metalness: 0.01,
        clearcoat: finish === "gloss" ? 0.82 : 0.06,
        clearcoatRoughness: finish === "gloss" ? 0.1 : 0.8,
      });
      product = buildProduct(format, material, color);
      product.rotation.y = format === "tube" ? 0.12 : format === "pouch" ? -0.24 : -0.42;
      scene.add(product);
    });

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
    let frame = 0;
    const animate = () => {
      frame = requestAnimationFrame(animate);
      controls.autoRotate = autoRotate;
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      controls.dispose();
      texture?.dispose();
      scene.traverse((object) => {
        if (!(object instanceof THREE.Mesh)) return;
        object.geometry.dispose();
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.forEach((item) => item.dispose());
      });
      renderer.dispose();
      if (renderer.domElement.parentElement === mount) mount.removeChild(renderer.domElement);
    };
  }, [artworkDataUrl, artworkFit, autoRotate, brandName, color, finish, format, logoDataUrl, onReady]);

  return <div ref={mountRef} className="pw-mockup-canvas" aria-label="Interactive 3D packaging mockup" />;
}
