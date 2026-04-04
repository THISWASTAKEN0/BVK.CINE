'use client';

import { useEffect, useRef } from 'react';

/**
 * ChromaticStar — WebGL 3D chrome star rendered with Three.js.
 * Extruded 4-pointed star geometry with bevelled edges.
 * Custom GLSL shader: dark chrome base + Fresnel iridescence + specular.
 * The Fresnel term creates vivid rainbow colours at grazing angles (silhouette edges)
 * exactly matching the reference images.
 */
export default function ChromaticStar() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    let mounted = true;
    let rafId: number;

    (async () => {
      const THREE = await import('three');
      if (!mounted || !ref.current) return;

      const el = ref.current;
      const W = el.clientWidth;
      const H = el.clientHeight;

      /* ── Renderer ─────────────────────────────────── */
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(W, H);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setClearColor(0x000000, 0);
      el.appendChild(renderer.domElement);

      /* ── Scene + Camera ───────────────────────────── */
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(38, W / H, 0.1, 100);
      camera.position.set(0, 0, 7.5);

      /* ── 4-pointed star shape ─────────────────────── */
      // Bezier-curved 4-petal star — tight pinch at centre, wide rounded tips
      const r = 1.85;  // outer tip radius
      const p = 0.13;  // inner pinch tightness (smaller = tighter gap between petals)

      const shape = new THREE.Shape();
      shape.moveTo(0, -r);
      shape.bezierCurveTo( p * 2.8, -p * 5.5,  p * 5.5, -p * 2.8,  r,  0);
      shape.bezierCurveTo( p * 5.5,  p * 2.8,  p * 2.8,  p * 5.5,  0,  r);
      shape.bezierCurveTo(-p * 2.8,  p * 5.5, -p * 5.5,  p * 2.8, -r,  0);
      shape.bezierCurveTo(-p * 5.5, -p * 2.8, -p * 2.8, -p * 5.5,  0, -r);

      const geometry = new THREE.ExtrudeGeometry(shape, {
        depth: 0.55,
        bevelEnabled: true,
        bevelSegments: 32,
        bevelSize: 0.36,
        bevelThickness: 0.30,
        steps: 1,
      });
      geometry.center();

      /* ── GLSL shaders ─────────────────────────────── */
      const vertexShader = /* glsl */`
        varying vec3 vNormal;
        varying vec3 vViewDir;
        varying vec3 vWorldNormal;

        void main() {
          vec4 vp   = modelViewMatrix * vec4(position, 1.0);
          vViewDir  = normalize(-vp.xyz);
          vNormal   = normalize(normalMatrix * normal);
          vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
          gl_Position = projectionMatrix * vp;
        }
      `;

      const fragmentShader = /* glsl */`
        varying vec3 vNormal;
        varying vec3 vViewDir;
        varying vec3 vWorldNormal;

        uniform float uTime;

        // Inigo Quilez cosine palette — maps scalar → vivid rainbow
        vec3 palette(float t) {
          vec3 a = vec3(0.5,  0.5,  0.5);
          vec3 b = vec3(0.5,  0.5,  0.5);
          vec3 c = vec3(1.0,  1.0,  1.0);
          vec3 d = vec3(0.00, 0.33, 0.67);
          return a + b * cos(6.28318 * (c * t + d));
        }

        void main() {
          vec3 N = normalize(vNormal);
          vec3 V = normalize(vViewDir);

          // ── Fresnel ────────────────────────────────
          // Strong at silhouette edges (dot(N,V) ≈ 0), zero at face centre
          float NdotV  = max(dot(N, V), 0.0);
          float fresnel = pow(1.0 - NdotV, 1.4);

          // ── Lighting ───────────────────────────────
          vec3 L1 = normalize(vec3(2.0, 3.0, 2.5));   // key light — top-right-front
          vec3 L2 = normalize(vec3(-1.5, -1.0, 0.8)); // fill — bottom-left-back

          float diff1  = max(dot(N, L1), 0.0);
          float diff2  = max(dot(N, L2), 0.0) * 0.28;

          // Blinn-Phong specular
          vec3  H1    = normalize(L1 + V);
          float spec1 = pow(max(dot(N, H1), 0.0), 140.0);

          // ── Dark chrome base ───────────────────────
          // Very dark so iridescent colors dominate (like the reference)
          vec3 chrome  = vec3(0.04 + diff1 * 0.28 + diff2);
          chrome      += spec1 * 2.0;  // bright white specular flare

          // ── Iridescent sweep ───────────────────────
          // Uses world-space normal so hues shift as the star rotates
          float iriT = dot(vWorldNormal, normalize(vec3(0.55, 0.45, 0.35)));
          iriT      += uTime * 0.09;
          vec3 iri   = palette(iriT) * 2.2;  // high multiplier for vivid saturation

          // ── Mix ────────────────────────────────────
          // At edges (fresnel=1): pure iridescent; at face (fresnel=0): mostly chrome
          float blend = fresnel * 0.85 + 0.15;  // minimum 15% iridescence everywhere
          vec3 color  = mix(chrome, iri, blend);

          // Second specular on top (stays white regardless of blend)
          color += spec1 * 0.8;

          // Rim glow — extra brightness at extreme silhouette edges
          color += pow(fresnel, 0.6) * iri * 0.35;

          gl_FragColor = vec4(color, 1.0);
        }
      `;

      const material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: { uTime: { value: 0.0 } },
        side: THREE.DoubleSide,
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.rotation.x = 0.22;  // slight top-down tilt so bevel is visible
      scene.add(mesh);

      /* ── Animation loop ───────────────────────────── */
      const t0 = Date.now();
      function animate() {
        rafId = requestAnimationFrame(animate);
        const t = (Date.now() - t0) / 1000;
        material.uniforms.uTime.value = t;
        mesh.rotation.y = t * 0.20;                        // slow steady spin
        mesh.rotation.x = 0.22 + Math.sin(t * 0.17) * 0.1; // gentle nod
        renderer.render(scene, camera);
      }
      animate();
    })();

    return () => {
      mounted = false;
      cancelAnimationFrame(rafId);
      if (ref.current) {
        const c = ref.current.querySelector('canvas');
        if (c) ref.current.removeChild(c);
      }
    };
  }, []);

  return (
    <div
      ref={ref}
      className="absolute pointer-events-none"
      style={{
        /* Centre-right — star is behind the content which sits bottom-left */
        top: '50%',
        left: '50%',
        transform: 'translate(-25%, -52%)',
        width: '620px',
        height: '620px',
        zIndex: 1,
      }}
    />
  );
}
