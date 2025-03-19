import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
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
    FormsModule,
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
  constructor(private snackBar: MatSnackBar, private dialog: MatDialog) { }

  flatNo: string = '';
  selectedOwnerId: string | null = null;
  selectedRenterId: string | null = null;
  owners: ApartmentUser[] = [];
  renters: ApartmentUser[] = [];

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
    if (!this.selectedOwnerId) {
      this.dialog.open(ConfirmationDialogComponent, {
        data: {
          title: 'Validation Error',
          message: 'Please select both owner and renter',
          buttons: [{ text: 'OK', role: 'dismiss' }]
        }
      });
      return;
    }

    const apartmentData: Apartment = {
      apartmentNumber: this.flatNo,
      ownerId: this.selectedOwnerId as string,
      tenantId: this.selectedRenterId as string
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
    this.flatNo = '';
    this.selectedOwnerId = null;
    this.selectedRenterId = null;
  }

}
