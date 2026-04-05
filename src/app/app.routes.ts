import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'accueil',
    pathMatch: 'full'
  },
  {
    path: 'accueil',
    loadComponent: () =>
      import('./features/accueil.component').then(m => m.AccueilComponent)
  },
  {
    path: 'vehicules/nouveau',
    loadComponent: () =>
      import('../app/features/vehicules/form/vehicule-form.component').then(m => m.VehiculeFormComponent)
  },
  {
    path: 'vehicules/:id',
    loadComponent: () =>
      import('../app/features/vehicules/fiche-vehicule.component').then(m => m.FicheVehiculeComponent)
  },
  {
    path: 'vehicules/:id/modifier',
    loadComponent: () =>
      import('../app/features/vehicules/form/vehicule-form.component').then(m => m.VehiculeFormComponent)
  },
  {
    path: 'vehicules/:id/interventions/nouvelle',
    loadComponent: () =>
      import('./features/interventions/form/intervention-form.component').then(m => m.InterventionFormComponent)
  },
  {
    path: 'vehicules/:id/interventions/:interventionId/modifier',
    loadComponent: () =>
      import('./features/interventions/form/intervention-form.component').then(m => m.InterventionFormComponent)
  },
  {
    path: 'parametres',
    loadComponent: () =>
      import('./features/parametres/parametres.component').then(m => m.ParametresComponent)
  },
  {
    path: '**',
    redirectTo: 'accueil'
  }
];
