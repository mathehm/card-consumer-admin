import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: '/welcome' },
  { path: 'welcome', loadChildren: () => import('./pages/welcome/welcome.routes').then(m => m.WELCOME_ROUTES) },
  { path: 'products', loadChildren: () => import('./pages/products/products.routes').then(m => m.PRODUCTS_ROUTES) },
  { path: 'wallets', loadChildren: () => import('./pages/wallets/wallets.routes').then(m => m.WALLETS_ROUTES) }
];
