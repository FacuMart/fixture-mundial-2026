// ─── FIREBASE CONFIG ─────────────────────────────────────────────────────────
// 1. Crear proyecto en https://console.firebase.google.com
// 2. Ir a Configuración del proyecto → Tus apps → Agregar app web
// 3. Copiar el objeto firebaseConfig y reemplazar los valores de abajo
// 4. Habilitar Authentication → Email/contraseña
// 5. Crear usuario en Authentication → Users (solo vos)
// 6. Crear base de datos Firestore en modo producción
// 7. Publicar estas reglas en Firestore → Reglas:
//
//    rules_version = '2';
//    service cloud.firestore {
//      match /databases/{database}/documents {
//        match /results/current {
//          allow read: if true;
//          allow write: if request.auth != null;
//        }
//      }
//    }
// ─────────────────────────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyDrmtYkWGa4jNsG-DdoFRTlSMAJrxcIB1s",
  authDomain: "fixture-mundial-2026-9bd21.firebaseapp.com",
  projectId: "fixture-mundial-2026-9bd21",
  storageBucket: "fixture-mundial-2026-9bd21.firebasestorage.app",
  messagingSenderId: "906172534248",
  appId: "1:906172534248:web:72a38adf1f26df8911a85d"
};

if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();
const auth = firebase.auth();

async function loadResultsFromFirebase() {
  const snap = await db.collection('results').doc('current').get();
  return snap.exists ? snap.data() : { updated: null, groups: {}, bracket: {} };
}

async function saveResultsToFirebase(data) {
  await db.collection('results').doc('current').set(data);
}
