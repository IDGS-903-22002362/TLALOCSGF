import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, Router, NavigationEnd } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { importProvidersFrom, APP_INITIALIZER } from '@angular/core';
import { provideEchartsCore } from 'ngx-echarts';
import { FlexLayoutModule } from '@ngbracket/ngx-layout';
import { JWT_OPTIONS, JwtHelperService } from '@auth0/angular-jwt';
import { NgxEchartsModule } from 'ngx-echarts';
import { routes } from './app/app.routes';
import { jwtInterceptor } from './app/core/interceptors/jwt-interceptor';
import { AuthService } from './app/core/services/auth';
import { App } from './app/app';
import { initFlowbite } from 'flowbite';
import * as echarts from 'echarts';

/* ▸ Refresca el token una vez al arrancar si el usuario ya estaba logueado */
function refreshOnStart(auth: AuthService) {
  return () =>
    auth.isLoggedIn()
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

    /* ECharts */
    importProvidersFrom(NgxEchartsModule.forRoot({ echarts })),
    provideEchartsCore({ echarts }),

    /* APP_INITIALIZER: refresh token al cargar la app */
    {
      provide: APP_INITIALIZER,
      useFactory: refreshOnStart,
      deps: [AuthService],
      multi: true,
    },
  ],
})
  .then((appRef) => {
    // Inicializa Flowbite al arrancar y tras cada navegación (SPA)
    const router = appRef.injector.get(Router);
    const init = () => setTimeout(() => initFlowbite(), 0);

    init(); // primera carga

    router.events.subscribe((e) => {
      if (e instanceof NavigationEnd) init();
    });
  })
  .catch((err) => console.error(err));
