import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Apartment } from '../../models/apartment';
import { ApartmentUser } from '../../models/apartment-user';
import { ApartmentService } from '../../services/building/apartment-service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-apartment',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './apartment.component.html',
  styleUrls: ['./apartment.component.css']
})
export class ApartmentComponent implements OnInit {

  buildingService: ApartmentService = inject(ApartmentService);

  flatNo: string = '';
  selectedOwnerId: number | null = null;
  selectedRenterId: number | null = null;
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
