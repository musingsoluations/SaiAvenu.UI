import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { ApartmentUser } from '../../models/apartment-user';
import { ApartmentService } from '../../services/building/apartment-service';
import { CommonModule } from '@angular/common';

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
    const apartmentData = {
      flatNo: this.flatNo,
      ownerId: this.selectedOwnerId,
      renterId: this.selectedRenterId
    };
    // TODO: Implement service call
  }

}
