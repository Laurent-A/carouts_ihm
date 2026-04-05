import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'kmFormat', standalone: true })
export class KmFormatPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    if (value == null) return '—';
    return value.toLocaleString('fr-FR') + '\u00a0km';
  }
}
