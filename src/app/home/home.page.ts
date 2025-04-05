import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule],
})
export class HomePage {
  selectedFridge: string = '';
  temperature: number | null = null;

  constructor(
    private toastController: ToastController,
    private router: Router,
    private alertController: AlertController
  ) {}

  async logTemperature() {
    if (!this.selectedFridge) {
      await this.presentAlert('Error', 'Please select a fridge.');
      return;
    }

    if (this.temperature === null || this.temperature === undefined) {
      await this.presentAlert('Error', 'Please enter the temperature.');
      return;
    }

    const now = new Date();
    const timestamp = now.toISOString();

    console.log('Selected Fridge:', this.selectedFridge);
    console.log('Temperature:', this.temperature);
    console.log('Timestamp:', timestamp);

    await this.presentToast('Temperature logged successfully!');
    this.router.navigate(['/log']);
  }

  goToLog() {
    this.router.navigate(['/log'])
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: 'bottom',
    });
    await toast.present();
  }

  async presentAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header: header,
      message: message,
      buttons: ['OK'],
    });

    await alert.present();
  }
}
