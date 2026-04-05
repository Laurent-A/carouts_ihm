import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Intervention, Prestation } from '../../core/carouts-db';
import { KmFormatPipe } from '../pipe/km-format.pipe';
import { EuroFormatPipe } from '../pipe/euro-format.pipe';

@Component({
  selector: 'app-intervention-item',
  standalone: true,
  imports: [CommonModule, KmFormatPipe, EuroFormatPipe],
  templateUrl: './intervention-item.component.html',
  styleUrls: ['./intervention-item.component.scss']
})
export class InterventionItemComponent {
  @Input({ required: true }) intervention!: Intervention;
  @Input() prestation: Prestation | undefined;
  @Output() editClick   = new EventEmitter<void>();
  @Output() deleteClick = new EventEmitter<void>();

  get dateFormatee(): string {
    return new Date(this.intervention.date).toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
  }
}
