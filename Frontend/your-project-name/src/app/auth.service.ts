import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userId: string | null = null;  

  constructor() {
    
    this.userId = localStorage.getItem('userId');
  }

  setUserId(userId: string) {
    this.userId = userId;
    localStorage.setItem('userId', userId);  
  }

  getUserId(): string | null {
    return this.userId;
  }

  
}
