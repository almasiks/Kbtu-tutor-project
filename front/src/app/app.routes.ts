import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home';
import { LoginComponent } from './components/login/login';
import { ProfileComponent } from './components/profile/profile';
import { TutorDetailComponent } from './components/tutor/tutor';
import { AdminComponent } from './components/admin/admin';
import { RegisterComponent } from './components/register/register';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'tutor/:id', component: TutorDetailComponent },
  { path: 'admin-panel', component: AdminComponent },
  { path: '**', redirectTo: '' },
];
