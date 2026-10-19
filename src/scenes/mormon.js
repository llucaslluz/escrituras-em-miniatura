import { builders as journeys } from './mormon/journeys.js';
import { builders as community } from './mormon/community.js';
import { builders as witnesses } from './mormon/witnesses.js';
import { stories } from '../data/mormon.js';

// Restore articulated rigs before evaluating a moment. Seeking backwards and
// repeating therefore produce the same pose as a newly opened scene at that time.
// Ambient head sway keeps its z rotation; all narrative transforms are absolute.
const poseKeys = ['root', 'head', 'leftArm', 'rightArm', 'leftForearm', 'rightForearm', 'leftLeg', 'rightLeg'];
function deterministic(builder, id) {
  return k => {
    let poses = [];
    k.animate(() => {
      for (const { node, position, rotation, key } of poses) {
        node.position.copy(position);
        if (key === 'head') { node.rotation.x = rotation.x; node.rotation.y = rotation.y; }
        else node.rotation.copy(rotation);
      }
    });
    builder(k);
    const story = stories.find(s => s.id === id);
    for (const entry of k.selectables) {
      if (entry.role !== 'Personagem deste episódio') continue;
      const character = story.characters.find(c => c.name === entry.name);
      entry.role = character?.role || 'Figura representativa';
      entry.reference = story.reference;
      entry.summary = character?.description || 'Participante representativo da multidão descrita nesta passagem.';
    }
    poses = k.people.flatMap(rig => poseKeys.map(key => ({ key, node: rig[key], position: rig[key].position.clone(), rotation: rig[key].rotation.clone() })));
  };
}
export const builders = Object.fromEntries(Object.entries({ ...journeys, ...community, ...witnesses }).map(([id, builder]) => [id, deterministic(builder, id)]));
