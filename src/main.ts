import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { importProvidersFrom } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app/app.routes';
import { jwtInterceptor } from './app/core/interceptors/jwt-interceptor';
import { FlexLayoutModule } from '@ngbracket/ngx-layout';
import { JWT_OPTIONS, JwtHelperService } from '@auth0/angular-jwt';
import { App } from './app/app';

bootstrapApplication(App, {
  providers: [
    provideRouter(routes),                                 
    provideHttpClient(withInterceptors([jwtInterceptor])),
    importProvidersFrom(FlexLayoutModule),
    { provide: JWT_OPTIONS, useValue: JWT_OPTIONS },
    JwtHelperService
  ]
});
