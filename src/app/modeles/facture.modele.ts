import { Vehicule } from '../modeles/vehicule.modele';

export interface Facture {
  id: number;
  date_facture: Date;
  label_facture: string;
  vehicule: Vehicule;
  kilometrage: number;
  prix: string;
  prestation: Prestation;
}
