import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule, Location } from '@angular/common';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.scss']
})
export class TopbarComponent {
  /** Titre affiché au centre */
  @Input() titre = '';
  /** Affiche la flèche de retour */
  @Input() retour = false;
  /** Icône action droite : 'edit' | 'delete' | 'save' | null */
  @Input() actionDroite: 'edit' | 'delete' | 'save' | null = null;
  /** Surcharge le comportement retour (par défaut : location.back()) */
  @Output() retourClick  = new EventEmitter<void>();
  @Output() actionClick  = new EventEmitter<void>();

  constructor(private location: Location) {}

  onRetour() {
    if (this.retourClick.observed) {
      this.retourClick.emit();
    } else {
      this.location.back();
    }
  }
}
