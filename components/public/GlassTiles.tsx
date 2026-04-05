'use client';

import { useEffect, useRef } from 'react';

/*
  GlassTiles — true WebGL glass tiles rendered with Three.js.
  Uses MeshPhysicalMaterial: transmission + iridescence + clearcoat.
  Background colour spheres give the glass something to refract so it
  picks up the aurora blob palette from the CSS hero behind the canvas.
*/

export default function GlassTiles() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let animId = 0;
    let disposed = false;

    (async () => {
      const THREE = await import('three');
      if (disposed) return;

      const mount = mountRef.current;
      if (!mount) return;

      /* ── Renderer ─────────────────────────────────── */
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(mount.clientWidth, mount.clientHeight);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.3;
      renderer.domElement.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;';
      mount.appendChild(renderer.domElement);

      /* ── Scene & Camera ───────────────────────────── */
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(40, mount.clientWidth / mount.clientHeight, 0.1, 100);
      camera.position.z = 7.5;

      /* ── Environment (for glass reflections) ─────── */
      try {
        const { RoomEnvironment } = await import('three/examples/jsm/environments/RoomEnvironment.js' as string);
        const pmrem = new THREE.PMREMGenerator(renderer);
        scene.environment = pmrem.fromScene(new (RoomEnvironment as any)()).texture;
        pmrem.dispose();
      } catch {
        /* fallback — lights handle it */
      }

      /* ── Lights ───────────────────────────────────── */
      scene.add(new THREE.AmbientLight(0xffffff, 1.2));

      const lightDefs = [
        { color: 0x4466ff, intensity: 5,  pos: [-4,  4, 6] },
        { color: 0xff5500, intensity: 4,  pos: [ 5, -3, 5] },
        { color: 0xaa33ff, intensity: 3,  pos: [ 0,  5, 4] },
        { color: 0xffffff, intensity: 6,  pos: [ 0,  0, 8] },
        { color: 0x00ccff, intensity: 2,  pos: [-2, -4, 5] },
      ];
      lightDefs.forEach(({ color, intensity, pos }) => {
        const l = new THREE.PointLight(color, intensity, 30);
        l.position.set(...(pos as [number, number, number]));
        scene.add(l);
      });

      /* ── Background colour blobs ──────────────────── */
      /* These sit behind the tiles so the glass refracts their colours,
         mirroring the CSS aurora palette in the hero section.            */
      const blobDefs = [
        { color: 0xff5500, pos: [ 2.5,  1.8, -2.5], size: 2.4 },
        { color: 0x0033ff, pos: [-2.2,  1.2, -3.5], size: 2.0 },
        { color: 0x8800cc, pos: [ 3.2, -2.0, -3.0], size: 1.8 },
        { color: 0xff0055, pos: [-1.0, -2.2, -3.5], size: 2.2 },
        { color: 0x00aaff, pos: [ 0.2,  3.5, -4.0], size: 1.6 },
      ];
      blobDefs.forEach(({ color, pos, size }) => {
        const mesh = new THREE.Mesh(
          new THREE.SphereGeometry(size, 32, 32),
          new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.78 }),
        );
        mesh.position.set(...(pos as [number, number, number]));
        scene.add(mesh);
      });

      /* ── Rounded box geometry ─────────────────────── */
      let RoundedBoxGeometry: any = null;
      try {
        const mod = await import('three/examples/jsm/geometries/RoundedBoxGeometry.js' as string);
        RoundedBoxGeometry = (mod as any).RoundedBoxGeometry;
      } catch { /* fall back to BoxGeometry */ }

      const makeGeo = () => RoundedBoxGeometry
        ? new RoundedBoxGeometry(1.18, 1.18, 0.22, 8, 0.22)
        : new THREE.BoxGeometry(1.18, 1.18, 0.22);

      /* ── Tile definitions ─────────────────────────── */
      const tileDefs = [
        { basePos: [-1.5,  1.2,  0.3] as [number, number, number], baseRot: [ 0.22, -0.34, -0.09] as [number, number, number], tint: 0xaaddff, delay: 0.0 },
        { basePos: [ 1.7,  0.5, -0.2] as [number, number, number], baseRot: [ 0.14,  0.29,  0.07] as [number, number, number], tint: 0xffccaa, delay: 0.8 },
        { basePos: [-0.2, -0.9,  0.2] as [number, number, number], baseRot: [-0.10, -0.24,  0.05] as [number, number, number], tint: 0xaaffd0, delay: 1.5 },
        { basePos: [ 1.0, -1.7, -0.1] as [number, number, number], baseRot: [ 0.19,  0.27, -0.06] as [number, number, number], tint: 0xddaaff, delay: 2.2 },
      ];

      const tiles = tileDefs.map(({ basePos, baseRot, tint, delay }) => {
        const geo = makeGeo();

        /* Physical glass material */
        const mat = new THREE.MeshPhysicalMaterial({
          color:                       new THREE.Color(tint),
          metalness:                   0,
          roughness:                   0.02,
          transmission:                0.88,      // glass-like transparency
          thickness:                   0.5,        // refraction depth
          ior:                         1.52,       // glass IOR
          iridescence:                 0.80,       // rainbow sheen
          iridescenceIOR:              1.38,
          iridescenceThicknessRange:   [100, 900],
          clearcoat:                   1.0,
          clearcoatRoughness:          0.02,
          transparent:                 true,
          opacity:                     0.94,
          side:                        THREE.DoubleSide,
        });

        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(...basePos);
        mesh.rotation.set(...baseRot);

        /* Glowing wireframe edges — makes the depth very visible */
        const edgeGeo = new THREE.EdgesGeometry(
          new THREE.BoxGeometry(1.18, 1.18, 0.22),
          10, // crease angle threshold
        );
        const edgeMat = new THREE.LineBasicMaterial({
          color:       0xffffff,
          transparent: true,
          opacity:     0.45,
        });
        mesh.add(new THREE.LineSegments(edgeGeo, edgeMat));

        scene.add(mesh);
        return { mesh, basePos, baseRot, delay };
      });

      /* ── Render loop ──────────────────────────────── */
      const clock = new THREE.Clock();

      const animate = () => {
        if (disposed) return;
        animId = requestAnimationFrame(animate);
        const t = clock.getElapsedTime();

        tiles.forEach(({ mesh, basePos, baseRot, delay }) => {
          mesh.position.y = basePos[1] + Math.sin(t * 0.55 + delay)       * 0.12;
          mesh.rotation.y = baseRot[1] + Math.sin(t * 0.38 + delay)       * 0.08;
          mesh.rotation.x = baseRot[0] + Math.cos(t * 0.28 + delay * 0.7) * 0.04;
        });

        renderer.render(scene, camera);
      };
      animate();

      /* ── Resize ───────────────────────────────────── */
      const onResize = () => {
        if (!mount || disposed) return;
        const w = mount.clientWidth, h = mount.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };
      window.addEventListener('resize', onResize);

      /* ── Cleanup stored on the element ───────────── */
      (mount as any)._glCleanup = () => {
        disposed = true;
        window.removeEventListener('resize', onResize);
        cancelAnimationFrame(animId);
        renderer.dispose();
        if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
      };
    })();

    return () => {
      disposed = true;
      cancelAnimationFrame(animId);
      const mount = mountRef.current;
      (mount as any)?._glCleanup?.();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{
        position: 'absolute',
        top:    0,
        right:  0,
        width:  '55%',
        height: '100%',
        zIndex: 4,
        pointerEvents: 'none',
      }}
    />
  );
}
