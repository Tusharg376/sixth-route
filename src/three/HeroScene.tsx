import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { buildRouteGeometry } from "./routeGeometry";
import { SilkRibbon } from "./SilkRibbon";
import { gsap, prefersReducedMotion } from "../lib/motion";
import { PHONE, useMedia } from "../lib/media";
import { mulberry32 } from "../lib/random";

const ORANGE = new THREE.Color("#FF8221");
const MAROON = new THREE.Color("#2E0809"); // renders as brand maroon #420D0F under the scene lights

type Props = { slot: RefObject<HTMLElement | null>; started: boolean };

export default function HeroScene({ slot, started }: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  // Phones get a lighter scene: lower pixel ratio, one silk ribbon, coarser mesh, less dust.
  const lite = useMedia(PHONE);

  // Stop rendering once the hero is off screen.
  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: "120px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={wrap} className="hero__canvas" aria-hidden="true">
      <Canvas
        // Render once (compiles shaders) but hold still until the intro hands over, so the
        // opening animation never competes with the 3D scene for the GPU.
        frameloop={visible && started ? "always" : "demand"}
        dpr={lite ? [1, 1.5] : [1, 1.8]}
        camera={{ fov: 28, position: [0, 0, 12], near: 0.1, far: 60 }}
        gl={{ antialias: true, alpha: true, toneMapping: THREE.NoToneMapping, powerPreference: "high-performance" }}
      >
        <Lights />
        <Stage slot={slot} started={started} lite={lite} />
      </Canvas>
    </div>
  );
}

function Lights() {
  return (
    <>
      <ambientLight intensity={1.15} />
      <directionalLight position={[-3.5, 4, 6]} intensity={2.3} />
      <directionalLight position={[5, -2, 3]} intensity={0.55} color="#ffd9b8" />
      <pointLight position={[2.5, 3, 4]} intensity={18} distance={20} color="#fff2e6" />
      <pointLight position={[-4, -3, -2]} intensity={30} distance={14} color="#ff8221" />
    </>
  );
}

