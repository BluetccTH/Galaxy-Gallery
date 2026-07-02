import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GalaxyConfig, GalleryPanel } from "../types";
import { getAssetUrl } from "../utils";

interface GalaxyViewerProps {
  config: GalaxyConfig;
  onSelectPanel: (panel: GalleryPanel) => void;
  focusedPanelId: string | null;
  onClearFocus: () => void;
}

export default function GalaxyViewer({
  config,
  onSelectPanel,
  focusedPanelId,
  onClearFocus,
}: GalaxyViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredPanelId, setHoveredPanelId] = useState<string | null>(null);

  // References to communicate state with the animation loop
  const configRef = useRef(config);
  const selectedIdRef = useRef<string | null>(null);

  useEffect(() => {
    configRef.current = config;
  }, [config]);

  useEffect(() => {
    selectedIdRef.current = focusedPanelId;
  }, [focusedPanelId]);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // --- SCENE, CAMERA & RENDERER ---
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020205, 0.015);

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 25, 45);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x020205, 1);
    container.appendChild(renderer.domElement);

    // --- LIGHTS ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const centerLight = new THREE.PointLight(0xff3e00, 4, 50);
    centerLight.position.set(0, 0, 0);
    scene.add(centerLight);

    // --- CENTRAL BLACK HOLE ---
    const bhGroup = new THREE.Group();
    scene.add(bhGroup);

    // Core Sphere
    const coreGeo = new THREE.SphereGeometry(2.5, 32, 32);
    const coreMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    bhGroup.add(coreMesh);

    // Glow Aura Ring (Accretion disk backdrop)
    const auraGeo = new THREE.RingGeometry(2.6, 5.0, 64);
    // Custom vertex/fragment to make accretion disk glow
    const auraMat = new THREE.MeshBasicMaterial({
      color: 0xff3e00,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });
    const auraMesh = new THREE.Mesh(auraGeo, auraMat);
    auraMesh.rotation.x = Math.PI / 2;
    bhGroup.add(auraMesh);

    // --- ACCRETION DISK PARTICLES ---
    const adCount = 1200;
    const adGeo = new THREE.BufferGeometry();
    const adPos = new Float32Array(adCount * 3);
    const adColors = new Float32Array(adCount * 3);
    const adSpeeds: number[] = [];
    const adRadii: number[] = [];

    const orangeColor = new THREE.Color(0xff3e00);
    const pinkColor = new THREE.Color(0x8b5cf6);

    for (let i = 0; i < adCount; i++) {
      const radius = 2.8 + Math.random() * 4.5;
      const angle = Math.random() * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = (Math.random() - 0.5) * 0.4; // thin disc

      adPos[i * 3] = x;
      adPos[i * 3 + 1] = y;
      adPos[i * 3 + 2] = z;

      // Color interpolation based on radius
      const mixRatio = (radius - 2.8) / 4.5;
      const finalColor = orangeColor.clone().lerp(pinkColor, mixRatio);
      adColors[i * 3] = finalColor.r;
      adColors[i * 3 + 1] = finalColor.g;
      adColors[i * 3 + 2] = finalColor.b;

      adRadii.push(radius);
      adSpeeds.push(1.5 + Math.random() * 2.5); // Fast orbit close to black hole
    }

    adGeo.setAttribute("position", new THREE.BufferAttribute(adPos, 3));
    adGeo.setAttribute("color", new THREE.BufferAttribute(adColors, 3));

    // Simple custom round particle texture
    const canvas = document.createElement("canvas");
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      const grad = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
      grad.addColorStop(0, "rgba(255,255,255,1)");
      grad.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 16, 16);
    }
    const dotTexture = new THREE.CanvasTexture(canvas);

    const adMat = new THREE.PointsMaterial({
      size: 0.25,
      map: dotTexture,
      vertexColors: true,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const adPoints = new THREE.Points(adGeo, adMat);
    bhGroup.add(adPoints);

    // --- SPIRAL GALAXY STARS ---
    const starsCount = 4000;
    const starsGeo = new THREE.BufferGeometry();
    const starsPos = new Float32Array(starsCount * 3);
    const starsColors = new Float32Array(starsCount * 3);

    const colorCore = new THREE.Color(0xfff3e0); // Warm hot cream white
    const colorMid = new THREE.Color(0x8b5cf6);  // Elegant nebula purple
    const colorOuter = new THREE.Color(0x4c1d95); // Deep space purple

    const arms = 2;
    const spin = 1.2;

    for (let i = 0; i < starsCount; i++) {
      const radius = Math.random() * 32;
      const armAngle = ((i % arms) * 2 * Math.PI) / arms;
      const angle = armAngle + radius * spin + (Math.random() - 0.5) * (4.5 / (radius + 1.5));

      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = (Math.random() - 0.5) * (5.0 * Math.exp(-radius / 10)); // flatter towards edges

      starsPos[i * 3] = x;
      starsPos[i * 3 + 1] = y;
      starsPos[i * 3 + 2] = z;

      // Color based on radius
      let starColor = colorCore.clone();
      if (radius < 10) {
        starColor.lerp(colorMid, radius / 10);
      } else {
        starColor = colorMid.clone().lerp(colorOuter, (radius - 10) / 22);
      }

      starsColors[i * 3] = starColor.r;
      starsColors[i * 3 + 1] = starColor.g;
      starsColors[i * 3 + 2] = starColor.b;
    }

    starsGeo.setAttribute("position", new THREE.BufferAttribute(starsPos, 3));
    starsGeo.setAttribute("color", new THREE.BufferAttribute(starsColors, 3));

    const starsMat = new THREE.PointsMaterial({
      size: 0.18,
      map: dotTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const starsPoints = new THREE.Points(starsGeo, starsMat);
    scene.add(starsPoints);

    // --- BEATING PARTICLE HEART ---
    // Heart coordinates parametric:
    // x = 16 * sin^3(t)
    // y = 13 * cos(t) - 5 * cos(2t) - 2 * cos(3t) - cos(4t)
    const heartCount = 600;
    const heartGeo = new THREE.BufferGeometry();
    const heartPos = new Float32Array(heartCount * 3);
    const heartColors = new Float32Array(heartCount * 3);
    const heartOrigins: number[][] = [];

    const heartColorBase = new THREE.Color(0xff3e00); // warm fire orange-red
    const heartColorSparkle = new THREE.Color(0xffceb5); // softer gold-peach

    for (let i = 0; i < heartCount; i++) {
      const t = Math.random() * Math.PI * 2;
      // Parametric formula scaled down
      const scale = 0.22;
      const x = 16 * Math.pow(Math.sin(t), 3) * scale;
      const y = (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * scale;
      const z = (Math.random() - 0.5) * 1.5; // Depth spread

      // Position heart slightly above the black hole core
      const py = y + 7.5;
      const px = x;
      const pz = z;

      heartPos[i * 3] = px;
      heartPos[i * 3 + 1] = py;
      heartPos[i * 3 + 2] = pz;

      heartOrigins.push([px, py, pz]);

      const hCol = heartColorBase.clone().lerp(heartColorSparkle, Math.random());
      heartColors[i * 3] = hCol.r;
      heartColors[i * 3 + 1] = hCol.g;
      heartColors[i * 3 + 2] = hCol.b;
    }

    heartGeo.setAttribute("position", new THREE.BufferAttribute(heartPos, 3));
    heartGeo.setAttribute("color", new THREE.BufferAttribute(heartColors, 3));

    const heartMat = new THREE.PointsMaterial({
      size: 0.35,
      map: dotTexture,
      vertexColors: true,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const heartPoints = new THREE.Points(heartGeo, heartMat);
    scene.add(heartPoints);

    // --- FLOATING PHRASES TEXTURE GENERATION ---
    const phraseSprites: THREE.Sprite[] = [];
    const phraseSpeeds: number[] = [];
    const phraseOffsets: number[] = [];

    const updatePhrases = () => {
      // Clear old phrase sprites
      phraseSprites.forEach((sprite) => scene.remove(sprite));
      phraseSprites.length = 0;
      phraseSpeeds.length = 0;
      phraseOffsets.length = 0;

      const currentPhrases = configRef.current.phrases || [];
      currentPhrases.forEach((phrase, index) => {
        // Create 2D canvas for clean textual texture
        const textCanvas = document.createElement("canvas");
        textCanvas.width = 512;
        textCanvas.height = 128;
        const textCtx = textCanvas.getContext("2d");
        
        if (textCtx) {
          textCtx.clearRect(0, 0, 512, 128);
          
          // Outer glow
          textCtx.shadowColor = "rgba(255, 62, 0, 0.6)";
          textCtx.shadowBlur = 12;
          
          // Elegant serif styling
          textCtx.font = "italic bold 32px 'Cormorant Garamond', serif";
          textCtx.fillStyle = "#ffceb5";
          textCtx.textAlign = "center";
          textCtx.textBaseline = "middle";
          
          // Render phrase
          textCtx.fillText(phrase, 256, 64);
        }

        const textTexture = new THREE.CanvasTexture(textCanvas);
        const spriteMat = new THREE.SpriteMaterial({
          map: textTexture,
          transparent: true,
          opacity: 0.85,
          blending: THREE.AdditiveBlending,
        });

        const sprite = new THREE.Sprite(spriteMat);
        // Position at random distances on outer perimeter
        const radius = 18 + Math.random() * 12;
        const angle = (index / currentPhrases.length) * Math.PI * 2;
        const px = Math.cos(angle) * radius;
        const pz = Math.sin(angle) * radius;
        const py = (Math.random() - 0.5) * 6 + 2;

        sprite.position.set(px, py, pz);
        sprite.scale.set(10, 2.5, 1);

        scene.add(sprite);
        phraseSprites.push(sprite);
        phraseSpeeds.push(0.3 + Math.random() * 0.4);
        phraseOffsets.push(Math.random() * 100);
      });
    };

    updatePhrases();

    // --- PHOTO GALLERY PANELS ---
    const panelGroups: THREE.Group[] = [];
    const textureLoader = new THREE.TextureLoader();

    const buildPhotoPanels = () => {
      // Clear existing panels
      panelGroups.forEach((g) => scene.remove(g));
      panelGroups.length = 0;

      const currentPanels = configRef.current.panels || [];
      
      currentPanels.forEach((panel, index) => {
        const group = new THREE.Group();
        // @ts-ignore
        group.userData = { panelId: panel.id, panelData: panel, index };

        // Base frame geometry (Circle backdrop)
        const frameGeo = new THREE.RingGeometry(3.0, 3.15, 64);
        const frameMat = new THREE.MeshBasicMaterial({
          color: 0xffceb5,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.7,
        });
        const frameRing = new THREE.Mesh(frameGeo, frameMat);
        group.add(frameRing);

        // Core photo circle
        const circleGeo = new THREE.CircleGeometry(2.95, 64);
        
        // Dynamic loading of images - standard fallback to Picsum/Unsplash
        const photoUrl = getAssetUrl(panel.photoUrl) || `https://picsum.photos/seed/${panel.id}/300/300`;
        const photoTex = textureLoader.load(photoUrl, undefined, undefined, () => {
          // Fallback image if loading fails
          console.log(`Failed loading ${photoUrl}, using fallback.`);
        });
        photoTex.colorSpace = THREE.SRGBColorSpace;

        const photoMat = new THREE.MeshBasicMaterial({
          map: photoTex,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.95,
        });
        const photoCircle = new THREE.Mesh(circleGeo, photoMat);
        group.add(photoCircle);

        // Ambient subtle outer glowing disk behind
        const glowBackGeo = new THREE.CircleGeometry(3.1, 32);
        const glowBackMat = new THREE.MeshBasicMaterial({
          color: 0x8b5cf6,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.25,
          blending: THREE.AdditiveBlending,
        });
        const glowBack = new THREE.Mesh(glowBackGeo, glowBackMat);
        glowBack.position.z = -0.02;
        group.add(glowBack);

        // Initial setup
        const orbitRadius = 13 + index * 4; // unique radius per panel
        const startAngle = (index / currentPanels.length) * Math.PI * 2;
        const py = (index % 2 === 0 ? 1 : -1) * 2;
        
        const px = Math.cos(startAngle) * orbitRadius;
        const pz = Math.sin(startAngle) * orbitRadius;
        
        group.position.set(px, py, pz);
        // Keep facing center or billboarded
        group.lookAt(0, py, 0);

        scene.add(group);
        panelGroups.push(group);
      });
    };

    buildPhotoPanels();

    // --- INTERACTIVE RAYCASTING FOR MOUSE HOVER/CLICK ---
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const getIntersectedPanel = (clientX: number, clientY: number) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      // We need to intersect the circle meshes
      const circlesToIntersect: THREE.Object3D[] = [];
      panelGroups.forEach((g) => {
        g.children.forEach((child) => {
          if (child instanceof THREE.Mesh) {
            circlesToIntersect.push(child);
          }
        });
      });

      const intersects = raycaster.intersectObjects(circlesToIntersect);
      if (intersects.length > 0) {
        // Find parent group
        let parent = intersects[0].object.parent;
        while (parent && !(parent instanceof THREE.Group)) {
          parent = parent.parent;
        }
        if (parent && parent.userData.panelId) {
          return {
            id: parent.userData.panelId as string,
            data: parent.userData.panelData as GalleryPanel,
            group: parent as THREE.Group,
          };
        }
      }
      return null;
    };

    // --- ROTATION/PAN DRAG STATES ---
    let isDragging = false;
    let dragStart = { x: 0, y: 0 };
    let overallDragStartX = 0;
    let userAngleY = 0; // horizontal rotation offset
    let userAngleX = 0; // vertical rotation offset
    let hasDragged = false;

    const handleMouseDown = (e: MouseEvent) => {
      isDragging = true;
      dragStart.x = e.clientX;
      dragStart.y = e.clientY;
      overallDragStartX = e.clientX;
      hasDragged = false;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const dx = e.clientX - dragStart.x;
        const dy = e.clientY - dragStart.y;
        if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
          hasDragged = true;
        }
        // Rotate the view
        userAngleY += dx * 0.007;
        userAngleX = Math.max(-1.1, Math.min(1.1, userAngleX + dy * 0.007));
        dragStart.x = e.clientX;
        dragStart.y = e.clientY;
      }

      // Hover feedback when not dragging
      if (!isDragging) {
        const intersected = getIntersectedPanel(e.clientX, e.clientY);
        if (intersected) {
          document.body.style.cursor = "pointer";
          setHoveredPanelId(intersected.id);
        } else {
          document.body.style.cursor = "default";
          setHoveredPanelId(null);
        }
      } else {
        document.body.style.cursor = "grabbing";
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      isDragging = false;
      document.body.style.cursor = "default";

      // If they dragged far horizontally while a panel was focused, treat it as a swipe/slide
      const totalDx = e.clientX - overallDragStartX;
      const activeId = selectedIdRef.current;
      if (hasDragged && Math.abs(totalDx) > 80 && activeId) {
        const panels = configRef.current.panels || [];
        const currentIndex = panels.findIndex(p => p.id === activeId);
        if (currentIndex !== -1) {
          if (totalDx > 0) {
            // Dragged right -> Previous
            const prevIdx = (currentIndex - 1 + panels.length) % panels.length;
            onSelectPanel(panels[prevIdx]);
          } else {
            // Dragged left -> Next
            const nextIdx = (currentIndex + 1) % panels.length;
            onSelectPanel(panels[nextIdx]);
          }
        }
      }
    };

    const handleMouseClick = (e: MouseEvent) => {
      // Only trigger click if no drag occurred
      if (!hasDragged) {
        const intersected = getIntersectedPanel(e.clientX, e.clientY);
        if (intersected) {
          onSelectPanel(intersected.data);
        } else {
          if (selectedIdRef.current) {
            onClearFocus();
          }
        }
      }
    };

    // Mobile touch controls for drag rotation and panel swiping
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDragging = true;
        dragStart.x = e.touches[0].clientX;
        dragStart.y = e.touches[0].clientY;
        overallDragStartX = e.touches[0].clientX;
        hasDragged = false;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isDragging && e.touches.length === 1) {
        const dx = e.touches[0].clientX - dragStart.x;
        const dy = e.touches[0].clientY - dragStart.y;
        if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
          hasDragged = true;
        }
        userAngleY += dx * 0.009;
        userAngleX = Math.max(-1.1, Math.min(1.1, userAngleX + dy * 0.009));
        dragStart.x = e.touches[0].clientX;
        dragStart.y = e.touches[0].clientY;
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      isDragging = false;
      
      const activeId = selectedIdRef.current;
      if (hasDragged && e.changedTouches.length > 0 && activeId) {
        const totalDx = e.changedTouches[0].clientX - overallDragStartX;
        if (Math.abs(totalDx) > 60) {
          const panels = configRef.current.panels || [];
          const currentIndex = panels.findIndex(p => p.id === activeId);
          if (currentIndex !== -1) {
            if (totalDx > 0) {
              const prevIdx = (currentIndex - 1 + panels.length) % panels.length;
              onSelectPanel(panels[prevIdx]);
            } else {
              const nextIdx = (currentIndex + 1) % panels.length;
              onSelectPanel(panels[nextIdx]);
            }
          }
          return; // Skip click logic if swiped
        }
      }

      if (!hasDragged && e.changedTouches.length > 0) {
        const clientX = e.changedTouches[0].clientX;
        const clientY = e.changedTouches[0].clientY;
        const intersected = getIntersectedPanel(clientX, clientY);
        if (intersected) {
          onSelectPanel(intersected.data);
        } else {
          if (selectedIdRef.current) {
            onClearFocus();
          }
        }
      }
    };

    renderer.domElement.addEventListener("mousedown", handleMouseDown);
    renderer.domElement.addEventListener("mousemove", handleMouseMove);
    renderer.domElement.addEventListener("mouseup", handleMouseUp);
    renderer.domElement.addEventListener("click", handleMouseClick);
    renderer.domElement.addEventListener("touchstart", handleTouchStart, { passive: true });
    renderer.domElement.addEventListener("touchmove", handleTouchMove, { passive: true });
    renderer.domElement.addEventListener("touchend", handleTouchEnd, { passive: true });

    // --- ANIMATION LOOP ---
    let animationFrameId: number;
    let clock = new THREE.Clock();

    // Camera target states for smooth cinematic pans
    const cameraTargetPos = new THREE.Vector3(0, 25, 45);
    const cameraLookTarget = new THREE.Vector3(0, 0, 0);
    const currentLook = new THREE.Vector3(0, 0, 0);

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsed = clock.getElapsedTime();

      // --- 1. ROTATE BACKGROUND GALAXY & ACCRETION DISK ---
      bhGroup.rotation.y = elapsed * 0.15;
      starsPoints.rotation.y = elapsed * 0.04;

      // Accretion disk individual particles
      const posAttr = adPoints.geometry.getAttribute("position") as THREE.BufferAttribute;
      for (let i = 0; i < adCount; i++) {
        const radius = adRadii[i];
        const speed = adSpeeds[i];
        const currentAngle = elapsed * speed + i; // Offset start
        const x = Math.cos(currentAngle) * radius;
        const z = Math.sin(currentAngle) * radius;
        posAttr.setX(i, x);
        posAttr.setZ(i, z);
      }
      posAttr.needsUpdate = true;

      // --- 2. PULSATE PARTICLE HEART ---
      // Beating function: two heartbeats close together, then a rest
      const beatCycle = (elapsed * 1.5) % Math.PI;
      const beatAmplitude = Math.max(0, Math.sin(beatCycle * 4) * Math.exp(-beatCycle * 2));
      const scaleMultiplier = 1.0 + beatAmplitude * 0.18;

      const heartPosAttr = heartPoints.geometry.getAttribute("position") as THREE.BufferAttribute;
      for (let i = 0; i < heartCount; i++) {
        const orig = heartOrigins[i];
        // Pulsate with double beat
        const px = orig[0] * scaleMultiplier;
        const py = (orig[1] - 7.5) * scaleMultiplier + 7.5; // Scale relative to heart center
        const pz = orig[2] * scaleMultiplier;

        heartPosAttr.setXYZ(i, px, py, pz);
      }
      heartPosAttr.needsUpdate = true;

      // Sparkle heart points
      const heartColorsAttr = heartPoints.geometry.getAttribute("color") as THREE.BufferAttribute;
      for (let i = 0; i < heartCount; i++) {
        const bright = 0.8 + 0.2 * Math.sin(elapsed * 8 + i);
        heartColorsAttr.setX(i, heartColorsAttr.getX(i) * bright);
      }
      heartColorsAttr.needsUpdate = true;

      // --- 3. FLOATING TEXT PRESERVES ROTATION & SIN WAVE DRIFT ---
      phraseSprites.forEach((sprite, idx) => {
        const offset = phraseOffsets[idx];
        const speed = phraseSpeeds[idx];
        
        // Gentle vertical swaying
        sprite.position.y += Math.sin(elapsed * 0.8 + offset) * 0.006;
        
        // Slow rotation around the galaxy
        const radius = 18 + (idx % 3) * 3;
        const angle = elapsed * 0.02 + (idx / phraseSprites.length) * Math.PI * 2;
        sprite.position.x = Math.cos(angle) * radius;
        sprite.position.z = Math.sin(angle) * radius;
      });

      // --- 4. ORBIT AND INTERACTION FOR COVERS ---
      panelGroups.forEach((group) => {
        const pData = group.userData.panelData as GalleryPanel;
        const pIndex = group.userData.index as number;
        
        const orbitRadius = 14 + pIndex * 4;
        const baseSpeed = 0.07;
        const currentAngle = elapsed * baseSpeed + (pIndex / panelGroups.length) * Math.PI * 2;

        // Base orbiting coordinates
        let tx = Math.cos(currentAngle) * orbitRadius;
        let tz = Math.sin(currentAngle) * orbitRadius;
        let ty = (pIndex % 2 === 0 ? 1 : -1) * 2;

        // If this panel is focused, don't orbit it, freeze it in front or pan camera to its position
        const isFocused = selectedIdRef.current === pData.id;
        const isHovered = hoveredPanelId === pData.id;

        // Smoothly position and orient
        if (isFocused) {
          // Freeze orbit, pull closer to screen or make camera point directly
          group.scale.lerp(new THREE.Vector3(1.3, 1.3, 1.3), 0.1);
        } else if (isHovered) {
          group.scale.lerp(new THREE.Vector3(1.15, 1.15, 1.15), 0.1);
        } else {
          group.scale.lerp(new THREE.Vector3(1.0, 1.0, 1.0), 0.1);
        }

        // Apply slow orbit
        group.position.lerp(new THREE.Vector3(tx, ty, tz), 0.05);

        // Always billboard face the camera
        group.quaternion.copy(camera.quaternion);

        // Pulsate frame ring glowing opacity
        const frameRing = group.children[0] as THREE.Mesh;
        if (frameRing && frameRing.material instanceof THREE.MeshBasicMaterial) {
          frameRing.material.opacity = 0.5 + 0.5 * Math.sin(elapsed * 2 + pIndex);
          if (isHovered || isFocused) {
            frameRing.material.color.setHex(0xffffff);
          } else {
            frameRing.material.color.setHex(0xffceb5);
          }
        }
      });

      // --- 5. SMOOTH CAMERA TRANSITIONS ---
      const activeId = selectedIdRef.current;
      if (activeId) {
        // Find focused panel group
        const focusedGroup = panelGroups.find((g) => g.userData.panelId === activeId);
        if (focusedGroup) {
          // Position camera slightly offset from the panel to look directly at it
          const panelPos = focusedGroup.position;
          
          // Vector from center to panel
          const dir = panelPos.clone().normalize();
          // Position camera 8 units away along that direction, slightly elevated
          const destCam = panelPos.clone().add(dir.multiplyScalar(9.0));
          destCam.y += 1.0;

          cameraTargetPos.copy(destCam);
          cameraLookTarget.copy(panelPos);
        }
      } else {
        // Floating ambient slow orbital view around galaxy when unfocused
        const baseAngle = elapsed * 0.03 + 0.5 + userAngleY;
        const h = Math.max(2, Math.min(45, 22 + Math.sin(elapsed * 0.1) * 5 - userAngleX * 15));
        const d = 38 + Math.cos(elapsed * 0.05) * 6;
        cameraTargetPos.set(Math.cos(baseAngle) * d, h, Math.sin(baseAngle) * d);
        cameraLookTarget.set(0, 0, 0);
      }

      // Slerp camera position and look target
      camera.position.lerp(cameraTargetPos, 0.05);
      currentLook.lerp(cameraLookTarget, 0.05);
      camera.lookAt(currentLook);

      renderer.render(scene, camera);
    };

    animate();

    // --- RESIZE LISTENER ---
    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;

      camera.aspect = w / h;
      camera.updateProjectionMatrix();

      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };

    const resizeObserver = new ResizeObserver(() => handleResize());
    resizeObserver.observe(container);

    // --- CLEANUP ON UNMOUNT ---
    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener("mousedown", handleMouseDown);
      renderer.domElement.removeEventListener("mousemove", handleMouseMove);
      renderer.domElement.removeEventListener("mouseup", handleMouseUp);
      renderer.domElement.removeEventListener("click", handleMouseClick);
      renderer.domElement.removeEventListener("touchstart", handleTouchStart);
      renderer.domElement.removeEventListener("touchmove", handleTouchMove);
      renderer.domElement.removeEventListener("touchend", handleTouchEnd);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      
      // Dispose materials/geometries
      coreGeo.dispose();
      coreMat.dispose();
      auraGeo.dispose();
      auraMat.dispose();
      adGeo.dispose();
      adMat.dispose();
      starsGeo.dispose();
      starsMat.dispose();
      heartGeo.dispose();
      heartMat.dispose();
      dotTexture.dispose();
      
      phraseSprites.forEach((sprite) => {
        if (sprite.material.map) sprite.material.map.dispose();
        sprite.material.dispose();
      });

      panelGroups.forEach((g) => {
        g.children.forEach((c) => {
          if (c instanceof THREE.Mesh) {
            c.geometry.dispose();
            if (c.material.map) c.material.map.dispose();
            c.material.dispose();
          }
        });
      });
    };
  }, []);

  return (
    <div id="galaxy-3d-viewport" className="relative w-full h-full select-none overflow-hidden">
      {/* 3D Canvas Anchor */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
      
      {/* Help Overlay or HUD indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2.5 bg-[#020205]/80 border border-white/5 backdrop-blur-md rounded-full text-[10px] md:text-xs text-slate-300 pointer-events-none flex items-center gap-2.5 tracking-widest uppercase font-mono shadow-xl select-none text-center whitespace-nowrap">
        <span className="w-1.5 h-1.5 rounded-full bg-[#ffceb5] animate-pulse" />
        {focusedPanelId 
          ? "Esc / Click Empty Space to zoom out • Swipe to switch" 
          : "Drag / Swipe to rotate • Click panels to zoom"}
      </div>
    </div>
  );
}
