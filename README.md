# MyFridge Monitor

## A simple mobile application built with Ionic and Angular to log and monitor refrigerator temperatures, using Firebase Firestore for data storage

## Features ✨

* Log temperatures for multiple predefined fridges.
* View historical temperature logs grouped by date.
* Delete individual log entries.
* Delete all log entries for a specific day.
* Export daily temperature logs to a PDF file saved locally on the device (Android Documents folder).

## Tech Stack 🛠️

* [Ionic Framework](https://ionicframework.com/)
* [Angular](https://angular.io/) (v19+, Standalone Components)
* [Capacitor](https://capacitorjs.com/) (v7+)
* [Firebase (Firestore)](https://firebase.google.com/) for database
* [jsPDF](https://github.com/parallax/jsPDF) for PDF generation
* [@capacitor/filesystem](https://capacitorjs.com/docs/apis/filesystem) for saving PDFs
* [TypeScript](https://www.typescriptlang.org/)

## Getting Started

### Prerequisites

* Node.js and npm (Check versions using `node -v` and `npm -v`)
* Ionic CLI installed globally (`npm install -g @ionic/cli`)
* Android Studio installed and configured for Android development.
* A Firebase project set up with Firestore enabled.

### Installation & Setup

1. **Clone Repository** (If applicable)

    ```sh
    # git clone <your-repo-url>
    # cd my-fridge-monitor
    ```

2. **Install Dependencies:**

    ```sh
    npm install
    ```

3. **Configure Firebase:**
    * Create a file named `firebase.ts` inside the `src/environments/` folder.
    * Add your Firebase project configuration details to this file:

        ```typescript
        // src/environments/firebase.ts
        export const firebaseConfig = {
          apiKey: "YOUR_API_KEY",
          authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
          projectId: "YOUR_PROJECT_ID",
          storageBucket: "YOUR_PROJECT_ID.appspot.com",
          messagingSenderId: "YOUR_SENDER_ID",
          appId: "YOUR_APP_ID"
        };
        ```

    * Replace the placeholders with your actual Firebase config values (found in your Firebase project settings).

4. **Build Web Assets:**

    ```sh
    ionic build
    ```

    *(Note: Currently configured to run with `optimization: false` in `angular.json` due to a runtime issue with optimized builds in this project's environment).*

5. **Sync with Native Platform:**

    ```sh
    npx cap sync android
    ```

6. **Open Native Project:**

    ```sh
    npx cap open android
    ```

## Usage

### Development Server

To run the app in your browser for quick development and testing (without native features like PDF saving):

```sh
ionic serve

## Author

👤 **Armand Neethling**
