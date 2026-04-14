import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class HomeComponent {
  tutorName: string = '';
  searchQuery: string = '';
  tutors = [
    { id: 1, name: 'John Doe', subject: 'Mathematics', rating: 4.5 },
    { id: 2, name: 'Jane Smith', subject: 'Physics', rating: 4.0 },
    { id: 3, name: 'Almas Magrupov', subject: 'Chemistry', rating: 4.2 },
    { id: 4, name: 'Michael Brown', subject: 'Biology', rating: 4.7 },
    { id: 5, name: 'Alikhan Turugeldiev', subject: 'English', rating: 4.3 },
    { id: 6, name: 'Yertayev Daniyal', subject: 'History', rating: 4.1 },
  
  ];

  onSearch() {
    console.log('Search query:', this.searchQuery);
  }
  selectTutor(tutor: any) {
    console.log('Selected tutor:', tutor);
    
    alert(`You selected ${tutor.name}, who teaches ${tutor.subject} with a rating of ${tutor.rating}`);
  }
}
