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
    archGroup.add(lintel);

    this.scene.add(archGroup);

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

    // 7. CONTACT HUB (DAY BIOME): Connected Spheres Landmark with @ and GitHub beacon
    const contactHub = new THREE.Group();
    contactHub.position.set(-60, 0, -200);

    const sphereMat = new THREE.MeshStandardMaterial({
      color: 0x4EA8DE,
      metalness: 0.6,
      roughness: 0.2,
      flatShading: true,
    });

    // Connected geometric spheres
    const centerSphere = new THREE.Mesh(new THREE.IcosahedronGeometry(4.5, 2), sphereMat);
    centerSphere.position.y = 7.5;
    centerSphere.castShadow = true;
    contactHub.add(centerSphere);

    const orb1 = new THREE.Mesh(new THREE.IcosahedronGeometry(2.2, 1), sphereMat);
    orb1.position.set(5.5, 11, 0);
    contactHub.add(orb1);

    const orb2 = new THREE.Mesh(new THREE.IcosahedronGeometry(2.0, 1), sphereMat);
    orb2.position.set(-5.0, 10.5, 2);
    contactHub.add(orb2);

    // Floating "@" and "GitHub" rings
    this.contactRing = new THREE.Mesh(
      new THREE.TorusGeometry(3.5, 0.35, 12, 32),
      this.goldMat
    );
    this.contactRing.position.set(0, 8.5, 0);
    this.contactRing.rotation.x = Math.PI / 2;
    contactHub.add(this.contactRing);

    this.scene.add(contactHub);
    this.animatedObjects.push({
      mesh: this.contactRing,
      update: (delta) => {
        this.contactRing.rotation.z += delta * 0.5;
      },
    });

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
