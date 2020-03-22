// import { coordinates } from './nordschleife';
import * as coordsSpa from '../custom/geometries/SpaFrancorchamps';
import * as coordsNoordschleife from '../custom/geometries/nordschleife';

export const trackOptions = [
  {
    name: 'Nordschleife',
    coords: coordsNoordschleife,
  },
  {
    name: 'SpaFrancorchamps',
    coords: coordsSpa,
  },
];

export default coordsSpa.default;
