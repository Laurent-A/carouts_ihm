import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { PhotoService } from '../../core/services/photo.service';

@Component({
  selector: 'app-photo-picker',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './photo-picker.component.html',
  styleUrls: ['./photo-picker.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => PhotoPickerComponent),
    multi: true
  }]
})
export class PhotoPickerComponent implements ControlValueAccessor {
  photo: string | null = null;
  loading = false;
  disabled = false;

  private onChange = (_: any) => {};
  private onTouched = () => {};

  constructor(private photoService: PhotoService) {}

  async choisirPhoto() {
    if (this.disabled) return;
    this.loading = true;
    this.onTouched();
    const base64 = await this.photoService.choisirPhoto();
    if (base64) {
      this.photo = base64;
      this.onChange(base64);
    }
    this.loading = false;
  }

  supprimer() {
    this.photo = null;
    this.onChange(null);
  }

  writeValue(val: string | null)   { this.photo = val; }
  registerOnChange(fn: any)        { this.onChange = fn; }
  registerOnTouched(fn: any)       { this.onTouched = fn; }
  setDisabledState(d: boolean)     { this.disabled = d; }
}
