import * as THREE from 'three';

const clamp = THREE.MathUtils.clamp;
const mix = THREE.MathUtils.lerp;

export const DIVINE_NAMES = new Set([
  'Jesus Cristo',
  'Senhor',
  'Deus, o Pai',
]);

export const HEAVENLY_MESSENGER_NAMES = new Set([
  'Anjo',
  'Anjo do Senhor',
  'Anjo fortalecedor',
  'Anjo querubim',
  'Gabriel',
  'Homem de branco',
  'Dois mensageiros de branco',
  'Quarta figura',
]);

export const CRUCIFIXION_MARK_SCENES = new Set([
  'B30', 'B31', 'B32',
  'M16', 'M17', 'M18',
  'D05', 'D07', 'D09', 'D10',
  'P09',
]);

const SOLEMN_SORROW_SCENES = new Set(['B29', 'B30']);
const WEEPING_TO_JOY_SCENES = new Set(['B26', 'B31', 'M17']);
const AWE_VISION_SCENES = new Set([
  'B04', 'B05', 'B10', 'B12', 'B14', 'B15', 'B17', 'B19', 'B22', 'B32',
  'M02', 'M10', 'M15', 'M16', 'M18', 'M19',
  'D01', 'D02', 'D05', 'D07', 'D10',
  'P01', 'P03', 'P05', 'P06', 'P08', 'P09', 'P10',
]);
const JOYFUL_SCENES = new Set([
  'B02', 'B03', 'B08', 'B15', 'B17', 'B21', 'B23', 'B24', 'B27',
  'M04', 'M05', 'M07', 'M09', 'M11', 'M18',
  'D03', 'D04', 'D09',
  'P02', 'P06',
]);

/**
 * Normalizes appearance options for Jesus Christ, God the Father, and heavenly
 * messengers so that Deity has a serene, welcoming, consistent visual identity
 * across all four scripture canons with soft luminous white robes.
 */
export function resolveFigureStyling(sceneId, name, options = {}) {
  const isChrist = name === 'Jesus Cristo' || name === 'Senhor' || options.divine === 'christ';
  const isFather = name === 'Deus, o Pai' || options.divine === 'father';
  const isMessenger = HEAVENLY_MESSENGER_NAMES.has(name) ||
    ((name === 'Morôni' || name === 'João Batista') && sceneId !== 'M20');

  const styled = { ...options };
  if (isChrist) {
    styled.skin = options.skin || '#cfa07d';
    styled.hair = options.hair || '#5c3b28';
    styled.robe = options.robe || '#f5efe2';
    styled.beard = options.beard !== false;
    styled.heavenlyGlow = options.heavenlyGlow ?? true;
    styled.crucifixionMarks = options.crucifixionMarks ?? CRUCIFIXION_MARK_SCENES.has(sceneId);
  } else if (isFather) {
    styled.skin = options.skin || '#cfa07d';
    styled.hair = options.hair || '#efebdc';
    styled.robe = options.robe || '#f7f2e7';
    styled.beard = options.beard !== false;
    styled.heavenlyGlow = options.heavenlyGlow ?? true;
  } else if (isMessenger) {
    styled.robe = options.robe || '#f4eee1';
    styled.heavenlyGlow = options.heavenlyGlow ?? true;
  }

  if (SOLEMN_SORROW_SCENES.has(sceneId) && isChrist && !styled.expression) {
    styled.expression = 'dor';
  }
  return styled;
}

/**
 * Applies a facial expression preset to a clay figure's eyebrows, mouth, eyes,
 * and optional tear drops without allocating any new geometry or materials.
 *
 * Presets:
 * - 'sereno': calm, gentle welcoming expression
 * - 'oracao': bowed brows, calm closed/neutral mouth, gently lowered eyelids
 * - 'reverencia': humble, attentive brow and soft calm mouth
 * - 'tristeza': upward-angled inner brows, inverted/solemn mouth curve (no smile)
 * - 'lagrimas': sorrowful expression with subtle clay tears on the cheeks
 * - 'dor': deep silent suffering/surrender (Gethsemane/Golgotha) with zero smile
 * - 'espanto': raised brows and slightly rounded awestruck mouth
 * - 'alegria': warm lifted brows and fuller gentle smile
 */
