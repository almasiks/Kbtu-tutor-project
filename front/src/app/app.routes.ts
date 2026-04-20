import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { TutorDetails } from './components/tutor-details/tutor-details';
import { authGuard } from './services/auth';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'tutor/:id', component: TutorDetails, canActivate: [authGuard] },
];
