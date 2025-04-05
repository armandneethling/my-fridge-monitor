import { Injectable, inject } from '@angular/core';
import { collection, addDoc, Firestore } from '@angular/fire/firestore';
import { TemperatureLog } from './home/home.page';

@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  private firestore: Firestore = inject(Firestore);

  async logTemperature(logEntry: TemperatureLog) {
    try {
      const temperatureLogsCollection = collection(this.firestore, 'temperatureLogs');
      await addDoc(temperatureLogsCollection, logEntry);
      return true; // Indicate success
    } catch (error) {
      console.error('Error logging temperature in service:', error);
      return false; // Indicate failure
    }
  }
}
