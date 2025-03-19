import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Environment } from "../../../environments/environment.interface";
import { API_ENV } from "../../../environments/environment";
import { ApartmentUser } from "../../models/apartment-user";
import { Apartment } from "../../models/apartment";
import { ApartmentResponse } from "../../models/ApartmentResponse";

@Injectable({
  providedIn: 'root',
})
export class ApartmentService {
  constructor(
    private http: HttpClient,

  ) { }

  private readonly environment: Environment = inject(API_ENV);

  getUserWithRole(roles: string[]) {
    const url = `${this.environment.apiUrl}/api/Apartment/userwithroles`;
    return this.http.post<ApartmentUser[]>(url, roles);
  }

  createApartment(apartment: Apartment) {
    const url = `${this.environment.apiUrl}/api/Apartment/AddApartment`;
    return this.http.post<Apartment>(url, apartment);
  }

  getApartments() {
    const url = `${this.environment.apiUrl}/api/Apartment/GetApartments`;
    return this.http.get<ApartmentResponse[]>(url);
  }
}