export function setExpression(rig, preset = 'sereno', amount = 1, blinkOpenness = 1) {
  const parts = rig?.faceParts;
  if (!parts) return;
  const q = clamp(amount, 0, 1);

  let browTilt = 0;       // positive tilts inner brow up (sad/prayer), negative tilts down
  let browLift = 0;       // vertical offset from .065
  let mouthCurve = 1;     // +1 = gentle smile, 0.15 = neutral line, -0.8 = solemn/sorrow arch
  let mouthWidth = 1;     // horizontal scale
  let eyeOpenFactor = 1;  // multiplier on open eye height
  let showTears = false;

  switch (preset) {
    case 'oracao':
      browTilt = 0.14 * q;
      browLift = -0.004 * q;
      mouthCurve = mix(1, 0.18, q);
      mouthWidth = mix(1, 0.88, q);
      eyeOpenFactor = mix(1, 0.16, q);
      break;
    case 'reverencia':
      browTilt = 0.09 * q;
      browLift = 0.003 * q;
      mouthCurve = mix(1, 0.32, q);
      mouthWidth = mix(1, 0.92, q);
      eyeOpenFactor = mix(1, 0.82, q);
      break;
    case 'tristeza':
      browTilt = 0.24 * q;
      browLift = 0.005 * q;
      mouthCurve = mix(1, -0.65, q);
      mouthWidth = mix(1, 0.90, q);
      eyeOpenFactor = mix(1, 0.68, q);
      break;
    case 'lagrimas':
      browTilt = 0.26 * q;
      browLift = 0.006 * q;
      mouthCurve = mix(1, -0.72, q);
      mouthWidth = mix(1, 0.88, q);
      eyeOpenFactor = mix(1, 0.58, q);
      showTears = q > 0.35;
      break;
    case 'dor':
      browTilt = 0.30 * q;
      browLift = 0.004 * q;
      mouthCurve = mix(1, -0.85, q);
      mouthWidth = mix(1, 0.86, q);
      eyeOpenFactor = mix(1, 0.20, q);
      showTears = q > 0.65 && rig.root.userData.selectable === 'Jesus Cristo' && rig.root.parent?.name === 'B29';
      break;
    case 'espanto':
      browTilt = -0.06 * q;
      browLift = 0.014 * q;
      mouthCurve = mix(1, 0.55, q);
      mouthWidth = mix(1, 0.72, q);
      eyeOpenFactor = mix(1, 1.12, q);
      break;
    case 'alegria':
      browTilt = -0.04 * q;
      browLift = 0.008 * q;
      mouthCurve = mix(1, 1.32, q);
      mouthWidth = mix(1, 1.08, q);
      eyeOpenFactor = 1;
      break;
    case 'sereno':
    default:
      browTilt = 0;
      browLift = 0;
      mouthCurve = 0.75;
      mouthWidth = 0.96;
      eyeOpenFactor = 1;
      break;
  }

  if (parts.browL && parts.browR) {
    parts.browL.position.y = 0.065 + browLift;
    parts.browR.position.y = 0.065 + browLift;
    parts.browL.rotation.z = Math.PI / 2 - 0.07 - browTilt;
    parts.browR.rotation.z = Math.PI / 2 + 0.07 + browTilt;
  }
  if (parts.mouth) {
    parts.mouth.scale.set(mouthWidth, mouthCurve, 1);
  }
  if (parts.tearL && parts.tearR) {
    parts.tearL.visible = showTears;
    parts.tearR.visible = showTears;
  }
  if (parts.animatedEyes?.length) {
    const open = blinkOpenness * eyeOpenFactor;
    for (const { mesh, height } of parts.animatedEyes) {
      mesh.scale.y = height * open;
    }
  }
  rig.root.userData.clayPerson.activeExpression = preset;
}

/**
 * Bends a figure's upper body (head, shoulders, and robe) around the waist
 * pivot (y = 0.55) while keeping feet planted and preserving rest coordinates
 * when pitch === 0 and lean === 0.
 */
