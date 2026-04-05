import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { db, Vehicule, Intervention } from '../core/carouts-db';

interface VehiculeAvecStats {
  vehicule: Vehicule;
  nbInterventions: number;
  depensesAnnee: number;
  derniereIntervention: Date | null;
  badge: 'ok' | 'a-prevoir' | 'aucun';
}

@Component({
  selector: 'app-accueil',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './accueil.component.html',
  styleUrls: ['./accueil.component.scss']
})
export class AccueilComponent implements OnInit {

  vehiculesAvecStats = signal<VehiculeAvecStats[]>([]);
  loading = signal(true);

  // Stats globales
  totalVehicules = computed(() => this.vehiculesAvecStats().length);
  totalInterventions = computed(() =>
    this.vehiculesAvecStats().reduce((s, v) => s + v.nbInterventions, 0)
  );
  totalDepensesAnnee = computed(() =>
    this.vehiculesAvecStats().reduce((s, v) => s + v.depensesAnnee, 0)
  );

  constructor(private router: Router) {}

  async ngOnInit() {
    await db.seed();
    await this.chargerDonnees();
  }

  async chargerDonnees() {
    this.loading.set(true);

    const vehicules = await db.vehicules.toArray();
    const anneeEnCours = new Date().getFullYear();

    const stats: VehiculeAvecStats[] = await Promise.all(
      vehicules.map(async (v) => {
        const interventions = await db.interventions
          .where('vehiculeId').equals(v.id!)
          .toArray();

        const depensesAnnee = interventions
          .filter(i => new Date(i.date).getFullYear() === anneeEnCours)
          .reduce((s, i) => s + (i.prix ?? 0), 0);

        const dates = interventions.map(i => new Date(i.date)).sort((a, b) => b.getTime() - a.getTime());
        const derniereIntervention = dates.length > 0 ? dates[0] : null;

        // Badge : "à prévoir" si pas d'intervention depuis plus de 12 mois ou aucune
        let badge: 'ok' | 'a-prevoir' | 'aucun' = 'aucun';
        if (derniereIntervention) {
          const moisEcoules = (Date.now() - derniereIntervention.getTime()) / (1000 * 60 * 60 * 24 * 30);
          badge = moisEcoules > 12 ? 'a-prevoir' : 'ok';
        } else {
          badge = 'a-prevoir';
        }

        return {
          vehicule: v,
          nbInterventions: interventions.length,
          depensesAnnee,
          derniereIntervention,
          badge
        };
      })
    );

    this.vehiculesAvecStats.set(stats);
    this.loading.set(false);
  }

  naviguerVersVehicule(id: number) {
    this.router.navigate(['/vehicules', id]);
  }

  ajouterVehicule() {
    this.router.navigate(['/vehicules/nouveau']);
  }

  iconeCategorie(categorie: string): string {
    const map: Record<string, string> = {
      voiture: '🚗',
      moto: '🏍️',
      camion: '🚛',
      scooter: '🛵',
      velo: '🚲',
      bateau: '⛵',
      avion: '✈️'
    };
    return map[categorie] ?? '🚗';
  }

  formaterKm(km: number): string {
    return km.toLocaleString('fr-FR') + ' km';
  }

  formaterEuros(montant: number): string {
    return montant.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
  }

  formaterDate(date: Date | null): string {
    if (!date) return 'Aucune intervention';
    return new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  }
}
