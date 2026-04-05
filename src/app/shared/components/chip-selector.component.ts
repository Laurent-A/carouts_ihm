import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface ChipOption {
  value: number | string;
  label: string;
}

@Component({
  selector: 'app-chip-selector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chip-selector.component.html',
  styleUrls: ['./chip-selector.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => ChipSelectorComponent),
    multi: true
  }]
})
export class ChipSelectorComponent implements ControlValueAccessor {
  @Input() options: ChipOption[] = [];
  @Input() multiple = false;

  selected: (number | string)[] = [];
  disabled = false;

  private onChange = (_: any) => {};
  private onTouched = () => {};

  isSelected(value: number | string): boolean {
    return this.selected.includes(value);
  }

  toggle(value: number | string) {
    if (this.disabled) return;
    this.onTouched();

    if (this.multiple) {
      this.selected = this.isSelected(value)
        ? this.selected.filter(v => v !== value)
        : [...this.selected, value];
      this.onChange(this.selected);
    } else {
      this.selected = this.isSelected(value) ? [] : [value];
      this.onChange(this.selected[0] ?? null);
    }
  }

  writeValue(val: any) {
    if (val == null) { this.selected = []; return; }
    this.selected = Array.isArray(val) ? val : [val];
  }
  registerOnChange(fn: any)    { this.onChange = fn; }
  registerOnTouched(fn: any)   { this.onTouched = fn; }
  setDisabledState(d: boolean) { this.disabled = d; }
}
