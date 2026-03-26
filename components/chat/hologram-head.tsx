"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

type Emotion =
  | "neutral"
  | "happy"
  | "sad"
  | "angry"
  | "surprised"
  | "thinking"
  | "talking";

interface HologramHeadProps {
  emotion: Emotion;
  speaking: boolean;
}

interface MorphTarget {
  smile: number;
  frown: number;
  surprised: number;
  talk: number;
}

const EMOTION_MORPHS: Record<Emotion, Omit<MorphTarget, "talk">> = {
  neutral: { smile: 0, frown: 0, surprised: 0 },
  happy: { smile: 1, frown: 0, surprised: 0 },
  sad: { smile: 0, frown: 1, surprised: 0 },
  angry: { smile: 0, frown: 0.85, surprised: 0 },
  surprised: { smile: 0, frown: 0.1, surprised: 1 },
  thinking: { smile: 0.2, frown: 0.2, surprised: 0 },
  talking: { smile: 0.35, frown: 0.05, surprised: 0.2 },
};

const VERTEX_SHADER = `
uniform float uTime;
uniform float uSmile;
uniform float uFrown;
uniform float uSurprised;
uniform float uTalk;

attribute float aMouth;
attribute float aBrow;
attribute float aFront;

varying float vFront;
varying float vSignal;

void main() {
  vec3 displaced = position;

  float talkPulse = uTalk * aMouth * (0.5 + 0.5 * sin(uTime * 34.0 + position.x * 26.0));

  displaced.y += uSmile * aMouth * 0.10;
  displaced.y -= uFrown * aMouth * 0.10;
  displaced.z += uSmile * aMouth * 0.04;
  displaced.z += uSurprised * aMouth * 0.16;
  displaced.y -= uSurprised * aMouth * 0.05;
  displaced.z += talkPulse * 0.10;

  float browDrop = (uFrown * 1.15 + uSurprised * 0.5) * aBrow;
  float browLift = uSmile * 0.45 * aBrow;
  displaced.y += browLift * 0.08;
  displaced.y -= browDrop * 0.09;

  vec3 axis = normalize(position);
  float shimmer = (sin((position.y * 28.0) + uTime * 5.5) + sin((position.x * 19.0) - uTime * 3.7)) * 0.0025;
  displaced += axis * shimmer;

  vec4 mvPosition = modelViewMatrix * vec4(displaced, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  gl_PointSize = (1.4 + aFront * 2.2) * (6.5 / -mvPosition.z);

  vFront = aFront;
  vSignal = aMouth * (uSmile + uFrown + uSurprised + uTalk);
}
`;

const POINTS_FRAGMENT_SHADER = `
uniform float uTime;
uniform vec3 uColor;

varying float vFront;
varying float vSignal;

float randomValue(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

void main() {
  vec2 centered = gl_PointCoord - vec2(0.5);
  float falloff = 1.0 - smoothstep(0.18, 0.52, length(centered));
  float scan = 0.74 + 0.26 * sin((gl_FragCoord.y + uTime * 180.0) * 0.15);
  float noise = 0.78 + 0.22 * randomValue(gl_FragCoord.xy + uTime * 50.0);
  float pulse = 0.78 + 0.22 * sin(uTime * 4.0 + vFront * 10.0 + vSignal * 7.0);

  float alpha = falloff * scan * noise * pulse;
  vec3 color = uColor * (1.0 + vFront * 0.8 + vSignal * 0.4);
  gl_FragColor = vec4(color, alpha);
}
`;

const LINES_FRAGMENT_SHADER = `
uniform float uTime;
uniform vec3 uColor;

varying float vFront;
varying float vSignal;

void main() {
  float scan = 0.68 + 0.32 * sin((gl_FragCoord.y + uTime * 160.0) * 0.16);
  float flicker = 0.75 + 0.25 * sin(uTime * 11.0 + gl_FragCoord.x * 0.07);
  float alpha = 0.22 * scan * flicker * (0.8 + vFront * 0.5 + vSignal * 0.3);
  gl_FragColor = vec4(uColor, alpha);
}
`;

function toMorphTarget(emotion: Emotion, speaking: boolean): MorphTarget {
  const base = EMOTION_MORPHS[emotion] ?? EMOTION_MORPHS.neutral;
  return {
    ...base,
    talk: speaking ? 1 : emotion === "talking" ? 0.7 : 0,
  };
}

function disposeMaterial(material: THREE.Material | THREE.Material[]) {
  if (Array.isArray(material)) {
    material.forEach((item) => item.dispose());
    return;
  }
  material.dispose();
}

