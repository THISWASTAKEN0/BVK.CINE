'use client';

import { useEffect, useRef } from 'react';

/**
 * HeroOrb — WebGL morphing holographic sphere.
 *
 * Pass 1: Render a high-res sphere with organic sin-wave vertex displacement
 *         (creates liquid-metal blob feel) + physically-based thin-film
 *         iridescence GLSL shader → WebGLRenderTarget.
 *
 * Pass 2: Full-screen quad reads that texture and applies radial chromatic
 *         aberration (R/G/B channels shifted outward from center by different
 *         amounts) → final canvas.
 *
 * CSS drop-shadow adds the ambient colour glow halo around the orb.
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

      const el   = ref.current;
      const W    = el.clientWidth;
      const H    = el.clientHeight;
      const DPR  = Math.min(window.devicePixelRatio, 2);

      /* ─── Renderer ─────────────────────────────────────── */
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(W, H);
      renderer.setPixelRatio(DPR);
      renderer.setClearColor(0x000000, 0);
      renderer.autoClear = false;
      el.appendChild(renderer.domElement);

      /* ─── Scene / camera ───────────────────────────────── */
      const scene  = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(36, W / H, 0.1, 100);
      camera.position.set(0, 0, 6);

      /* ─── Render target (pass 1 → texture) ────────────── */
      const rt = new THREE.WebGLRenderTarget(W * DPR, H * DPR, {
        format:     THREE.RGBAFormat,
        minFilter:  THREE.LinearFilter,
        magFilter:  THREE.LinearFilter,
      });

      /* ─── Orb geometry ─────────────────────────────────── */
      // High subdivision sphere — vertex shader displaces it into a living blob
      const geo = new THREE.SphereGeometry(1.9, 256, 256);

      /* ─── Orb shaders ──────────────────────────────────── */
      const orbVert = /* glsl */`
        uniform float uTime;
        varying vec3  vNormal;
        varying vec3  vView;
        varying vec3  vWorldN;
        varying float vD;

        void main() {
          vec3 p  = position;
          float t = uTime;

          // Layered sin-wave displacement — creates organic morphing
          float d =
            sin(p.x * 3.00 + t * 0.68) * sin(p.y * 2.60 + t * 0.52) * 0.18 +
            sin(p.y * 3.80 + t * 0.59) * sin(p.z * 2.90 + t * 0.77) * 0.12 +
            sin(p.z * 2.40 + t * 0.44) * sin(p.x * 3.60 + t * 0.63) * 0.10 +
            sin(p.x * 5.50 + t * 1.05) * sin(p.y * 4.40 + t * 0.88) * 0.05 +
            sin(p.z * 6.20 + t * 0.72) * 0.03;

          vec3 displaced = p + normalize(p) * d;
          vD = d;

          vec4 vp  = modelViewMatrix * vec4(displaced, 1.0);
          vView    = normalize(-vp.xyz);
          vNormal  = normalize(normalMatrix * normal);
          vWorldN  = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
          gl_Position = projectionMatrix * vp;
        }
      `;

      const orbFrag = /* glsl */`
        uniform float uTime;
        varying vec3  vNormal;
        varying vec3  vView;
        varying vec3  vWorldN;
        varying float vD;

        // Physically-based thin-film interference
        // Computes wavelength-dependent interference for R, G, B wavelengths
        vec3 thinFilm(float cosA, float filmShift) {
          // Animated film thickness 350–750 nm
          float thick = 550.0 + 250.0 * sin(filmShift * 2.0 + uTime * 0.08);

          float r = 0.5 + 0.5 * cos(6.28318 * thick * cosA / 700.0);
          float g = 0.5 + 0.5 * cos(6.28318 * thick * cosA / 546.0);
          float b = 0.5 + 0.5 * cos(6.28318 * thick * cosA / 435.0);

          // Gamma-compress to boost saturation of mid tones
          return pow(vec3(r, g, b), vec3(0.55));
        }

        void main() {
          vec3  N   = normalize(vNormal);
          vec3  V   = normalize(vView);
          float NdV = max(dot(N, V), 0.0);

          // Fresnel — 0 at face-on, 1 at silhouette
          float fr = pow(1.0 - NdV, 1.5);

          // ── Lighting ──────────────────────────────────────
          vec3 L1 = normalize(vec3( 2.5,  3.5,  2.0)); // warm key
          vec3 L2 = normalize(vec3(-2.2, -1.5,  1.0)); // cool fill
          vec3 L3 = normalize(vec3( 0.0, -0.5, -2.5)); // back rim

          float d1 = max(dot(N, L1), 0.0);
          float d2 = max(dot(N, L2), 0.0) * 0.32;
          float d3 = max(dot(N, L3), 0.0) * 0.18;

          // Tight primary + broad secondary specular
          vec3  H1 = normalize(L1 + V);
          vec3  H2 = normalize(L2 + V);
          float s1 = pow(max(dot(N, H1), 0.0), 240.0);
          float s2 = pow(max(dot(N, H2), 0.0),  45.0) * 0.40;

          // ── Dark chrome base ───────────────────────────────
          vec3 chrome = vec3(d1 * 0.20 + d2 + d3);

          // ── Thin-film iridescence ──────────────────────────
          // filmShift varies across surface using world normal → each point of
          // the sphere has a different base hue
          float shift = dot(vWorldN, normalize(vec3(0.6, 0.45, 0.30)));
          vec3 iri    = thinFilm(NdV, shift) * 1.9;

          // ── Compose ───────────────────────────────────────
          // fr → 0 (face): dark chrome
          // fr → 1 (edge): vivid iridescent
          vec3 color = mix(chrome, iri, fr * 0.90 + 0.10);

          // Specular: primary white flash, secondary cool tinted
          color += s1 * vec3(1.00, 0.96, 0.92) * 2.8;
          color += s2 * vec3(0.55, 0.75, 1.00) * 1.3;

          // Rim burst — saturated iridescent at extreme grazing
          color += pow(fr, 0.45) * iri * 0.60;

          // Soft inner glow from displaced surface "thinning"
          float iglow = max(0.0, -vD * 3.0);
          color += iglow * vec3(0.2, 0.45, 1.0) * 0.30;

          gl_FragColor = vec4(color, 1.0);
        }
      `;

      const orbMat = new THREE.ShaderMaterial({
        vertexShader:   orbVert,
        fragmentShader: orbFrag,
        uniforms: { uTime: { value: 0.0 } },
        side: THREE.FrontSide,
      });

      const orb = new THREE.Mesh(geo, orbMat);
      scene.add(orb);

      /* ─── Post-pass: Chromatic Aberration ──────────────── */
      const postScene  = new THREE.Scene();
      const postCam    = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
      const postGeo    = new THREE.PlaneGeometry(2, 2);

      const postFrag = /* glsl */`
        uniform sampler2D tDiffuse;
        uniform float     uCA;      // aberration strength
        varying vec2      vUv;

        void main() {
          vec2 uv  = vUv;
          vec2 dir = uv - vec2(0.5);
          float r2 = dot(dir, dir) * 4.0; // 0 at centre, ~1 at corners

          // Each channel offset scales with distance from centre
          vec2 offR = dir * r2 * uCA * 1.8;
          vec2 offB = dir * r2 * uCA * -1.8;
          // Green stays centred; red pushed out; blue pulled in

          vec4 cR = texture2D(tDiffuse, uv + offR);
          vec4 cG = texture2D(tDiffuse, uv);
          vec4 cB = texture2D(tDiffuse, uv + offB);

          float a = max(cR.a, max(cG.a, cB.a));
          gl_FragColor = vec4(cR.r, cG.g, cB.b, a);
        }
      `;

      const postMat = new THREE.ShaderMaterial({
        uniforms: {
          tDiffuse: { value: rt.texture },
          uCA:      { value: 0.012 },
        },
        vertexShader: /* glsl */`
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = vec4(position.xy, 0.0, 1.0);
          }
        `,
        fragmentShader: postFrag,
        transparent:    true,
        depthWrite:     false,
        depthTest:      false,
      });

      postScene.add(new THREE.Mesh(postGeo, postMat));

      /* ─── Animation ────────────────────────────────────── */
      const t0 = Date.now();

      function tick() {
        rafId = requestAnimationFrame(tick);
        const t = (Date.now() - t0) / 1000;

        orbMat.uniforms.uTime.value = t;
        orb.rotation.y = t * 0.13;
        orb.rotation.x = Math.sin(t * 0.11) * 0.16;
        orb.rotation.z = Math.sin(t * 0.08) * 0.07;

        // Pass 1 — scene → render target
        renderer.setRenderTarget(rt);
        renderer.clear();
        renderer.render(scene, camera);

        // Pass 2 — CA quad → screen
        renderer.setRenderTarget(null);
        renderer.clear();
        renderer.render(postScene, postCam);
      }
      tick();
    })();

    return () => {
      mounted = false;
      cancelAnimationFrame(rafId);
      const c = ref.current?.querySelector('canvas');
      if (c) ref.current?.removeChild(c);
    };
  }, []);

  return (
    <div
      ref={ref}
      className="absolute pointer-events-none"
      style={{
        top:       '50%',
        right:     '-4%',
        transform: 'translateY(-52%)',
        width:     'min(660px, 55vw)',
        height:    'min(660px, 55vw)',
        zIndex:    1,
        /* Ambient glow halo — CSS drop-shadow respects canvas alpha */
        filter: [
          'drop-shadow(0 0  60px rgba(100, 60, 255, 0.55))',
          'drop-shadow(0 0 120px rgba( 60, 80, 255, 0.30))',
          'drop-shadow(0 0 200px rgba( 80, 40, 200, 0.18))',
        ].join(' '),
      }}
    />
  );
}
