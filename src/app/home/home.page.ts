import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController, AlertController, IonSelect } from '@ionic/angular';
import { Router } from '@angular/router';
import { collection, addDoc, Firestore } from '@angular/fire/firestore';

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
  providers: [],
})
export class HomePage {
  selectedFridgeValue: string = ''; // Rename selectedFridge to selectedFridgeValue
  selectedFridgeName: string = 'Unknown Fridge'; // Add a property for the name
  temperature: number | null = null;

  private toastController = inject(ToastController);
  private router = inject(Router);
  private alertController = inject(AlertController);
  private firestore: Firestore = inject(Firestore);

  constructor() {}

  async logTemperature() {
    if (!this.selectedFridgeValue) {
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

  fridgeChanged(event: any) {
    const selectedValue = event.target.value;
    this.selectedFridgeValue = selectedValue;

    // Find the selected option's text
    const selectedOption = Array.from(event.target.options as HTMLOptionElement[]).find(
      (option) => option.value === selectedValue
    );
    this.selectedFridgeName = selectedOption && selectedOption.textContent
      ? selectedOption.textContent.trim()
      : 'Unknown Fridge';
  }
}
