import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Vehicule } from '../../../core/carouts-db';
import { VehiculeService } from '../../../core/services/vehicule.service';
import { ChipSelectorComponent, ChipOption } from '../../../shared/components/chip-selector.component';
import { TopbarComponent } from '../../../shared/components/topbar.component';

type Categorie = Vehicule['categorie'];

@Component({
  selector: 'app-vehicule-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TopbarComponent,
    ChipSelectorComponent,
  ],
  templateUrl: './vehicule-form.component.html',
  styleUrls: ['./vehicule-form.component.scss']
})
export class VehiculeFormComponent implements OnInit {

  form!: FormGroup;
  estEdition = false;
  vehiculeId: number | null = null;
  loading = signal(false);
  saving = signal(false);

  categorieOptions: ChipOption[] = [
    { value: 'voiture',  label: '🚗 Voiture'  },
    { value: 'moto',     label: '🏍️ Moto'     },
    { value: 'scooter',  label: '🛵 Scooter'  },
    { value: 'camion',   label: '🚛 Camion'   },
    { value: 'velo',     label: '🚲 Vélo'     },
    { value: 'bateau',   label: '⛵ Bateau'   },
    { value: 'avion',    label: '✈️ Avion'    },
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private vehiculeService: VehiculeService,
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      nom:            ['', [Validators.required, Validators.minLength(1)]],
      categorie:      ['voiture', Validators.required],
      kilometrage:    [0, [Validators.required, Validators.min(0)]],
      marque:         [''],
      modele:         [''],
      annee:          [null],
      immatriculation:[''],
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id && this.route.snapshot.url.some(s => s.path === 'modifier')) {
      this.estEdition = true;
      this.vehiculeId = Number(id);
      this.chargerVehicule(this.vehiculeId);
    }
  }

  async chargerVehicule(id: number) {
    this.loading.set(true);
    const vehicule = await this.vehiculeService.getById(id);
    if (!vehicule) { this.router.navigate(['/accueil']); return; }

    this.form.patchValue({
      nom:             vehicule.nom,
      categorie:       vehicule.categorie,
      kilometrage:     vehicule.kilometrage,
      marque:          vehicule.marque ?? '',
      modele:          vehicule.modele ?? '',
      annee:           vehicule.annee ?? null,
      immatriculation: vehicule.immatriculation ?? '',
    });
    this.loading.set(false);
  }

  get titre(): string {
    return this.estEdition ? 'Modifier le véhicule' : 'Nouveau véhicule';
  }

  get nomInvalid(): boolean {
    const c = this.form.get('nom');
    return !!(c?.invalid && c?.touched);
  }

  get kmInvalid(): boolean {
    const c = this.form.get('kilometrage');
    return !!(c?.invalid && c?.touched);
  }

  async sauvegarder() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.saving.set(true);
    const val = this.form.value;

    const data: Omit<Vehicule, 'id'> = {
      nom:             val.nom.trim(),
      categorie:       val.categorie as Categorie,
      kilometrage:     Number(val.kilometrage),
      marque:          val.marque?.trim() || undefined,
      modele:          val.modele?.trim() || undefined,
      annee:           val.annee ? Number(val.annee) : undefined,
      immatriculation: val.immatriculation?.trim() || undefined,
    };

    if (this.estEdition && this.vehiculeId) {
      await this.vehiculeService.update(this.vehiculeId, data);
      this.router.navigate(['/vehicules', this.vehiculeId]);
    } else {
      const id = await this.vehiculeService.add(data);
      this.router.navigate(['/vehicules', id]);
    }
    this.saving.set(false);
  }

  annuler() {
    if (this.estEdition && this.vehiculeId) {
      this.router.navigate(['/vehicules', this.vehiculeId]);
    } else {
      this.router.navigate(['/accueil']);
    }
  }
}
