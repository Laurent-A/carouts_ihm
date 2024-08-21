import { Component, OnInit } from '@angular/core';
import { VehiculeService } from '../services/vehicule.service';
import { Vehicule } from '../modeles/vehicule.modele';

@Component({
  selector: 'app-vehicules',
  templateUrl: './vehicules.component.html',
  styleUrls: ['./vehicules.component.css']
})
export class VehiculesComponent implements OnInit {
  vehicules: Vehicule[] = [];
  selectedVehicule: any = null;
  isModalOpen = false;

  constructor(private vehiculeService: VehiculeService) { }

  ngOnInit(): void {
    this.loadVehicules();
  }
  loadVehicules(): void {
    this.vehiculeService.getVehicules().subscribe(data => {
      this.vehicules = data.slice(0, 5);
    });
  }

  goToFactures(vehiculeId: number): void {
    // Naviguer vers les factures du véhicule sélectionné
  }

}
