  import { Injectable } from '@angular/core';
  import { HttpClient } from '@angular/common/http';
  import { Observable } from 'rxjs';
  import * as CryptoJS from 'crypto-js';
  import { environment } from '../../environments/environment';


  @Injectable({
    providedIn: 'root'
  })
  export class LoginService {
  private apiUrl = environment.apiUrl;

    constructor(private http: HttpClient) {}

    authenticate(usuario: string, password: string): Observable<any> {
      const passwordCifrado : string = this.cifrar(password,usuario);
      console.log("Clave cifrada:",passwordCifrado.toString());
      const query = {
        query: `
          query {
            authenticate(usuario: "${usuario}", password: "${passwordCifrado}") {
              message
            }
          }
        `
      };
      return this.http.post<any>(this.apiUrl, query,{ withCredentials: true });
    }

    cifrar ( valor: string,key: string): string{
      console.log("valor:",valor," key:",key);
      const cifrado:string = CryptoJS.AES.encrypt(valor,key).toString();
      console.log("cifrado:");
      console.log(cifrado);
      return cifrado;
    }


  }
