import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InterventionService } from '../../../core/services/intervention.service';
import { PrestationService } from '../../../core/services/prestation.service';
import { PhotoService } from '../../../core/services/photo.service';
import { VehiculeService } from '../../../core/services/vehicule.service';
import { Vehicule, Intervention } from '../../../core/carouts-db';
import { ChipSelectorComponent, ChipOption } from '../../../shared/components/chip-selector.component';
import { PhotoPickerComponent } from '../../../shared/components/photo-picker.component';
import { TopbarComponent } from '../../../shared/components/topbar.component';

@Component({
  selector: 'app-intervention-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TopbarComponent,
    ChipSelectorComponent,
    PhotoPickerComponent,
  ],
  templateUrl: './intervention-form.component.html',
  styleUrls: ['./intervention-form.component.scss']
})
export class InterventionFormComponent implements OnInit {

  form!: FormGroup;
  estEdition = false;
  vehiculeId!: number;
  interventionId: number | null = null;
  vehicule = signal<Vehicule | null>(null);
  prestationOptions = signal<ChipOption[]>([]);
  loading = signal(true);
  saving = signal(false);

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private interventionService: InterventionService,
    private prestationService: PrestationService,
    private vehiculeService: VehiculeService,
    private photoService: PhotoService,
  ) {}

  async ngOnInit() {
    this.vehiculeId = Number(this.route.snapshot.paramMap.get('id'));
    const interventionIdParam = this.route.snapshot.paramMap.get('interventionId');

    if (interventionIdParam) {
      this.estEdition = true;
      this.interventionId = Number(interventionIdParam);
    }

    this.form = this.fb.group({
      prestationId: [null, Validators.required],
      date:         [this.dateAujourdhui(), Validators.required],
      kilometrage:  [null],
      prix:         [null],
      prestataire:  [''],
      notes:        [''],
      photoPath:    [null],
    });

    await this.chargerDonnees();
  }

  private dateAujourdhui(): string {
    return new Date().toISOString().slice(0, 10);
  }

  async chargerDonnees() {
    this.loading.set(true);

    const [vehicule, prestations] = await Promise.all([
      this.vehiculeService.getById(this.vehiculeId),
      this.prestationService.getAll(),
    ]);

    if (!vehicule) { this.router.navigate(['/accueil']); return; }
    this.vehicule.set(vehicule);

    this.prestationOptions.set(
      prestations.map(p => ({ value: p.id!, label: p.label }))
    );

    if (this.estEdition && this.interventionId) {
      const intervention = await this.interventionService.getById(this.interventionId);
      if (intervention) {
        this.form.patchValue({
          prestationId: intervention.prestationId,
          date:         new Date(intervention.date).toISOString().slice(0, 10),
          kilometrage:  intervention.kilometrage ?? null,
          prix:         intervention.prix ?? null,
          prestataire:  intervention.prestataire ?? '',
          notes:        intervention.notes ?? '',
          photoPath:    intervention.photoPath ?? null,
        });
      }
    }

    this.loading.set(false);
  }

  get titre(): string {
    return this.estEdition ? 'Modifier l\'intervention' : 'Nouvelle intervention';
  }

  get prestationInvalid(): boolean {
    const c = this.form.get('prestationId');
    return !!(c?.invalid && c?.touched);
  }

  get dateInvalid(): boolean {
    const c = this.form.get('date');
    return !!(c?.invalid && c?.touched);
  }

  async sauvegarder() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.saving.set(true);
    const val = this.form.value;

    const data: Omit<Intervention, 'id'> = {
      vehiculeId:   this.vehiculeId,
      prestationId: Number(val.prestationId),
      date:         new Date(val.date),
      kilometrage:  val.kilometrage ? Number(val.kilometrage) : undefined,
      prix:         val.prix ? Number(val.prix) : undefined,
      prestataire:  val.prestataire?.trim() || undefined,
      notes:        val.notes?.trim() || undefined,
      photoPath:    val.photoPath || undefined,
    };

    if (this.estEdition && this.interventionId) {
      await this.interventionService.update(this.interventionId, data);
    } else {
      await this.interventionService.add(data);
    }

    this.saving.set(false);
    this.router.navigate(['/vehicules', this.vehiculeId]);
  }

  annuler() {
    this.router.navigate(['/vehicules', this.vehiculeId]);
  }
}
