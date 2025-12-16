import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth.service'; // Import AuthService
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-create-order',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './create-order.component.html',
  styleUrls: ['./create-order.component.css']
})
export class CreateOrderComponent {
  createOrderForm: FormGroup;
  loading = false;

  constructor(
    private formBuilder: FormBuilder, 
    private authService: AuthService // Inject AuthService
  ) {
    this.createOrderForm = this.formBuilder.group({
      pickup_location: ['', Validators.required],
      dropoff_location: ['', Validators.required],
      package_details: ['', Validators.required], 
      delivery_time: [''] 
    });
  }

  onCreateOrder() {
    if (this.createOrderForm.valid) {
      this.loading = true;
      const userId = this.authService.getUserId(); 
      if (!userId) {
        alert('User not logged in. Please login first.');
        this.loading = false;
        return;
      }
      const orderData = {
        ...this.createOrderForm.value,
        user_id: userId
      };

      fetch(`${environment.apiUrl}/api/orders/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to create order');
          }
          return response.json();
        })
        .then(data => {
          console.log('Order created successfully:', data);
          alert('Order created successfully!');
          this.createOrderForm.reset();
        })
        .catch(error => {
          console.error('Error creating order:', error);
          alert('Failed to create order. Please try again.');
        })
        .finally(() => {
          this.loading = false;
        });
    } else {
      alert('Please fill in all fields correctly.');
    }
  }
}
