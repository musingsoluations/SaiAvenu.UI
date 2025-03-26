import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { ApartmentUser } from '../../models/apartment-user';
import { ApartmentService } from '../../services/building/apartment-service';
import { CommonModule } from '@angular/common';
import { Apartment } from '../../models/apartment';
import { ApartmentResponse } from "../../models/ApartmentResponse";
import { catchError, finalize, take } from 'rxjs/operators';
import { of, Subject } from 'rxjs';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-apartment',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatTableModule,
  ],
  templateUrl: './apartment.component.html',
  styleUrls: ['./apartment.component.css']
})
export class ApartmentComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  floatLabel(): 'always' {
    return 'always';
  }

  buildingService: ApartmentService = inject(ApartmentService);
  apartmentForm: FormGroup;
  owners: ApartmentUser[] = [];
  renters: ApartmentUser[] = [];
  apartments: ApartmentResponse[] = [];
  displayedColumns: string[] = ['Apartment Number', 'Owner', 'Tenant'];
  isLoading = false;

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
    this.loadInitialData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadInitialData(): void {
    this.isLoading = true;

    // Combine all initial data loading
    const owners$ = this.buildingService.getUserWithRole(['owner']).pipe(
      catchError(error => {
        this.showError('Failed to load owners', error);
        return of([]);
      })
    );

    const renters$ = this.buildingService.getUserWithRole(['renter']).pipe(
      catchError(error => {
        this.showError('Failed to load renters', error);
        return of([]);
      })
    );

    const apartments$ = this.buildingService.getApartments().pipe(
      catchError(error => {
        this.showError('Failed to load apartments', error);
        return of([]);
      })
    );

    // Subscribe to all observables at once
    forkJoin({
      owners: owners$,
      renters: renters$,
      apartments: apartments$
    }).pipe(
      take(1),
      finalize(() => {
        this.isLoading = false;
      })
    ).subscribe({
      next: (result) => {
        this.owners = result.owners;
        this.renters = result.renters;
        this.apartments = result.apartments;
      },
      error: (error) => {
        this.showError('Error loading data', error);
        this.isLoading = false;
      }
    });
  }

  // Remove the separate loadApartments method since it's now part of loadInitialData
  // Update the onSubmit method to use the new pattern
  onSubmit() {
    if (this.apartmentForm.invalid) {
      this.showError('Validation Error', 'Please fill in all required fields (Flat Number and Owner)');
      return;
    }

    const formValue = this.apartmentForm.value;
    const apartmentData: Apartment = {
      apartmentNumber: formValue.flatNo,
      ownerId: formValue.ownerId,
      tenantId: formValue.renterId || null
    };

    this.isLoading = true;
    this.buildingService.createApartment(apartmentData).pipe(
      take(1),
      finalize(() => {
        this.isLoading = false;
      })
    ).subscribe({
      next: (result) => {
        if (result) {
          this.snackBar.open('Apartment saved successfully!', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.resetForm();
          this.loadInitialData(); // Reload all data
        }
      },
      error: (error) => {
        this.showError('Save Error', error);
      }
    });
  }

  private showError(title: string, error: any): void {
    const message = error.message || error;
    this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: title,
        message: `${title}: ${message}`,
        buttons: [{ text: 'OK', role: 'dismiss' }]
      }
    });
  }

  private resetForm() {
    this.apartmentForm.reset();
  }
}
