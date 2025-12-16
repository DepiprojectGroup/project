import { Component, EventEmitter, Output } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { environment } from '../../environments/environment';  

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  @Output() loginSuccess = new EventEmitter<string>(); 

  constructor(
    private formBuilder: FormBuilder, 
    private router: Router, 
    private authService: AuthService  
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onLogin() {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
  
      fetch(`${environment.apiUrl}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })
        .then(response => {
          if (response.ok) {
            return response.json();
          } else {
            return response.json().then(errData => {
              throw new Error(errData.message || 'Invalid email or password');
            });
          }
        })
        .then(data => {
          console.log('Login successful:', data);
          
        
          this.authService.setUserId(data.userId); 
          localStorage.setItem('userId', data.userId);  
          
       
          this.loginSuccess.emit(data.role); 
  
          alert('Login successful.');
        })
        .catch(error => {
          console.error('Error:', error);
          alert('Login failed: ' + error.message);
        });
    } else {
      alert('Please enter a valid email and password.');
    }
  }
}
