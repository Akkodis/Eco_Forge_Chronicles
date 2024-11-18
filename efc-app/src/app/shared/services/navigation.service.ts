import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NavigationService {
  private currentComponentSubject = new BehaviorSubject<string>('explorer');
  currentComponent$ = this.currentComponentSubject.asObservable();

  navigateTo(component: string) {
    this.currentComponentSubject.next(component);
  }
}
