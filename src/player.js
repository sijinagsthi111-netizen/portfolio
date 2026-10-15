/**
 * Player & Vehicle Module
 * Builds the stylized low-poly character on a yellow scooter, handles WASD / Arrow / Scroll / Joystick input,
 * wheel rotation, body banking, and smooth third-person chase camera.
 */

import * as THREE from 'three';
import { audio } from './audio.js';

export class Player {
  constructor(scene, camera, pathCurve) {
    this.scene = scene;
    this.camera = camera;
    this.pathCurve = pathCurve;

    // Movement mode: 'scroll' (default along spline route) or 'free'
    this.controlMode = 'scroll';
    this.scrollProgress = 0.001; // 0 to 1 along pathCurve
    this.autoRide = false;

    // Free roam physics
    this.position = new THREE.Vector3(0, 0.5, 0);
    this.velocity = new THREE.Vector3();
    this.rotation = 0;
    this.speed = 0;
    this.maxSpeed = 16.0;
    this.boostMultiplier = 1.6;
    this.acceleration = 18.0;
    this.friction = 0.88;
    this.turnSpeed = 2.4;
    this.lateralOffset = 0; // sideways offset in scroll mode

    // Camera parameters
    this.cameraOffset = new THREE.Vector3(0, 3.8, 8.5);
    this.cameraTarget = new THREE.Vector3();
    this.orbitYaw = 0;
    this.orbitPitch = 0;
    this.isDraggingCamera = false;

    // Controls state
    this.keys = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      boost: false,
    };
    this.joystickVector = { x: 0, y: 0 };

