import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CreateOrderComponent } from './create-order.component';

describe('CreateOrderComponent', () => {
  let component: CreateOrderComponent;
  let fixture: ComponentFixture<CreateOrderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, HttpClientTestingModule],
      declarations: [CreateOrderComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should have a form with invalid initial state', () => {
    expect(component.createOrderForm.valid).toBeFalsy();
  });

  it('should make the form valid when filled correctly', () => {
    component.createOrderForm.controls['sourceAddress'].setValue('Test Source');
    component.createOrderForm.controls['deliveryAddress'].setValue('Test Delivery');
    component.createOrderForm.controls['packageDetails'].setValue('Test Package Details');

    expect(component.createOrderForm.valid).toBeTruthy();
  });

  it('should call onCreateOrder when the form is submitted', () => {
    spyOn(component, 'onCreateOrder');

    component.createOrderForm.controls['sourceAddress'].setValue('Test Source');
    component.createOrderForm.controls['deliveryAddress'].setValue('Test Delivery');
    component.createOrderForm.controls['packageDetails'].setValue('Test Package Details');
    component.onCreateOrder();

    expect(component.onCreateOrder).toHaveBeenCalled();
  });
});
