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
  showErrors: { [key: string]: boolean } = {};
  roles = ['Admin', 'Owner', 'Renter'];
  registrationForm: FormGroup;

  toggleError(field: string) {
    this.showErrors[field] = !this.showErrors[field];
  }

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registrationForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
      mobile: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      roles: this.fb.array([], Validators.required)
    }, { validator: this.passwordMatchValidator });
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('confirmPassword')?.value
      ? null : { mismatch: true };
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
