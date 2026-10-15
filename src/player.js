/**
 * Player & Vehicle Module
 * Implements ONE unified input pipeline (wheel, touch, keys, joystick) driving targetProgress,
 * smoothed with exponential damping, AnimationMixer cross-fading, and chase camera.
 */

import * as THREE from 'three';
import { audio } from './audio.js';
import { CharacterAnimationRig } from './animation.js';

export class Player {
  constructor(scene, camera, pathCurve) {
    this.scene = scene;
    this.camera = camera;
    this.pathCurve = pathCurve;

    // --- UNIFIED ROUTE PROGRESS & DAMPING ---
    this.progress = 0.001;        // Current smoothed progress (0 to 1)
    this.targetProgress = 0.001;  // Target progress driven by wheel, touch, keys
    this.speed = 0;               // Derived instantaneous speed
    this.normalizedSpeed = 0;     // 0 to 1 for animations and sound
    this.lateralOffset = 0;       // Sideways steering offset (-2.5 to 2.5)
    this.targetLateralOffset = 0;

    // Movement options
    this.controlMode = 'scroll';
    this.autoRide = false;
    this.isFacingForward = true;
    this.isMounted = false;

    // Position & Rotation in World space
    this.position = new THREE.Vector3(0, 0.5, 0);
    this.targetPosition = new THREE.Vector3(0, 0.5, 0);
    this.rotation = 0;

    // Camera parameters
    this.cameraOffset = new THREE.Vector3(0, 3.8, 8.5);
    this.cameraTarget = new THREE.Vector3();
    this.orbitYaw = 0;
    this.orbitPitch = 0;
    this.isDraggingCamera = false;

    // Input state
    this.keys = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      boost: false,
    };
    this.joystickVector = { x: 0, y: 0 };

    this.initModel();
    this.setupUnifiedInput();
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

    // Front apron
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

    // Headlight spotlight beam
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

    // Rear engine cover
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

    // Front fork & Handlebars
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
    this.scooter.visible = false; // Starts on foot at Spawn Plaza

    // --- CHARACTER MODEL ---
    this.character = new THREE.Group();
    this.character.position.set(0, 0.46, 0); // On foot height

    // Torso / Jacket (child 0)
    const torsoGeo = new THREE.BoxGeometry(0.48, 0.65, 0.35);
    const torso = new THREE.Mesh(torsoGeo, jacketMat);
    torso.position.set(0, 0.45, 0);
    torso.rotation.x = 0.05;
    torso.castShadow = true;
    this.character.add(torso);

    // Head (child 1)
    const headGeo = new THREE.BoxGeometry(0.32, 0.35, 0.32);
    const head = new THREE.Mesh(headGeo, skinMat);
    head.position.set(0, 0.95, 0.05);
    head.castShadow = true;
    this.character.add(head);

    // Hair (child 2)
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

    // Arms with shoulder pivot (child 3 & 4)
    const armGeo = new THREE.BoxGeometry(0.12, 0.48, 0.12);
    armGeo.translate(0, -0.22, 0); // pivot at shoulder

    const leftArm = new THREE.Mesh(armGeo, jacketMat);
    leftArm.position.set(-0.3, 0.7, 0);
    leftArm.castShadow = true;
    this.character.add(leftArm);

    const rightArm = new THREE.Mesh(armGeo, jacketMat);
    rightArm.position.set(0.3, 0.7, 0);
    rightArm.castShadow = true;
    this.character.add(rightArm);

    // Legs with hip pivot (child 5 & 6)
    const legGeo = new THREE.BoxGeometry(0.16, 0.46, 0.16);
    legGeo.translate(0, -0.21, 0); // pivot at hip

