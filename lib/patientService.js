import { initFirebase } from './firebase';
import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
  addDoc,
  orderBy,
  limit,
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';

function getDb() {
  return initFirebase().db;
}

function getStorageRef() {
  return initFirebase().storage;
}

// Generate a unique Patient ID like PAT1001
export async function generatePatientId() {
  const db = getDb();
  const snapshot = await getDocs(collection(db, 'patients'));
  const count = snapshot.size;
  const id = `PAT${1001 + count}`;
  return id;
}

// Save patient profile to Firestore
export async function savePatientProfile(userId, profileData) {
  const db = getDb();
  await setDoc(
    doc(db, 'patients', userId),
    {
      ...profileData,
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );
}

// Get patient profile by user ID
export async function getPatientProfile(userId) {
  const db = getDb();
  const docSnap = await getDoc(doc(db, 'patients', userId));
  return docSnap.exists() ? docSnap.data() : null;
}

// Get patient by Patient ID (for doctor portal)
export async function getPatientByPatientId(patientId) {
  const db = getDb();

  console.log("================================");
  console.log("Searching Patient ID:", patientId);

  const q = query(
    collection(db, 'patients'),
    where('patientId', '==', patientId)
  );

  const snapshot = await getDocs(q);

  console.log("Documents found:", snapshot.size);

  if (snapshot.empty) {
    console.log("No patient found");
    return null;
  }

  const docSnap = snapshot.docs[0];

  console.log("Document ID:", docSnap.id);
  console.log("Patient Data:", docSnap.data());

  return {
    id: docSnap.id,
    ...docSnap.data(),
  };
}

// Live data real-time listener
export function subscribeToLiveData(patientId, callback) {
  const db = getDb();
  const q = query(
    collection(db, 'liveData'),
    where('patientId', '==', patientId),
    orderBy('timestamp', 'desc'),
    limit(1)
  );

  return onSnapshot(q, (snapshot) => {
    if (!snapshot.empty) {
      callback(snapshot.docs[0].data());
    }
  });
}

// Upload a medical report file to Firebase Storage
export async function uploadReport(userId, file, reportInfo) {
  const db = getDb();
  const storage = getStorageRef();

  const fileRef = ref(
    storage,
    `reports/${userId}/${Date.now()}_${file.name}`
  );

  await uploadBytes(fileRef, file);

  const downloadUrl = await getDownloadURL(fileRef);

  const docRef = await addDoc(collection(db, 'reports'), {
    patientId: userId,
    fileName: file.name,
    fileUrl: downloadUrl,
    fileType: file.type,
    ...reportInfo,
    uploadedAt: new Date().toISOString(),
  });

  return {
    id: docRef.id,
    fileUrl: downloadUrl,
  };
}

// Get all reports for a patient
export async function getReports(userId) {
  const db = getDb();
  const q = query(
    collection(db, 'reports'),
    where('patientId', '==', userId)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));
}

// Subscribe to emergency alerts
export function subscribeToEmergencyAlerts(patientId, callback) {
  const db = getDb();

  const q = query(
    collection(db, 'emergencyAlerts'),
    where('patientId', '==', patientId),
    orderBy('timestamp', 'desc'),
    limit(10)
  );

  return onSnapshot(q, (snapshot) => {
    callback(
      snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }))
    );
  });
}

// Save ECG report
export async function saveEcgReport(userId, ecgData, summary) {
  const db = getDb();

  const docRef = await addDoc(collection(db, 'ecgReports'), {
    patientId: userId,
    ecgData: JSON.stringify(ecgData),
    summary,
    createdAt: new Date().toISOString(),
  });

  return docRef.id;
}

// Get ECG reports
export async function getEcgReports(userId) {
  const db = getDb();

  const q = query(
    collection(db, 'ecgReports'),
    where('patientId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));
}