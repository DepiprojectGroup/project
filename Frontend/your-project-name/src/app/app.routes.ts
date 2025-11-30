import { Routes } from '@angular/router';
import { CreateOrderComponent } from './create-order/create-order.component';
import { MyOrdersComponent } from './my-orders/my-orders.component';
import { OrderDetailsComponent } from './order-details/order-details.component';
import { LoginComponent } from './login/login.component'; 
import { AssignedOrdersComponent } from './assigned-orders/assigned-orders.component';
import { ManageOrdersComponent } from './Admin/manage-orders/manage-orders.component'; 
import { AssignOrderToCourierComponent } from './Admin/assign-order-to-courier/assign-order-to-courier.component';

export const routes: Routes = [
  { path: 'create-order', component: CreateOrderComponent },
  { path: 'my-orders', component: MyOrdersComponent }, 
  { path: 'assigned-orders', component: AssignedOrdersComponent },  
  { path: 'order-details/:id', component: OrderDetailsComponent },
  {
    path: 'admin', 
    children: [
      { path: 'manage-orders', component: ManageOrdersComponent },  
      { path: 'assign-order-to-courier', component: AssignOrderToCourierComponent },  
    ]
  },
  { path: '', component: LoginComponent, pathMatch: 'full' }, 
  { path: '**', redirectTo: '' } 
];
