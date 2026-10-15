/**
 * 3D Open World Environment & Biomes
 * Generates the low-poly procedural city, sunset & daytime skies, water, bridges,
 * street furniture, trees, billboards, archways, and portals.
 */

import * as THREE from 'three';
import { stops } from './stops.js';

export class World {
  constructor(scene, renderer) {
    this.scene = scene;
    this.renderer = renderer;

    this.animatedObjects = [];
    this.streetLamps = [];
    this.skillPlates = [];
    this.currentBiome = 'sunset';

    this.initMaterials();
    this.buildSkyAndSun();
    this.buildTerrainAndWater();
    this.buildRoadNetwork();
    this.buildCityBuildings();
    this.buildTreesAndProps();
    this.buildLandmarks();
  }

  initMaterials() {
    // Sunset Palette: coral, salmon, peach, terracotta, lavender-blue
    this.matGround = new THREE.MeshLambertMaterial({
      color: 0xEE9B83, // warm peach/salmon ground
      flatShading: true,
    });

    this.matWater = new THREE.MeshStandardMaterial({
      color: 0x7B88A8, // lavender-blue water
      roughness: 0.15,
      metalness: 0.1,
      flatShading: true,
    });

    this.matRoad = new THREE.MeshLambertMaterial({
      color: 0x4A4E69, // dark purple-slate road surface
      flatShading: true,
    });

    this.matCurb = new THREE.MeshLambertMaterial({
      color: 0xF2E9E4, // chalk white curb
      flatShading: true,
    });

    // Building pastel palette
    this.buildingColors = [
      0xF4A261, // peach
      0xE76F51, // terracotta
      0xF28E79, // salmon
      0xF7B267, // warm honey
      0xE07A5F, // coral
      0xFED9B7, // light peach
      0xD88C9A, // dusty rose
    ];

    this.buildingMats = this.buildingColors.map(
      (c) => new THREE.MeshLambertMaterial({ color: c, flatShading: true })
    );

    this.roofMat = new THREE.MeshLambertMaterial({
      color: 0x6D4C41, // darker terracotta roof
      flatShading: true,
    });

    this.windowMat = new THREE.MeshStandardMaterial({
      color: 0xFFF3B0, // warm glowing sunset window
      emissive: 0xFFA07A,
      emissiveIntensity: 0.45,
      roughness: 0.2,
    });

    this.foliageColors = [0x588157, 0x3A5A40, 0x81B29A, 0x6B9080];
    this.foliageMats = this.foliageColors.map(
      (c) => new THREE.MeshLambertMaterial({ color: c, flatShading: true })
    );
    this.trunkMat = new THREE.MeshLambertMaterial({ color: 0x8D6E63, flatShading: true });
    this.goldMat = new THREE.MeshStandardMaterial({
      color: 0xFFD166,
      metalness: 0.8,
      roughness: 0.2,
      emissive: 0xF7B731,
      emissiveIntensity: 0.35,
    });
  }

