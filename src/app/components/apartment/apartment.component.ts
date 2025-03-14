import { Component, inject, OnInit } from '@angular/core';
import { Apartment } from '../../models/apartment';
import { ApartmentService } from '../../services/building/apartment-service';

@Component({
  selector: 'app-apartment',
  templateUrl: './apartment.component.html',
  styleUrls: ['./apartment.component.css']
})
export class ApartmentComponent implements OnInit {

  buildingService: ApartmentService = inject(ApartmentService);

  ngOnInit(): void {
    this.buildingService.getUserWithRole(['owner']).subscribe((data) => {
      console.log(data);
    });
  }

}
