import { Routes } from '@angular/router';
import { HomePage } from './home/home.page';
import { LogPage } from './log/log.page';
// import { LoginComponent } from './auth/login/login.component';
import { AuthGuard } from './auth/auth.guard';

export const routes: Routes = [
  {
    path: 'home',
    component: HomePage,
    // canActivate: [AuthGuard],
  },
  {
    path: 'log',
    component: LogPage,
    // canActivate: [AuthGuard],
  },
  // {
  //   path: 'login',
  //   component: LoginComponent,
  // },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
];
