import { Component, inject, Signal, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ContactService, CreateContactDto } from '../../core/services/contact';
import { AuthService } from '../../core/services/auth';
import { SafeUrlPipe } from '../../core/pipes/safe-url.pipe';

@Component({
  standalone: true,
  selector: 'app-contact',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, SafeUrlPipe],
  templateUrl: './contact.html'
})
export class ContactComponent {
  private fb = inject(FormBuilder);
  private contact = inject(ContactService);
  private auth = inject(AuthService);

  info = signal<any>(null);
  ok = signal<boolean | null>(null);
  msg = signal('');

  form = this.fb.group({
    fullName: ['', [Validators.required, Validators.maxLength(150)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
    phone: [''],
    topic: ['General', Validators.required],
    message: ['', [Validators.required, Validators.maxLength(3000)]],
    asTicket: [false]
  });

  ngOnInit() {
    this.contact.info().subscribe(i => this.info.set(i));
    if (this.auth.isLoggedIn()) {
      this.auth.me().subscribe(me => {
        this.form.patchValue({ fullName: me.fullName, email: me.email });
      });
    }
  }

  submit() {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    const dto: CreateContactDto = {
      fullName: v.fullName!.trim(),
      email: v.email!.trim(),
      phone: (v.phone || '').toString().replace(/\D+/g, '') || null,
      topic: v.topic!,
      message: v.message!.trim(),
      asTicket: !!v.asTicket
    };
    this.contact.send(dto).subscribe({
      next: () => { this.ok.set(true); this.msg.set('¡Gracias! Hemos recibido tu mensaje.'); this.form.reset({ topic: 'General', asTicket: false }); },
      error: e => { console.error(e); this.ok.set(false); this.msg.set('No pudimos enviar tu mensaje. Intenta más tarde.'); }
    });
  }
}