export function bendTorso(rig, pitch = 0, lean = 0) {
  if (!rig) return;
  rig.torso = rig.torso || { dirty: false };
  rig.torso.dirty = true;
  const waistY = 0.55;
  const baseHeadY = 1.37;
  const baseArmY = 1.08;
  const headDy = baseHeadY - waistY;
  const armDy = baseArmY - waistY;

  const sinP = Math.sin(pitch), cosP = Math.cos(pitch);
  const sinL = Math.sin(lean), cosL = Math.cos(lean);

  rig.head.position.x = -sinL * headDy;
  rig.head.position.y = waistY + cosP * cosL * headDy;
  rig.head.position.z = sinP * headDy;
  rig.head.rotation.x += pitch * 0.55;
  rig.head.rotation.z += lean * 0.45;

  for (const [side, arm] of [[-1, rig.leftArm], [1, rig.rightArm]]) {
    arm.position.x = side * 0.24 - sinL * armDy;
    arm.position.y = waistY + cosP * cosL * armDy;
    arm.position.z = sinP * armDy;
  }
  rig.robe.rotation.x = pitch * 0.38;
  rig.robe.rotation.z = lean * 0.32;
}

/**
 * Smoothly rotates a figure's head to look toward a target world/scene point
 * (targetX, targetZ, optional targetY), clamped to natural human neck limits.
 */
export function lookAtPoint(rig, targetX, targetZ, amount = 1, targetY = null) {
  if (!rig || amount <= 0) return;
  const dx = targetX - rig.root.position.x;
  const dz = targetZ - rig.root.position.z;
  const distSq = dx * dx + dz * dz;
  if (distSq < 0.04) return;

  const worldAngle = Math.atan2(dx, dz);
  let deltaY = Math.atan2(Math.sin(worldAngle - rig.root.rotation.y), Math.cos(worldAngle - rig.root.rotation.y));
  deltaY = clamp(deltaY, -0.52, 0.52);
  rig.head.rotation.y = mix(rig.head.rotation.y, deltaY, clamp(amount, 0, 1));

  if (targetY !== null) {
    const dist = Math.sqrt(distSq);
    const eyeY = rig.root.position.y + rig.head.position.y * (rig.root.scale.y || 1);
    const pitch = clamp(-Math.atan2(targetY - eyeY, Math.max(dist, 0.4)), -0.38, 0.38);
    rig.head.rotation.x = mix(rig.head.rotation.x, pitch, clamp(amount * 0.65, 0, 1));
  }
}

const SKIP_AUTO_GAZE_SCENES = new Set(['B30', 'D01', 'M05', 'M14', 'M18']);

/**
 * Resets transient acting channels before scene `animations` run so seeking
 * backward or forward is 100% deterministic and never leaks state across frames.
 */
export function resetActingFrame(kit) {
  const people = kit.people;
  if (!people || !people.length) return;
  for (const rig of people) {
    if (!rig.basePose) {
      rig.basePose = {
        headRotX: rig.head.rotation.x,
        headRotY: rig.head.rotation.y,
      };
    }
    if (rig.autoGazeDirty) {
      rig.head.rotation.y = rig.basePose.headRotY;
      rig.autoGazeDirty = false;
    }
    if (rig.torso?.dirty) {
      rig.head.position.set(0, 1.37, 0);
      rig.leftArm.position.set(-0.24, 1.08, 0);
      rig.rightArm.position.set(0.24, 1.08, 0);
      rig.robe.rotation.x = 0;
      rig.robe.rotation.z = 0;
      rig.torso.dirty = false;
    }
  }
}

/**
 * Automatic contextual gaze and expression pass executed AFTER scene `animations`
 * using the current frame's resolved positions, visibilities, and postures.
 */