  buildSkyAndSun() {
    // Sunset Fog & Ambient Lighting
    this.scene.fog = new THREE.FogExp2(0xFCA88E, 0.0035);

    // Ambient light
    this.ambientLight = new THREE.AmbientLight(0xFFA07A, 1.2);
    this.scene.add(this.ambientLight);

    // Directional Sunset Sun
    this.sunLight = new THREE.DirectionalLight(0xFFE3B3, 2.2);
    this.sunLight.position.set(120, 35, 140);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.camera.near = 10;
    this.sunLight.shadow.camera.far = 450;
    const d = 160;
    this.sunLight.shadow.camera.left = -d;
    this.sunLight.shadow.camera.right = d;
    this.sunLight.shadow.camera.top = d;
    this.sunLight.shadow.camera.bottom = -d;
    this.sunLight.shadow.bias = -0.0005;
    this.scene.add(this.sunLight);

    // Secondary fill light for soft shadows
    this.fillLight = new THREE.DirectionalLight(0xA29BFE, 0.8);
    this.fillLight.position.set(-100, 40, -100);
    this.scene.add(this.fillLight);

    // Glowing Sun sphere low on horizon
    const sunGeo = new THREE.SphereGeometry(24, 24, 24);
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xFFE082 });
    this.sunMesh = new THREE.Mesh(sunGeo, sunMat);
    this.sunMesh.position.set(240, 45, 260);
    this.scene.add(this.sunMesh);

    // Low-poly soft sunset clouds
    this.cloudGroup = new THREE.Group();
    const cloudMat = new THREE.MeshLambertMaterial({
      color: 0xFED0C5,
      transparent: true,
      opacity: 0.85,
      flatShading: true,
    });

    for (let i = 0; i < 28; i++) {
      const cloud = new THREE.Group();
      const numPuffs = 4 + Math.floor(Math.random() * 4);
      for (let p = 0; p < numPuffs; p++) {
        const puff = new THREE.Mesh(
          new THREE.DodecahedronGeometry(6 + Math.random() * 7, 1),
          cloudMat
        );
        puff.position.set(
          (p - numPuffs / 2) * 7 + (Math.random() - 0.5) * 4,
          (Math.random() - 0.5) * 3,
          (Math.random() - 0.5) * 4
        );
        cloud.add(puff);
      }
      cloud.position.set(
        (Math.random() - 0.5) * 500,
        55 + Math.random() * 40,
        (Math.random() - 0.5) * 500
      );
      this.cloudGroup.add(cloud);
    }
    this.scene.add(this.cloudGroup);
  }

  setBiome(biome) {
    if (this.currentBiome === biome) return;
    this.currentBiome = biome;

    if (biome === 'day') {
      // Daytime bright sky biome
      if (this.scene.fog) {
        this.scene.fog.color.setHex(0x90E0EF);
      }
      this.ambientLight.color.setHex(0xCAF0F8);
      this.ambientLight.intensity = 1.6;
      this.sunLight.color.setHex(0xFFFFFF);
      this.sunLight.position.set(-60, 90, -80);
      this.fillLight.color.setHex(0x90E0EF);
    } else if (biome === 'sunset') {
      // Sunset golden-hour biome
      if (this.scene.fog) {
        this.scene.fog.color.setHex(0xFCA88E);
      }
      this.ambientLight.color.setHex(0xFFA07A);
      this.ambientLight.intensity = 1.2;
      this.sunLight.color.setHex(0xFFE3B3);
      this.sunLight.position.set(120, 35, 140);
    }
  }

  buildTerrainAndWater() {
    // Main terrain plane
    const groundGeo = new THREE.PlaneGeometry(600, 600, 32, 32);
    groundGeo.rotateX(-Math.PI / 2);
    this.groundMesh = new THREE.Mesh(groundGeo, this.matGround);
    this.groundMesh.position.y = 0;
    this.groundMesh.receiveShadow = true;
    this.scene.add(this.groundMesh);

    // Large Canal / Lavender-blue Water Basin
    const waterGeo = new THREE.PlaneGeometry(350, 90, 24, 24);
    waterGeo.rotateX(-Math.PI / 2);
    this.waterMesh = new THREE.Mesh(waterGeo, this.matWater);
    this.waterMesh.position.set(80, -0.4, -130);
    this.waterMesh.rotation.y = 0.35;
    this.scene.add(this.waterMesh);

    // Stone quay walls along the water
    const quayGeo = new THREE.BoxGeometry(360, 1.4, 2.5);
    const quayMat = new THREE.MeshLambertMaterial({ color: 0xF2E9E4, flatShading: true });
    const quayNorth = new THREE.Mesh(quayGeo, quayMat);
    quayNorth.position.set(80, 0.4, -85);
    quayNorth.rotation.y = 0.35;
    quayNorth.castShadow = true;
    quayNorth.receiveShadow = true;
    this.scene.add(quayNorth);

    const quaySouth = new THREE.Mesh(quayGeo, quayMat);
    quaySouth.position.set(80, 0.4, -175);
    quaySouth.rotation.y = 0.35;
    quaySouth.castShadow = true;
    quaySouth.receiveShadow = true;
    this.scene.add(quaySouth);
  }

  buildRoadNetwork() {
    // Build the continuous Catmull-Rom spline route passing through all 10 stops
    const points = stops.map((s) => new THREE.Vector3(s.position.x, s.position.y, s.position.z));
    this.pathCurve = new THREE.CatmullRomCurve3(points, true, 'centripetal', 0.5);

    // Extrude a smooth paved road ribbon along the curve
    const roadWidth = 5.2;
    const curbWidth = 0.5;
    const numSteps = 400;
    const curvePoints = this.pathCurve.getSpacedPoints(numSteps);

    const roadGeo = new THREE.BufferGeometry();
    const positions = [];
    const uvs = [];

    for (let i = 0; i <= numSteps; i++) {
      const t = i / numSteps;
      const pt = curvePoints[i % numSteps];
      const tangent = this.pathCurve.getTangentAt(t % 1).normalize();
      const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();

      const left = pt.clone().addScaledVector(normal, -roadWidth / 2);
      const right = pt.clone().addScaledVector(normal, roadWidth / 2);

      positions.push(left.x, 0.05, left.z);
      positions.push(right.x, 0.05, right.z);

      uvs.push(0, t * 20);
      uvs.push(1, t * 20);
    }

    const indices = [];
    for (let i = 0; i < numSteps; i++) {
      const a = i * 2;
      const b = i * 2 + 1;
      const c = (i + 1) * 2;
      const d = (i + 1) * 2 + 1;

      indices.push(a, b, d);
      indices.push(a, d, c);
    }

    roadGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    roadGeo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    roadGeo.setIndex(indices);
    roadGeo.computeVertexNormals();

    const roadMesh = new THREE.Mesh(roadGeo, this.matRoad);
    roadMesh.receiveShadow = true;
    this.scene.add(roadMesh);

    // Dashed center road line
    const lineMat = new THREE.MeshBasicMaterial({ color: 0xFFD166 });
    for (let i = 0; i < numSteps; i += 4) {
      const t = i / numSteps;
      const pt = curvePoints[i];
      const tangent = this.pathCurve.getTangentAt(t).normalize();
      const dash = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.02, 1.4), lineMat);
      dash.position.set(pt.x, 0.07, pt.z);
      dash.rotation.y = Math.atan2(tangent.x, tangent.z);
      this.scene.add(dash);
    }
  }

  buildCityBuildings() {
    this.buildingGroup = new THREE.Group();

    // Procedural pastel apartment townhouses and towers placed strategically
    const buildingCoords = [
      // Spawn Plaza surrounds
      { x: -25, z: -15, w: 14, h: 22, d: 14, rot: 0.2 },
      { x: 25, z: 25, w: 12, h: 28, d: 16, rot: -0.1 },
      { x: -35, z: 20, w: 16, h: 18, d: 12, rot: 0.4 },
      { x: 15, z: -35, w: 14, h: 24, d: 14, rot: -0.3 },

      // Arch approach & Skill zone
      { x: 75, z: -40, w: 16, h: 32, d: 14, rot: 0.1 },
      { x: 60, z: -85, w: 14, h: 26, d: 16, rot: 0.5 },
      { x: 125, z: -60, w: 18, h: 36, d: 18, rot: -0.2 },
      { x: 110, z: -95, w: 16, h: 30, d: 14, rot: 0.2 },

      // South canal townhouses
      { x: 145, z: -170, w: 14, h: 28, d: 14, rot: 0.4 },
      { x: 115, z: -210, w: 16, h: 22, d: 16, rot: -0.3 },
      { x: 45, z: -245, w: 18, h: 34, d: 16, rot: 0.2 },

      // Daytime Biome & Letter Avenue
      { x: -85, z: -235, w: 16, h: 30, d: 16, rot: 0.3 },
      { x: -105, z: -180, w: 14, h: 24, d: 14, rot: -0.4 },
      { x: -140, z: -125, w: 12, h: 36, d: 12, rot: 0.1 },
      { x: -135, z: -95, w: 14, h: 28, d: 14, rot: -0.2 },
      { x: -125, z: -60, w: 16, h: 25, d: 14, rot: 0.3 },
      { x: -65, z: -15, w: 14, h: 32, d: 14, rot: -0.1 },
    ];

    buildingCoords.forEach((b, idx) => {
      const mat = this.buildingMats[idx % this.buildingMats.length];
      const bMesh = new THREE.Mesh(new THREE.BoxGeometry(b.w, b.h, b.d), mat);
      bMesh.position.set(b.x, b.h / 2, b.z);
      bMesh.rotation.y = b.rot;
      bMesh.castShadow = true;
      bMesh.receiveShadow = true;
      this.buildingGroup.add(bMesh);

      // Pitched roof or cornice
      if (idx % 2 === 0) {
        const roofGeo = new THREE.ConeGeometry(Math.max(b.w, b.d) * 0.72, 5.5, 4);
        roofGeo.rotateY(Math.PI / 4);
        const roofMesh = new THREE.Mesh(roofGeo, this.roofMat);
        roofMesh.position.set(b.x, b.h + 2.75, b.z);
        roofMesh.rotation.y = b.rot;
        roofMesh.castShadow = true;
        this.buildingGroup.add(roofMesh);
      } else {
        const ledge = new THREE.Mesh(
          new THREE.BoxGeometry(b.w + 1.2, 0.8, b.d + 1.2),
          this.matCurb
        );
        ledge.position.set(b.x, b.h + 0.4, b.z);
        ledge.rotation.y = b.rot;
        this.buildingGroup.add(ledge);
      }

      // Add windows to facades
      const numFloors = Math.floor(b.h / 4);
      for (let floor = 1; floor < numFloors; floor++) {
        for (let col = -1; col <= 1; col += 2) {
          const win = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 2.2), this.windowMat);
          win.position.set(
            b.x + col * (b.w * 0.28) * Math.cos(b.rot) + (b.d / 2 + 0.05) * Math.sin(b.rot),
            floor * 4,
            b.z - col * (b.w * 0.28) * Math.sin(b.rot) + (b.d / 2 + 0.05) * Math.cos(b.rot)
          );
          win.rotation.y = b.rot;
          this.buildingGroup.add(win);
        }
      }
    });

    this.scene.add(this.buildingGroup);
  }

  buildTreesAndProps() {
    this.propsGroup = new THREE.Group();

    // Stylized low-poly trees with rounded canopies
    const treeCoords = [
      { x: -10, z: -8 }, { x: 12, z: -10 }, { x: -8, z: 15 },
      { x: 35, z: -25 }, { x: 55, z: -45 }, { x: 80, z: -60 },
      { x: 105, z: -80 }, { x: 135, z: -115 }, { x: 100, z: -150 },
      { x: 70, z: -175 }, { x: 90, z: -210 }, { x: 25, z: -230 },
      { x: -15, z: -225 }, { x: -45, z: -210 }, { x: -75, z: -190 },
      { x: -95, z: -150 }, { x: -120, z: -105 }, { x: -95, z: -70 },
      { x: -75, z: -35 }, { x: -50, z: 5 }
    ];

    treeCoords.forEach((c, idx) => {
      const tree = new THREE.Group();
      // Trunk
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.45, 2.8, 6), this.trunkMat);
      trunk.position.y = 1.4;
      trunk.castShadow = true;
      tree.add(trunk);

      // Round / faceted canopy
      const fMat = this.foliageMats[idx % this.foliageMats.length];
      const canopy = new THREE.Mesh(new THREE.DodecahedronGeometry(2.2 + (idx % 3) * 0.4, 1), fMat);
      canopy.position.y = 3.6;
      canopy.castShadow = true;
      tree.add(canopy);

      tree.position.set(c.x, 0, c.z);
      this.propsGroup.add(tree);
    });

    // Street Lamps with warm glowing pointlights
    const lampCoords = [
      { x: 8, z: -2 }, { x: 38, z: -30 }, { x: 88, z: -65 },
      { x: 112, z: -120 }, { x: 72, z: -185 }, { x: 2, z: -215 },
      { x: -55, z: -195 }, { x: -105, z: -125 }, { x: -80, z: -45 }
    ];

    lampCoords.forEach((c) => {
      const lamp = new THREE.Group();
      const post = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.14, 4.2, 8),
        new THREE.MeshLambertMaterial({ color: 0x222222, flatShading: true })
      );
      post.position.y = 2.1;
      post.castShadow = true;
      lamp.add(post);

      const bulbMesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.35, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0xFFE082 })
      );
      bulbMesh.position.y = 4.2;
      lamp.add(bulbMesh);

      // Pointlight
      const pLight = new THREE.PointLight(0xFFD166, 1.8, 14, 1.8);
      pLight.position.set(0, 4.2, 0);
      lamp.add(pLight);
      this.streetLamps.push(pLight);

      lamp.position.set(c.x, 0, c.z);
      this.propsGroup.add(lamp);
    });

    // Park benches & Cafe Umbrellas
    const umbrellaCoords = [
      { x: 5, z: 8, color: 0xF28E79 },
      { x: -14, z: 6, color: 0xF7B267 },
      { x: 52, z: -32, color: 0xE76F51 },
      { x: -52, z: -195, color: 0x4EA8DE }
    ];

    umbrellaCoords.forEach((u) => {
      const umbrella = new THREE.Group();
      const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.06, 0.06, 3.2, 6),
        new THREE.MeshLambertMaterial({ color: 0xEEEEEE })
      );
      pole.position.y = 1.6;
      umbrella.add(pole);

      const canopy = new THREE.Mesh(
        new THREE.ConeGeometry(2.4, 0.9, 8),
        new THREE.MeshLambertMaterial({ color: u.color, flatShading: true })
      );
      canopy.position.y = 3.2;
      canopy.castShadow = true;
      umbrella.add(canopy);

      umbrella.position.set(u.x, 0, u.z);
      this.propsGroup.add(umbrella);
    });

    this.scene.add(this.propsGroup);
  }

  buildLandmarks() {
    // 1. SPAWN PLAZA (HERO) LANDMARK: Waterfront Obelisk & Lighthouse
    const plazaLandmark = new THREE.Group();
    plazaLandmark.position.set(0, 0, -25);
    const obeliskBase = new THREE.Mesh(
      new THREE.CylinderGeometry(2.5, 3.5, 3, 6),
      new THREE.MeshLambertMaterial({ color: 0xF28E79, flatShading: true })
    );
    obeliskBase.position.y = 1.5;
    plazaLandmark.add(obeliskBase);

    const obeliskSpire = new THREE.Mesh(
      new THREE.CylinderGeometry(0.6, 2.0, 18, 6),
      new THREE.MeshLambertMaterial({ color: 0xFED9B7, flatShading: true })
    );
    obeliskSpire.position.y = 12;
    plazaLandmark.add(obeliskSpire);

    const obeliskBeacon = new THREE.Mesh(
      new THREE.SphereGeometry(1.2, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0xFFE082 })
    );
    obeliskBeacon.position.y = 22;
    plazaLandmark.add(obeliskBeacon);
    this.scene.add(plazaLandmark);

    // 2. ABOUT: LANDMARK ARCH
    const archGroup = new THREE.Group();
    archGroup.position.set(45, 0, -35);

    const leftCol = new THREE.Mesh(
      new THREE.BoxGeometry(2.8, 12, 2.8),
      new THREE.MeshLambertMaterial({ color: 0xE76F51, flatShading: true })
    );
    leftCol.position.set(-4.5, 6, 0);
    leftCol.castShadow = true;
    archGroup.add(leftCol);

    const rightCol = new THREE.Mesh(
      new THREE.BoxGeometry(2.8, 12, 2.8),
      new THREE.MeshLambertMaterial({ color: 0xE76F51, flatShading: true })
    );
    rightCol.position.set(4.5, 6, 0);
    rightCol.castShadow = true;
    archGroup.add(rightCol);

    const lintel = new THREE.Mesh(
      new THREE.BoxGeometry(13.5, 3.2, 3.5),
      new THREE.MeshLambertMaterial({ color: 0xF4A261, flatShading: true })
    );
    lintel.position.set(0, 12.5, 0);
    lintel.castShadow = true;
    this.scene.add(archGroup);

    // Parked Scooter at Stop 2 with animated floating "Hi!" speech card
    this.buildParkedScooter(41.5, 0.35, -31, -0.4, true);

    // Monumental Eiffel Tower Archway spanning the avenue
    this.buildEiffelTowerArch();

    // Animated Rotating Ferris Wheel on the sunset horizon
    this.buildFerrisWheel();

    // 3. SKILL ZONE GATE: Gateway between two high buildings with vertical skill bars
    const skillGate = new THREE.Group();
    skillGate.position.set(95, 0, -70);

    const gatePillar1 = new THREE.Mesh(
      new THREE.BoxGeometry(3, 20, 3),
      new THREE.MeshLambertMaterial({ color: 0x4A4E69, flatShading: true })
    );
    gatePillar1.position.set(-6, 10, 0);
    skillGate.add(gatePillar1);

    const gatePillar2 = new THREE.Mesh(
      new THREE.BoxGeometry(3, 20, 3),
      new THREE.MeshLambertMaterial({ color: 0x4A4E69, flatShading: true })
    );
    gatePillar2.position.set(6, 10, 0);
    skillGate.add(gatePillar2);

    // Glowing Skill Slat Ribbons
    for (let i = 0; i < 8; i++) {
      const slat = new THREE.Mesh(
        new THREE.BoxGeometry(10, 0.45, 0.25),
        new THREE.MeshStandardMaterial({
          color: 0xFFD166,
          emissive: 0xF7B731,
          emissiveIntensity: 0.6,
        })
      );
      slat.position.set(0, 4 + i * 1.8, 0);
      skillGate.add(slat);
      this.skillPlates.push(slat);
    }
    this.scene.add(skillGate);

    // 4. PROJECTS: STYLIZED ARCHED BRIDGE & BILLBOARDS
    const bridgeGroup = new THREE.Group();
    bridgeGroup.position.set(120, 0, -130);

    // Arched Bridge Deck
    const bridgeArch = new THREE.Mesh(
      new THREE.BoxGeometry(12, 1.8, 38),
      new THREE.MeshLambertMaterial({ color: 0xF28E79, flatShading: true })
    );
    bridgeArch.position.y = 3.2;
    bridgeArch.castShadow = true;
    bridgeGroup.add(bridgeArch);

    // Bridge piers in the water
    const pier1 = new THREE.Mesh(
      new THREE.CylinderGeometry(2, 2.5, 6, 8),
      new THREE.MeshLambertMaterial({ color: 0xF2E9E4, flatShading: true })
    );
    pier1.position.set(0, 0, -10);
    bridgeGroup.add(pier1);

    const pier2 = new THREE.Mesh(
      new THREE.CylinderGeometry(2, 2.5, 6, 8),
      new THREE.MeshLambertMaterial({ color: 0xF2E9E4, flatShading: true })
    );
    pier2.position.set(0, 0, 10);
    bridgeGroup.add(pier2);

    // Two Large Roadside Billboards for VisionAid & Driver Drowsiness
    const billboard1 = this.createBillboard(
      'VISIONAID',
      'Smart Glasses with Raspberry Pi & Generative AI'
    );
    billboard1.position.set(8.5, 6.5, -12);
    billboard1.rotation.y = -Math.PI / 6;
    bridgeGroup.add(billboard1);

    const billboard2 = this.createBillboard(
      'DRIVER DROWSINESS DETECTION',
      'LSTM-KNN & EAR Analysis • 81.5% Accuracy'
    );
    billboard2.position.set(8.5, 6.5, 12);
    billboard2.rotation.y = -Math.PI / 4;
    bridgeGroup.add(billboard2);

    // Fluffy sunset clouds floating alongside and beneath the canal bridge
    this.buildBridgeClouds(bridgeGroup);

    this.scene.add(bridgeGroup);

    // 5. TIMELINE: MILESTONE SIGNPOSTS (2023, 2024, 2025, 2026)
    const timelineGroup = new THREE.Group();
    timelineGroup.position.set(80, 0, -190);

    const milestones = ['2023', '2024', '2025', '2026'];
    milestones.forEach((year, idx) => {
      const post = new THREE.Group();
      post.position.set(-6 + idx * 4, 0, idx * 8);

      const pillar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.18, 0.22, 4.5, 8),
        new THREE.MeshLambertMaterial({ color: 0xF4A261 })
      );
      pillar.position.y = 2.25;
      post.add(pillar);

      const badge = new THREE.Mesh(
        new THREE.BoxGeometry(2.4, 1.4, 0.3),
        new THREE.MeshStandardMaterial({
          color: 0x222222,
          metalness: 0.2,
          roughness: 0.5,
        })
      );
      badge.position.y = 4.2;
      badge.castShadow = true;
      post.add(badge);

      const yearText = this.createCanvasSign(year);
      yearText.position.set(0, 4.2, 0.18);
      post.add(yearText);

      timelineGroup.add(post);
    });
    this.scene.add(timelineGroup);

    // 6. GLOWING RING PORTAL (TRANSITION)
    const portalGroup = new THREE.Group();
    portalGroup.position.set(10, 4.5, -220);

    const ringGeo = new THREE.TorusGeometry(5.5, 0.6, 16, 48);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0xFFD166,
      emissive: 0xFF9E00,
      emissiveIntensity: 1.2,
      roughness: 0.1,
      metalness: 0.8,
    });
    this.portalRing = new THREE.Mesh(ringGeo, ringMat);
    portalGroup.add(this.portalRing);

    // Inner glowing dissolve disc
    const discGeo = new THREE.CircleGeometry(4.8, 32);
    const discMat = new THREE.MeshBasicMaterial({
      color: 0xFFF3B0,
      transparent: true,
      opacity: 0.45,
      side: THREE.DoubleSide,
    });
    const disc = new THREE.Mesh(discGeo, discMat);
    portalGroup.add(disc);

    this.scene.add(portalGroup);
    this.animatedObjects.push({
      mesh: this.portalRing,
      update: (delta) => {
        this.portalRing.rotation.z += delta * 0.8;
      },
    });

    // 7. CONTACT HUB (DAY BIOME): Brussels Atomium-Style Connected Spheres Landmark
    const contactHub = new THREE.Group();
    contactHub.position.set(-60, 0, -200);
    this.buildAtomiumLandmark(contactHub);

    // 8. GIANT 3D LETTERS STREET: Oversized Pink Extruded "HELLO"
    const lettersGroup = new THREE.Group();
    lettersGroup.position.set(-110, 0, -130);

    const letterMat = new THREE.MeshStandardMaterial({
      color: 0xFF70A6, // bright pink
      roughness: 0.3,
      metalness: 0.1,
      flatShading: true,
    });

    // Procedural low-poly block letters for "HELLO"
    const helloLetters = this.buildBlockLetters('HELLO', letterMat);
    helloLetters.position.set(-12, 0, 0);
    lettersGroup.add(helloLetters);
    this.scene.add(lettersGroup);

    // 9 & 10. FINAL ROOM & RED DOOR LOOP
    const finalRoom = new THREE.Group();
    finalRoom.position.set(-85, 0, -50);

    // Cool-toned gallery pavilion walls
    const galleryMat = new THREE.MeshLambertMaterial({ color: 0x2B2D42, flatShading: true });
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(16, 8, 1), galleryMat);
    backWall.position.set(0, 4, -6);
    finalRoom.add(backWall);

    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(1, 8, 12), galleryMat);
    leftWall.position.set(-8, 4, 0);
    finalRoom.add(leftWall);

    // Modern interior furniture (sofa, coffee table, succulent, arched brass lamp)
    this.buildGalleryRoomFurniture(finalRoom);

    // Framed pictures on the walls
    const frameGeo = new THREE.BoxGeometry(3.2, 2.4, 0.2);
    const frameMat = new THREE.MeshStandardMaterial({ color: 0xF7B731, metalness: 0.7 });
    const picFrame1 = new THREE.Mesh(frameGeo, frameMat);
    picFrame1.position.set(-3.5, 4.5, -5.4);
    finalRoom.add(picFrame1);

    const picFrame2 = new THREE.Mesh(frameGeo, frameMat);
    picFrame2.position.set(3.5, 4.5, -5.4);
    finalRoom.add(picFrame2);

    // Glowing Red Portal Door
    const doorFrame = new THREE.Mesh(
      new THREE.BoxGeometry(3.6, 6.2, 0.4),
      new THREE.MeshLambertMaterial({ color: 0x111111 })
    );
    doorFrame.position.set(0, 3.1, -5.2);
    finalRoom.add(doorFrame);

    const doorPanel = new THREE.Mesh(
      new THREE.PlaneGeometry(3.0, 5.6),
      new THREE.MeshStandardMaterial({
        color: 0xEB3B5A,
        emissive: 0xEB3B5A,
        emissiveIntensity: 1.5,
        roughness: 0.2,
      })
    );
    doorPanel.position.set(0, 3.1, -5.0);
    finalRoom.add(doorPanel);

    this.scene.add(finalRoom);

    // Parked Scooter outside Gallery Room doorway (where player dismounts to walk inside)
    this.buildParkedScooter(-85, 0.35, -42, 0.2, false);
  }

  createBillboard(title, desc) {
    const group = new THREE.Group();

    // Steel frame
    const frame = new THREE.Mesh(
      new THREE.BoxGeometry(10.5, 5.5, 0.4),
      new THREE.MeshLambertMaterial({ color: 0x222222 })
    );
    frame.castShadow = true;
    group.add(frame);

    // Canvas texture with high contrast typography
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, 1024, 512);
    grad.addColorStop(0, '#1E272C');
    grad.addColorStop(1, '#0F1418');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 512);

    // Accent header border
    ctx.fillStyle = '#F7B731';
    ctx.fillRect(0, 0, 1024, 18);

    // Title
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 54px Orbitron, sans-serif';
    ctx.fillText(title, 50, 120);

    // Divider
    ctx.fillStyle = '#F28E79';
    ctx.fillRect(50, 160, 240, 6);

    // Description text
    ctx.fillStyle = '#FED9B7';
    ctx.font = '32px Inter, sans-serif';
    ctx.fillText(desc, 50, 240);

    ctx.fillStyle = '#A29BFE';
    ctx.font = 'italic 28px Inter, sans-serif';
    ctx.fillText('Tap / Click in world for details', 50, 380);

    const tex = new THREE.CanvasTexture(canvas);
    const board = new THREE.Mesh(
      new THREE.PlaneGeometry(10, 5),
      new THREE.MeshStandardMaterial({
        map: tex,
        emissive: 0x222222,
        roughness: 0.3,
      })
    );
    board.position.z = 0.22;
    group.add(board);

    // Support legs
    const leg1 = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.18, 6.5, 6),
      new THREE.MeshLambertMaterial({ color: 0x444444 })
    );
    leg1.position.set(-3.5, -4.5, 0);
    group.add(leg1);

    const leg2 = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.18, 6.5, 6),
      new THREE.MeshLambertMaterial({ color: 0x444444 })
    );
    leg2.position.set(3.5, -4.5, 0);
    group.add(leg2);

    return group;
  }

  createCanvasSign(text) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#222222';
    ctx.fillRect(0, 0, 256, 128);

    ctx.fillStyle = '#F7B731';
    ctx.font = 'bold 72px Orbitron, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 128, 64);

    const tex = new THREE.CanvasTexture(canvas);
    return new THREE.Mesh(
      new THREE.PlaneGeometry(2.2, 1.1),
      new THREE.MeshBasicMaterial({ map: tex })
    );
  }

  buildBlockLetters(word, mat) {
    const group = new THREE.Group();
    const letterWidth = 3.6;
    const letterHeight = 6.0;
    const thickness = 1.2;

    for (let i = 0; i < word.length; i++) {
      const char = word[i];
      const charGroup = new THREE.Group();
      charGroup.position.x = i * 4.8;

      if (char === 'H') {
        const left = new THREE.Mesh(new THREE.BoxGeometry(0.8, letterHeight, thickness), mat);
        left.position.set(-1.2, letterHeight / 2, 0);
        const right = new THREE.Mesh(new THREE.BoxGeometry(0.8, letterHeight, thickness), mat);
        right.position.set(1.2, letterHeight / 2, 0);
        const bar = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.8, thickness), mat);
        bar.position.set(0, letterHeight / 2, 0);
        charGroup.add(left, right, bar);
      } else if (char === 'E') {
        const spine = new THREE.Mesh(new THREE.BoxGeometry(0.8, letterHeight, thickness), mat);
        spine.position.set(-1.2, letterHeight / 2, 0);
        const top = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.8, thickness), mat);
        top.position.set(0, letterHeight - 0.4, 0);
        const mid = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.7, thickness), mat);
        mid.position.set(-0.3, letterHeight / 2, 0);
        const bot = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.8, thickness), mat);
        bot.position.set(0, 0.4, 0);
        charGroup.add(spine, top, mid, bot);
      } else if (char === 'L') {
        const spine = new THREE.Mesh(new THREE.BoxGeometry(0.8, letterHeight, thickness), mat);
        spine.position.set(-1.2, letterHeight / 2, 0);
        const bot = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.8, thickness), mat);
        bot.position.set(0, 0.4, 0);
        charGroup.add(spine, bot);
      } else if (char === 'O') {
        const left = new THREE.Mesh(new THREE.BoxGeometry(0.8, letterHeight, thickness), mat);
        left.position.set(-1.2, letterHeight / 2, 0);
        const right = new THREE.Mesh(new THREE.BoxGeometry(0.8, letterHeight, thickness), mat);
        right.position.set(1.2, letterHeight / 2, 0);
        const top = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.8, thickness), mat);
        top.position.set(0, letterHeight - 0.4, 0);
        const bot = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.8, thickness), mat);
        bot.position.set(0, 0.4, 0);
        charGroup.add(left, right, top, bot);
      }

      charGroup.traverse((c) => {
        if (c.isMesh) {
          c.castShadow = true;
          c.receiveShadow = true;
        }
      });
      group.add(charGroup);
    }
    return group;
  }

  buildParkedScooter(x, y, z, rotY, withSpeechBadge = false) {
    const scooter = new THREE.Group();
    scooter.position.set(x, y, z);
    scooter.rotation.y = rotY;

    const yellowMat = new THREE.MeshStandardMaterial({
      color: 0xF7B731,
      roughness: 0.4,
      metalness: 0.1,
      flatShading: true,
    });
    const chromeMat = new THREE.MeshStandardMaterial({
      color: 0xEEEEEE,
      metalness: 0.8,
      roughness: 0.2,
      flatShading: true,
    });
    const blackMat = new THREE.MeshStandardMaterial({
      color: 0x222222,
      roughness: 0.7,
      flatShading: true,
    });
    const lightMat = new THREE.MeshBasicMaterial({ color: 0xFFF9E6 });

    // Foot deck
    const deck = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.14, 1.6), yellowMat);
    deck.position.set(0, 0.35, 0);
    deck.castShadow = true;
    scooter.add(deck);

    // Front apron shield
    const shield = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.9, 0.18), yellowMat);
    shield.position.set(0, 0.85, 0.75);
    shield.rotation.x = -0.15;
    shield.castShadow = true;
    scooter.add(shield);

    // Headlight
    const headlight = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.1, 12), lightMat);
    headlight.rotation.x = Math.PI / 2;
    headlight.position.set(0, 1.25, 0.85);
    scooter.add(headlight);

    // Seat
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.18, 0.75), blackMat);
    seat.position.set(0, 0.72, -0.3);
    seat.castShadow = true;
    scooter.add(seat);

    // Rear engine cover
    const rear = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.5, 0.8), yellowMat);
    rear.position.set(0, 0.5, -0.5);
    rear.castShadow = true;
    scooter.add(rear);

    // Handlebars
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.9, 8), chromeMat);
    stem.position.set(0, 0.95, 0.8);
    scooter.add(stem);

    const bar = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.05, 0.05), chromeMat);
    bar.position.set(0, 1.45, 0.8);
    scooter.add(bar);

    // Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.14, 16);
    wheelGeo.rotateZ(Math.PI / 2);
    const frontWheel = new THREE.Mesh(wheelGeo, blackMat);
    frontWheel.position.set(0, 0.28, 0.8);
    frontWheel.castShadow = true;
    scooter.add(frontWheel);

    const rearWheel = new THREE.Mesh(wheelGeo, blackMat);
    rearWheel.position.set(0, 0.28, -0.6);
    rearWheel.castShadow = true;
    scooter.add(rearWheel);

    // Kickstand leaning
    scooter.rotation.z = -0.08;

    // Optional floating "Hi!" speech bubble badge
    if (withSpeechBadge) {
      const badgeGroup = new THREE.Group();
      badgeGroup.position.set(0, 2.4, 0.3);

      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 128;
      const ctx = canvas.getContext('2d');

      // Rounded speech bubble background
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.roundRect(16, 16, 224, 96, 24);
      ctx.fill();

      // Bold cheerful text
      ctx.fillStyle = '#2C3A47';
      ctx.font = 'bold 56px Orbitron, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Hi!', 128, 64);

      const tex = new THREE.CanvasTexture(canvas);
      const badgeMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(1.8, 0.9),
        new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide })
      );
      badgeGroup.add(badgeMesh);
      scooter.add(badgeGroup);

      this.animatedObjects.push({
        mesh: badgeGroup,
        update: () => {
          badgeGroup.position.y = 2.4 + Math.sin(Date.now() * 0.0035) * 0.14;
          badgeGroup.rotation.y = Math.sin(Date.now() * 0.002) * 0.12;
        },
      });
    }

    this.scene.add(scooter);
    return scooter;
  }

  buildEiffelTowerArch() {
    const eiffel = new THREE.Group();
    // Spanning the avenue between Stop 2 and Stop 3
    eiffel.position.set(70, 0, -52);
    eiffel.rotation.y = -0.52;

    const ironMat = new THREE.MeshStandardMaterial({
      color: 0xE07A5F, // warm terracotta iron
      roughness: 0.6,
      metalness: 0.3,
      flatShading: true,
    });
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xFFD166,
      roughness: 0.3,
      metalness: 0.7,
      emissive: 0xF7B731,
      emissiveIntensity: 0.4,
    });

    const legWidth = 2.4;
    const roadClearance = 11.0;
    const baseSpanZ = 7.5;

    // 4 Grand Tapered Lattice Legs straddling the road
    const legPositions = [
      [-roadClearance / 2 - 1.2, baseSpanZ],
      [-roadClearance / 2 - 1.2, -baseSpanZ],
      [roadClearance / 2 + 1.2, baseSpanZ],
      [roadClearance / 2 + 1.2, -baseSpanZ],
    ];

    legPositions.forEach(([lx, lz]) => {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(legWidth, 14, legWidth), ironMat);
      leg.position.set(lx, 7, lz);
      leg.rotation.z = lx > 0 ? 0.12 : -0.12;
      leg.rotation.x = lz > 0 ? -0.1 : 0.1;
      leg.castShadow = true;
      eiffel.add(leg);
    });

    // Lower Arch Vault overhead
    const archCurve = new THREE.Mesh(
      new THREE.BoxGeometry(roadClearance + 5, 2.2, 16),
      ironMat
    );
    archCurve.position.set(0, 13.5, 0);
    archCurve.castShadow = true;
    eiffel.add(archCurve);

    // Decorative Arch Lattice Trim
    const archTrim = new THREE.Mesh(
      new THREE.TorusGeometry(roadClearance / 2 + 0.8, 0.45, 8, 24, Math.PI),
      goldMat
    );
    archTrim.position.set(0, 11.5, 0);
    archTrim.rotation.z = Math.PI;
    eiffel.add(archTrim);

    // First Platform Balustrade Deck (Observation Level 1)
    const platform1 = new THREE.Mesh(new THREE.BoxGeometry(16, 1.2, 18), ironMat);
    platform1.position.set(0, 14.8, 0);
    platform1.castShadow = true;
    eiffel.add(platform1);

    // Second Tapered Tower Tier
    const tier2 = new THREE.Mesh(new THREE.BoxGeometry(9.5, 12, 10.5), ironMat);
    tier2.position.set(0, 21.0, 0);
    tier2.castShadow = true;
    eiffel.add(tier2);

    // Platform Level 2
    const platform2 = new THREE.Mesh(new THREE.BoxGeometry(8, 0.8, 8.5), goldMat);
    platform2.position.set(0, 27.2, 0);
    eiffel.add(platform2);

    // Upper Spire & Beacon
    const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 3.2, 18, 4), ironMat);
    spire.position.set(0, 36.5, 0);
    spire.rotation.y = Math.PI / 4;
    spire.castShadow = true;
    eiffel.add(spire);

    // Glowing Golden Beacon at Apex
    const beacon = new THREE.Mesh(
      new THREE.SphereGeometry(1.4, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0xFFE082 })
    );
    beacon.position.set(0, 46.0, 0);
    eiffel.add(beacon);

    const beaconLight = new THREE.PointLight(0xFFD166, 2.5, 60);
    beaconLight.position.set(0, 46.0, 0);
    eiffel.add(beaconLight);

    this.scene.add(eiffel);
  }

  buildFerrisWheel() {
    const wheelGroup = new THREE.Group();
    // Overlooking the horizon in sunset view
    wheelGroup.position.set(210, 0, -80);
    wheelGroup.rotation.y = -0.35;

    const steelMat = new THREE.MeshStandardMaterial({
      color: 0xEE9B83, // warm sunset coral steel
      roughness: 0.5,
      metalness: 0.4,
      flatShading: true,
    });

    // Foundation concrete pylons
    const basePylonL = new THREE.Mesh(new THREE.BoxGeometry(6, 3, 6), this.matCurb);
    basePylonL.position.set(0, 1.5, -8);
    wheelGroup.add(basePylonL);

    const basePylonR = new THREE.Mesh(new THREE.BoxGeometry(6, 3, 6), this.matCurb);
    basePylonR.position.set(0, 1.5, 8);
    wheelGroup.add(basePylonR);

    // Diagonal A-Frame Support Legs
    const supportGeo = new THREE.CylinderGeometry(0.6, 0.9, 34, 6);
    const leg1 = new THREE.Mesh(supportGeo, steelMat);
    leg1.position.set(-6, 16, -6);
    leg1.rotation.z = -0.18;
    leg1.rotation.x = -0.15;
    leg1.castShadow = true;
    wheelGroup.add(leg1);

    const leg2 = new THREE.Mesh(supportGeo, steelMat);
    leg2.position.set(6, 16, -6);
    leg2.rotation.z = 0.18;
    leg2.rotation.x = -0.15;
    leg2.castShadow = true;
    wheelGroup.add(leg2);

    const leg3 = new THREE.Mesh(supportGeo, steelMat);
    leg3.position.set(-6, 16, 6);
    leg3.rotation.z = -0.18;
    leg3.rotation.x = 0.15;
    leg3.castShadow = true;
    wheelGroup.add(leg3);

    const leg4 = new THREE.Mesh(supportGeo, steelMat);
    leg4.position.set(6, 16, 6);
    leg4.rotation.z = 0.18;
    leg4.rotation.x = 0.15;
    leg4.castShadow = true;
    wheelGroup.add(leg4);

    // Rotating Wheel Assembly at y: 31
    const rotatingWheel = new THREE.Group();
    rotatingWheel.position.set(0, 31, 0);

    // Central axle hub
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(2.0, 2.0, 5, 12), steelMat);
    hub.rotation.x = Math.PI / 2;
    rotatingWheel.add(hub);

    const wheelRadius = 24;
    const numGondolas = 16;
    const gondolaList = [];

    // Outer & Inner concentric rims
    const outerRimGeo = new THREE.TorusGeometry(wheelRadius, 0.35, 8, 48);
    const outerRim = new THREE.Mesh(outerRimGeo, steelMat);
    rotatingWheel.add(outerRim);

    const innerRimGeo = new THREE.TorusGeometry(wheelRadius * 0.72, 0.25, 8, 36);
    const innerRim = new THREE.Mesh(innerRimGeo, steelMat);
    rotatingWheel.add(innerRim);

    const gondolaColors = [0xF7B731, 0xFF70A6, 0x2EC4B6, 0xB388FF, 0xFF6B35];

    // Radial Spokes and Gondolas
    for (let i = 0; i < numGondolas; i++) {
      const angle = (i / numGondolas) * Math.PI * 2;

      // Radial spoke strut
      const spoke = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.12, wheelRadius * 2, 6),
        steelMat
      );
      spoke.rotation.z = angle;
      rotatingWheel.add(spoke);

      // Passenger Gondola Pod
      const gondolaPivot = new THREE.Group();
      gondolaPivot.position.set(
        Math.cos(angle) * wheelRadius,
        Math.sin(angle) * wheelRadius,
        0
      );

      const colorMat = new THREE.MeshStandardMaterial({
        color: gondolaColors[i % gondolaColors.length],
        roughness: 0.4,
        metalness: 0.1,
        flatShading: true,
      });

      // Gondola cabin
      const cabin = new THREE.Mesh(new THREE.BoxGeometry(2.2, 2.2, 1.8), colorMat);
      cabin.position.y = -1.2;
      cabin.castShadow = true;
      gondolaPivot.add(cabin);

      // Gondola roof canopy
      const roof = new THREE.Mesh(new THREE.ConeGeometry(1.8, 1.0, 4), this.roofMat);
      roof.position.y = 0.3;
      roof.rotation.y = Math.PI / 4;
      gondolaPivot.add(roof);

      rotatingWheel.add(gondolaPivot);
      gondolaList.push(gondolaPivot);
    }

    wheelGroup.add(rotatingWheel);
    this.scene.add(wheelGroup);

    // Register rotation & counter-rotation for upright gondolas
    this.animatedObjects.push({
      update: (delta) => {
        rotatingWheel.rotation.z += delta * 0.12;
        const currentRot = rotatingWheel.rotation.z;
        gondolaList.forEach((g) => {
          g.rotation.z = -currentRot;
        });
      },
    });
  }

  buildBridgeClouds(bridgeGroup) {
    const cloudMat = new THREE.MeshLambertMaterial({
      color: 0xFED0C5,
      transparent: true,
      opacity: 0.85,
      flatShading: true,
    });

    const cloudPositions = [
      // Flanking north railing
      [-8, 2.0, -14], [-9, 3.2, -6], [-8, 2.4, 2], [-9, 3.0, 10], [-8, 2.2, 16],
      // Flanking south railing
      [8, 2.0, -14], [9, 3.2, -6], [8, 2.4, 2], [9, 3.0, 10], [8, 2.2, 16],
      // Floating underneath bridge piers
      [0, 1.2, -18], [0, 1.4, 18], [-4, 1.8, 0], [4, 1.8, 0]
    ];

    cloudPositions.forEach(([cx, cy, cz]) => {
      const puffCluster = new THREE.Group();
      puffCluster.position.set(cx, cy, cz);

      const numPuffs = 3 + Math.floor(Math.random() * 3);
      for (let p = 0; p < numPuffs; p++) {
        const puff = new THREE.Mesh(
          new THREE.DodecahedronGeometry(2.5 + Math.random() * 2.2, 1),
          cloudMat
        );
        puff.position.set(
          (Math.random() - 0.5) * 3,
          (Math.random() - 0.5) * 1.5,
          (Math.random() - 0.5) * 3
        );
        puffCluster.add(puff);
      }
      bridgeGroup.add(puffCluster);
    });
  }

  buildAtomiumLandmark(contactHub) {
    const chromeMat = new THREE.MeshStandardMaterial({
      color: 0xEAEAEA,
      metalness: 0.9,
      roughness: 0.15,
      flatShading: true,
    });
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xFFD166,
      metalness: 0.8,
      roughness: 0.2,
      emissive: 0xF7B731,
      emissiveIntensity: 0.4,
    });

    // Central Sphere at height y: 12
    const centerSphere = new THREE.Mesh(new THREE.IcosahedronGeometry(3.8, 2), chromeMat);
    centerSphere.position.set(0, 12, 0);
    centerSphere.castShadow = true;
    contactHub.add(centerSphere);

    // 8 Outer Corner Spheres in cubic symmetry
    const d = 6.2;
    const outerSphereCoords = [
      [-d, 12 - d, -d], [d, 12 - d, -d], [-d, 12 - d, d], [d, 12 - d, d],
      [-d, 12 + d, -d], [d, 12 + d, -d], [-d, 12 + d, d], [d, 12 + d, d],
    ];

    const tubeGeo = new THREE.CylinderGeometry(0.45, 0.45, 1, 8);

    outerSphereCoords.forEach(([ox, oy, oz]) => {
      const orb = new THREE.Mesh(new THREE.IcosahedronGeometry(2.2, 2), chromeMat);
      orb.position.set(ox, oy, oz);
      orb.castShadow = true;
      contactHub.add(orb);

      // Connecting tube from center to outer sphere
      const tube = new THREE.Mesh(tubeGeo, chromeMat);
      const start = new THREE.Vector3(0, 12, 0);
      const end = new THREE.Vector3(ox, oy, oz);
      const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
      const len = start.distanceTo(end);

      tube.position.copy(mid);
      tube.scale.set(1, len, 1);
      tube.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3().subVectors(end, start).normalize());
      contactHub.add(tube);
    });

    // 3 Floating Orbital Rings with Contact Icons
    const ring1 = new THREE.Mesh(new THREE.TorusGeometry(8.5, 0.28, 8, 36), goldMat);
    ring1.position.set(0, 12, 0);
    ring1.rotation.x = Math.PI / 3;
    contactHub.add(ring1);

    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(10.5, 0.24, 8, 36), this.matWater);
    ring2.position.set(0, 12, 0);
    ring2.rotation.y = Math.PI / 4;
    contactHub.add(ring2);

    this.scene.add(contactHub);

    this.animatedObjects.push({
      update: (delta) => {
        ring1.rotation.z += delta * 0.4;
        ring2.rotation.x += delta * 0.3;
        contactHub.rotation.y += delta * 0.08;
      },
    });
  }

  buildGalleryRoomFurniture(finalRoom) {
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x5C4033, roughness: 0.7 });
    const fabricMat = new THREE.MeshLambertMaterial({ color: 0x1E272C, flatShading: true }); // dark slate/terracotta couch
    const cushionMat = new THREE.MeshLambertMaterial({ color: 0xE76F51, flatShading: true });
    const brassMat = new THREE.MeshStandardMaterial({ color: 0xFFD166, metalness: 0.8, roughness: 0.2 });

    // --- COUCH / SOFA ---
    const sofaGroup = new THREE.Group();
    sofaGroup.position.set(-3.8, 0, 1.5);
    sofaGroup.rotation.y = 0.25;

    // Sofa base
    const sofaBase = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.45, 2.2), woodMat);
    sofaBase.position.y = 0.45;
    sofaBase.castShadow = true;
    sofaGroup.add(sofaBase);

    // Sofa seat cushions
    const seatCushion1 = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.45, 1.9), cushionMat);
    seatCushion1.position.set(-1.25, 0.85, 0);
    sofaGroup.add(seatCushion1);

    const seatCushion2 = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.45, 1.9), cushionMat);
    seatCushion2.position.set(1.25, 0.85, 0);
    sofaGroup.add(seatCushion2);

    // Sofa backrest
    const backrest = new THREE.Mesh(new THREE.BoxGeometry(5.0, 1.2, 0.5), fabricMat);
    backrest.position.set(0, 1.45, -0.85);
    backrest.castShadow = true;
    sofaGroup.add(backrest);

    // Sofa armrests
    const armL = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.9, 2.1), fabricMat);
    armL.position.set(-2.55, 1.1, 0);
    sofaGroup.add(armL);

    const armR = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.9, 2.1), fabricMat);
    armR.position.set(2.55, 1.1, 0);
    sofaGroup.add(armR);

    // Sofa legs
    [[-2.2, 0.2, -0.8], [2.2, 0.2, -0.8], [-2.2, 0.2, 0.8], [2.2, 0.2, 0.8]].forEach(([lx, ly, lz]) => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.05, 0.4, 6), woodMat);
      leg.position.set(lx, ly, lz);
      sofaGroup.add(leg);
    });
    finalRoom.add(sofaGroup);

    // --- COFFEE TABLE ---
    const tableGroup = new THREE.Group();
    tableGroup.position.set(-3.2, 0, 4.0);

    const tableTop = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.4, 0.12, 16), woodMat);
    tableTop.position.y = 0.65;
    tableTop.castShadow = true;
    tableGroup.add(tableTop);

    [[-0.8, 0.32, -0.8], [0.8, 0.32, -0.8], [0, 0.32, 0.9]].forEach(([tx, ty, tz]) => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.04, 0.65, 6), woodMat);
      leg.position.set(tx, ty, tz);
      tableGroup.add(leg);
    });

    // Coffee mug & small succulent on table
    const mug = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.1, 0.22, 8),
      new THREE.MeshLambertMaterial({ color: 0xF2E9E4 })
    );
    mug.position.set(-0.35, 0.82, 0.15);
    tableGroup.add(mug);

    const plantPot = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.14, 0.2, 8),
      new THREE.MeshLambertMaterial({ color: 0xE76F51 })
    );
    plantPot.position.set(0.3, 0.81, -0.2);
    tableGroup.add(plantPot);

    const succulent = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.15, 1),
      new THREE.MeshLambertMaterial({ color: 0x588157 })
    );
    succulent.position.set(0.3, 0.98, -0.2);
    tableGroup.add(succulent);

    finalRoom.add(tableGroup);

    // --- ARCHED FLOOR LAMP ---
    const lampGroup = new THREE.Group();
    lampGroup.position.set(-6.2, 0, 0.5);

    const lampBase = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 0.15, 12), brassMat);
    lampBase.position.y = 0.08;
    lampGroup.add(lampBase);

    // Curved lamp pole
    const poleCurve = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 4.6, 8), brassMat);
    poleCurve.position.set(0, 2.3, 0);
    lampGroup.add(poleCurve);

    const lampShade = new THREE.Mesh(
      new THREE.ConeGeometry(0.7, 0.6, 12, 1, true),
      new THREE.MeshStandardMaterial({
        color: 0xFFF3B0,
        emissive: 0xFFA07A,
        emissiveIntensity: 0.8,
        side: THREE.DoubleSide,
      })
    );
    lampShade.position.set(1.2, 4.2, 0);
    lampShade.rotation.x = Math.PI;
    lampGroup.add(lampShade);

    const warmLight = new THREE.PointLight(0xFFE3B3, 1.8, 12);
    warmLight.position.set(1.2, 4.0, 0);
    lampGroup.add(warmLight);

    finalRoom.add(lampGroup);
  }

  update(delta, playerPos) {
    // Gentle water ripple
    if (this.waterMesh) {
      this.waterMesh.position.y = -0.4 + Math.sin(Date.now() * 0.002) * 0.08;
    }

    // Gentle cloud drift
    if (this.cloudGroup) {
      this.cloudGroup.rotation.y += delta * 0.01;
    }

    // Animated objects (portal ring, contact beacon)
    this.animatedObjects.forEach((item) => {
      if (item.update) {
        item.update(delta);
      }
    });

    // Check proximity to Day Biome
    if (playerPos) {
      if (playerPos.z < -195 && playerPos.x < 10) {
        this.setBiome('day');
      } else {
        this.setBiome('sunset');
      }
    }
  }
}
