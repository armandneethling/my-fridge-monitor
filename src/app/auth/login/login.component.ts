import { Component, inject } from '@angular/core';
import { IonicModule, ToastController } from '@ionic/angular';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  fetchSignInMethodsForEmail,
} from '@angular/fire/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [IonicModule, FormsModule, NgIf],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  private auth = inject(Auth);
  private toastController = inject(ToastController);
  private router = inject(Router);

  username: string = '';
  passkey: string = '';

  ALLOWED_USERNAMES = ['armand']; // all lowercase

  step: 'username' | 'passkey' | 'setPasskey' = 'username';
  email: string = '';
  isNewUser: boolean = false;

  async onUsernameSubmit() {
    this.username = this.username.trim().toLowerCase();

    if (!this.username) {
      this.presentToast('Please enter your name');
      return;
    }

    if (!this.ALLOWED_USERNAMES.includes(this.username)) {
      this.presentToast('Name not registered');
      return;
    }

    this.email = this.usernameToEmail(this.username);

    try {
      const methods = await fetchSignInMethodsForEmail(this.auth, this.email);
      if (methods.length === 0) {
        this.isNewUser = true;
        this.step = 'setPasskey';
      } else {
        this.isNewUser = false;
        this.step = 'passkey';
      }
      this.passkey = ''; // clear passkey input on step change
    } catch (error: any) {
      this.presentToast(`Error checking name: ${error.message}`);
    }
  }

  async onPasskeySubmit() {
    if (!this.passkey.trim()) {
      this.presentToast(this.isNewUser ? 'Please set your manager code' : 'Please enter your manager code');
      return;
    }

    try {
      if (this.isNewUser) {
        await createUserWithEmailAndPassword(this.auth, this.email, this.passkey);
        this.presentToast('Registration successful');
      } else {
        await signInWithEmailAndPassword(this.auth, this.email, this.passkey);
        this.presentToast('Login successful');
      }
      this.router.navigate(['/home']);
    } catch (error: any) {
      this.presentToast(`Authentication failed: ${error.message}`);
    }
  }

  usernameToEmail(username: string): string {
    return `${username}@yourappdomain.com`;
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