    this.initModel();
    this.setupInputs();
  }

  initModel() {
    this.group = new THREE.Group();

    // Palette
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
    const redMat = new THREE.MeshStandardMaterial({
      color: 0xEB3B5A,
      roughness: 0.4,
      flatShading: true,
    });
    const skinMat = new THREE.MeshStandardMaterial({
      color: 0xD79A76,
      roughness: 0.6,
      flatShading: true,
    });
    const jacketMat = new THREE.MeshStandardMaterial({
      color: 0x2C3A47,
      roughness: 0.5,
      flatShading: true,
    });
    const pantsMat = new THREE.MeshStandardMaterial({
      color: 0x1E272C,
      roughness: 0.6,
      flatShading: true,
    });
    const hairMat = new THREE.MeshStandardMaterial({
      color: 0x181818,
      roughness: 0.9,
      flatShading: true,
    });
    const lightMat = new THREE.MeshBasicMaterial({ color: 0xFFF9E6 });

    // --- SCOOTER BODY ---
    this.scooter = new THREE.Group();

    // Foot deck
    const deckGeo = new THREE.BoxGeometry(0.7, 0.14, 1.6);
    const deck = new THREE.Mesh(deckGeo, yellowMat);
    deck.position.set(0, 0.35, 0);
    deck.castShadow = true;
    deck.receiveShadow = true;
    this.scooter.add(deck);

    // Front apron / shield
    const shieldGeo = new THREE.BoxGeometry(0.65, 0.9, 0.18);
    const shield = new THREE.Mesh(shieldGeo, yellowMat);
    shield.position.set(0, 0.85, 0.75);
    shield.rotation.x = -0.15;
    shield.castShadow = true;
    this.scooter.add(shield);

    // Headlight
    const headlightGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.1, 12);
    const headlight = new THREE.Mesh(headlightGeo, lightMat);
    headlight.rotation.x = Math.PI / 2;
    headlight.position.set(0, 1.25, 0.85);
    this.scooter.add(headlight);

    // Headlight beam (spotlight)
    this.headlightBeam = new THREE.SpotLight(0xFFF2D6, 2.5, 25, Math.PI / 6, 0.5, 1.5);
    this.headlightBeam.position.set(0, 1.25, 0.9);
    this.headlightBeamTarget = new THREE.Object3D();
    this.headlightBeamTarget.position.set(0, 0.5, 6);
    this.scooter.add(this.headlightBeamTarget);
    this.headlightBeam.target = this.headlightBeamTarget;
    this.scooter.add(this.headlightBeam);

    // Seat
    const seatGeo = new THREE.BoxGeometry(0.5, 0.18, 0.75);
    const seat = new THREE.Mesh(seatGeo, blackMat);
    seat.position.set(0, 0.72, -0.3);
    seat.castShadow = true;
    this.scooter.add(seat);

    // Rear engine cover / fender
    const rearGeo = new THREE.BoxGeometry(0.6, 0.5, 0.8);
    const rear = new THREE.Mesh(rearGeo, yellowMat);
    rear.position.set(0, 0.5, -0.5);
    rear.castShadow = true;
    this.scooter.add(rear);

    // Tail light
    const taillightGeo = new THREE.BoxGeometry(0.2, 0.08, 0.05);
    const taillight = new THREE.Mesh(taillightGeo, redMat);
    taillight.position.set(0, 0.65, -0.92);
    this.scooter.add(taillight);

    // Front fork & Handlebars (can rotate with steering)
    this.forkGroup = new THREE.Group();
    this.forkGroup.position.set(0, 0.4, 0.8);

    const stemGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.0, 8);
    const stem = new THREE.Mesh(stemGeo, chromeMat);
    stem.position.set(0, 0.55, 0);
    this.forkGroup.add(stem);

    const barGeo = new THREE.BoxGeometry(0.9, 0.05, 0.05);
    const bar = new THREE.Mesh(barGeo, chromeMat);
    bar.position.set(0, 1.05, 0);
    this.forkGroup.add(bar);

    // Grips
    const gripGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.16, 8);
    gripGeo.rotateZ(Math.PI / 2);
    const leftGrip = new THREE.Mesh(gripGeo, blackMat);
    leftGrip.position.set(-0.4, 1.05, 0);
    const rightGrip = new THREE.Mesh(gripGeo, blackMat);
    rightGrip.position.set(0.4, 1.05, 0);
    this.forkGroup.add(leftGrip);
    this.forkGroup.add(rightGrip);

    // Front Wheel
    const wheelGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.14, 16);
    wheelGeo.rotateZ(Math.PI / 2);
    this.frontWheel = new THREE.Mesh(wheelGeo, blackMat);
    this.frontWheel.position.set(0, -0.1, 0);
    this.frontWheel.castShadow = true;
    this.forkGroup.add(this.frontWheel);

    this.scooter.add(this.forkGroup);

    // Rear Wheel
    this.rearWheel = new THREE.Mesh(wheelGeo, blackMat);
    this.rearWheel.position.set(0, 0.28, -0.6);
    this.rearWheel.castShadow = true;
    this.scooter.add(this.rearWheel);

    this.group.add(this.scooter);

    // --- CHARACTER ON SCOOTER ---
    this.character = new THREE.Group();
    this.character.position.set(0, 0.75, -0.2);

    // Torso / Jacket
    const torsoGeo = new THREE.BoxGeometry(0.48, 0.65, 0.35);
    const torso = new THREE.Mesh(torsoGeo, jacketMat);
    torso.position.set(0, 0.45, 0);
    torso.rotation.x = 0.1; // leaning slightly forward
    torso.castShadow = true;
    this.character.add(torso);

    // Head
    const headGeo = new THREE.BoxGeometry(0.32, 0.35, 0.32);
    const head = new THREE.Mesh(headGeo, skinMat);
    head.position.set(0, 0.95, 0.05);
    head.castShadow = true;
    this.character.add(head);

    // Short dark curly hair clusters
    const hairGroup = new THREE.Group();
    const curlGeo = new THREE.SphereGeometry(0.1, 6, 6);
    const hairPositions = [
      [0, 1.15, 0.05], [0.12, 1.12, 0.05], [-0.12, 1.12, 0.05],
      [0, 1.12, -0.1], [0.12, 1.08, -0.08], [-0.12, 1.08, -0.08],
      [0.15, 1.0, 0.0], [-0.15, 1.0, 0.0], [0, 1.15, 0.12]
    ];
    hairPositions.forEach((pos) => {
      const curl = new THREE.Mesh(curlGeo, hairMat);
      curl.position.set(...pos);
      hairGroup.add(curl);
    });
    this.character.add(hairGroup);

    // Arms reaching for handlebars
    const armGeo = new THREE.BoxGeometry(0.12, 0.5, 0.12);
    const leftArm = new THREE.Mesh(armGeo, jacketMat);
    leftArm.position.set(-0.3, 0.45, 0.35);
    leftArm.rotation.x = -0.8;
    leftArm.rotation.z = -0.15;
    leftArm.castShadow = true;
    this.character.add(leftArm);

    const rightArm = new THREE.Mesh(armGeo, jacketMat);
    rightArm.position.set(0.3, 0.45, 0.35);
    rightArm.rotation.x = -0.8;
    rightArm.rotation.z = 0.15;
    rightArm.castShadow = true;
    this.character.add(rightArm);

    // Legs sitting on scooter
    const legGeo = new THREE.BoxGeometry(0.16, 0.45, 0.16);
    const leftLeg = new THREE.Mesh(legGeo, pantsMat);
    leftLeg.position.set(-0.2, 0.05, 0.25);
    leftLeg.rotation.x = -0.5;
    this.character.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeo, pantsMat);
    rightLeg.position.set(0.2, 0.05, 0.25);
    rightLeg.rotation.x = -0.5;
    this.character.add(rightLeg);

    this.group.add(this.character);
    this.scene.add(this.group);
  }

  /**
   * Slot for loading user-provided custom avatar GLB if desired.
   */
  loadCustomAvatar(glbUrl) {
    console.log(`[Player] Ready to swap custom avatar from: ${glbUrl}`);
    // Will be populated if custom GLB is placed in public/models/
  }

  setupInputs() {
    window.addEventListener('keydown', (e) => {
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          this.keys.forward = true;
          break;
        case 'KeyS':
        case 'ArrowDown':
          this.keys.backward = true;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          this.keys.left = true;
          break;
        case 'KeyD':
        case 'ArrowRight':
          this.keys.right = true;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          this.keys.boost = true;
          break;
        case 'Space':
          audio.honk();
          break;
      }
    });

    window.addEventListener('keyup', (e) => {
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          this.keys.forward = false;
          break;
        case 'KeyS':
        case 'ArrowDown':
          this.keys.backward = false;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          this.keys.left = false;
          break;
        case 'KeyD':
        case 'ArrowRight':
          this.keys.right = false;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          this.keys.boost = false;
          break;
      }
    });

    // Mouse drag for camera orbit
    window.addEventListener('mousedown', (e) => {
      if (e.target.tagName === 'CANVAS') {
        this.isDraggingCamera = true;
        this.lastMouseX = e.clientX;
        this.lastMouseY = e.clientY;
      }
    });

    window.addEventListener('mousemove', (e) => {
      if (this.isDraggingCamera) {
        const deltaX = e.clientX - this.lastMouseX;
        const deltaY = e.clientY - this.lastMouseY;
        this.orbitYaw -= deltaX * 0.005;
        this.orbitPitch = Math.max(-0.4, Math.min(0.6, this.orbitPitch + deltaY * 0.003));
        this.lastMouseX = e.clientX;
        this.lastMouseY = e.clientY;
      }
    });

    window.addEventListener('mouseup', () => {
      this.isDraggingCamera = false;
    });

    // Scroll wheel driving (Scroll Mode)
    window.addEventListener('wheel', (e) => {
      const delta = e.deltaY * 0.00035;
      this.scrollProgress = (this.scrollProgress + delta + 1) % 1;
    }, { passive: true });
  }

  setJoystick(vector) {
    this.joystickVector = vector;
    this.keys.forward = vector.y > 0.2;
    this.keys.backward = vector.y < -0.2;
    this.keys.left = vector.x < -0.2;
    this.keys.right = vector.x > 0.2;
  }

  toggleAutoRide() {
    this.autoRide = !this.autoRide;
    return this.autoRide;
  }

  jumpToProgress(progress) {
    this.scrollProgress = Math.max(0, Math.min(0.999, progress));
    if (this.pathCurve) {
      const pt = this.pathCurve.getPointAt(this.scrollProgress);
      this.position.copy(pt);
      this.group.position.copy(pt);
    }
  }

  update(delta) {
    const isMovingForward = this.keys.forward || this.autoRide || (this.joystickVector.y > 0.1);
    const isMovingBackward = this.keys.backward || (this.joystickVector.y < -0.1);
    const isSteeringLeft = this.keys.left || (this.joystickVector.x < -0.1);
    const isSteeringRight = this.keys.right || (this.joystickVector.x > 0.1);
    const isBoosting = this.keys.boost;

    // SCROLL MODE UPDATE
    if (this.controlMode === 'scroll' && this.pathCurve) {
      let speedIncrement = 0;
      if (this.autoRide) {
        speedIncrement = 0.04 * delta;
      } else if (isMovingForward) {
        speedIncrement = (isBoosting ? 0.08 : 0.05) * delta;
      } else if (isMovingBackward) {
        speedIncrement = -0.04 * delta;
      }

      this.scrollProgress = (this.scrollProgress + speedIncrement + 1) % 1;

      // Calculate position & tangent on path
      const pathPoint = this.pathCurve.getPointAt(this.scrollProgress);
      const tangent = this.pathCurve.getTangentAt(this.scrollProgress).normalize();

      // Sideways offset with A/D
      if (isSteeringLeft) {
        this.lateralOffset = Math.max(-2.5, this.lateralOffset - 3.0 * delta);
      } else if (isSteeringRight) {
        this.lateralOffset = Math.min(2.5, this.lateralOffset + 3.0 * delta);
      } else {
        this.lateralOffset *= 0.94; // recenter smoothly
      }

      const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
      this.position.copy(pathPoint).addScaledVector(normal, this.lateralOffset);
      this.group.position.copy(this.position);

      // Align group rotation with path tangent
      const targetAngle = Math.atan2(tangent.x, tangent.z);
      this.group.rotation.y = targetAngle;

      // Handlebar steering rotation & body bank
      const targetSteer = (isSteeringLeft ? 0.35 : isSteeringRight ? -0.35 : 0);
      this.forkGroup.rotation.y = THREE.MathUtils.lerp(this.forkGroup.rotation.y, targetSteer, 0.2);
      this.scooter.rotation.z = THREE.MathUtils.lerp(this.scooter.rotation.z, -targetSteer * 0.4, 0.15);

      this.speed = Math.abs(speedIncrement) * 150;
    } else {
      // FREE ROAM MODE UPDATE
      if (isMovingForward) {
        const boost = isBoosting ? this.boostMultiplier : 1.0;
        this.speed = Math.min(this.maxSpeed * boost, this.speed + this.acceleration * delta);
      } else if (isMovingBackward) {
        this.speed = Math.max(-this.maxSpeed * 0.5, this.speed - this.acceleration * delta);
      } else {
        this.speed *= this.friction;
      }

      if (isSteeringLeft) {
        this.rotation += this.turnSpeed * delta * (this.speed >= 0 ? 1 : -1);
        this.forkGroup.rotation.y = THREE.MathUtils.lerp(this.forkGroup.rotation.y, 0.45, 0.2);
        this.scooter.rotation.z = THREE.MathUtils.lerp(this.scooter.rotation.z, -0.15, 0.15);
      } else if (isSteeringRight) {
        this.rotation -= this.turnSpeed * delta * (this.speed >= 0 ? 1 : -1);
        this.forkGroup.rotation.y = THREE.MathUtils.lerp(this.forkGroup.rotation.y, -0.45, 0.2);
        this.scooter.rotation.z = THREE.MathUtils.lerp(this.scooter.rotation.z, 0.15, 0.15);
      } else {
        this.forkGroup.rotation.y = THREE.MathUtils.lerp(this.forkGroup.rotation.y, 0, 0.2);
        this.scooter.rotation.z = THREE.MathUtils.lerp(this.scooter.rotation.z, 0, 0.15);
      }

      this.group.rotation.y = this.rotation;
      const forwardDir = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.rotation);
      this.position.addScaledVector(forwardDir, this.speed * delta);
      this.group.position.copy(this.position);
    }

    // Spin wheels with travel speed
    const wheelRotSpeed = this.speed * delta * 5.0;
    this.frontWheel.rotation.x += wheelRotSpeed;
    this.rearWheel.rotation.x += wheelRotSpeed;

    // Update audio engine frequency
    audio.setSpeed(this.speed / this.maxSpeed);

    // Gentle engine idle / ride vibration
    this.character.position.y = 0.75 + Math.sin(Date.now() * 0.015) * 0.012;

    // --- CHASE CAMERA UPDATE ---
    this.updateCamera(delta);
  }

  updateCamera(delta) {
    if (!this.camera) return;

    // Follow offset rotated by vehicle rotation + manual orbit drag
    const currentAngle = this.group.rotation.y + this.orbitYaw;
    const distance = 8.5;
    const height = 4.0 + this.orbitPitch * 3.5;

    const camX = this.position.x - Math.sin(currentAngle) * distance;
    const camZ = this.position.z - Math.cos(currentAngle) * distance;
    const camY = this.position.y + height;

    const targetPos = new THREE.Vector3(camX, camY, camZ);
    this.camera.position.lerp(targetPos, 0.09);

    // Look at player chest
    const lookTarget = new THREE.Vector3(
      this.position.x,
      this.position.y + 1.6,
      this.position.z
    );
    this.camera.lookAt(lookTarget);

    // Damping mouse orbit smoothly back towards forward view when not dragging
    if (!this.isDraggingCamera) {
      this.orbitYaw = THREE.MathUtils.lerp(this.orbitYaw, 0, 0.03);
      this.orbitPitch = THREE.MathUtils.lerp(this.orbitPitch, 0, 0.03);
    }
  }
}