/** Positions the sphere over the DOM "slot" between the two headline lines and drives all motion. */
function Stage({ slot, started, lite }: Props & { lite: boolean }) {
  const { size, viewport } = useThree();
  const root = useRef<THREE.Group>(null);
  const silk = useRef<THREE.Group>(null);
  const spin = useRef<THREE.Group>(null);
  const intro = useRef({ p: prefersReducedMotion() ? 1 : 0 });
  const pointer = useRef({ x: 0, y: 0 });
  const layout = useRef({ x: 0, y: 0, r: 1 });
  // Ribbons must run past both screen edges whatever the sphere's size (in sphere radii).
  const [span, setSpan] = useState(40);

  useEffect(() => {
    const measure = () => {
      const el = slot.current;
      const canvas = el?.closest(".hero")?.querySelector("canvas");
      if (!el || !canvas) return;
      const s = el.getBoundingClientRect();
      const c = canvas.getBoundingClientRect();
      const cx = s.left + s.width / 2 - c.left;
      const cy = s.top + s.height / 2 - c.top;
      const unit = viewport.height / c.height; // world units per CSS px at z = 0
      layout.current = {
        x: (cx - c.width / 2) * unit,
        y: (c.height / 2 - cy) * unit,
        r: (Math.min(s.width, s.height) / 2) * unit * 0.9,
      };
      setSpan(viewport.width / Math.max(layout.current.r, 0.001) + 6);
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (slot.current) ro.observe(slot.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [slot, size.width, size.height, viewport.height, viewport.width]);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useEffect(() => {
    if (!started || intro.current.p === 1) return;
    const tw = gsap.to(intro.current, { p: 1, duration: 2.6, ease: "expo.out", delay: 0.1 });
    return () => {
      tw.kill();
    };
  }, [started]);

  useFrame((state, dt) => {
    const g = root.current;
    const sp = spin.current;
    if (!g || !sp) return;
    const p = intro.current.p;
    const t = state.clock.elapsedTime;
    const heroH = window.innerHeight;
    const scroll = Math.min(Math.max(window.scrollY / heroH, 0), 1.2);
    const { x, y, r } = layout.current;

    g.position.set(x, y + Math.sin(t * 0.7) * 0.04 * r + scroll * r * 0.9, 0);
    const sc = r * (0.72 + 0.28 * p) * (1 - scroll * 0.12);
    g.scale.setScalar(sc);
    // The ribbons share the sphere's centre and radius but not its intro scale-up.
    if (silk.current) {
      silk.current.position.set(x, y + scroll * r * 0.6, 0);
      silk.current.scale.setScalar(r);
    }

    // Spin into alignment on entry, then follow the cursor; scrolling turns the route away.
    const k = 1 - Math.pow(0.0015, dt);
    const tx = (1 - p) * 0.7 + pointer.current.y * 0.22 - scroll * 0.25;
    const ty = (1 - p) * -2.6 + pointer.current.x * 0.32 + scroll * 1.6;
    sp.rotation.x += (tx - sp.rotation.x) * k;
    sp.rotation.y += (ty - sp.rotation.y) * k;
  });

  return (
    <>
      <group ref={silk}>
        {/* Wide, deep ribbon behind the sphere, entering from the left like the opening ribbon. */}
        <SilkRibbon reveal={intro} length={span} width={1.45} amp={0.32} freq={0.42} twist={1.25} seed={0.4} lift={0.8} position={[0, 0.05, -1.7]} rotation={[0, 0, -0.1]} segments={lite ? [160, 12] : undefined} />
        {/* Narrow, brighter ribbon crossing it at an angle. */}
        {!lite && <SilkRibbon reveal={intro} delay={0.12} length={span} width={0.5} amp={0.45} freq={0.6} twist={2.3} seed={2.2} speed={0.45} lift={1.15} position={[0, -0.25, -0.85]} rotation={[0, 0, 0.16]} />}
      </group>
      <group ref={root}>
        <group ref={spin}>
          <RouteSphere intro={intro} />
        </group>
        <Dust count={lite ? 80 : 220} />
      </group>
    </>
  );
}

function RouteSphere({ intro }: { intro: RefObject<{ p: number }> }) {
  const geom = useMemo(() => buildRouteGeometry(1, { thickness: 0.022 }), []);
  const count = geom.index!.count;
  const route = useRef<THREE.Mesh>(null);

  useFrame(() => {
    const p = intro.current?.p ?? 1;
    // The route is drawn as the sphere turns: it "creates" itself.
    const grow = THREE.MathUtils.clamp((p - 0.05) / 0.75, 0, 1);
    const segs = Math.floor((count / 60) * grow) * 60;
    route.current?.geometry.setDrawRange(0, Math.max(segs, 0));
  });

  return (
    <>
      <mesh>
        <sphereGeometry args={[1, 128, 96]} />
        <meshPhysicalMaterial
          color={ORANGE}
          roughness={0.38}
          metalness={0}
          clearcoat={0.9}
          clearcoatRoughness={0.22}
          sheen={0.5}
          sheenColor={new THREE.Color("#ffc08f")}
          sheenRoughness={0.45}
        />
      </mesh>
      <mesh ref={route} geometry={geom}>
        <meshPhysicalMaterial color={MAROON} roughness={0.42} clearcoat={0.45} clearcoatRoughness={0.35} />
      </mesh>
    </>
  );
}

function Dust({ count }: { count: number }) {
  const ref = useRef<THREE.Points>(null);
  const geom = useMemo(() => {
    const rand = mulberry32(6);
    const n = count;
    const pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const r = 1.6 + rand() * 3.6;
      const th = rand() * Math.PI * 2;
      const ph = Math.acos(2 * rand() - 1);
      pos[i * 3] = r * Math.sin(ph) * Math.cos(th) * 1.6;
      pos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th);
      pos[i * 3 + 2] = r * Math.cos(ph) - 1;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return g;
  }, [count]);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.02;
  });
  return (
    <points ref={ref} geometry={geom}>
      <pointsMaterial color="#FF8221" size={0.018} sizeAttenuation transparent opacity={0.55} depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}
