import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CarServiceService } from '../servies/car-service.service';
interface RentalDetails {
  pricePerKm: number;
  discount: number;
  perDayCost: number;
}

interface Car {
  _id: string;
  name: string;
  image: string;
  model: string;
  type: 'basic' | 'mid-range' | 'high-end';
  rentalDetails: RentalDetails;
  userDistance?: number;
  rentalDays?: number;
  details: string;
  gearType: 'manual' | 'automatic';
  isFrequentRenter?: boolean;
  loyaltyPoints?: number;
  extraDiscountRides?: number;
}
@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent  {


  // ngOnInit() {
  //   // Check if the admin is authenticated
  //     this.router.navigate(['/login']); // Redirect to login if not authenticated
  // }

  // Navigate to different sections
   
   cars: Car[] = [];
  selectedType: string = 'all';
  selectedGearType: string = 'all';
  editingCarId: string | null = null; // Track which car is being edited
    currentPage: string = '';
   constructor(private carService: CarServiceService ,private router: Router) {}
 

  // Function to set the current page
  setPage(page: string): void {
    this.currentPage = page;
  }

  ngOnInit(): void {
    this.fetchCars();
  }

  fetchCars(): void {
    this.carService.getCars().subscribe(
      (data) => {
        this.cars = data;
      },
      (error) => {
        console.error('Error fetching cars:', error);
      }
    );
  }

  enableEdit(carId: string): void {
    this.editingCarId = carId; // Set the car ID being edited
  }

  saveCar(car: Car): void {
    this.carService.updateCar(car._id, car).subscribe(
      (response) => {
        alert(`Car ${car.name} updated successfully!`);
        this.editingCarId = null; // Exit edit mode
        this.fetchCars(); // Refresh the car list
      },
      (error) => {
        console.error('Error updating car:', error);
      }
    );
  }

  cancelEdit(): void {
    this.editingCarId = null; // Exit edit mode without saving
  }
  deleteCar(carId: string): void {
  console.log('Attempting to delete car with ID:', carId); // Debug log
  if (confirm('Are you sure you want to delete this car?')) {
    this.carService.deleteCar(carId).subscribe(
      (response) => {
        console.log('Delete response:', response); // Debug log
        alert('Car deleted successfully.');
        this.fetchCars(); // Refresh the car list
      },
      (error) => {
        console.error('Error deleting car:', error);
        alert('Failed to delete the car. Please try again.');
      }
    );
  }
}
previousRentals = [
    { carName: 'Car 1', rentalDate: '2025-05-01', returnDate: '2025-05-05' },
    { carName: 'Car 2', rentalDate: '2025-04-15', returnDate: '2025-04-20' }
  ];
}