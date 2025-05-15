import { Routes } from '@angular/router';
import { HomePage } from './home/home.page';
import { LogPage } from './log/log.page';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { AuthGuard } from './auth/auth.guard';

export const routes: Routes = [
  {
    path: 'home',
    component: HomePage,
    canActivate: [AuthGuard],  // Protect HomePage
  },
  {
    path: 'log',
    component: LogPage,
    canActivate: [AuthGuard],  // Protect LogPage
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'register',
    component: RegisterComponent,
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
];
