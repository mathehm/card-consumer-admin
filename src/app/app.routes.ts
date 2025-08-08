import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: '/login' },
  { path: 'login', loadChildren: () => import('./pages/login/login.routes').then(m => m.LOGIN_ROUTES) },
  { path: 'welcome', loadChildren: () => import('./pages/welcome/welcome.routes').then(m => m.WELCOME_ROUTES), canActivate: [authGuard] },
  { path: 'products', loadChildren: () => import('./pages/products/products.routes').then(m => m.PRODUCTS_ROUTES), canActivate: [authGuard] },
  { path: 'wallets', loadChildren: () => import('./pages/wallets/wallets.routes').then(m => m.WALLETS_ROUTES), canActivate: [authGuard] }
];
