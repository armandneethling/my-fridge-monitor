import { Routes } from '@angular/router';
import { HomePage } from './home/home.page';
import { LogPage } from './log/log.page';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';

export const routes: Routes = [
  { path: 'home', component: HomePage },
  { path: 'log', component: LogPage },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: '', component: HomePage, pathMatch: 'full' }
];
