import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExportService } from '../../core/services/export.service';
import { VehiculeService } from '../../core/services/vehicule.service';
import { InterventionService } from '../../core/services/intervention.service';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog.component';
import { TopbarComponent } from '../../shared/components/topbar.component';

@Component({
  selector: 'app-parametres',
  standalone: true,
  imports: [
    CommonModule,
    TopbarComponent,
    ConfirmDialogComponent,
  ],
  templateUrl: './parametres.component.html',
  styleUrls: ['./parametres.component.scss']
})
export class ParametresComponent implements OnInit {

  // Stats globales
  nbVehicules    = signal(0);
  nbInterventions = signal(0);
  depensesAnnee  = signal(0);
  depensesTotal  = signal(0);

  // États UI
  loading          = signal(true);
  importLoading    = signal(false);
  exportLoading    = signal(false);
  dialogViderVisible = false;

  // Feedback
  feedbackMessage  = signal<string | null>(null);
  feedbackType     = signal<'success' | 'error'>('success');

  constructor(
    private exportService: ExportService,
    private vehiculeService: VehiculeService,
    private interventionService: InterventionService,
  ) {}

  async ngOnInit() {
    await this.chargerStats();
  }

  async chargerStats() {
    this.loading.set(true);
    const annee = new Date().getFullYear();

    const [vehicules, interventions] = await Promise.all([
      this.vehiculeService.getAll(),
      this.interventionService.getAll(),
    ]);

    const depensesAnnee = interventions
      .filter(i => new Date(i.date).getFullYear() === annee)
      .reduce((s, i) => s + (i.prix ?? 0), 0);

    const depensesTotal = interventions
      .reduce((s, i) => s + (i.prix ?? 0), 0);

    this.nbVehicules.set(vehicules.length);
    this.nbInterventions.set(interventions.length);
    this.depensesAnnee.set(depensesAnnee);
    this.depensesTotal.set(depensesTotal);
    this.loading.set(false);
  }

  // ── Export ────────────────────────────────────────────────────────────────

  async exporter() {
    this.exportLoading.set(true);
    try {
      await this.exportService.exporterJSON();
      this.afficherFeedback('Exportation réussie', 'success');
    } catch {
      this.afficherFeedback('Erreur lors de l\'exportation', 'error');
    } finally {
      this.exportLoading.set(false);
    }
  }

  // ── Import ────────────────────────────────────────────────────────────────

  declencherImport() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';
    input.onchange = async (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      await this.importerFichier(file);
    };
    input.click();
  }

  async importerFichier(file: File) {
    this.importLoading.set(true);
    try {
      await this.exportService.importerJSON(file);
      await this.chargerStats();
      this.afficherFeedback('Données importées avec succès', 'success');
    } catch {
      this.afficherFeedback('Fichier invalide ou incompatible', 'error');
    } finally {
      this.importLoading.set(false);
    }
  }

  // ── Vider les données ─────────────────────────────────────────────────────

  demanderVider() {
    this.dialogViderVisible = true;
  }

  async confirmerVider() {
    this.dialogViderVisible = false;
    try {
      await this.exportService.viderTout();
      await this.chargerStats();
      this.afficherFeedback('Toutes les données ont été supprimées', 'success');
    } catch {
      this.afficherFeedback('Erreur lors de la suppression', 'error');
    }
  }

  annulerDialog() {
    this.dialogViderVisible = false;
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  formaterEuros(montant: number): string {
    return montant.toLocaleString('fr-FR', {
      style: 'currency', currency: 'EUR', maximumFractionDigits: 0
    });
  }

  private afficherFeedback(message: string, type: 'success' | 'error') {
    this.feedbackMessage.set(message);
    this.feedbackType.set(type);
    setTimeout(() => this.feedbackMessage.set(null), 3000);
  }

  readonly version = '1.0.0';
  readonly anneeEnCours = new Date().getFullYear();
}
