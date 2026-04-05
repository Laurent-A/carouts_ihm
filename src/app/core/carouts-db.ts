import Dexie, { Table } from 'dexie';

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface Vehicule {
  id?: number;
  nom: string;
  immatriculation?: string;
  kilometrage: number;
  marque?: string;
  modele?: string;
  annee?: number;
  categorie: 'voiture' | 'moto' | 'camion' | 'scooter' | 'velo' | 'bateau' | 'avion';
}

export interface Prestation {
  id?: number;
  label: string;
}

export interface Intervention {
  id?: number;
  vehiculeId: number;
  prestationId: number;
  date: Date;
  kilometrage?: number;
  prix?: number;
  prestataire?: string;
  notes?: string;
  photoPath?: string;
}

export interface Notification {
  id?: number;
  vehiculeId: number;
  prestationId: number;
  type: 'kilometrage' | 'date';
  kilometrageNotification?: number;
  dateNotification?: Date;
  active: boolean;
}

// ─── Base de données Dexie ────────────────────────────────────────────────────

export class CaroutsDB extends Dexie {

  vehicules!:     Table<Vehicule,     number>;
  prestations!:   Table<Prestation,   number>;
  interventions!: Table<Intervention, number>;
  notifications!: Table<Notification, number>;

  constructor() {
    super('CaroutsDB');

    this.version(1).stores({
      vehicules:     '++id',
      prestations:   '++id, label',
      interventions: '++id, vehiculeId, prestationId, date',
      notifications: '++id, vehiculeId, prestationId, active',
    });
  }

  // ─── Seed automatique des prestations ─────────────────────────────────────

  async seed() {
    const count = await this.prestations.count();
    if (count > 0) return;

    await this.prestations.bulkAdd([
      { label: 'Freins' },
      { label: 'Pneus' },
      { label: 'Vidange' },
      { label: 'Batterie' },
      { label: 'Essuie-glaces' },
      { label: 'Révision' },
      { label: 'Liquides' },
      { label: 'Courroie de distribution' },
      { label: 'Filtres' },
      { label: 'Autre' },
    ]);
  }
}

// ─── Instance singleton exportée ─────────────────────────────────────────────

export const db = new CaroutsDB();