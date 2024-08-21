import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VehiculesComponent } from './vehicules/vehicules.component';

const routes: Routes = [
  { path: '', redirectTo: '/vehicules', pathMatch: 'full' },
  { path: 'vehicules', component: VehiculesComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
