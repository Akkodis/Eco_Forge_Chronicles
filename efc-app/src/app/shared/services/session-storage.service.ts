import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SessionStorageService {
  public set(key: string, value: unknown): void {
    sessionStorage.setItem(key, JSON.stringify(value));
  }

  public get(key: string): string | null {
    const value = sessionStorage.getItem(key);
    if (!value?.length) {
      return null;
    }
    return JSON.parse(value);
  }

  public remove(key: string): void {
    sessionStorage.removeItem(key);
  }

  public clear(): void {
    sessionStorage.clear();
  }
}
