import {editorial as bible} from './editorial/bible.js';
import {editorial as mormon} from './editorial/mormon.js';
import {editorial as restoration} from './editorial/restoration.js';

// Every scene has an authored teaching grounded in its own scripture passage.
export const editorial={...bible,...mormon,...restoration};
