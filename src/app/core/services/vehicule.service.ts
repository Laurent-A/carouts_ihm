import { Injectable } from '@angular/core';
import { db, Vehicule } from '../carouts-db';

@Injectable({ providedIn: 'root' })
export class VehiculeService {

  getAll(): Promise<Vehicule[]> {
    return db.vehicules.toArray();
  }

  getById(id: number): Promise<Vehicule | undefined> {
    return db.vehicules.get(id);
  }

  async add(vehicule: Omit<Vehicule, 'id'>): Promise<number> {
    return db.vehicules.add(vehicule as Vehicule);
  }

  async update(id: number, changes: Partial<Vehicule>): Promise<void> {
    await db.vehicules.update(id, changes);
  }

  /**
   * Suppression en cascade : interventions + notifications liées
   */
  async delete(id: number): Promise<void> {
    await db.transaction('rw', db.vehicules, db.interventions, db.notifications, async () => {
      await db.interventions.where('vehiculeId').equals(id).delete();
      await db.notifications.where('vehiculeId').equals(id).delete();
      await db.vehicules.delete(id);
    });
  }
}
