# 📱 **ChatterBox**

Welcome to **ChatterBox**, a modern, feature-rich chat application built with React Native and Firebase! 🌟 This app offers real-time chatting capabilities, online/offline status indicators, profile management, and much more.

---

## ✨ **Features**
- 🔒 **Secure Authentication**: User authentication using Firebase Authentication.
- 💬 **Real-Time Messaging**: Real-time chat with message history stored in Firebase Firestore.
- 🟢 **Online/Offline Status**: Real-time presence indicator for users.
- 🖼️ **Profile Management**: Upload and update profile pictures and usernames.
- 🔔 **Notifications**: Push notifications for new messages (optional).
- 🎨 **Theming**: Black-and-white modern UI with responsive designs.
- 📋 **Sorting**: Chat list sorted by most recent interactions.

---

## 🚀 **Getting Started**

### **Prerequisites**
Before you begin, ensure you have the following installed on your machine:
- **Node.js**: [Download Node.js](https://nodejs.org)
- **Expo CLI**: Install using `npm install -g expo-cli`
- **Firebase Project**: Set up a Firebase project and configure authentication, Firestore, and Storage.

---

## 📥 **Installation**

1. **Clone the Repository**
   ```bash
   git clone https://github.com/PraveenAndra/ChatterBox.git
   cd ChatterBox
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Set Up Firebase**
   - Go to the [Firebase Console](https://console.firebase.google.com/).
   - Create a new project and add a web app to get the Firebase configuration.
   - Replace the placeholder configuration in `firebaseConfig.js` with your Firebase credentials:
     ```typescript
     const firebaseConfig = {
       apiKey: "YOUR_API_KEY",
       authDomain: "YOUR_AUTH_DOMAIN",
       projectId: "YOUR_PROJECT_ID",
       storageBucket: "YOUR_STORAGE_BUCKET",
       messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
       appId: "YOUR_APP_ID",
     };
     ```

4. **Run the Project**  
   Start the Expo development server:
   ```bash
   npm start
   ```
   Scan the QR code in your Expo Go app or run the project on an emulator.

---

## ⚙️ **Features Walkthrough**

### **Authentication**
- **Sign Up**: Create an account with an email, password, and profile picture.
- **Sign In**: Login securely using Firebase Authentication.
- **Password Management**: Update passwords securely through Firebase.

### **Chat Functionality**
- Real-time messaging powered by Firebase Firestore.
- **Online/Offline Indicators**: Shows whether users are online or last seen time.

### **Profile Management**
- **Edit Profile**: Change username or profile picture.
- **Profile Pictures**: Upload images stored in Firebase Storage.

### **Sorting and Interaction**
- Chats sorted by the latest message timestamp for seamless navigation.

---

## 🛠️ **Key Technologies**
- **React Native**: Build native apps for iOS and Android.
- **Expo**: Simplified app development and testing.
- **Firebase**: Backend as a service for authentication, Firestore, and storage.
- **TypeScript**: Strongly typed codebase for maintainability.

---

## 🤖 **Running the App**
1. **Start the Development Server**
   ```bash
   npm start
   ```

2. **Choose a Platform**
   - Open the app on your phone using the **Expo Go** app (iOS/Android).
   - Or run the app on an emulator.

3. **Test Features**
   - Create a new account, upload a profile picture, and start chatting!

---

## 🐛 **Troubleshooting**
- **Dependency Issues**: Run `npm install` to ensure all dependencies are installed.
- **Firebase Errors**: Verify your Firebase configuration and enable required services (Authentication, Firestore, Storage).

---

## 👥 **Contributing**
Contributions are welcome! 🎉
1. Fork the repository.
2. Create a feature branch: `git checkout -b feature-name`.
3. Commit your changes: `git commit -m "Add feature"`.
4. Push to the branch: `git push origin feature-name`.
5. Submit a pull request. 🚀

---

## 📜 **License**
This project is licensed under the [MIT License](LICENSE).

---

## 💬 **Feedback**
Have questions or suggestions?  
Reach out via [praveenandra2404@gmail.com](mailto:praveenandra2404@gmail.com) or open an issue on GitHub.

---

## 🌟 **Thank You for Using ChatterBox!**
Happy chatting! 🧑‍💻✨