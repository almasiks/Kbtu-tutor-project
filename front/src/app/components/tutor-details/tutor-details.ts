import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-tutor-details',
  imports: [CommonModule],
  templateUrl: './tutor-details.html',
  styleUrl: './tutor-details.css',
})
export class TutorDetails {
  private readonly route = inject(ActivatedRoute);
  readonly tutorId = this.route.snapshot.paramMap.get('id');
}
