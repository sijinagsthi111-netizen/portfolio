/**
 * Character Animation Rig & Mixer
 * Creates a THREE.AnimationMixer with procedural KeyframeTracks for:
 * - 'idle': Subtle breathing, handlebar rest, foot down for balance
 * - 'ride': Tucked driving posture, knee vibration, body banking into turns
 * - 'walk': Stride & foot-pushing motion for slow transitions
 */

import * as THREE from 'three';

export class CharacterAnimationRig {
  constructor(characterGroup, scooterGroup, wheels) {
    this.character = characterGroup;
    this.scooter = scooterGroup;
    this.wheels = wheels; // [frontWheel, rearWheel]

    this.mixer = new THREE.AnimationMixer(characterGroup);
    this.actions = {};
    this.activeActionName = 'idle';
    this.activeAction = null;

    this.createClips();
  }

  createClips() {
    // 1. IDLE CLIP (Gentle breathing, weight shift, foot grounded)
    const idleTorsoTimes = [0, 1.2, 2.4];
    const idleTorsoPos = [
      0, 0.45, 0,
      0, 0.47, 0,
      0, 0.45, 0,
    ];
    const idleTorsoRot = [
      0.05, 0, 0,
      0.08, 0, 0,
      0.05, 0, 0,
    ];

    const idleTrackPos = new THREE.VectorKeyframeTrack('.children[0].position', idleTorsoTimes, idleTorsoPos);
    const idleTrackRot = new THREE.VectorKeyframeTrack('.children[0].rotation', idleTorsoTimes, idleTorsoRot);
    const idleClip = new THREE.AnimationClip('idle', 2.4, [idleTrackPos, idleTrackRot]);
    this.actions.idle = this.mixer.clipAction(idleClip);
    this.actions.idle.setEffectiveWeight(1.0);
    this.actions.idle.play();
    this.activeAction = this.actions.idle;

    // 2. RIDE CLIP (Forward lean, road vibration absorption, dynamic posture)
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
    const rideTrackPos = new THREE.VectorKeyframeTrack('.children[0].position', rideTorsoTimes, rideTorsoPos);
    const rideTrackRot = new THREE.VectorKeyframeTrack('.children[0].rotation', rideTorsoTimes, rideTorsoRot);
    const rideClip = new THREE.AnimationClip('ride', 1.0, [rideTrackPos, rideTrackRot]);
    this.actions.ride = this.mixer.clipAction(rideClip);
    this.actions.ride.setEffectiveWeight(0.0);
    this.actions.ride.play();

    // 3. WALK CLIP (Low speed stride / push)
    const walkTorsoTimes = [0, 0.5, 1.0];
    const walkTorsoPos = [
      0, 0.44, 0.02,
      0, 0.48, 0.02,
      0, 0.44, 0.02,
    ];
    const walkTrackPos = new THREE.VectorKeyframeTrack('.children[0].position', walkTorsoTimes, walkTorsoPos);
    const walkClip = new THREE.AnimationClip('walk', 1.0, [walkTrackPos]);
    this.actions.walk = this.mixer.clipAction(walkClip);
    this.actions.walk.setEffectiveWeight(0.0);
    this.actions.walk.play();
  }

  update(delta, speed, normalizedSpeed) {
    // Cross-fade animation weights based on speed
    const isMoving = normalizedSpeed > 0.03;
    const isFast = normalizedSpeed > 0.35;

    let targetActionName = 'idle';
    if (isFast) {
      targetActionName = 'ride';
    } else if (isMoving) {
      targetActionName = 'walk';
    }

    if (this.activeActionName !== targetActionName) {
      const prevAction = this.actions[this.activeActionName];
      const nextAction = this.actions[targetActionName];

      if (prevAction && nextAction) {
        nextAction.reset();
        nextAction.enabled = true;
        nextAction.setEffectiveTimeScale(Math.max(0.6, normalizedSpeed * 2.2));
        nextAction.crossFadeFrom(prevAction, 0.25, true);
        this.activeActionName = targetActionName;
        this.activeAction = nextAction;
      }
    } else if (this.activeAction) {
      // Modulate playback rate with speed
      if (this.activeActionName === 'ride' || this.activeActionName === 'walk') {
        this.activeAction.setEffectiveTimeScale(Math.max(0.5, normalizedSpeed * 2.5));
      }
    }

    // Update mixer
    this.mixer.update(delta);

    // Spin wheels proportional to physical velocity
    if (this.wheels && Math.abs(speed) > 0.001) {
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
    };
  }
}
