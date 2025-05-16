import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminLoginService } from '../admin-login.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-adminlogin',
  templateUrl: './adminlogin.component.html',
  styleUrls: ['./adminlogin.component.css']
})
export class AdminloginComponent {
  loginForm: FormGroup;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private adminLoginService: AdminLoginService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onLogin() {
    if (this.loginForm.invalid) return;
    this.adminLoginService.login(this.loginForm.value).subscribe({
      next: (res) => {
        alert('Login successful!');
        this.errorMessage = '';
        // this.router.navigate(['/admin-dashboard']); // Uncomment if you have a dashboard
      },
      error: (err) => {
        if (err.status === 404) {
          this.errorMessage = 'Admin not found.';
        } else if (err.status === 401) {
          this.errorMessage = 'Invalid password.';
        } else {
          this.errorMessage = 'An unexpected error occurred.';
        }
      }
    });
  }
}