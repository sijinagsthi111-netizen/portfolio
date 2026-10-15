/**
 * Character Animation Rig & Mixer
 * Creates a THREE.AnimationMixer with procedural KeyframeTracks for:
 * - 'idle': Subtle breathing, relaxed standing or grounded foot rest
 * - 'ride': Tucked driving posture, hands on handlebars, road vibration
 * - 'walk': Natural stride cycle with alternating swinging arms and legs
 */

import * as THREE from 'three';

export class CharacterAnimationRig {
  constructor(characterGroup, scooterGroup, wheels) {
    this.character = characterGroup;
    this.scooter = scooterGroup;
    this.wheels = wheels; // [frontWheel, rearWheel]
    this.isMounted = false;

    this.mixer = new THREE.AnimationMixer(characterGroup);
    this.actions = {};
    this.activeActionName = 'idle';
    this.activeAction = null;

    this.createClips();
  }

  createClips() {
    // -------------------------------------------------------------
    // 1. IDLE CLIP (Gentle breathing, weight shift)
    // -------------------------------------------------------------
    const idleTorsoTimes = [0, 1.2, 2.4];
    const idleTorsoPos = [
      0, 0.45, 0,
      0, 0.47, 0,
      0, 0.45, 0,
    ];
    const idleTorsoRot = [
      0.04, 0, 0,
      0.07, 0, 0,
      0.04, 0, 0,
    ];

    const idleArmsTimes = [0, 1.2, 2.4];
    const idleArmLeftRot = [
      0.05, 0, 0,
      0.08, 0, 0,
      0.05, 0, 0,
    ];
    const idleArmRightRot = [
      0.05, 0, 0,
      0.08, 0, 0,
      0.05, 0, 0,
    ];

    const idleTrackTorsoPos = new THREE.VectorKeyframeTrack('.children[0].position', idleTorsoTimes, idleTorsoPos);
    const idleTrackTorsoRot = new THREE.VectorKeyframeTrack('.children[0].rotation', idleTorsoTimes, idleTorsoRot);
    const idleTrackArmL = new THREE.VectorKeyframeTrack('.children[3].rotation', idleArmsTimes, idleArmLeftRot);
    const idleTrackArmR = new THREE.VectorKeyframeTrack('.children[4].rotation', idleArmsTimes, idleArmRightRot);
    const idleTrackLegL = new THREE.VectorKeyframeTrack('.children[5].rotation', [0, 2.4], [0, 0, 0, 0, 0, 0]);
    const idleTrackLegR = new THREE.VectorKeyframeTrack('.children[6].rotation', [0, 2.4], [0, 0, 0, 0, 0, 0]);

    const idleClip = new THREE.AnimationClip('idle', 2.4, [
      idleTrackTorsoPos,
      idleTrackTorsoRot,
      idleTrackArmL,
      idleTrackArmR,
      idleTrackLegL,
      idleTrackLegR,
    ]);
    this.actions.idle = this.mixer.clipAction(idleClip);
    this.actions.idle.setEffectiveWeight(1.0);
    this.actions.idle.play();
    this.activeAction = this.actions.idle;

    // -------------------------------------------------------------
    // 2. RIDE CLIP (Forward lean, road vibration, hands on handlebar)
    // -------------------------------------------------------------
    const rideTorsoTimes = [0, 0.25, 0.5, 0.75, 1.0];
    const rideTorsoPos = [
      0, 0.43, 0.05,
      0, 0.45, 0.05,
      0, 0.43, 0.05,
      0, 0.45, 0.05,
      0, 0.43, 0.05,
    ];
    const rideTorsoRot = [
      0.18, 0, 0,
      0.22, 0, 0,
      0.18, 0, 0,
      0.22, 0, 0,
      0.18, 0, 0,
    ];

    const rideArmRot = [-0.85, 0, 0, -0.85, 0, 0];
    const rideLegRot = [-0.55, 0, 0, -0.55, 0, 0];

    const rideTrackTorsoPos = new THREE.VectorKeyframeTrack('.children[0].position', rideTorsoTimes, rideTorsoPos);
    const rideTrackTorsoRot = new THREE.VectorKeyframeTrack('.children[0].rotation', rideTorsoTimes, rideTorsoRot);
    const rideTrackArmL = new THREE.VectorKeyframeTrack('.children[3].rotation', [0, 1.0], rideArmRot);
    const rideTrackArmR = new THREE.VectorKeyframeTrack('.children[4].rotation', [0, 1.0], rideArmRot);
    const rideTrackLegL = new THREE.VectorKeyframeTrack('.children[5].rotation', [0, 1.0], rideLegRot);
    const rideTrackLegR = new THREE.VectorKeyframeTrack('.children[6].rotation', [0, 1.0], rideLegRot);

    const rideClip = new THREE.AnimationClip('ride', 1.0, [
      rideTrackTorsoPos,
      rideTrackTorsoRot,
      rideTrackArmL,
      rideTrackArmR,
      rideTrackLegL,
      rideTrackLegR,
    ]);
    this.actions.ride = this.mixer.clipAction(rideClip);
    this.actions.ride.setEffectiveWeight(0.0);
    this.actions.ride.play();

    // -------------------------------------------------------------
    // 3. WALK CLIP (Alternating stride: arms and legs swinging)
    // -------------------------------------------------------------
    const walkTimes = [0, 0.25, 0.5, 0.75, 1.0];
    const walkTorsoPos = [
      0, 0.44, 0.02,
      0, 0.48, 0.02,
      0, 0.44, 0.02,
      0, 0.48, 0.02,
      0, 0.44, 0.02,
    ];
    const walkArmL = [
      -0.45, 0, 0,
       0.0,  0, 0,
       0.45, 0, 0,
       0.0,  0, 0,
      -0.45, 0, 0,
    ];
    const walkArmR = [
       0.45, 0, 0,
       0.0,  0, 0,
      -0.45, 0, 0,
       0.0,  0, 0,
       0.45, 0, 0,
    ];
    const walkLegL = [
       0.55, 0, 0,
       0.0,  0, 0,
      -0.55, 0, 0,
       0.0,  0, 0,
       0.55, 0, 0,
    ];
    const walkLegR = [
      -0.55, 0, 0,
       0.0,  0, 0,
       0.55, 0, 0,
       0.0,  0, 0,
      -0.55, 0, 0,
    ];

    const walkTrackTorsoPos = new THREE.VectorKeyframeTrack('.children[0].position', walkTimes, walkTorsoPos);
    const walkTrackArmL = new THREE.VectorKeyframeTrack('.children[3].rotation', walkTimes, walkArmL);
    const walkTrackArmR = new THREE.VectorKeyframeTrack('.children[4].rotation', walkTimes, walkArmR);
    const walkTrackLegL = new THREE.VectorKeyframeTrack('.children[5].rotation', walkTimes, walkLegL);
    const walkTrackLegR = new THREE.VectorKeyframeTrack('.children[6].rotation', walkTimes, walkLegR);

    const walkClip = new THREE.AnimationClip('walk', 1.0, [
      walkTrackTorsoPos,
      walkTrackArmL,
      walkTrackArmR,
      walkTrackLegL,
      walkTrackLegR,
    ]);
    this.actions.walk = this.mixer.clipAction(walkClip);
    this.actions.walk.setEffectiveWeight(0.0);
    this.actions.walk.play();
  }

