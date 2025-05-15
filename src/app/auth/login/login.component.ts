import { Component, inject } from '@angular/core';
import { IonicModule, ToastController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Auth, signInWithEmailAndPassword } from '@angular/fire/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [IonicModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  private auth = inject(Auth);
  private toastController = inject(ToastController);
  private router = inject(Router);

  email: string = '';
  password: string = '';

  async login() {
    try {
      await signInWithEmailAndPassword(this.auth, this.email, this.password);
      this.presentToast('Login successful');
      this.router.navigate(['/home']); // Navigate to your home page after login
    } catch (error: any) {
      this.presentToast(`Login failed: ${error.message}`);
    }
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2500,
      position: 'bottom',
    });
    await toast.present();
  }
}
