import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { TutorDetails } from './components/tutor-details/tutor-details';
import { Login } from './components/login/login';
import { Register } from './components/register/register';
import { Profile } from './components/profile/profile';
import { SubjectTutors } from './components/subject-tutors/subject-tutors';
import { BecomeTutor } from './components/become-tutor/become-tutor';
import { authGuard } from './services/auth';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'profile', component: Profile, canActivate: [authGuard] },
  { path: 'tutor/:id', component: TutorDetails, canActivate: [authGuard] },
  { path: 'tutors/subject/:id', component: SubjectTutors },
  { path: 'become-tutor', component: BecomeTutor, canActivate: [authGuard] },
];
