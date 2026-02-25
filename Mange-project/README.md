# ICT1222 Team App — Firebase Edition

**Team: HassKariyawasamtiks | University of Ruhuna | ICT1222 DBMS Practicum**

---

## 📁 FILE STRUCTURE

```
ict1222-app/
├── index.html
├── package.json
├── vite.config.js
├── README.md
└── src/
    ├── main.jsx
    ├── App.jsx       ← Main app (React + Firebase)
    └── firebase.js   ← Your Firebase config
```

---

## 🔧 STEP 1 — Install (Run these commands in terminal)

```bash
# 1. Go into the project folder
cd ict1222-app

# 2. Install all dependencies
npm install

# 3. Run locally to test
npm run dev
```
Open http://localhost:5173 in browser to test.

---

## 🔥 STEP 2 — Firebase Console Setup

Go to: https://console.firebase.google.com/project/project-manager-29381

### 2a. Enable Authentication
1. Left menu → Build → Authentication
2. Click "Get Started"
3. Sign-in method → Email/Password → Enable → Save

### 2b. Create Firestore Database
1. Left menu → Build → Firestore Database
2. Click "Create database"
3. Choose "Start in test mode" (we'll fix rules next)
4. Select region → Enable

### 2c. Set Firestore Security Rules
1. Firestore → Rules tab
2. Replace everything with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Users can read/write their own profile
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;

      // Private tasks — only the owner
      match /privateTasks/{taskId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }

    // Public tasks — any logged-in user
    match /tasks/{taskId} {
      allow read, write: if request.auth != null;
    }

    // Chat — any logged-in user
    match /chat/{msgId} {
      allow read, write: if request.auth != null;
    }
  }
}
```
3. Click **Publish**

---

## 🌐 STEP 3 — Deploy to Firebase Hosting (Free!)

```bash
# 1. Install Firebase CLI globally (run once)
npm install -g firebase-tools

# 2. Login to Firebase
firebase login

# 3. Initialize Firebase in the project
firebase init

# When asked:
# → Select: Hosting
# → Use existing project: project-manager-29381
# → Public directory: dist
# → Single page app: YES
# → Overwrite index.html: NO

# 4. Build the app
npm run build

# 5. Deploy!
firebase deploy
```

Your app will be live at:
**https://project-manager-29381.web.app**

Share this URL with your team members — they can register and use it from any device! 📱💻

---

## 📱 STEP 4 — First Time Use

1. Open the URL
2. Click **REGISTER**
3. Enter username + password
4. Select your team role
5. Go to **DATA** tab → Click **"SEED TASKS → FIREBASE"** (do this ONCE to load all project tasks)
6. Share the URL with team members — they register themselves

---

## 🔄 Data Flow

```
User Action → React State → Firebase Firestore → Real-time to all users
```

- Public tasks, chat: stored in Firestore, visible to everyone
- Private tasks: stored in your user's subcollection, only you see them
- Auth: Firebase Authentication (email/password internally)

---

## 🔑 Firebase Collections

| Collection | What's stored |
|-----------|---------------|
| `users/{uid}` | username, role, color |
| `users/{uid}/privateTasks` | private tasks per user |
| `tasks` | all public tasks |
| `chat` | all chat messages |

---

## ⚠️ Firestore Rules — IMPORTANT

The rules above only allow **logged-in users** to read/write.
Nobody can access data without being logged in. This is your security.
