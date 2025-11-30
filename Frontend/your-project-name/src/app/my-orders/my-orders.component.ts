import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { RouterModule, Router } from '@angular/router'; 
import { AuthService } from '../auth.service';
import { environment } from '../../environments/environment'; 

@Component({
  selector: 'app-my-orders',
  standalone: true,  
  imports: [CommonModule, RouterModule],  
  templateUrl: './my-orders.component.html',
  styleUrls: ['./my-orders.component.css']
})
export class MyOrdersComponent implements OnInit {
  orders: any[] = [];
  loading: boolean = true;
  errorMessage: string = '';
  expandedOrderId: string | null = null;  // Track which order is expanded

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.fetchOrders();
  }

  fetchOrders() {
    const userId = this.authService.getUserId();
    console.log('User ID:', userId);  
    if (!userId) {
      this.errorMessage = 'User not logged in';
      this.loading = false;
      return;
    }
  
    fetch(`${environment.apiUrl}/users/order?user_id=${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      return response.json();
    })
    .then(data => {
      console.log('Orders:', data);  
      this.orders = data;
      if (data.length === 0) {
        this.errorMessage = 'No orders found';
      }
      this.loading = false;
    })
    .catch(error => {
      console.error('Error:', error);
      this.errorMessage = 'Failed to load orders. Please try again later.';
      this.loading = false;
    });
  }

  toggleOrderDetails(orderId: string) {
    if (this.expandedOrderId === orderId) {
      this.expandedOrderId = null;  
    } else {
      this.expandedOrderId = orderId;  
    }
  }
  cancelOrder(orderId: string) {
    fetch(`${environment.apiUrl}/cancelOrder?order_id=${orderId}`, {
      method: 'PUT',
    })
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('Failed to cancel order');
        }
      })
      .then(data => {
        console.log(data.message); // Log the success message
  
        // Remove the canceled order from the orders list
        this.orders = this.orders.filter(order => order.id !== orderId);
        
        // Optionally reset any expanded order details if it was the canceled one
        if (this.expandedOrderId === orderId) {
          this.expandedOrderId = null;
        }
      })
      .catch(error => {
        console.error('Error:', error);
        this.errorMessage = 'Error cancelling order: ' + error.message;
      });
  }
}  