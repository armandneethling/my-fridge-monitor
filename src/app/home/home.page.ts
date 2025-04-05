import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

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

  constructor() {}

  logTemperature() {
    const now = new Date();
    const timestamp = now.toISOString(); // Get ISO 8601 timestamp (includes date and time)

    console.log('Selected Fridge:', this.selectedFridge);
    console.log('Temperature:', this.temperature);
    console.log('Timestamp:', timestamp);

    // Here, we will later send this data (selectedFridge, temperature, timestamp) to Firebase
  }
}
