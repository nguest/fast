// import { coordinates } from './nordschleife';
import * as coordsTest from '../custom/geometries/Test';
import * as coordsSpa from '../custom/geometries/SpaFrancorchamps';
import * as coordsNoordschleife from '../custom/geometries/Nordschleife';
import * as coordsCastleCombe from '../custom/geometries/CastleCombe';


export const trackOptions = [
  {
    name: 'CastleCombe',
    coords: coordsCastleCombe,
  },
  {
    name: 'Test',
    coords: coordsTest,
  },
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
