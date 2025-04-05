import { Routes } from '@angular/router';
import { HomePage } from './home/home.page';
import { LogPage } from './log/log.page';

export const routes: Routes = [
  { path: 'home', component: HomePage },
  { path: 'log', component: LogPage },
  { path: '', redirectTo: 'home', pathMatch: 'full' }
];
