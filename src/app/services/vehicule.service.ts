import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Vehicule } from '../modeles/vehicule.modele';

@Injectable({
  providedIn: 'root'
})
export class VehiculeService {

  private baseUrl = 'http://localhost:9090/carouts';

  constructor(private http: HttpClient) { }

  getVehicules(): Observable<Vehicule[]> {
    return this.http.get<Vehicule[]>(`${this.baseUrl}/vehicules`);
  }

  addVehicule(vehicule: Vehicule): Observable<any> {
    return this.http.post(`${this.baseUrl}/vehicules`, vehicule);
  }

}