function createHeadData(latSegments: number, lonSegments: number) {
  const positions: number[] = [];
  const mouthMask: number[] = [];
  const browMask: number[] = [];
  const frontMask: number[] = [];

  for (let lat = 0; lat <= latSegments; lat += 1) {
    const v = lat / latSegments;
    const theta = (v - 0.5) * Math.PI * 0.97;

    for (let lon = 0; lon < lonSegments; lon += 1) {
      const u = lon / lonSegments;
      const phi = u * Math.PI * 2;

      let x = Math.cos(theta) * Math.cos(phi);
      let y = Math.sin(theta);
      let z = Math.cos(theta) * Math.sin(phi);

      const foreheadInflate = Math.max(y, 0) * 0.1;
      const jawTaper = 1 - Math.max(-y, 0) * 0.23;

      x *= (0.78 + foreheadInflate) * jawTaper;
      y *= 1.12;
      z *= 0.72;

      const faceForward = Math.exp(-(x * x * 6.5 + (y * 1.15) * (y * 1.15) * 5.8));
      z += 0.16 * faceForward;

      const nose = Math.exp(-(x * x * 125 + (y + 0.03) * (y + 0.03) * 95));
      z += 0.1 * nose;

      const chin = Math.exp(-(x * x * 22 + (y + 0.63) * (y + 0.63) * 30));
      z += 0.05 * chin;

      positions.push(x, y, z);

      const mouth =
        Math.exp(-(x * x * 18 + (y + 0.32) * (y + 0.32) * 88)) *
        THREE.MathUtils.clamp((z + 0.4) * 1.4, 0, 1);
      const brow =
        Math.exp(-(x * x * 10 + (y - 0.24) * (y - 0.24) * 90)) *
        THREE.MathUtils.clamp((z + 0.2) * 1.2, 0, 1);
      const front = THREE.MathUtils.clamp((z + 0.2) / 1.2, 0, 1);

      mouthMask.push(mouth);
      browMask.push(brow);
      frontMask.push(front);
    }
  }

  return { positions, mouthMask, browMask, frontMask };
}

function createWireframeData(
  basePositions: number[],
  baseMouth: number[],
  baseBrow: number[],
  baseFront: number[],
  latSegments: number,
  lonSegments: number
) {
  const wirePositions: number[] = [];
  const wireMouth: number[] = [];
  const wireBrow: number[] = [];
  const wireFront: number[] = [];

  const pushVertex = (index: number) => {
    const offset = index * 3;
    wirePositions.push(
      basePositions[offset] ?? 0,
      basePositions[offset + 1] ?? 0,
      basePositions[offset + 2] ?? 0
    );
    wireMouth.push(baseMouth[index] ?? 0);
    wireBrow.push(baseBrow[index] ?? 0);
    wireFront.push(baseFront[index] ?? 0);
  };

  const pushSegment = (a: number, b: number) => {
    pushVertex(a);
    pushVertex(b);
  };

  for (let lat = 0; lat <= latSegments; lat += 1) {
    for (let lon = 0; lon < lonSegments; lon += 1) {
      const current = lat * lonSegments + lon;
      const right = lat * lonSegments + ((lon + 1) % lonSegments);

      if ((lat + lon) % 2 === 0) {
        pushSegment(current, right);
      }

      if (lat < latSegments) {
        const down = (lat + 1) * lonSegments + lon;
        pushSegment(current, down);

        const diag = (lat + 1) * lonSegments + ((lon + 1) % lonSegments);
        if ((lat * 3 + lon) % 4 === 0) {
          pushSegment(current, diag);
        }
      }
    }
  }

  return { wirePositions, wireMouth, wireBrow, wireFront };
}

