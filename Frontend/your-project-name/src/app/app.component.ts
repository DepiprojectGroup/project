import { Component, ViewChild, ViewContainerRef, ComponentFactoryResolver, ComponentRef } from '@angular/core';
import { UserInfoComponent } from './user-info/user-info.component';
import { LoginComponent } from './login/login.component';
import { CreateOrderComponent } from './create-order/create-order.component';
import { MyOrdersComponent } from './my-orders/my-orders.component';
import { AssignedOrdersComponent } from './assigned-orders/assigned-orders.component';
import { ManageOrdersComponent } from './Admin/manage-orders/manage-orders.component';
import { AssignOrderToCourierComponent } from './Admin/assign-order-to-courier/assign-order-to-courier.component';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http'; // Import HttpClientModule

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule,HttpClientModule],
  template: `
    <div class="container">
      <h1>Welcome to Our Application</h1>
      
      <div *ngIf="!loggedIn">
        <div class="button-group">
          <button class="btn primary" (click)="loadUserInfo()">Register</button>
          <button class="btn secondary" (click)="loadLogin()">Login</button>
        </div>

        <ng-container #container></ng-container>
      </div>

      <div *ngIf="loggedIn && isCourier" class="button-group">
        <button class="btn primary" (click)="loadAssignedOrders()">Assigned Orders</button>

      </div>

      <div *ngIf="loggedIn && !isCourier && !isAdmin" class="button-group">
        <button class="btn primary" (click)="loadCreateOrder()">Create Order</button>
        <button class="btn secondary" (click)="loadMyOrders()">My Orders</button>
      </div>

      <div *ngIf="loggedIn && isAdmin" class="button-group">
        <button class="btn" (click)="loadManageOrders()">Manage Orders</button>
        <button class="btn secondary" (click)="loadAssignOrder()">Assigned Orders</button>
      </div>

      <ng-container #container></ng-container>
    </div>
  `,
  styles: [
    `
    .container {
      max-width: 800px;
      margin: 60px auto;
      padding: 30px;
      border-radius: 12px;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
      text-align: center;
      background: linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%);
    }

    h1 {
      font-size: 26px;
      margin-bottom: 30px;
      color: #444;
      font-weight: bold;
    }

    .button-group {
      display: flex;
      justify-content: space-evenly;
      margin-bottom: 25px;
    }

    .btn {
      padding: 12px 25px;
      font-size: 16px;
      color: #fff;
      background-color: #28a745;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      transition: background-color 0.3s, transform 0.2s;
      box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
    }

    .btn.secondary {
      background-color: #007bff;
    }

    .btn:hover {
      background-color: #218838;
      transform: translateY(-3px);
    }

    .btn.secondary:hover {
      background-color: #0056b3;
    }

    .btn:focus {
      outline: none;
    }

    .btn:active {
      transform: translateY(1px);
      box-shadow: none;
    }
    `
  ]
})
export class AppComponent {
  @ViewChild('container', { read: ViewContainerRef }) container!: ViewContainerRef;
  loggedIn = false;
  isCourier = false;
  isAdmin = false;

  constructor(private resolver: ComponentFactoryResolver, private router: Router) {}

  loadUserInfo() {
    this.container.clear(); 
    const userInfoFactory = this.resolver.resolveComponentFactory(UserInfoComponent);
    this.container.createComponent(userInfoFactory); 
  }

  loadLogin() {
    this.container.clear(); 
    const loginFactory = this.resolver.resolveComponentFactory(LoginComponent);
    const loginComponentRef: ComponentRef<LoginComponent> = this.container.createComponent(loginFactory);

    loginComponentRef.instance.loginSuccess.subscribe((role: string) => {
      console.log('Login successful, updating loggedIn status');
      this.loggedIn = true; 
      this.isCourier = role === 'courier';
      this.isAdmin = role === 'admin';
      this.container.clear();

      if (role === 'admin') {
        this.router.navigate(['/admin-dashboard']);
      } else if (role === 'courier') {
        this.loadAssignedOrders();
      } else {
        this.loadCreateOrder();
      }
    });
  }

  loadCreateOrder() {
    this.container.clear(); 
    const createOrderFactory = this.resolver.resolveComponentFactory(CreateOrderComponent);
    this.container.createComponent(createOrderFactory); 
  }

  loadMyOrders() {
    this.container.clear(); 
    const myOrdersFactory = this.resolver.resolveComponentFactory(MyOrdersComponent);
    this.container.createComponent(myOrdersFactory); 
  }

  loadAssignedOrders() {
    this.container.clear();
    const assignedOrdersFactory = this.resolver.resolveComponentFactory(AssignedOrdersComponent);
    this.container.createComponent(assignedOrdersFactory);
  }

  loadManageOrders() {
    this.container.clear();
    const manageOrdersFactory = this.resolver.resolveComponentFactory(ManageOrdersComponent);
    this.container.createComponent(manageOrdersFactory);
  }

  loadAssignOrder() {
    this.container.clear();
    const assignOrderFactory = this.resolver.resolveComponentFactory(AssignOrderToCourierComponent);
    this.container.createComponent(assignOrderFactory);
  }
  
  
}
