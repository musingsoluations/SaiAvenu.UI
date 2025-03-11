import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  credentials = { userId: '', password: '' };
  errorMessage = '';
  submitting = false;

  constructor(
    private auth: AuthService,
    private router: Router
  ) { }

  onSubmit() {
    this.submitting = true;
    this.errorMessage = '';

    this.auth.login(this.credentials.userId, this.credentials.password).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
        this.submitting = false;
      },
      error: (err) => {
        this.errorMessage = 'Login failed. Please check your credentials.';
        this.submitting = false;
      }
    });
  }
}
