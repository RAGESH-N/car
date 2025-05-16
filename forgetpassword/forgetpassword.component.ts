import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ForgetPasswordService } from '../forget-password.service';

@Component({
  selector: 'app-forgetpassword',
  templateUrl: './forgetpassword.component.html',
  styleUrls: ['./forgetpassword.component.css']
})
export class ForgetpasswordComponent {
  forgetPassword: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private forgetPasswordService: ForgetPasswordService
  ) {
    this.forgetPassword = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      newpassword: [
        '',
        [
          Validators.required,
          Validators.pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,12}$/)
        ]
      ],
      confirmpassword: ['', Validators.required],
      favourites: [''] // add favourites as string
    });
  }

  get password() {
    return this.forgetPassword.get('newpassword')?.value || '';
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
    return this.forgetPassword.get('confirmpassword')?.value || '';
  }

  get hasPasswordMismatch() {
    return (
      this.forgetPassword.get('confirmpassword')?.touched &&
      this.confirmPassword !== this.password
    );
  }

  onReset() {
    if (this.forgetPassword.invalid) {
      return;
    }

    if (!this.hasPasswordMismatch) {
      const formData = this.forgetPassword.value;
      this.forgetPasswordService.resetPassword(formData).subscribe({
        next: (response) => {
          this.successMessage = 'Password reset successful! You can now log in.';
          this.errorMessage = '';
          setTimeout(() => this.router.navigate(['/login']), 1500);
        },
        error: (error) => {
          this.successMessage = '';
          if (error.status === 404) {
            this.errorMessage = 'User not found.';
          } else if (error.status === 400) {
            this.errorMessage = error.error.error || 'Bad request.';
          } else {
            this.errorMessage = 'An unexpected error occurred. Please try again.';
          }
        }
      });
    }
  }
}