import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'euroFormat', standalone: true })
export class EuroFormatPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    if (value == null) return '—';
    return value.toLocaleString('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    });
  }
}
