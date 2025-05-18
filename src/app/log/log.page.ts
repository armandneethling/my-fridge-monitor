import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { IonicModule, AlertController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { collection, query, orderBy, onSnapshot, Firestore, deleteDoc, doc } from '@angular/fire/firestore';
import jsPDF from 'jspdf';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { FormsModule } from '@angular/forms';

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
  imports: [IonicModule, CommonModule, FormsModule],
  providers: [DatePipe],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class LogPage implements OnInit {
  private router = inject(Router);
  private firestore: Firestore = inject(Firestore);
  private alertController = inject(AlertController);
  private toastController = inject(ToastController);
  private datePipe = inject(DatePipe);

  public dailyLogs: DailyLogs[] = [];
  public filteredLogs: DailyLogs[] = [];
  public selectedDate: string | null = null;
  public maxDate: string;
  public loading = true;
  public exportingPDF = false;
  public viewMode: 'all' | 'date' = 'date'; // default to 'date'

  constructor() {
    const today = new Date();
    this.maxDate = today.toISOString().split('T')[0];
  }

  ngOnInit() {
    this.getTemperatureLogs();
  }

  getTemperatureLogs() {
    const temperatureLogsCollection = collection(this.firestore, 'temperatureLogs');
    const q = query(temperatureLogsCollection, orderBy('timestamp', 'desc'));

    this.loading = true;
    onSnapshot(
      q,
      (snapshot) => {
        this.dailyLogs = this.groupByDate(
          snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as TemperatureLog))
        );
        this.applyFilter();
        this.loading = false;
      },
      (error) => {
        this.presentToast('Error loading logs.', 'danger');
        this.loading = false;
      }
    );
  }

  groupByDate(logs: TemperatureLog[]): DailyLogs[] {
    const grouped: { [date: string]: TemperatureLog[] } = {};
    logs.forEach((log) => {
      const date = this.datePipe.transform(log.timestamp, 'yyyy-MM-dd') || '';
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(log);
    });

    return Object.keys(grouped).map((date) => ({ date, logs: grouped[date] }));
  }

  onViewModeChange() {
    if (this.viewMode === 'all') {
      this.selectedDate = null; // clear date filter when viewing all
    }
    this.applyFilter();
  }

  filterLogsByDate() {
    this.applyFilter();
  }

  applyFilter() {
    if (this.viewMode === 'all') {
      this.filteredLogs = this.dailyLogs;
    } else if (this.viewMode === 'date') {
      if (!this.selectedDate) {
        this.filteredLogs = [];
      } else {
        const selected = this.selectedDate.split('T')[0];
        this.filteredLogs = this.dailyLogs.filter((day) => day.date === selected);
      }
    }
  }

  async deleteLogEntry(logId: string) {
    const alert = await this.alertController.create({
      header: 'Confirm Delete',
      message: 'Are you sure you want to delete this log entry?',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          handler: async () => {
            try {
              const logEntryDocRef = doc(this.firestore, 'temperatureLogs', logId);
              await deleteDoc(logEntryDocRef);
              this.presentToast('Log entry deleted successfully!');
            } catch (error) {
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
    if (this.exportingPDF) return;
    this.exportingPDF = true;

    const pdf = new jsPDF();
    const logsToExport = this.dailyLogs.find((group) => group.date === date)?.logs || [];

    let y = 20;
    pdf.setFontSize(16);
    pdf.text(`Temperature Logs for ${date}`, 10, y);
    y += 10;

    pdf.setFontSize(12);
    logsToExport.forEach((log) => {
      const fridgeName = log.fridgeName || 'N/A';
      const temperature = log.temperature !== null ? log.temperature : 'N/A';
      const timestamp = log.timestamp ? this.datePipe.transform(log.timestamp, 'yyyy-MM-dd HH:mm:ss') : 'N/A';

      pdf.text(`Fridge: ${fridgeName}`, 10, y);
      y += 7;
      pdf.text(`Temperature: ${temperature} °C`, 10, y);
      y += 7;
      pdf.text(`Logged at: ${timestamp}`, 10, y);
      y += 10;

      if (y > 280) {
        pdf.addPage();
        y = 20;
      }
    });

    try {
      const pdfDataUri = pdf.output('datauristring');
      const base64Data = pdfDataUri.substring(pdfDataUri.indexOf(',') + 1);
      const fileName = `temperature-logs-${date}.pdf`;

      const result = await Filesystem.writeFile({
        path: fileName,
        data: base64Data,
        directory: Directory.Documents,
      });

      this.presentToast(`PDF saved: ${result.uri}`);
    } catch (e) {
      this.presentToast('Error saving PDF.', 'danger');
    } finally {
      this.exportingPDF = false;
    }
  }

  async deleteAllLogsForDate(date: string) {
    const dayData = this.dailyLogs.find((group) => group.date === date);
    const logsToDelete = dayData?.logs || [];

    if (logsToDelete.length === 0) {
      this.presentToast('No logs found for this date.', 'warning');
      return;
    }

    const logIdsToDelete = logsToDelete.map((log) => log.id).filter((id) => id !== undefined) as string[];

    if (logIdsToDelete.length === 0) {
      this.presentToast('Error finding log IDs.', 'danger');
      return;
    }

    const alert = await this.alertController.create({
      header: 'Confirm Delete',
      message: `Are you sure you want to delete all ${logIdsToDelete.length} log(s) for ${date}? This action cannot be undone.`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete All',
          handler: async () => {
            try {
              const deletePromises = logIdsToDelete.map((logId) => {
                const logEntryDocRef = doc(this.firestore, 'temperatureLogs', logId);
                return deleteDoc(logEntryDocRef);
              });
              await Promise.all(deletePromises);
              this.presentToast(`Successfully deleted all logs for ${date}.`);
            } catch (error) {
              this.presentToast('Error deleting logs.', 'danger');
            }
          },
        },
      ],
    });

    await alert.present();
  }

  async presentToast(message: string, color: string = 'success') {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'bottom',
      color,
    });
    await toast.present();
  }
}
