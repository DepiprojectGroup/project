import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';

interface AssignOrderToCourier {
  id: number;
  pickup_location: string;
  dropoff_location: string;
  package_details: string;
  status: string;
  courier_id: number;
}

@Component({
  selector: 'app-assign-order-to-courier',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './assign-order-to-courier.component.html',
  styleUrls: ['./assign-order-to-courier.component.css']
})
export class AssignOrderToCourierComponent implements OnInit {
  orders: AssignOrderToCourier[] = [];
  couriers: { id: number; name: string }[] = [];
  selectedCourierId: number | null = null;
  errorMessage: string = '';
  selectedOrderId: number | null = null;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadData();
  }

  private async loadData() {
    await Promise.all([this.fetchAssignedOrders(), this.fetchCouriers()]);
  }

  private async fetchAssignedOrders() {
    try {
      const response = await fetch(`${environment.apiUrl}/admin/assigned-orders`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      console.log('API response data:', data); 
      this.orders = data.filter((order: AssignOrderToCourier) => order.status !== 'in transit' && order.status !== 'delivered');
      console.log('Filtered orders:', this.orders); 
    } catch (error) {
      this.handleError('Error fetching assigned orders:', error);
    }
  }
  
  

  private async fetchCouriers() {
    try {
      const response = await fetch(`${environment.apiUrl}/couriers`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      this.couriers = await response.json();
    } catch (error) {
      this.handleError('Error fetching couriers:', error);
    }
  }

  private handleError(message: string, error: any) {
    console.error(message, error);
    this.errorMessage = message;
  }

  onReassignOrder(orderId: number, selectedCourierId: number) {
    if (selectedCourierId) {
      this.reassignOrder(orderId, selectedCourierId);
    } else {
      this.errorMessage = 'Please select a courier';
    }
  }

  async reassignOrder(orderId: number, newCourierId: number) {
    if (newCourierId <= 0) {
      this.errorMessage = 'Please select a valid courier';
      return;
    }
  
    console.log('Reassigning order ID:', orderId, 'to courier ID:', newCourierId);  
  
    try {
      const response = await fetch(`${environment.apiUrl}/AssignOrder`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId, courierId: newCourierId }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to reassign order');
      }
  
      const updatedOrder = await response.json();
      console.log('Updated order response:', updatedOrder); 

      const orderIndex = this.orders.findIndex(order => order.id === orderId);
      if (orderIndex !== -1) {
        this.orders[orderIndex] = { ...this.orders[orderIndex], courier_id: newCourierId };
      }

      alert('Order reassigned successfully!');
      this.selectedCourierId = null;
    } catch (error) {
      this.handleError('Error reassigning order:', error);
    }
  }
  
}
