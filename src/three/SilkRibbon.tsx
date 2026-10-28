import { useMemo, useRef, type RefObject } from "react";
import { useFrame, type ThreeElements } from "@react-three/fiber";
import * as THREE from "three";

// A glossy silk ribbon (the brand's "flowing surfaces"): a long plane bent along a waving
// centreline and twisted about it, shaded between maroon and orange with a cream sheen.
// It grows in from its left end while `reveal` runs 0 -> 1, picking up the opening ribbons.

const vertex = /* glsl */ `
  uniform float uTime, uLen, uWidth, uAmp, uFreq, uTwist, uSeed, uSpeed;
  varying vec3 vN;
  varying vec3 vView;
  varying vec2 vUv;

  vec3 centre(float x) {
    float t = uTime * uSpeed;
    float y = uAmp * sin(x * uFreq + t + uSeed) + uAmp * 0.32 * sin(x * uFreq * 2.3 - t * 1.3 + uSeed * 2.0);
    float z = uAmp * 0.9 * cos(x * uFreq * 0.8 + t * 0.7 + uSeed * 1.7);
    return vec3(x, y, z);
  }
  float twist(float x) {
    return uTwist * sin(x * uFreq * 0.55 + uTime * uSpeed * 0.8 + uSeed * 3.1);
  }
  vec3 surf(float x, float v) {
    float th = twist(x);
    return centre(x) + vec3(0.0, cos(th), sin(th)) * v;
  }

  void main() {
    float x = position.x * uLen;
    float v = position.y * uWidth;
    vec3 p = surf(x, v);
    vec3 dx = surf(x + 0.01, v) - surf(x - 0.01, v);
    vec3 dv = surf(x, v + 0.01) - surf(x, v - 0.01);
    vec3 n = normalize(cross(dx, dv));
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vN = normalize(normalMatrix * n);
    vView = -mv.xyz;
    vUv = uv;
    gl_Position = projectionMatrix * mv;
  }
`;

const fragment = /* glsl */ `
  uniform vec3 uDeep, uBody, uSheen;
  uniform float uReveal, uLift;
  varying vec3 vN;
  varying vec3 vView;
  varying vec2 vUv;

  void main() {
    if (vUv.x > uReveal) discard;
    vec3 n = normalize(vN);
    if (!gl_FrontFacing) n = -n;
    vec3 V = normalize(vView);
    vec3 L = normalize(vec3(-0.35, 0.6, 0.75));
    float diff = max(dot(n, L), 0.0);
    float spec = pow(max(dot(reflect(-L, n), V), 0.0), 34.0);
    float fres = pow(1.0 - max(dot(n, V), 0.0), 2.4);
    vec3 col = mix(uDeep, uBody, smoothstep(0.05, 1.0, diff * uLift));
    col += uSheen * spec * 0.5 + uBody * fres * 0.22;
    float edge = smoothstep(0.0, 0.05, vUv.y) * smoothstep(1.0, 0.95, vUv.y);
    col *= mix(0.6, 1.0, edge);
    float ends = smoothstep(0.0, 0.1, vUv.x) * smoothstep(1.0, 0.9, vUv.x);
    float head = smoothstep(uReveal, uReveal - 0.05, vUv.x);
    gl_FragColor = vec4(col, ends * head);
    #include <colorspace_fragment>
  }
`;

type Props = {
  length: number;
  width: number;
  amp?: number;
  freq?: number;
  twist?: number;
  seed?: number;
  speed?: number;
  lift?: number;
  reveal: RefObject<{ p: number }>;
  delay?: number;
  /** Mesh resolution along and across the ribbon. */
  segments?: [number, number];
} & Omit<ThreeElements["mesh"], "args">;

export function SilkRibbon({ length, width, amp = 0.35, freq = 0.45, twist = 1.1, seed = 0, speed = 0.35, lift = 1, reveal, delay = 0, segments = [360, 20], ...mesh }: Props) {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const [along, across] = segments;
  const geom = useMemo(() => new THREE.PlaneGeometry(1, 1, along, across), [along, across]);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uLen: { value: length },
      uWidth: { value: width },
      uAmp: { value: amp },
      uFreq: { value: freq },
      uTwist: { value: twist },
      uSeed: { value: seed },
      uSpeed: { value: speed },
      uLift: { value: lift },
      uReveal: { value: 0 },
      uDeep: { value: new THREE.Color("#420D0F") },
      uBody: { value: new THREE.Color("#FF8221") },
      uSheen: { value: new THREE.Color("#FFFCF4") },
    }),
    [], // eslint-disable-line react-hooks/exhaustive-deps -- uniforms are created once; props are pushed each frame

  );

  useFrame((state) => {
    const u = mat.current?.uniforms;
    if (!u) return;
    u.uTime.value = state.clock.elapsedTime;
    u.uLen.value = length;
    const p = reveal.current?.p ?? 1;
    u.uReveal.value = THREE.MathUtils.clamp((p - delay) / (1 - delay), 0, 1) * 1.06;
  });

  return (
    <mesh geometry={geom} frustumCulled={false} {...mesh}>
      <shaderMaterial
        ref={mat}
        vertexShader={vertex}
        fragmentShader={fragment}
        uniforms={uniforms}
        side={THREE.DoubleSide}
        transparent
      />
    </mesh>
  );
}
