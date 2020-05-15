// import { coordinates } from './nordschleife';
import * as coordsTest from '../custom/trackCoordinates/Test';
import * as coordsSpa from '../custom/trackCoordinates/SpaFrancorchamps';
import * as coordsNoordschleife from '../custom/trackCoordinates/Nordschleife';
import * as coordsCastleCombe from '../custom/trackCoordinates/CastleCombe';


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
