import { Component, inject } from '@angular/core';
import { IonicModule, ToastController } from '@ionic/angular';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  fetchSignInMethodsForEmail,
  sendPasswordResetEmail,
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
  step: 'username' | 'passkey' | 'setPasskey' = 'username';
  email: string = '';
  isNewUser: boolean = false;
  loading: boolean = false;

  ALLOWED_USERNAMES = ['armand']; // Add allowed usernames here

  async onUsernameSubmit() {
    if (this.loading) return;
    this.loading = true;

    this.username = this.username.trim().toLowerCase();
    console.log('Username:', this.username);

    if (!this.username) {
      await this.presentToast('Please enter your name');
      this.loading = false;
      return;
    }

    if (!this.ALLOWED_USERNAMES.includes(this.username)) {
      await this.presentToast('Name not registered');
      this.loading = false;
      return;
    }

    this.email = this.usernameToEmail(this.username);
    console.log('Checking email:', this.email);

    try {
      const methods = await fetchSignInMethodsForEmail(this.auth, this.email);
      console.log('Sign-in methods:', methods);

      if (methods && methods.includes('password')) {
        this.isNewUser = false;
        this.step = 'passkey';
      } else {
        this.isNewUser = true;
        this.step = 'setPasskey';
      }
      this.passkey = '';
    } catch (error: any) {
      await this.presentToast(`Error checking name: ${error.message}`);
    } finally {
      this.loading = false;
    }
  }

  async onPasskeySubmit() {
    if (this.loading) return;
    this.loading = true;

    const trimmedPasskey = this.passkey.trim();
    if (!trimmedPasskey) {
      await this.presentToast(this.isNewUser ? 'Please set your manager code.' : 'Please enter your manager code.');
      this.loading = false;
      return;
    }
    if (trimmedPasskey.length < 6) {
      await this.presentToast('Passkey must be at least 6 characters long.');
      this.loading = false;
      return;
    }

    try {
      if (this.isNewUser) {
        await createUserWithEmailAndPassword(this.auth, this.email, trimmedPasskey);
        await this.presentToast('Registration successful! You can now log in.');
        this.isNewUser = false; // Important: switch to login mode after registration
        this.step = 'passkey';
        this.passkey = '';
      } else {
        await signInWithEmailAndPassword(this.auth, this.email, trimmedPasskey);
        await this.presentToast('Login successful!');
        this.router.navigate(['/home']);
      }
    } catch (error: any) {
      let message = 'Authentication failed. Please try again.';
      switch (error.code) {
        case 'auth/weak-password':
          message = 'Passkey is too weak. Please use at least 6 characters.';
          break;
        case 'auth/wrong-password':
          message = 'Incorrect passkey. Please try again.';
          break;
        case 'auth/user-not-found':
          message = 'User not found. Please check your name or register.';
          break;
        case 'auth/too-many-requests':
          message = 'Too many failed attempts. Please wait and try again later.';
          break;
      }
      await this.presentToast(message);
    } finally {
      this.loading = false;
    }
  }

  async sendResetEmail() {
    if (this.loading) return;
    this.loading = true;

    if (!this.email) {
      await this.presentToast('Please enter your name first.');
      this.loading = false;
      return;
    }

    try {
      await sendPasswordResetEmail(this.auth, this.email);
      await this.presentToast('Password reset email sent. Please check your inbox.');
    } catch (error: any) {
      await this.presentToast(`Error sending reset email: ${error.message}`);
    } finally {
      this.loading = false;
    }
  }

  usernameToEmail(username: string): string {
    return `${username.trim().toLowerCase()}@yourappdomain.com`;
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'bottom',
    });
    await toast.present();
  }
}
