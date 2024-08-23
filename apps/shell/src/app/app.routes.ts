import { Route } from '@angular/router';
import { loadRemoteModule } from '@angular-architects/native-federation';
import { OktaAuthGuard, OktaCallbackComponent } from '@okta/okta-angular';

export async function getAppRoutes(): Promise<Route[]> {
  const res = await fetch('assets/appSetting.json');
  const data = await res.json();
  const route = data.map((route: any) => {
    if (route.remoteModule)
      return {
        path: route.path,
        loadComponent: () =>
          import('@mfe-starter-kit/shared-ui').then(
            (m: any) => m[route.layout]
          ), // Dynamic import based on layout
        loadChildren: () =>
          loadRemoteModule(
            route.remoteModule.name,
            `${route.remoteModule.exposes}`
          ).then((m) => m[route.remoteModule.module]), // Dynamic import based on remote module
      };
    else {
      return {
        path: route.path,
        pathMatch: route.path ? '' : 'full',
        loadComponent: () =>
          import('@mfe-starter-kit/shared-ui').then(
            (m: any) => m[route.layout]
          ),
        loadChildren: async () => {
          return import(`./${route.featureModule}.module.ts`).then((m) => {
            return m.default;
          });
        },
      };
    }
  });
  route.push({ path: 'login/callback', component: OktaCallbackComponent });
  return route;
}
