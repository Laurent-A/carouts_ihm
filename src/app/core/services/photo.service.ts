import { Injectable } from '@angular/core';

const MAX_SIZE_PX  = 1200; // redimension max
const JPEG_QUALITY = 0.75; // qualité compression

@Injectable({ providedIn: 'root' })
export class PhotoService {

  /**
   * Ouvre le sélecteur de fichier natif (galerie + appareil photo sur mobile)
   * et retourne une chaîne base64 compressée.
   */
  choisirPhoto(): Promise<string | null> {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type   = 'file';
      input.accept = 'image/*';
      input.capture = 'environment'; // caméra arrière sur mobile

      input.onchange = async (event: Event) => {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (!file) { resolve(null); return; }
        try {
          const base64 = await this.compresser(file);
          resolve(base64);
        } catch {
          resolve(null);
        }
      };

      input.oncancel = () => resolve(null);
      input.click();
    });
  }

  /**
   * Redimensionne et compresse une image en JPEG base64
   */
  private compresser(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload  = (e) => {
        const img = new Image();
        img.onerror = reject;
        img.onload  = () => {
          const canvas = document.createElement('canvas');
          let { width, height } = img;

          // Redimensionner si trop grande
          if (width > MAX_SIZE_PX || height > MAX_SIZE_PX) {
            const ratio = Math.min(MAX_SIZE_PX / width, MAX_SIZE_PX / height);
            width  = Math.round(width  * ratio);
            height = Math.round(height * ratio);
          }

          canvas.width  = width;
          canvas.height = height;
          canvas.getContext('2d')!.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', JPEG_QUALITY));
        };
        img.src = e.target!.result as string;
      };
      reader.readAsDataURL(file);
    });
  }

  /**
   * Estime la taille en Mo d'un base64
   */
  tailleMo(base64: string): number {
    const bytes = (base64.length * 3) / 4;
    return Math.round((bytes / 1024 / 1024) * 100) / 100;
  }
}
