import { Component, inject } from '@angular/core';
import { IonicModule, ToastController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Auth, createUserWithEmailAndPassword } from '@angular/fire/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [IonicModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  private auth = inject(Auth);
  private toastController = inject(ToastController);
  private router = inject(Router);

  email: string = '';
  password: string = '';
  confirmPassword: string = '';

  async register() {
    if (this.password !== this.confirmPassword) {
      this.presentToast('Passwords do not match');
      return;
    }
    try {
      await createUserWithEmailAndPassword(this.auth, this.email, this.password);
      this.presentToast('Registration successful');
      this.router.navigate(['/login']); // Navigate to login after registration
    } catch (error: any) {
      this.presentToast(`Registration failed: ${error.message}`);
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
