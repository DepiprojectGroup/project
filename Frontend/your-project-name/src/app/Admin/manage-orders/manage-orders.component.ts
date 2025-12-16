import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';

interface Order {
  id: number;
  pickup_location: string;
  dropoff_location: string;
  package_details: string;
  status: string;
  assignedCourier: number | null;
}

@Component({
  selector: 'app-manage-orders',
  standalone: true, 
  imports: [CommonModule, ReactiveFormsModule, FormsModule], 
  templateUrl: './manage-orders.component.html',
  styleUrls: ['./manage-orders.component.css']
})
export class ManageOrdersComponent implements OnInit {
  orders: Order[] = [];
  couriers: { id: number, name: string }[] = [];
  orderForm: FormGroup;

  constructor(private formBuilder: FormBuilder) {
    this.orderForm = this.formBuilder.group({});
  }

  ngOnInit(): void {
    this.loadData();
  }

  private async loadData(): Promise<void> {
    try {
      await this.fetchOrders();
      await this.fetchCouriers();
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }

  private async fetchCouriers(): Promise<void> {
    try {
      const response = await fetch(`${environment.apiUrl}/api/couriers`);
      if (!response.ok) throw new Error('Failed to fetch couriers');
      this.couriers = await response.json();
    } catch (error) {
      console.error('Error fetching couriers:', error);
    }
  }

  private async fetchOrders(): Promise<void> {
    try {
      const response = await fetch(`${environment.apiUrl}/api/admin/AllOrders`);
      if (!response.ok) throw new Error('Failed to fetch orders');
      this.orders = await response.json();
      
      console.log('Fetched orders:', this.orders);
      
      this.orders.forEach(order => {
        this.orderForm.addControl(`status-${order.id}`, new FormControl(order.status));
        this.orderForm.addControl(`assignedCourier-${order.id}`, new FormControl(order.assignedCourier));
      });
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  }
  

  async updateOrderStatus(order: Order): Promise<void> {
    const newStatus = this.orderForm.get(`status-${order.id}`)?.value;
    if (newStatus) {
      await this.handleOrderUpdate('UpdateOrderStatus', { orderId: order.id, status: newStatus });
    } else {
      alert('Please select a status to update.');
    }
  }

  async assignCourier(order: Order): Promise<void> {
    if (order.status === 'cancelled') {
      alert('Cannot assign a courier to a cancelled order.');
      return; 
    }
    if (order.status === 'in transit') {
      alert('Cannot assign a courier to an order in transit.');
      return; 
    }
    const courierId = this.orderForm.get(`assignedCourier-${order.id}`)?.value;
    if (courierId) {
      await this.handleOrderUpdate('AssignOrder', { orderId: order.id, courierId });
    } else {
      alert('Please select a courier');
    }
  }

  private async handleOrderUpdate(endpoint: string, payload: any): Promise<void> {
    try {
      const response = await fetch(`${environment.apiUrl}/api/${endpoint}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Failed to update order');
      await this.fetchOrders();
      alert('Order updated successfully!');
    } catch (error) {
      console.error('Error updating order:', error);
      alert('There was an error updating the order. Please try again.');
    }
  }

  async deleteOrder(orderId: number): Promise<void> {
    if (confirm('Are you sure you want to delete this order?')) {
      try {
        const response = await fetch(`${environment.apiUrl}/api/admin/delete/order?order_id=${orderId}`, {
          method: 'DELETE',
        });

        if (!response.ok) throw new Error('Failed to delete order');
        await this.fetchOrders();
        alert('Order deleted successfully!');
      } catch (error) {
        console.error('Error deleting order:', error);
        alert('There was an error deleting the order. Please try again.');
      }
    }
  }
}
