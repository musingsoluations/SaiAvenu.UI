import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { ApartmentUser } from '../../models/apartment-user';
import { ApartmentService } from '../../services/building/apartment-service';
import { CommonModule } from '@angular/common';
import { Apartment } from '../../models/apartment';

@Component({
  selector: 'app-apartment',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
  ],
  templateUrl: './apartment.component.html',
  styleUrls: ['./apartment.component.css']
})
export class ApartmentComponent implements OnInit {
  floatLabel(): 'always' {
    return 'always';
  }

  buildingService: ApartmentService = inject(ApartmentService);
  apartmentForm: FormGroup;
  owners: ApartmentUser[] = [];
  renters: ApartmentUser[] = [];

  constructor(
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private fb: FormBuilder
  ) {
    this.apartmentForm = this.fb.group({
      flatNo: ['', [Validators.required]],
      ownerId: ['', [Validators.required]],
      renterId: ['']
    });
  }

  ngOnInit(): void {
    this.buildingService.getUserWithRole(['owner']).subscribe(
      (users) => {
        this.owners = users;
      });
    this.buildingService.getUserWithRole(['renter']).subscribe(
      (users) => {
        this.renters = users;
      });
  }

  onSubmit() {
    if (this.apartmentForm.invalid) {
      this.dialog.open(ConfirmationDialogComponent, {
        data: {
          title: 'Validation Error',
          message: 'Please fill in all required fields (Flat Number and Owner)',
          buttons: [{ text: 'OK', role: 'dismiss' }]
        }
      });
      return;
    }

    const formValue = this.apartmentForm.value;
    const apartmentData: Apartment = {
      apartmentNumber: formValue.flatNo,
      ownerId: formValue.ownerId,
      tenantId: formValue.renterId || null
    };

    this.buildingService.createApartment(apartmentData).subscribe({
      next: () => {
        this.snackBar.open('Apartment saved successfully!', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.resetForm();
      },
      error: (err) => {
        this.dialog.open(ConfirmationDialogComponent, {
          data: {
            title: 'Save Error',
            message: `Failed to save apartment: ${err.message}`,
            buttons: [{ text: 'OK', role: 'dismiss' }]
          }
        });
      }
    });
  }

  private resetForm() {
    this.apartmentForm.reset();
  }
}
