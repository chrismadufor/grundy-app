import { db } from "./config";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  Timestamp,
} from "firebase/firestore";

export const firestoreHelpers = {
  // Generic get document
  async getDocument<T>(collectionName: string, docId: string): Promise<T | null> {
    try {
      if (!db) {
        throw new Error("Firebase Firestore is not initialized");
      }
      const docRef = doc(db, collectionName, docId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as T;
      }
      return null;
    } catch (error) {
      console.error("Error getting document:", error);
      throw error;
    }
  },

  // Generic get all documents
  async getAllDocuments<T>(collectionName: string): Promise<T[]> {
    try {
      if (!db) {
        throw new Error("Firebase Firestore is not initialized");
      }
      const querySnapshot = await getDocs(collection(db, collectionName));
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as T[];
    } catch (error) {
      console.error("Error getting documents:", error);
      throw error;
    }
  },

  // Generic add document
  async addDocument<T extends Record<string, any>>(
    collectionName: string,
    data: Omit<T, "id">
  ): Promise<string> {
    try {
      if (!db) {
        throw new Error("Firebase Firestore is not initialized");
      }
      const docRef = await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: Timestamp.now(),
      });
      return docRef.id;
    } catch (error) {
      console.error("Error adding document:", error);
      throw error;
    }
  },

  // Generic update document
  async updateDocument(
    collectionName: string,
    docId: string,
    data: Partial<any>
  ): Promise<void> {
    try {
      if (!db) {
        throw new Error("Firebase Firestore is not initialized");
      }
      const docRef = doc(db, collectionName, docId);
      await updateDoc(docRef, data);
    } catch (error) {
      console.error("Error updating document:", error);
      throw error;
    }
  },

  // Query documents
  async queryDocuments<T>(
    collectionName: string,
    field: string,
    operator: any,
    value: any
  ): Promise<T[]> {
    try {
      if (!db) {
        throw new Error("Firebase Firestore is not initialized");
      }
      const q = query(collection(db, collectionName), where(field, operator, value));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as T[];
    } catch (error) {
      console.error("Error querying documents:", error);
      throw error;
    }
  },
};

