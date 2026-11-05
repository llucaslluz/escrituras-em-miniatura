import { builders as journeys } from './mormon/journeys.js';
import { builders as community } from './mormon/community.js';
import { builders as witnesses } from './mormon/witnesses.js';
import { stories } from '../data/mormon.js';
import { prepareRigPose } from './mormon/utils.js';

// Restore articulated rigs before evaluating a moment. Seeking backwards and
// repeating therefore produce the same pose as a newly opened scene at that time.
// Ambient head sway keeps its z rotation; all narrative transforms are absolute.
const poseKeys = ['root', 'head', 'robe', 'leftArm', 'rightArm', 'leftForearm', 'rightForearm', 'leftLeg', 'rightLeg'];
// These are authored inspection angles, not a replacement for the free camera.
// Props on a shelf, a tower, or a boat need their own focal height.
const inspectionViews={
 M01:[['Família e bagagens',[5,3.8,7],[.5,1,1]],['Acampamento',[7,5.2,7.8],[1.6,.8,-.3]]],
 M02:[['Árvore e fruto',[6,4,6],[1.3,1.5,-.4]],['Caminho e barra',[-6,4,8],[-.7,.9,.8]]],
 M03:[['As placas de latão',[4.1,2.9,-2.1],[.65,1,-.5]],['Saída pela cidade',[-6,4,6],[-1,.8,.5]]],
 M04:[['A Liahona',[3.5,2.8,5],[-.5,1,.6]],['Tendas e jornada',[-6,4,7],[0,1,-.5]]],
 M05:[['Navio e tripulação',[8,4.5,1.5],[0,1.6,.9]],['Margem e embarque',[-7,4,5],[-.8,.8,-.5]]],
 M06:[['Enos em oração',[3.5,2.8,5],[-.4,.9,.3]],['O bosque',[-7,5,6],[0,1,0]]],
 M07:[['O ensino na torre',[5,4.5,6],[0,2.7,-1.8]],['Famílias e tendas',[-7,4.5,7],[0,1.2,.6]]],
 M08:[['Abinádi e a corte',[5,3.5,7],[0,1.2,-.4]],['O registro de Alma',[-6,4,7],[1.7,1,1.6]]],
 M09:[['Alma e Helã',[4,3.2,5],[0,1,.15]],['Margens e testemunhas',[-7,4.5,5],[0,1,0]]],
 M10:[['O encontro no caminho',[5,3.5,6],[0,1.3,.6]],['A oração de Alma',[-6,4,6],[.8,1,1]]],
 M11:[['Amon e Lamôni',[5,3.3,5],[2,1.1,-.5]],['Rebanho e serviço',[-6,4,6],[-1.6,.7,.2]]],
 M12:[['O depósito das armas',[4,3.8,5],[0,.6,.1]],['O povo reunido',[-6,3.8,6],[0,1,0]]],
 M13:[['O estandarte',[4.5,3.8,6],[0,1.7,-.1]],['O compromisso do povo',[-6,4,6],[0,1,1.3]]],
 M14:[['Helamã e os jovens',[5,3.2,7],[0,1,1]],['Companheiros na marcha',[-6,3.5,6],[0,1,.8]]],
 M15:[['Samuel e a muralha',[5,5.2,7],[0,3.4,-1.6]],['Ouvintes e projéteis',[-7,4.5,7],[0,2,.2]]],
 M16:[['Cristo e as testemunhas',[5,3.8,7],[0,1.5,.5]],['Templo e reunião',[-7,5,7],[0,1.6,-1]]],
 M17:[['O gesto de cuidado',[4,3,5],[0,1.1,-.1]],['Aproximação e companhia',[-6,3.5,6],[-.5,1,.7]]],
 M18:[['A bênção das crianças',[4,3.2,6],[0,1.2,.1]],['Famílias e círculo de luz',[-6,4.2,6],[0,1.5,0]]],
 M19:[['As dezesseis pedras',[4.2,4.2,5.2],[0,1.9,-.65]],['Encontro sobre o monte',[-6,4.6,6],[0,2,-.3]]],
 M20:[['O registro à luz da lamparina',[3.5,2.8,5],[-.4,1.1,0]],['Recolhimento dos registros',[-5,3.2,5],[.7,.8,.3]]],
 M21:[['Enos em clamor',[3.8,2.9,5.2],[-.2,1,.3]],['Memória de Jacó e os registros',[-5.5,3.8,6],[.4,1,-.4]]],
 M22:[['Abinádi diante do trono',[4.8,3.6,6.6],[0,1.2,-.3]],['Alma acolhe a verdade',[-5.6,3.8,6.6],[1.4,1,1.1]]],
 M23:[['Alma e Amuleque em oração',[4.4,3.4,5.8],[0,1.1,.2]],['Pilares da prisão',[-5.8,4.2,6.8],[0,1.4,-.4]]],
 M24:[['Helamã e os jovens',[4.8,3.4,6.8],[0,1.1,.8]],['Formação e estandarte',[-6,3.8,6.5],[0,1.2,-.2]]],
};
function deterministic(builder, id) {
  return k => {
    let poses = [];
    k.animate(() => {
      for (const { node, position, rotation, scale, key } of poses) {
        node.position.copy(position);
        if (key === 'head') { node.rotation.x = rotation.x; node.rotation.y = rotation.y; }
        else node.rotation.copy(rotation);
        node.scale.y=scale.y;
        if(key!=='robe'){node.scale.x=scale.x;node.scale.z=scale.z;}
      }
    });
    builder(k);
    k.config.views=[{label:'Vista geral',camera:[...k.config.camera],target:[...k.config.target]},...inspectionViews[id].map(([label,camera,target])=>({label,camera:[...camera],target:[...target]}))];
    const story = stories.find(s => s.id === id);
    for (const entry of k.selectables) {
      if (entry.role !== 'Personagem deste episódio') continue;
      const character = story.characters.find(c => c.name === entry.name);
      entry.role = character?.role || 'Figura representativa';
      entry.reference = story.reference;
      entry.summary = character?.description || 'Participante representativo da multidão descrita nesta passagem.';
    }
    poses = k.people.flatMap(rig => {
      prepareRigPose(rig);const extra=rig.root.children.filter(node=>!poseKeys.some(key=>rig[key]===node));
      return [...poseKeys.map(key=>({key,node:rig[key]})),...extra.map(node=>({key:'cloth',node}))].map(({key,node})=>({key,node,position:node.position.clone(),rotation:node.rotation.clone(),scale:node.scale.clone()}));
    });
  };
}
export const builders = Object.fromEntries(Object.entries({ ...journeys, ...community, ...witnesses }).map(([id, builder]) => [id, deterministic(builder, id)]));
