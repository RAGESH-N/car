import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SignupService } from '../service/signup.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
})
export class SignupComponent {
  signupForm: FormGroup;
  captcha: string = this.generateCaptcha();
  showErrorPopup: boolean = false; // Control popup visibility
  errorMessage: string = ''; // Error message to display in the popup

  constructor(private fb: FormBuilder, private router: Router, private signupService: SignupService) {
    this.signupForm = this.fb.group({
      name: ['', Validators.required],
      mobile: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      email: ['', [Validators.required, Validators.email, Validators.pattern(/^[a-zA-Z0-9._%+-]+@gmail\.com$/)]],
      password: [
        '',
        [
          Validators.required,
          Validators.pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,12}$/),
        ],
      ],
      confirmPassword: ['', Validators.required],
      captchaInput: ['', Validators.required],
      favourites: ['',Validators.required], // Added favourites as a string
    });
  }

  get password() {
    return this.signupForm.get('password')?.value || '';
  }

  get hasMinLength() {
    return this.password.length >= 8 && this.password.length <= 12;
  }

  get hasUppercase() {
    return /[A-Z]/.test(this.password);
  }

  get hasAlphanumeric() {
    return /[a-zA-Z]/.test(this.password) && /\d/.test(this.password);
  }

  get hasSpecialChar() {
    return /[!@#$%^&*]/.test(this.password);
  }

  get confirmPassword() {
    return this.signupForm.get('confirmPassword')?.value || '';
  }

  get captchaInput() {
    return this.signupForm.get('captchaInput')?.value || '';
  }

  get hasPasswordMismatch() {
    return this.signupForm.get('confirmPassword')?.touched && this.confirmPassword !== this.password;
  }

  get hasCaptchaMismatch() {
    return this.signupForm.get('captchaInput')?.touched && this.captchaInput !== this.captcha;
  }

  generateCaptcha(): string {
    return Math.random().toString(36).substring(2, 8);
  }

  refreshCaptcha(): void {
    this.captcha = this.generateCaptcha();
  }

  onSubmit() {
    if (this.signupForm.invalid) {
      return;
    }

    if (!this.hasPasswordMismatch && !this.hasCaptchaMismatch) {
      const formData = this.signupForm.value;
      // favourites is already a string, no conversion needed
      this.signupService.signup(formData).subscribe({
        next: (response) => {
          alert('Signup successful!');
          this.router.navigate(['/login']);
        },
        error: (error) => {
          if (error.status === 400 && error.error.error === 'Email or Mobile number already exists') {
            this.errorMessage = 'Email or Phone number is already registered!';
            this.showErrorPopup = true;
          } else {
            alert('An unexpected error occurred. Please try again.');
          }
        },
      });
    }
  }

  closePopup(): void {
    this.showErrorPopup = false; // Close the popup
  }
}