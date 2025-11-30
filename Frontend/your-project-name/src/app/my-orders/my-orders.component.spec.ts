import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MyOrdersComponent } from './my-orders.component';

describe('MyOrdersComponent', () => {
  let component: MyOrdersComponent;
  let fixture: ComponentFixture<MyOrdersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyOrdersComponent, HttpClientTestingModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyOrdersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch orders on init', async () => {
    const mockOrders = [
      { id: 1, status: 'pending', deliveryAddress: '123 Main St' },
      { id: 2, status: 'completed', deliveryAddress: '456 Elm St' },
    ];

  
    const mockFetchResponse = {
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: new Headers(),
      url: '',
      json: () => Promise.resolve(mockOrders)
    } as Response;

    spyOn(window, 'fetch').and.returnValue(Promise.resolve(mockFetchResponse));

    await component.ngOnInit(); 

    expect(component.orders).toEqual(mockOrders);
    expect(component.loading).toBeFalse();
  });

  it('should handle fetch error', async () => {
    const mockFetchErrorResponse = {
      ok: false,
      status: 404,
      statusText: 'Not Found',
      headers: new Headers(),
      url: '',
      json: () => Promise.reject('Error fetching orders')
    } as Response;

    spyOn(window, 'fetch').and.returnValue(Promise.resolve(mockFetchErrorResponse));

    await component.ngOnInit();

    expect(component.loading).toBeFalse();
    expect(component.errorMessage).toBe('Failed to fetch orders');
  });
});