  setMounted(mounted) {
    this.isMounted = mounted;
  }

  update(delta, speed, normalizedSpeed, isMounted = false) {
    this.isMounted = isMounted;

    // Cross-fade animation weights based on movement speed and mounting
    const isMoving = normalizedSpeed > 0.08 || Math.abs(speed) > 1.2;
    const isFast = normalizedSpeed > 0.32 || Math.abs(speed) > 4.0;

    let targetActionName = 'idle';
    if (isMoving) {
      if (this.isMounted) {
        targetActionName = isFast ? 'ride' : 'walk';
      } else {
        targetActionName = 'walk';
      }
    } else {
      targetActionName = 'idle';
    }

    if (this.activeActionName !== targetActionName) {
      const prevAction = this.actions[this.activeActionName];
      const nextAction = this.actions[targetActionName];

      if (prevAction && nextAction) {
        nextAction.reset();
        nextAction.enabled = true;
        nextAction.setEffectiveTimeScale(Math.max(0.6, normalizedSpeed * 2.2));
        nextAction.crossFadeFrom(prevAction, 0.2, true);
        this.activeActionName = targetActionName;
        this.activeAction = nextAction;
      }
    } else if (this.activeAction) {
      // Modulate playback rate with physical movement speed
      if (this.activeActionName === 'ride' || this.activeActionName === 'walk') {
        this.activeAction.setEffectiveTimeScale(Math.max(0.6, normalizedSpeed * 2.5));
      }
    }

    // Update animation mixer
    this.mixer.update(delta);

    // Spin wheels proportional to physical velocity when mounted
    if (this.wheels && this.isMounted && Math.abs(speed) > 0.001) {
      const wheelDelta = speed * delta * 8.5;
      this.wheels.forEach((w) => {
        if (w) w.rotation.x += wheelDelta;
      });
    }
  }

  getDebugInfo() {
    return {
      activeAction: this.activeActionName,
      mixerTime: this.mixer.time.toFixed(2),
      isMounted: this.isMounted,
    };
  }
}
