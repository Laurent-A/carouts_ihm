import { Injectable } from '@angular/core';
import { db, Intervention } from '../carouts-db';

@Injectable({ providedIn: 'root' })
export class InterventionService {

  getByVehicule(vehiculeId: number): Promise<Intervention[]> {
    return db.interventions
      .where('vehiculeId').equals(vehiculeId)
      .sortBy('date')
      .then(list => list.reverse()); // date décroissante
  }

  getById(id: number): Promise<Intervention | undefined> {
    return db.interventions.get(id);
  }

  async add(intervention: Omit<Intervention, 'id'>): Promise<number> {
    return db.interventions.add(intervention as Intervention);
  }

  async update(id: number, changes: Partial<Intervention>): Promise<void> {
    await db.interventions.update(id, changes);
  }

  async delete(id: number): Promise<void> {
    await db.interventions.delete(id);
  }

  /**
   * Dépenses totales pour un véhicule sur une année donnée
   */
  async depensesAnnee(vehiculeId: number, annee: number): Promise<number> {
    const interventions = await this.getByVehicule(vehiculeId);
    return interventions
      .filter(i => new Date(i.date).getFullYear() === annee)
      .reduce((sum, i) => sum + (i.prix ?? 0), 0);
  }

  /**
   * Toutes les interventions toutes tables confondues (pour export)
   */
  getAll(): Promise<Intervention[]> {
    return db.interventions.toArray();
  }
}
