import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { collection, addDoc, Firestore } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { addIcons } from 'ionicons';
import { logOutOutline } from 'ionicons/icons';

// Register logout icon globally
addIcons({
  'log-out-outline': logOutOutline,
});

export interface TemperatureLog {
  fridgeValue: string;
  fridgeName: string;
  temperature: number | null;
  timestamp: string;
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule],
})
export class HomePage {
  selectedFridgeValue: string = '';
  selectedFridgeName: string = 'Unknown Fridge';
  temperature: number | null = null;
  loading: boolean = false;

  private toastController = inject(ToastController);
  private router = inject(Router);
  private alertController = inject(AlertController);
  private firestore: Firestore = inject(Firestore);
  private auth: Auth = inject(Auth);

  constructor() {}

  async logTemperature() {
    if (this.loading) return;
    this.loading = true;

    if (!this.selectedFridgeValue) {
      await this.presentAlert('Error', 'Please select a fridge.');
      this.loading = false;
      return;
    }

    if (this.temperature === null || this.temperature === undefined) {
      await this.presentAlert('Error', 'Please enter the temperature.');
      this.loading = false;
      return;
    }

    const now = new Date();
    const timestamp = now.toISOString();

    const logEntry: TemperatureLog = {
      fridgeValue: this.selectedFridgeValue,
      fridgeName: this.selectedFridgeName,
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
    } finally {
      this.loading = false;
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

  toggleSign() {
    if (typeof this.temperature === 'number' && !isNaN(this.temperature)) {
      this.temperature = -this.temperature;
    }
  }

  fridgeChanged(event: CustomEvent) {
    this.selectedFridgeValue = event.detail.value;

    // Access selected text from ion-select-option elements
    const selectElement = event.target as HTMLIonSelectElement;
    const selectedText = Array.from(selectElement.querySelectorAll(`ion-select-option[value="${event.detail.value}"]`))
      .map(option => option.textContent ? option.textContent.trim() : '')[0];
    this.selectedFridgeName = selectedText || 'Unknown Fridge';
  }
}
