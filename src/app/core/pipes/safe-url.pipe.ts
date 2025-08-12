import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';

@Pipe({
  name: 'safeUrl',
  standalone: true
})
export class SafeUrlPipe implements PipeTransform {
  constructor(private readonly sanitizer: DomSanitizer) {}

  /**
   * Usa 'resourceUrl' para iframes (maps, youtube, etc).
   * Usa 'url' para hrefs normales si fuera necesario.
   */
  transform(
    value: string | null | undefined,
    kind: 'resourceUrl' | 'url' = 'resourceUrl'
  ): SafeResourceUrl | SafeUrl | null {
    if (!value) return null;

    return kind === 'resourceUrl'
      ? this.sanitizer.bypassSecurityTrustResourceUrl(value)
      : this.sanitizer.bypassSecurityTrustUrl(value);
  }
}