    const leftLeg = new THREE.Mesh(legGeo, pantsMat);
    leftLeg.position.set(-0.16, 0.22, 0);
    this.character.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeo, pantsMat);
    rightLeg.position.set(0.16, 0.22, 0);
    this.character.add(rightLeg);

    this.group.add(this.character);
    this.scene.add(this.group);

    // Initialize the Animation Rig & Mixer
    this.animationRig = new CharacterAnimationRig(
      this.character,
      this.scooter,
      [this.frontWheel, this.rearWheel]
    );
  }

  setupUnifiedInput() {
    // 1. NORMALIZE WHEEL INPUT
    window.addEventListener('wheel', (e) => {
      // Normalize wheel delta across pixel, line, and page scroll modes
      let pixelDelta = e.deltaY;
      if (e.deltaMode === 1) {
        // DOM_DELTA_LINE
        pixelDelta *= 28;
      } else if (e.deltaMode === 2) {
        // DOM_DELTA_PAGE
        pixelDelta *= 400;
      }

      // Scroll down = forward (positive), scroll up = backward (negative)
      const increment = pixelDelta * 0.00032;
      this.targetProgress = (this.targetProgress + increment + 1) % 1;
    }, { passive: true });

    // 2. KEYBOARD CONTROLS
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

    // 3. TOUCH DRAG FOR SCROLL & CAMERA
    let touchStartY = 0;
    let touchStartX = 0;
    let isTouchActive = false;

    window.addEventListener('touchstart', (e) => {
      if (e.target.closest('#menu-panel') || e.target.closest('#simple-version-modal') || e.target.closest('#joystick-base')) {
        return;
      }
      if (e.touches.length === 1) {
        isTouchActive = true;
        touchStartY = e.touches[0].clientY;
        touchStartX = e.touches[0].clientX;
      }
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (!isTouchActive || e.touches.length === 0) return;
      const currentY = e.touches[0].clientY;
      const deltaY = touchStartY - currentY; // Swipe up = drive forward
      touchStartY = currentY;

      const increment = deltaY * 0.0012;
      this.targetProgress = (this.targetProgress + increment + 1) % 1;
    }, { passive: true });

    window.addEventListener('touchend', () => {
      isTouchActive = false;
    }, { passive: true });

    // 4. MOUSE DRAG FOR CAMERA ORBIT
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

  jumpToProgress(prog) {
    this.targetProgress = Math.max(0, Math.min(0.999, prog));
    this.progress = this.targetProgress;
    if (this.pathCurve) {
      const pt = this.pathCurve.getPointAt(this.progress);
      this.position.copy(pt);
      this.group.position.copy(pt);
    }
  }

  update(delta) {
    // 0. Update mounted status (rides scooter between Stop 2 Archway and Stop 9 Gallery)
    const shouldBeMounted = (this.progress >= 0.075 && this.progress < 0.88);
    if (this.isMounted !== shouldBeMounted) {
      this.isMounted = shouldBeMounted;
      this.scooter.visible = this.isMounted;
      if (this.isMounted) {
        this.character.position.set(0, 0.75, -0.2);
      } else {
        this.character.position.set(0, 0.46, 0);
      }
      this.animationRig.setMounted(this.isMounted);
    }

    // 1. Process keys / auto-ride into targetProgress
    const isForward = this.keys.forward || this.autoRide || (this.joystickVector.y > 0.1);
    const isBackward = this.keys.backward || (this.joystickVector.y < -0.1);
    const isBoost = this.keys.boost;
    const isLeft = this.keys.left || (this.joystickVector.x < -0.1);
    const isRight = this.keys.right || (this.joystickVector.x > 0.1);

    const baseKeySpeed = isBoost ? 0.08 : 0.045;
    if (isForward) {
      this.targetProgress = (this.targetProgress + baseKeySpeed * delta + 1) % 1;
    } else if (isBackward) {
      this.targetProgress = (this.targetProgress - (baseKeySpeed * 0.7) * delta + 1) % 1;
    }

    // 2. Exponential Damping: progress smoothly chases targetProgress
    // Handle wrap-around distance for shortest angular path
    let diff = this.targetProgress - this.progress;
    if (diff > 0.5) diff -= 1.0;
    if (diff < -0.5) diff += 1.0;

    // Epsilon deadband: snaps when within threshold to eliminate micro-creeping at damping tail
    if (Math.abs(diff) < 0.005) {
      this.progress = this.targetProgress;
      diff = 0;
    }

    const dampingFactor = 1.0 - Math.exp(-8.0 * delta);
    this.progress = (this.progress + diff * dampingFactor + 1.0) % 1.0;

    // 3. Derive Instantaneous Speed
    const rawStep = Math.abs(diff * dampingFactor);
    this.speed = (diff === 0) ? 0 : (rawStep / Math.max(delta, 0.001) * 140.0);
    this.normalizedSpeed = Math.min(1.0, this.speed / 12.0);

    // Direction (moving forward or reversing)
    if (Math.abs(diff) > 0.0001) {
      this.isFacingForward = diff >= 0;
    }

    // 4. Update Path Position & Tangent
    if (this.pathCurve) {
      const pathPoint = this.pathCurve.getPointAt(this.progress);
      const tangent = this.pathCurve.getTangentAt(this.progress).normalize();

      // Sideways steering offset with A/D
      if (isLeft) {
        this.targetLateralOffset = Math.max(-2.5, this.targetLateralOffset - 4.0 * delta);
      } else if (isRight) {
        this.targetLateralOffset = Math.min(2.5, this.targetLateralOffset + 4.0 * delta);
      } else {
        this.targetLateralOffset *= Math.exp(-4.0 * delta); // return to center
      }
      this.lateralOffset += (this.targetLateralOffset - this.lateralOffset) * dampingFactor;

      const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
      this.position.copy(pathPoint).addScaledVector(normal, this.lateralOffset);
      this.group.position.copy(this.position);

      // Facing angle (tangent or reversed if backward)
      const moveAngle = Math.atan2(tangent.x, tangent.z);
      const finalAngle = this.isFacingForward ? moveAngle : moveAngle + Math.PI;

      // Smooth rotation interpolation
      let angleDiff = finalAngle - this.group.rotation.y;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
      this.group.rotation.y += angleDiff * (1.0 - Math.exp(-8.0 * delta));

      // Handlebar steering rotation & dynamic banking (when mounted)
      const targetSteer = (isLeft ? 0.35 : isRight ? -0.35 : 0);
      this.forkGroup.rotation.y = THREE.MathUtils.lerp(this.forkGroup.rotation.y, targetSteer, 0.2);
      this.scooter.rotation.z = THREE.MathUtils.lerp(this.scooter.rotation.z, -targetSteer * 0.45, 0.15);
    }

    // 5. Update Animation Rig & Mixer (idle, walk, ride cross-fade)
    if (this.animationRig) {
      const signedSpeed = this.isFacingForward ? this.speed : -this.speed;
      this.animationRig.update(delta, signedSpeed, this.normalizedSpeed, this.isMounted);
    }

    // 6. Audio Engine Modulation
    audio.setSpeed(this.normalizedSpeed);

    // 7. Update Third-Person Chase Camera
    this.updateCamera(delta);
  }

  updateCamera(delta) {
    if (!this.camera) return;

    // Follow offset behind the vehicle's/character's direction
    const currentAngle = this.group.rotation.y + this.orbitYaw;
    const distance = this.isMounted ? 8.5 : 6.2;
    const baseHeight = this.isMounted ? 4.0 : 2.8;
    const height = baseHeight + this.orbitPitch * (this.isMounted ? 3.5 : 2.5);

    const camX = this.position.x - Math.sin(currentAngle) * distance;
    const camZ = this.position.z - Math.cos(currentAngle) * distance;
    const camY = this.position.y + height;

    const targetPos = new THREE.Vector3(camX, camY, camZ);
    this.camera.position.lerp(targetPos, 1.0 - Math.exp(-6.5 * delta));

    // Look at player chest
    const lookTarget = new THREE.Vector3(
      this.position.x,
      this.position.y + (this.isMounted ? 1.6 : 1.1),
      this.position.z
    );
    this.camera.lookAt(lookTarget);

    // Smooth return from orbit drag
    if (!this.isDraggingCamera) {
      this.orbitYaw = THREE.MathUtils.lerp(this.orbitYaw, 0, 0.04);
      this.orbitPitch = THREE.MathUtils.lerp(this.orbitPitch, 0, 0.04);
    }
  }

  getDebugStats() {
    return {
      progress: this.progress.toFixed(4),
      targetProgress: this.targetProgress.toFixed(4),
      speed: this.speed.toFixed(2),
      normalizedSpeed: this.normalizedSpeed.toFixed(2),
      animation: this.animationRig ? this.animationRig.activeActionName : 'none',
      mixerTime: this.animationRig ? this.animationRig.mixer.time.toFixed(2) : '0',
    };
  }
}