export function HologramHead({ emotion, speaking }: HologramHeadProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const targetMorphRef = useRef<MorphTarget>(toMorphTarget("neutral", false));
  const initialMorph = useMemo(() => toMorphTarget(emotion, speaking), [emotion, speaking]);

  useEffect(() => {
    targetMorphRef.current = initialMorph;
  }, [initialMorph]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) {
      return;
    }

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
    camera.position.set(0, 0.02, 3.3);

    const headGroup = new THREE.Group();
    scene.add(headGroup);

    const uniforms = {
      uTime: { value: 0 },
      uSmile: { value: 0 },
      uFrown: { value: 0 },
      uSurprised: { value: 0 },
      uTalk: { value: 0 },
      uColor: { value: new THREE.Color("#2fd2ff") },
    };

    const latSegments = 56;
    const lonSegments = 84;
    const { positions, mouthMask, browMask, frontMask } = createHeadData(latSegments, lonSegments);

    const pointGeometry = new THREE.BufferGeometry();
    pointGeometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    pointGeometry.setAttribute("aMouth", new THREE.Float32BufferAttribute(mouthMask, 1));
    pointGeometry.setAttribute("aBrow", new THREE.Float32BufferAttribute(browMask, 1));
    pointGeometry.setAttribute("aFront", new THREE.Float32BufferAttribute(frontMask, 1));

    const pointsMaterial = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: VERTEX_SHADER,
      fragmentShader: POINTS_FRAGMENT_SHADER,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const points = new THREE.Points(pointGeometry, pointsMaterial);
    headGroup.add(points);

    const { wirePositions, wireMouth, wireBrow, wireFront } = createWireframeData(
      positions,
      mouthMask,
      browMask,
      frontMask,
      latSegments,
      lonSegments
    );

    const wireGeometry = new THREE.BufferGeometry();
    wireGeometry.setAttribute("position", new THREE.Float32BufferAttribute(wirePositions, 3));
    wireGeometry.setAttribute("aMouth", new THREE.Float32BufferAttribute(wireMouth, 1));
    wireGeometry.setAttribute("aBrow", new THREE.Float32BufferAttribute(wireBrow, 1));
    wireGeometry.setAttribute("aFront", new THREE.Float32BufferAttribute(wireFront, 1));

    const wireMaterial = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: VERTEX_SHADER,
      fragmentShader: LINES_FRAGMENT_SHADER,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: true,
    });

    const wireframe = new THREE.LineSegments(wireGeometry, wireMaterial);
    headGroup.add(wireframe);

    const haloGeometry = new THREE.SphereGeometry(1.2, 20, 20);
    const haloMaterial = new THREE.MeshBasicMaterial({
      color: 0x0da6ff,
      transparent: true,
      opacity: 0.09,
      blending: THREE.AdditiveBlending,
      wireframe: true,
    });
    const halo = new THREE.Mesh(haloGeometry, haloMaterial);
    halo.scale.set(1.0, 1.18, 0.86);
    headGroup.add(halo);

    const glowGeometry = new THREE.SphereGeometry(1.25, 18, 18);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0x16c0ff,
      transparent: true,
      opacity: 0.05,
      blending: THREE.AdditiveBlending,
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    glow.scale.set(0.98, 1.15, 0.84);
    headGroup.add(glow);

    const resizeRenderer = () => {
      const width = container.clientWidth || 300;
      const height = container.clientHeight || 300;
      renderer.setSize(width, height, false);
      camera.aspect = width / Math.max(height, 1);
      camera.updateProjectionMatrix();
    };

    resizeRenderer();
    const resizeObserver = new ResizeObserver(() => resizeRenderer());
    resizeObserver.observe(container);

    const clock = new THREE.Clock();
    const activeMorph: MorphTarget = { smile: 0, frown: 0, surprised: 0, talk: 0 };
    let frameId = 0;

    const animate = () => {
      frameId = window.requestAnimationFrame(animate);

      const t = clock.getElapsedTime();
      uniforms.uTime.value = t;

      const target = targetMorphRef.current;
      activeMorph.smile = THREE.MathUtils.lerp(activeMorph.smile, target.smile, 0.08);
      activeMorph.frown = THREE.MathUtils.lerp(activeMorph.frown, target.frown, 0.08);
      activeMorph.surprised = THREE.MathUtils.lerp(activeMorph.surprised, target.surprised, 0.08);
      activeMorph.talk = THREE.MathUtils.lerp(activeMorph.talk, target.talk, 0.24);

      uniforms.uSmile.value = activeMorph.smile;
      uniforms.uFrown.value = activeMorph.frown;
      uniforms.uSurprised.value = activeMorph.surprised;
      uniforms.uTalk.value = activeMorph.talk;

      headGroup.rotation.y = Math.sin(t * 0.45) * 0.23;
      headGroup.rotation.x = Math.sin(t * 0.31) * 0.08 + activeMorph.talk * 0.03;
      headGroup.position.y = Math.sin(t * 0.8) * 0.04;

      halo.rotation.y -= 0.0025;
      halo.rotation.z += 0.0012;
      glow.rotation.y += 0.0016;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.cancelAnimationFrame(frameId);
      resizeObserver.disconnect();

      headGroup.traverse((object) => {
        const mesh = object as THREE.Mesh;
        if (mesh.geometry) {
          mesh.geometry.dispose();
        }
        if (mesh.material) {
          disposeMaterial(mesh.material);
        }
      });

      renderer.dispose();
    };
  }, []);

  return (
    <div className="hologram-shell" ref={containerRef}>
      <canvas ref={canvasRef} className="hologram-canvas" />
      <div className="hologram-scanlines" />
      <div className="hologram-vignette" />
    </div>
  );
}
