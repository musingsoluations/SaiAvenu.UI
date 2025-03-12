import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { provideRouter } from '@angular/router';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-registration',
  standalone: true,
  templateUrl: './user-registration.component.html',
  styleUrls: ['./user-registration.component.css'],
  imports: [
    ReactiveFormsModule,
    CommonModule
  ]
})
export class UserRegistrationComponent {
  submitted = false;
  roles = ['Admin', 'Owner', 'Renter'];
  registrationForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registrationForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
      ]],
      confirmPassword: ['', [Validators.required]],
      mobile: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      roles: this.fb.array([], Validators.required)
    }, { validator: this.passwordMatchValidator });

    // Mark all controls as touched to show initial validation state
    Object.keys(this.registrationForm.controls).forEach(controlName => {
      this.registrationForm.get(controlName)?.markAsTouched();
    });
  }

  passwordMatchValidator(g: FormGroup) {
    const password = g.get('password');
    const confirmPassword = g.get('confirmPassword');

    if (password?.value !== confirmPassword?.value) {
      confirmPassword?.setErrors({ mismatch: true });
      return { mismatch: true };
    } else {
      confirmPassword?.setErrors(null);
      return null;
    }
  }

  onRoleChange(e: any) {
    const rolesArray = this.registrationForm.get('roles') as FormArray;
    if (e.target.checked) {
      rolesArray.push(this.fb.control(e.target.value));
    } else {
      const index = rolesArray.controls.findIndex(c => c.value === e.target.value);
      rolesArray.removeAt(index);
    }
  }

  getErrorMessage(controlName: string): string {
    const control = this.registrationForm.get(controlName);

    if (!control?.errors) return '';

    if (control.errors['required']) {
      return `${controlName.charAt(0).toUpperCase() + controlName.slice(1)} is required`;
    }
    if (control.errors['email']) {
      return 'Please enter a valid email address';
    }
    if (control.errors['minlength']) {
      return `Password must be at least ${control.errors['minlength'].requiredLength} characters`;
    }
    if (control.errors['pattern']) {
      return 'Mobile number must be 10 digits';
    }
    if (control.errors['mismatch']) {
      return 'Passwords do not match';
    }
    return 'Invalid value';
  }

  onSubmit() {
    this.submitted = true;
    if (this.registrationForm.valid) {
      this.authService.registerUser(this.registrationForm.value).subscribe({
        next: () => this.router.navigate(['/login']),
        error: (err) => console.error('Registration failed:', err)
      });
    }
  }
}
