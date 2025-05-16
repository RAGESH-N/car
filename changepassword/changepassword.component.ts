import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ChangePasswordService } from '../change-password.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-changepassword',
  templateUrl: './changepassword.component.html',
  styleUrls: ['./changepassword.component.css'],
})
export class ChangePasswordComponent {
  changePassword: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private changePasswordService: ChangePasswordService,
    private router: Router
  ) {
    this.changePassword = this.fb.group({
      currentPassword: ['', Validators.required],
      newpassword: [
        '',
        [
          Validators.required,
          Validators.pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,12}$/),
        ],
      ],
    });
  }

  get password() {
    return this.changePassword.get('newpassword')?.value || '';
  }
  get hasMinLength() { return this.password.length >= 8 && this.password.length <= 12; }
  get hasUppercase() { return /[A-Z]/.test(this.password); }
  get hasAlphanumeric() { return /[a-zA-Z]/.test(this.password) && /\d/.test(this.password); }
  get hasSpecialChar() { return /[!@#$%^&*]/.test(this.password); }

  onReset() {
    if (this.changePassword.invalid) return;

    // Get user's email from local storage (from login)
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user?.email) {
      this.errorMessage = 'User email not found. Please log in again.';
      return;
    }

    const formData = {
      email: user.email,
      currentPassword: this.changePassword.value.currentPassword,
      newpassword: this.changePassword.value.newpassword,
    };

    this.changePasswordService.changePassword(formData).subscribe({
      next: (res) => {
        this.successMessage = 'Password changed successfully!';
        this.errorMessage = '';
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1200);
      },
      error: (err) => {
        this.successMessage = '';
        if (err.status === 401) {
          this.errorMessage = 'Current password is incorrect.';
        } else if (err.status === 400) {
          this.errorMessage = err.error.error || 'Password criteria not met.';
        } else if (err.status === 404) {
          this.errorMessage = 'User not found.';
        } else {
          this.errorMessage = 'Something went wrong. Please try again.';
        }
      },
    });
  }
}