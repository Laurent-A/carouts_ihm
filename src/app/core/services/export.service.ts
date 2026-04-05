import { Injectable } from '@angular/core';
import { db } from '../carouts-db';

interface ExportPayload {
  version: number;
  exportedAt: string;
  vehicules: unknown[];
  prestations: unknown[];
  interventions: unknown[];
  notifications: unknown[];
}

@Injectable({ providedIn: 'root' })
export class ExportService {

  /**
   * Exporte toute la base en JSON et déclenche le téléchargement
   */
  async exporterJSON(): Promise<void> {
    const [vehicules, prestations, interventions, notifications] = await Promise.all([
      db.vehicules.toArray(),
      db.prestations.toArray(),
      db.interventions.toArray(),
      db.notifications.toArray(),
    ]);

    const payload: ExportPayload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      vehicules,
      prestations,
      interventions,
      notifications,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `carouts-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Importe un fichier JSON exporté par Carouts.
   * Écrase toutes les données existantes après confirmation.
   */
  async importerJSON(file: File): Promise<void> {
    const text    = await file.text();
    const payload = JSON.parse(text) as ExportPayload;

    if (!payload.vehicules || !payload.interventions) {
      throw new Error('Fichier JSON invalide ou incompatible.');
    }

    await db.transaction('rw',
      db.vehicules, db.prestations, db.interventions, db.notifications,
      async () => {
        await db.vehicules.clear();
        await db.prestations.clear();
        await db.interventions.clear();
        await db.notifications.clear();

        if (payload.vehicules.length)     await db.vehicules.bulkAdd(payload.vehicules as any);
        if (payload.prestations.length)   await db.prestations.bulkAdd(payload.prestations as any);
        if (payload.interventions.length) await db.interventions.bulkAdd(payload.interventions as any);
        if (payload.notifications.length) await db.notifications.bulkAdd(payload.notifications as any);
      }
    );
  }

  /**
   * Supprime toutes les données et re-seed les prestations
   */
  async viderTout(): Promise<void> {
    await db.transaction('rw',
      db.vehicules, db.prestations, db.interventions, db.notifications,
      async () => {
        await db.vehicules.clear();
        await db.prestations.clear();
        await db.interventions.clear();
        await db.notifications.clear();
      }
    );
    await db.seed();
  }
}
