import { Component } from '@angular/core';
import { User } from '../services/user.service'; // Importa la interfaz correctamente
import { LoginService } from './login.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'], // Se usa `styleUrls`, no `styleUrl`
})
export class LoginComponent {
  user: User = { email: '', password: '' }; // ✅ Definición correcta del objeto
  mensaje: string = '';
  constructor(
    private loginService: LoginService,
    private http: HttpClient,
    private router: Router
  ) {
    this.user.email = '';
    this.user.password = '';
  }
  async authenticate() {
    console.log('Inicia autenticacion');

    if (!this.user.email || !this.user.password) {
      this.mensaje = 'Por favor, ingresa usuario y contraseña';
      return;
    }
    this.loginService
      .authenticate(this.user.email, this.user.password)
      .subscribe(
        (response) => {
          console.log(response);
          if (response.data && response.data.authenticate) {
            this.mensaje = response.data.authenticate.message;
            if (this.mensaje === 'true') {
              console.log('Autenticado');
              console.log('redirigiendo');
              setTimeout(() => {
                this.router.navigate(['/dashboard']);
              }, 100);
              console.log('redirigido');
            } else console.log('No Autenticado');
          } else {
            this.mensaje = 'Error en la respuesta del servidor';
          }
        },
        (error) => {
          console.error('Error en la autenticación:', error);
          this.mensaje = 'Error al autenticar. Verifica tu conexión.';
        }
      );
  }
}
