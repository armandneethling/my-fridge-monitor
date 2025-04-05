import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { collection, query, orderBy, onSnapshot, Firestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export interface TemperatureLog { // Ensure this matches the interface in home.page.ts
  fridgeValue: string;
  fridgeName: string;
  temperature: number | null;
  timestamp: string;
}

@Component({
  selector: 'app-log',
  templateUrl: './log.page.html',
  styleUrls: ['./log.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class LogPage implements OnInit {
  private router = inject(Router);
  private firestore: Firestore = inject(Firestore);
  public temperatureLogs: TemperatureLog[] = [];

  constructor() {}

  ngOnInit() {
    this.getTemperatureLogs();
  }

  getTemperatureLogs() {
    const temperatureLogsCollection = collection(this.firestore, 'temperatureLogs');
    const q = query(temperatureLogsCollection, orderBy('timestamp', 'desc'));

    onSnapshot(q, (snapshot) => {
      this.temperatureLogs = [];
      snapshot.forEach((doc) => {
        this.temperatureLogs.push(doc.data() as TemperatureLog);
      });
      console.log('Temperature logs updated:', this.temperatureLogs);
    });
  }

  goHome() {
    this.router.navigate(['/home']);
  }
}