export function applyContextualExpressions(kit, t, duration = 32) {
  const people = kit.people;
  if (!people || !people.length) return;

  if (people.length >= 2 && !SKIP_AUTO_GAZE_SCENES.has(kit.id)) {
    let focal = people.find(r => r.root.visible && (r.root.userData.selectable === 'Jesus Cristo' || r.root.userData.selectable === 'Senhor')) ||
      people.find(r => r.root.visible && HEAVENLY_MESSENGER_NAMES.has(r.root.userData.selectable)) ||
      people[0];
    if (!focal || !focal.root.visible) focal = people.find(r => r.root.visible) || people[0];

    const fx = focal.root.position.x;
    const fz = focal.root.position.z;

    for (let i = 0; i < people.length; i++) {
      const rig = people[i];
      if (!rig.root.visible || rig.root.userData.clayPerson?.eyesClosed || !rig.basePose) continue;
      // Only apply automatic gaze if the scene animation did not author head.rotation.y
      if (Math.abs(rig.head.rotation.y - rig.basePose.headRotY) > 1e-5) continue;
      if (Math.abs(rig.basePose.headRotY) > 0.01) continue;

      if (rig === focal) {
        const listener = people.find(other => other !== rig && other.root.visible);
        if (listener) {
          rig.head.rotation.y = rig.basePose.headRotY;
          lookAtPoint(rig, listener.root.position.x, listener.root.position.z, 0.22);
          rig.autoGazeDirty = true;
        }
      } else {
        rig.head.rotation.y = rig.basePose.headRotY;
        lookAtPoint(rig, fx, fz, 0.28);
        rig.autoGazeDirty = true;
      }
    }
  }
  const id = kit.id;
  for (const rig of kit.people) {
    if (!rig.faceParts) continue;
    const meta = rig.root.userData.clayPerson;
    if (meta.manualExpressionAt === t) continue;

    const name = rig.root.userData.selectable || '';
    const blinkOpenness = rig.faceParts.lastBlinkOpenness ?? 1;

    // 1. Sensitive solemn scenes (Gethsemane B29 & Golgotha B30) — never smile!
    if (id === 'B29') {
      if (name === 'Jesus Cristo') {
        const strengthened = clamp((t - 20) / 8, 0, 1);
        setExpression(rig, strengthened > 0.6 ? 'oracao' : 'dor', 1, blinkOpenness);
      } else if (name.startsWith('Anjo')) {
        setExpression(rig, 'reverencia', 1, blinkOpenness);
      } else {
        setExpression(rig, 'oracao', 0.85, blinkOpenness);
      }
      continue;
    }
    if (id === 'B30') {
      if (name === 'Jesus Cristo' || name.includes('crucificado')) {
        setExpression(rig, 'dor', 1, blinkOpenness);
      } else if (name.includes('Maria') || name.includes('João')) {
        setExpression(rig, t > 14 ? 'lagrimas' : 'tristeza', 0.95, blinkOpenness);
      } else {
        setExpression(rig, 'reverencia', 0.9, blinkOpenness);
      }
      continue;
    }

    // 2. Detect praying posture from forearm & arm angles
    const isPrayingPose =
      rig.leftForearm.rotation.x < -0.75 &&
      rig.rightForearm.rotation.x < -0.75 &&
      rig.leftArm.rotation.z < -0.25 &&
      rig.rightArm.rotation.z > 0.25;
    if (isPrayingPose) {
      setExpression(rig, 'oracao', 0.95, blinkOpenness);
      continue;
    }

    // 3. Detect kneeling posture
    const isKneeling = rig.leftLeg.rotation.x > 0.5 || rig.leftLeg.rotation.x < -0.5;
    if (isKneeling && DIVINE_NAMES.has(name)) {
      setExpression(rig, id === 'B29' ? 'dor' : 'reverencia', 0.9, blinkOpenness);
      continue;
    }
    if (isKneeling) {
      setExpression(rig, AWE_VISION_SCENES.has(id) && t > 10 ? 'reverencia' : 'oracao', 0.9, blinkOpenness);
      continue;
    }

    // 4. Weeping turning to joy (B31 Mary Magdalene, B26 Lazarus sisters, M17 healed)
    if (WEEPING_TO_JOY_SCENES.has(id) && !DIVINE_NAMES.has(name) && !HEAVENLY_MESSENGER_NAMES.has(name)) {
      if (t < 13) {
        setExpression(rig, 'lagrimas', 0.9, blinkOpenness);
      } else if (t < 19) {
        setExpression(rig, 'espanto', 0.85, blinkOpenness);
      } else {
        setExpression(rig, 'alegria', 0.9, blinkOpenness);
      }
      continue;
    }

    // 5. Divine & Heavenly beings remain serene and welcoming
    if (DIVINE_NAMES.has(name) || HEAVENLY_MESSENGER_NAMES.has(name)) {
      setExpression(rig, t > 18 && JOYFUL_SCENES.has(id) ? 'alegria' : 'sereno', 0.75, blinkOpenness);
      continue;
    }

    // 6. Awe/Reverence during celestial visions and miracles
    if (AWE_VISION_SCENES.has(id) && t >= 8 && t <= 22) {
      setExpression(rig, t < 15 ? 'espanto' : 'reverencia', 0.8, blinkOpenness);
      continue;
    }

    // 7. Joyful endings / reunions
    if (JOYFUL_SCENES.has(id) && t > 20) {
      setExpression(rig, 'alegria', 0.8, blinkOpenness);
      continue;
    }

    // Default calm, contemplative expression
    setExpression(rig, meta.baseExpression || 'sereno', 0.8, blinkOpenness);
  }
}
