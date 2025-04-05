import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController, AlertController } from '@ionic/angular'; // Correct import for IonicModule
import { Router } from '@angular/router';
import { collection, addDoc, Firestore } from '@angular/fire/firestore';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

interface TemperatureLog {
  fridge: string;
  temperature: number | null;
  timestamp: string;
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule], // Correct imports array
  providers: [], // Crucially, no providers here!
})
export class HomePage {
  selectedFridge: string = '';
  temperature: number | null = null;
  private firestore: Firestore = inject(Firestore);

  constructor(
    private toastController: ToastController,
    private router: Router,
    private alertController: AlertController,
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

    const logEntry: TemperatureLog = {
      fridge: this.selectedFridge,
      temperature: this.temperature,
      timestamp: timestamp,
    };

    try {
      const temperatureLogsCollection = collection(this.firestore, 'temperatureLogs');
      await addDoc(temperatureLogsCollection, logEntry);
      await this.presentToast('Temperature logged successfully!');
      this.router.navigate(['/log']);
    } catch (error) {
      console.error('Error logging temperature:', error);
      await this.presentAlert('Error', 'Failed to log temperature. Please try again.');
    }
  }

  goToLog() {
    this.router.navigate(['/log']);
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