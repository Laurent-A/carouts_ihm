import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.scss']
})
export class ConfirmDialogComponent {
  @Input() titre   = 'Confirmation';
  @Input() message = 'Êtes-vous sûr ?';
  @Input() labelConfirm  = 'Supprimer';
  @Input() labelAnnuler  = 'Annuler';
  @Input() danger  = true;
  @Input() visible = false;

  @Output() confirmer = new EventEmitter<void>();
  @Output() annuler   = new EventEmitter<void>();
}
