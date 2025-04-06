import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { collection, query, orderBy, onSnapshot, Firestore, deleteDoc, doc } from '@angular/fire/firestore';
import { DatePipe } from '@angular/common';
import jsPDF from 'jspdf';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';

export interface TemperatureLog {
  fridgeValue: string;
  fridgeName: string;
  temperature: number | null;
  timestamp: string;
  id?: string;
}

interface DailyLogs {
  date: string;
  logs: TemperatureLog[];
}

@Component({
  selector: 'app-log',
  templateUrl: './log.page.html',
  styleUrls: ['./log.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
  providers: [DatePipe], // Provide DatePipe
})
export class LogPage implements OnInit {
  private router = inject(Router);
  private firestore: Firestore = inject(Firestore);
  private alertController = inject(AlertController);
  private toastController = inject(ToastController);
  private datePipe = inject(DatePipe); // Inject DatePipe
  public dailyLogs: DailyLogs[] = [];

  constructor() {}

  ngOnInit() {
    this.getTemperatureLogs();
  }

  getTemperatureLogs() {
    const temperatureLogsCollection = collection(this.firestore, 'temperatureLogs');
    const q = query(temperatureLogsCollection, orderBy('timestamp', 'desc'));

    onSnapshot(q, (snapshot) => {
      this.dailyLogs = this.groupByDate(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TemperatureLog)));
      console.log('Temperature logs updated:', this.dailyLogs);
    });
  }

  groupByDate(logs: TemperatureLog[]): DailyLogs[] {
    const grouped: { [date: string]: TemperatureLog[] } = {};
    logs.forEach(log => {
      const date = log.timestamp.split('T')[0]; // Extract the date part
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(log);
    });

    return Object.keys(grouped).map(date => ({ date, logs: grouped[date] }));
  }

  async deleteLogEntry(logId: string) {
    const alert = await this.alertController.create({
      header: 'Confirm Delete',
      message: 'Are you sure you want to delete this log entry?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Delete',
          handler: async () => {
            try {
              const logEntryDocRef = doc(this.firestore, 'temperatureLogs', logId);
              await deleteDoc(logEntryDocRef);
              console.log('Log entry deleted:', logId);
              this.presentToast('Log entry deleted successfully!');
            } catch (error) {
              console.error('Error deleting log entry:', error);
              this.presentToast('Error deleting log entry!', 'danger');
            }
          },
        },
      ],
    });

    await alert.present();
  }

  goHome() {
    this.router.navigate(['/home']);
  }

  async exportToPDF(date: string) {
    const pdf = new jsPDF();
    const logsToExport = this.dailyLogs.find(group => group.date === date)?.logs || [];

    let y = 20; // Initial Y position for content
    pdf.setFontSize(16);
    pdf.text(`Temperature Logs for ${date}`, 10, y);
    y += 10;

    pdf.setFontSize(12);
    logsToExport.forEach(log => {
      // Prevent PDF generation error if data is missing
      const fridgeName = log.fridgeName || 'N/A';
      const temperature = log.temperature !== null ? log.temperature : 'N/A';
      const timestamp = log.timestamp ? this.datePipe.transform(log.timestamp, 'yyyy-MM-dd HH:mm:ss') : 'N/A';

      pdf.text(`Fridge: ${fridgeName}`, 10, y);
      y += 7; // Adjust spacing slightly if needed
      pdf.text(`Temperature: ${temperature} °C`, 10, y);
      y += 7;
      pdf.text(`Logged at: ${timestamp}`, 10, y);
      y += 10; // Add spacing between entries

      // Add page break if content gets too long
      if (y > 280) {
        pdf.addPage();
        y = 20; // Reset Y position for new page
      }
    });

    try {
      // Get the PDF data as a base64 string
      // pdf.output('datauristring') returns the full Data URI "data:application/pdf;base64,...."
      // We need to extract just the base64 part after the comma.
      const pdfDataUri = pdf.output('datauristring');
      const base64Data = pdfDataUri.substring(pdfDataUri.indexOf(',') + 1);

      const fileName = `temperature-logs-${date}.pdf`;

      // Write the file using Capacitor Filesystem
      const result = await Filesystem.writeFile({
        path: fileName,
        data: base64Data,
        directory: Directory.Documents, // Try saving to Documents directory
      });

      console.log('Wrote file:', result);
      // Notify the user where the file was saved
      await this.presentToast(`PDF saved: ${result.uri}`);

    } catch (e) {
      console.error('Unable to write file', e);
      await this.presentToast('Error saving PDF.', 'danger');
    }
  }

  async presentToast(message: string, color: string = 'success') {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: 'bottom',
      color: color
    });
    await toast.present();
  }
}
