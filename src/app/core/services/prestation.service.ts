import { Injectable } from '@angular/core';
import { db, Prestation } from '../carouts-db';

@Injectable({ providedIn: 'root' })
export class PrestationService {

  async getAll(): Promise<Prestation[]> {
    await db.seed(); // no-op si déjà seedé
    return db.prestations.orderBy('label').toArray();
  }

  getById(id: number): Promise<Prestation | undefined> {
    return db.prestations.get(id);
  }
}
