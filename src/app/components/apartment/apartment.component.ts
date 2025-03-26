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

    // Load owners
    this.buildingService.getUserWithRole(['owner']).pipe(
      take(1),
      catchError(error => {
        this.showError('Failed to load owners', error);
        return of([]);
      })
    ).subscribe(users => {
      this.owners = users;
    });

    // Load renters
    this.buildingService.getUserWithRole(['renter']).pipe(
      take(1),
      catchError(error => {
        this.showError('Failed to load renters', error);
        return of([]);
      })
    ).subscribe(users => {
      this.renters = users;
    });

    // Load apartments
    this.loadApartments();
  }

  loadApartments() {
    this.isLoading = true;
    this.buildingService.getApartments().pipe(
      take(1),
      catchError(error => {
        this.showError('Failed to load apartments', error);
        return of([]);
      }),
      finalize(() => {
        this.isLoading = false;
      })
    ).subscribe(apartments => {
      this.apartments = apartments;
    });
  }

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
      catchError(error => {
        this.showError('Save Error', error);
        return of(null);
      }),
      finalize(() => {
        this.isLoading = false;
      })
    ).subscribe(result => {
      if (result !== null) {
        this.snackBar.open('Apartment saved successfully!', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.resetForm();
        this.loadApartments();
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
