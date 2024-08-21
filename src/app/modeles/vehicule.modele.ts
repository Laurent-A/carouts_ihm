import { Categorie } from '../modeles/categorie.modele';

export interface Vehicule {
  id: number;
  label: string;
  kilometrage: number;
  immatriculation: string;
  categorie: Categorie;
}
