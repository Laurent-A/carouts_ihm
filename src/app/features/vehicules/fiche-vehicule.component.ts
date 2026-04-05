import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Intervention, Prestation, Vehicule } from '../../core/carouts-db';
import { InterventionService } from '../../core/services/intervention.service';
import { PrestationService } from '../../core/services/prestation.service';
import { VehiculeService } from '../../core/services/vehicule.service';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog.component';
import { InterventionItemComponent } from '../../shared/components/intervention-item.component';
import { TopbarComponent } from '../../shared/components/topbar.component';
import { EuroFormatPipe } from '../../shared/pipe/euro-format.pipe';
import { KmFormatPipe } from '../../shared/pipe/km-format.pipe';

interface InterventionAvecPrestation {
  intervention: Intervention;
  prestation: Prestation | undefined;
}

@Component({
  selector: 'app-fiche-vehicule',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TopbarComponent,
    InterventionItemComponent,
    ConfirmDialogComponent,
    KmFormatPipe,
    EuroFormatPipe,
  ],
  templateUrl: './fiche-vehicule.component.html',
  styleUrls: ['./fiche-vehicule.component.scss']
})
export class FicheVehiculeComponent implements OnInit {

  vehicule = signal<Vehicule | null>(null);
  interventions = signal<InterventionAvecPrestation[]>([]);
  loading = signal(true);

  // Panneau détail intervention
  panneauVisible = false;
  interventionSelectionnee = signal<InterventionAvecPrestation | null>(null);

  // Dialog suppression véhicule
  dialogVehiculeVisible = false;
  // Dialog suppression intervention
  dialogInterventionVisible = false;
  interventionASupprimer: number | null = null;

  // Stats calculées
  totalDepensesAnnee = computed(() => {
    const annee = new Date().getFullYear();
    return this.interventions()
      .filter(i => new Date(i.intervention.date).getFullYear() === annee)
      .reduce((s, i) => s + (i.intervention.prix ?? 0), 0);
  });

  totalDepenses = computed(() =>
    this.interventions().reduce((s, i) => s + (i.intervention.prix ?? 0), 0)
  );

  derniereIntervention = computed(() => {
    const list = this.interventions();
    if (!list.length) return null;
    return new Date(list[0].intervention.date);
  });

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private vehiculeService: VehiculeService,
    private interventionService: InterventionService,
    private prestationService: PrestationService,
  ) {}

  async ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) { this.router.navigate(['/accueil']); return; }
    await this.charger(id);
  }

  async charger(id: number) {
    this.loading.set(true);
    const [vehicule, interventions, prestations] = await Promise.all([
      this.vehiculeService.getById(id),
      this.interventionService.getByVehicule(id),
      this.prestationService.getAll(),
    ]);

    if (!vehicule) { this.router.navigate(['/accueil']); return; }

    const prestationMap = new Map(prestations.map(p => [p.id!, p]));
    this.vehicule.set(vehicule);
    this.interventions.set(
      interventions.map(i => ({
        intervention: i,
        prestation: prestationMap.get(i.prestationId),
      }))
    );
    this.loading.set(false);
  }

  // ── Navigation ──────────────────────────────────────────────────────────────

  modifierVehicule() {
    this.router.navigate(['/vehicules', this.vehicule()!.id, 'modifier']);
  }

  ajouterIntervention() {
    this.router.navigate(['/vehicules', this.vehicule()!.id, 'interventions', 'nouvelle']);
  }

  modifierIntervention(interventionId: number) {
    this.fermerPanneau();
    this.router.navigate([
      '/vehicules', this.vehicule()!.id,
      'interventions', interventionId, 'modifier'
    ]);
  }

  // ── Panneau détail ──────────────────────────────────────────────────────────

  ouvrirPanneau(item: InterventionAvecPrestation) {
    this.interventionSelectionnee.set(item);
    this.panneauVisible = true;
  }

  fermerPanneau() {
    this.panneauVisible = false;
    setTimeout(() => this.interventionSelectionnee.set(null), 300);
  }

  modifierDepuisPanneau() {
    const item = this.interventionSelectionnee();
    if (item) this.modifierIntervention(item.intervention.id!);
  }

  supprimerDepuisPanneau() {
    const item = this.interventionSelectionnee();
    if (!item) return;
    this.fermerPanneau();
    setTimeout(() => this.demanderSuppressionIntervention(item.intervention.id!), 320);
  }

  // ── Suppression véhicule ────────────────────────────────────────────────────

  demanderSuppressionVehicule() {
    this.dialogVehiculeVisible = true;
  }

  async confirmerSuppressionVehicule() {
    this.dialogVehiculeVisible = false;
    await this.vehiculeService.delete(this.vehicule()!.id!);
    this.router.navigate(['/accueil']);
  }

  // ── Suppression intervention ────────────────────────────────────────────────

  demanderSuppressionIntervention(id: number) {
    this.interventionASupprimer = id;
    this.dialogInterventionVisible = true;
  }

  async confirmerSuppressionIntervention() {
    if (this.interventionASupprimer == null) return;
    this.dialogInterventionVisible = false;
    await this.interventionService.delete(this.interventionASupprimer);
    this.interventionASupprimer = null;
    await this.charger(this.vehicule()!.id!);
  }

  annulerDialog() {
    this.dialogVehiculeVisible = false;
    this.dialogInterventionVisible = false;
    this.interventionASupprimer = null;
  }

  // ── Helpers ─────────────────────────────────────────────────────────────────

  iconeCategorie(categorie: string): string {
    const map: Record<string, string> = {
      voiture: '🚗', moto: '🏍️', camion: '🚛',
      scooter: '🛵', velo: '🚲', bateau: '⛵', avion: '✈️'
    };
    return map[categorie] ?? '🚗';
  }

  formaterDate(date: Date | null | string): string {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
  }

  formaterEuros(montant: number): string {
    return montant.toLocaleString('fr-FR', {
      style: 'currency', currency: 'EUR', maximumFractionDigits: 0
    });
  }
}
