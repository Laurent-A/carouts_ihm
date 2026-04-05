import { Injectable } from '@angular/core';
import { db, Notification, Vehicule } from '../carouts-db';

export type StatutNotification = 'ok' | 'bientot' | 'en-retard';

export interface NotificationAvecStatut extends Notification {
  statut: StatutNotification;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {

  getByVehicule(vehiculeId: number): Promise<Notification[]> {
    return db.notifications.where('vehiculeId').equals(vehiculeId).toArray();
  }

  getAll(): Promise<Notification[]> {
    return db.notifications.toArray();
  }

  getById(id: number): Promise<Notification | undefined> {
    return db.notifications.get(id);
  }

  async add(notification: Omit<Notification, 'id'>): Promise<number> {
    return db.notifications.add(notification as Notification);
  }

  async update(id: number, changes: Partial<Notification>): Promise<void> {
    await db.notifications.update(id, changes);
  }

  async delete(id: number): Promise<void> {
    await db.notifications.delete(id);
  }

  async toggleActive(id: number, active: boolean): Promise<void> {
    await db.notifications.update(id, { active });
  }

  /**
   * Calcule le statut d'une notification par rapport au véhicule
   * - "en-retard"  : seuil dépassé
   * - "bientot"    : seuil atteint dans < 1 000 km ou < 30 jours
   * - "ok"         : loin du seuil
   */
  calculerStatut(notification: Notification, vehicule: Vehicule): StatutNotification {
    if (!notification.active) return 'ok';

    if (notification.type === 'kilometrage' && notification.kilometrageNotification != null) {
      const ecart = notification.kilometrageNotification - vehicule.kilometrage;
      if (ecart <= 0)       return 'en-retard';
      if (ecart <= 1000)    return 'bientot';
      return 'ok';
    }

    if (notification.type === 'date' && notification.dateNotification != null) {
      const now = Date.now();
      const cible = new Date(notification.dateNotification).getTime();
      const joursRestants = (cible - now) / (1000 * 60 * 60 * 24);
      if (joursRestants <= 0)   return 'en-retard';
      if (joursRestants <= 30)  return 'bientot';
      return 'ok';
    }

    return 'ok';
  }

  /**
   * Vérifie si un véhicule a au moins une notification active en retard ou bientôt
   */
  async aNotificationUrgente(vehiculeId: number): Promise<boolean> {
    const vehicule = await db.vehicules.get(vehiculeId);
    if (!vehicule) return false;
    const notifs = await this.getByVehicule(vehiculeId);
    return notifs.some(n => {
      const statut = this.calculerStatut(n, vehicule);
      return statut === 'en-retard' || statut === 'bientot';
    });
  }
}
