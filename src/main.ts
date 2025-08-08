import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter }        from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { importProvidersFrom, APP_INITIALIZER } from '@angular/core';

import { FlexLayoutModule }     from '@ngbracket/ngx-layout';
import { JWT_OPTIONS, JwtHelperService } from '@auth0/angular-jwt';

import { routes }          from './app/app.routes';
import { jwtInterceptor }  from './app/core/interceptors/jwt-interceptor';
import { AuthService }     from './app/core/services/auth';
import { App }             from './app/app';

/* ▸ Refresca el token una vez al arrancar si el usuario ya estaba logueado */
function refreshOnStart(auth: AuthService) {
  return () => auth.isLoggedIn()
    ? auth.refresh().toPromise().catch(() => undefined)
    : Promise.resolve();
}

bootstrapApplication(App, {
  providers: [
    /* Rutas principales */
    provideRouter(routes),

    /* HTTP + interceptor JWT */
    provideHttpClient(withInterceptors([jwtInterceptor])),

    /* Flex-Layout (opcional, lo tenías antes) */
    importProvidersFrom(FlexLayoutModule),

    /* JWT helper */
    { provide: JWT_OPTIONS, useValue: JWT_OPTIONS },
    JwtHelperService,

    /* APP_INITIALIZER: refresh token al cargar la app */
    {
      provide:  APP_INITIALIZER,
      useFactory: refreshOnStart,
      deps: [AuthService],
      multi: true,
    },
  ],
}).catch(err => console.error(err));
