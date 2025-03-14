import { Component, inject } from '@angular/core';
import { FloatLabelType, MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { UserAdminService } from '../../services/admin/user-admin.service';
import { UserProfileService } from '../../services/users/user-profile.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatButton,
    ReactiveFormsModule,
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent {
  registerForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private userProfileService: UserProfileService,
    private dialog: MatDialog
  ) {
    this.registerForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      mobile: ['', [Validators.required, Validators.pattern('[0-9]{10}')]],
      email: ['', [Validators.required, Validators.email]],
      password: [''],
      confirmPassword: [''],
    }, { validator: this.passwordMatchValidator });
  }
  private _snackBar = inject(MatSnackBar);

  readonly hideRequiredControl = new FormControl(false);
  readonly floatLabelControl = new FormControl('auto' as FloatLabelType);
  readonly options: any;

  protected readonly hideRequired = toSignal(this.hideRequiredControl.valueChanges);

  protected readonly floatLabel = toSignal(
    this.floatLabelControl.valueChanges.pipe(map(v => v || 'auto')),
    { initialValue: 'auto' },
  );
  passwordMatchValidator(form: FormGroup) {
    return form.get('password')?.value === form.get('confirmPassword')?.value
      ? null : { mismatch: true };
  }

  ngOnInit() {
    this.userProfileService.getUserProfile().subscribe({
      next: (profile) => {
        this.registerForm.patchValue(profile);
      },
      error: (err) => {
        this._snackBar.open('Failed to load profile', 'Close', { duration: 5000 });
        console.error('Profile load error:', err);
      }
    });
  }

  register() {
    if (this.registerForm.valid) {
      const UserProfileUpdate = this.registerForm.value;
      this.userProfileService.updateUserProfile(UserProfileUpdate).subscribe({
        next: () => {
          this._snackBar.open('User registered successfully', 'Done', { duration: 5000 });
        },
        error: (err: any) => {
          console.error(err);
          this.dialog.open(ConfirmationDialogComponent, {
            data: {
              title: err.error.title || 'Error',
              content: err.error.errors || 'An error occurred'
            }
          });
        }
      });
    }
  }
}
