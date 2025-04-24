import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';



@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router, private http: HttpClient) {}
  private apiUrl = 'http://localhost:59004/eventtracker/';

  canActivate(): Observable<boolean> {
    //console.log("activando");
    return this.http.get<{ authenticated: boolean }>(this.apiUrl+'api/auth/validate', { withCredentials: true }).pipe(
      map(response => {
        //console.log("response:",response);
        if (!response.authenticated) {
          this.router.navigate(['/login']);
          return false;
        }
        //console.log("Verificada la seguridad")
        return true;
      }),
      catchError(() => {
        this.router.navigate(['/login']);
        return [false];
      })
    );
  }
}
