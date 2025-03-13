import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CreateUser } from '../../models/create-user';
import { UserAdminService } from '../../services/admin/user-admin.service';
import { FloatLabelType } from '@angular/material/form-field';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatError } from '@angular/material/form-field';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatButton } from '@angular/material/button';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-register-user',
  templateUrl: './register-user.component.html',
  styleUrls: ['./register-user.component.css'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatError,
    MatButton,
    CommonModule,
    MatDialogModule
  ]
})
export class RegisterUserComponent {
  registerForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private userAdminService: UserAdminService,
    private dialog: MatDialog
  ) {
    this.registerForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      mobile: ['', [Validators.required, Validators.pattern('[0-9]{10}')]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required],
      roles: this.fb.array([], Validators.required)
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

  onRoleChange(event: any, role: string) {
    const roles = this.registerForm.get('roles') as FormArray;
    if (event.checked) {
      roles.push(this.fb.control(role));
    } else {
      const index = roles.controls.findIndex(x => x.value === role);
      roles.removeAt(index);
    }
  }

  register() {
    if (this.registerForm.valid) {
      const userData = this.registerForm.value;
      this.userAdminService.registerUser(userData).subscribe({
        next: () => {
          this._snackBar.open('User registered successfully', 'Done', { duration: 5000 });
          this.registerForm.reset();
        },
        error: (err) => {
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
