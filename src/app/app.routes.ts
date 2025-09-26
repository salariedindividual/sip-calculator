import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/calculator',
    pathMatch: 'full'
  },
  {
    path: 'calculator',
    loadComponent: () => import('./components/landing/landing.component').then(m => m.LandingComponent)
  },
  {
    path: 'regular-sip',
    loadComponent: () => import('./components/regular-sip/regular-sip.component').then(m => m.RegularSipComponent)
  },
  {
    path: 'step-up-sip',
    loadComponent: () => import('./components/step-up-sip/step-up-sip.component').then(m => m.StepUpSipComponent)
  },
  {
    path: 'dip-investment',
    loadComponent: () => import('./components/dip-investment/dip-investment.component').then(m => m.DipInvestmentComponent)
  },
  {
    path: '**',
    redirectTo: '/calculator'
  }
];