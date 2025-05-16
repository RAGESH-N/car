import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
export interface RentalDetails {
  pricePerKm: number;
  discount: number;
  perDayCost: number;
}

export interface Car {
  name: string;
  image: string;
  model: string;
  type: string;
  rentalDetails: RentalDetails;
  details: string;
  gearType: string;
  isFrequentRenter: boolean;
  loyaltyPoints: number;
  extraDiscountRides: number;
}

@Injectable({
  providedIn: 'root'
})
export class CarServiceService {

   private apiUrl = 'http://localhost:3000/api/cars'; // Backend API URL

  constructor(private http: HttpClient) {}

  // Fetch all cars
  getCars(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}`);
  }

  // Update car data
  updateCar(id: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  // Book a car
  bookCar(id: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/book/${id}`, {});
  }
  cancelBooking(bookingId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/cancel/${bookingId}`);
  }
  deleteCar(carId: string): Observable<any> {
  return this.http.delete(`${this.apiUrl}/${carId}`);
  }
}

