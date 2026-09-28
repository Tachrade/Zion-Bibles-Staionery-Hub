import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  writeBatch,
  getDocs
} from 'firebase/firestore';
import { db } from '../firebase';
import { Product, StockMovement, Sale, ShopSettings, ShopUser } from '../types';

export type CloudSyncStatus = 'connected' | 'connecting' | 'offline' | 'error';

/**
 * Recursively removes keys with undefined values, as Firestore strictly rejects undefined.
 */
export function sanitizeForFirestore<T>(data: T): T {
  if (data === null || data === undefined) {
    return null as any;
  }
  if (Array.isArray(data)) {
    return data.map((item) => sanitizeForFirestore(item)) as any;
  }
  if (typeof data === 'object' && !(data instanceof Date)) {
    const clean: Record<string, any> = {};
    for (const [key, value] of Object.entries(data as Record<string, any>)) {
      if (value !== undefined) {
        clean[key] = sanitizeForFirestore(value);
      }
    }
    return clean as any;
  }
  return data;
}

export function subscribeToCloudUsers(
  onUpdate: (users: ShopUser[]) => void,
  onError?: (err: Error) => void
) {
  try {
    const colRef = collection(db, 'users');
    return onSnapshot(
      colRef,
      (snapshot) => {
        const items: ShopUser[] = [];
        snapshot.forEach((docSnap) => {
          items.push(docSnap.data() as ShopUser);
        });
        onUpdate(items);
      },
      (error) => {
        console.warn('Firestore users listener error:', error);
        onError?.(error);
      }
    );
  } catch (e: any) {
    console.warn('Firestore users subscribe failed:', e);
    onError?.(e);
    return () => {};
  }
}

export async function saveUserToCloud(user: ShopUser) {
  try {
    const docRef = doc(db, 'users', user.id);
    await setDoc(docRef, sanitizeForFirestore(user), { merge: true });
  } catch (e) {
    console.warn('Failed to save user to cloud:', e);
  }
}

export async function deleteUserFromCloud(userId: string) {
  try {
    const docRef = doc(db, 'users', userId);
    await deleteDoc(docRef);
  } catch (e) {
    console.warn('Failed to delete user from cloud:', e);
  }
}

export function subscribeToCloudProducts(
  onUpdate: (products: Product[]) => void,
  onError?: (err: Error) => void
) {
  try {
    const colRef = collection(db, 'products');
    return onSnapshot(
      colRef,
      (snapshot) => {
        const items: Product[] = [];
        snapshot.forEach((docSnap) => {
          items.push(docSnap.data() as Product);
        });
        onUpdate(items);
      },
      (error) => {
        console.warn('Firestore products listener error:', error);
        onError?.(error);
      }
    );
  } catch (e: any) {
    console.warn('Firestore connection failed:', e);
    onError?.(e);
    return () => {};
  }
}

export function subscribeToCloudMovements(
  onUpdate: (movements: StockMovement[]) => void,
  onError?: (err: Error) => void
) {
  try {
    const colRef = collection(db, 'movements');
    return onSnapshot(
      colRef,
      (snapshot) => {
        const items: StockMovement[] = [];
        snapshot.forEach((docSnap) => {
          items.push(docSnap.data() as StockMovement);
        });
        // Sort newest first
        items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        onUpdate(items);
      },
      (error) => {
        console.warn('Firestore movements listener error:', error);
        onError?.(error);
      }
    );
  } catch (e: any) {
    console.warn('Firestore movements subscribe failed:', e);
    onError?.(e);
    return () => {};
  }
}

export function subscribeToCloudSales(
  onUpdate: (sales: Sale[]) => void,
  onError?: (err: Error) => void
) {
  try {
    const colRef = collection(db, 'sales');
    return onSnapshot(
      colRef,
      (snapshot) => {
        const items: Sale[] = [];
        snapshot.forEach((docSnap) => {
          items.push(docSnap.data() as Sale);
        });
        // Sort newest first
        items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        onUpdate(items);
      },
      (error) => {
        console.warn('Firestore sales listener error:', error);
        onError?.(error);
      }
    );
  } catch (e: any) {
    console.warn('Firestore sales subscribe failed:', e);
    onError?.(e);
    return () => {};
  }
}

export function subscribeToCloudSettings(
  onUpdate: (settings: ShopSettings) => void,
  onError?: (err: Error) => void
) {
  try {
    const docRef = doc(db, 'settings', 'shopConfig');
    return onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          onUpdate(docSnap.data() as ShopSettings);
        }
      },
      (error) => {
        console.warn('Firestore settings listener error:', error);
        onError?.(error);
      }
    );
  } catch (e: any) {
    console.warn('Firestore settings subscribe failed:', e);
    onError?.(e);
    return () => {};
  }
}

export async function saveProductToCloud(product: Product) {
  try {
    const docRef = doc(db, 'products', product.id);
    await setDoc(docRef, sanitizeForFirestore(product), { merge: true });
  } catch (e) {
    console.warn('Failed to save product to cloud:', e);
  }
}

export async function deleteProductFromCloud(productId: string) {
  try {
    const docRef = doc(db, 'products', productId);
    await deleteDoc(docRef);
  } catch (e) {
    console.warn('Failed to delete product from cloud:', e);
  }
}

export async function saveMovementToCloud(movement: StockMovement) {
  try {
    const docRef = doc(db, 'movements', movement.id);
    await setDoc(docRef, sanitizeForFirestore(movement));
  } catch (e) {
    console.warn('Failed to save movement to cloud:', e);
  }
}

export async function saveSaleToCloud(sale: Sale) {
  try {
    const docRef = doc(db, 'sales', sale.id);
    await setDoc(docRef, sanitizeForFirestore(sale));
  } catch (e) {
    console.warn('Failed to save sale to cloud:', e);
  }
}

export async function deleteSaleFromCloud(saleId: string) {
  try {
    const docRef = doc(db, 'sales', saleId);
    await deleteDoc(docRef);
  } catch (e) {
    console.warn('Failed to delete sale from cloud:', e);
  }
}

export async function saveSettingsToCloud(settings: ShopSettings) {
  try {
    const docRef = doc(db, 'settings', 'shopConfig');
    await setDoc(docRef, sanitizeForFirestore(settings), { merge: true });
  } catch (e) {
    console.warn('Failed to save settings to cloud:', e);
  }
}

// Upload local data to cloud in batch
export async function uploadLocalDataToCloud(
  products: Product[],
  movements: StockMovement[],
  sales: Sale[],
  settings: ShopSettings
) {
  try {
    const batch = writeBatch(db);

    products.forEach((p) => {
      const ref = doc(db, 'products', p.id);
      batch.set(ref, sanitizeForFirestore(p));
    });

    movements.forEach((m) => {
      const ref = doc(db, 'movements', m.id);
      batch.set(ref, sanitizeForFirestore(m));
    });

    sales.forEach((s) => {
      const ref = doc(db, 'sales', s.id);
      batch.set(ref, sanitizeForFirestore(s));
    });

    const setRef = doc(db, 'settings', 'shopConfig');
    batch.set(setRef, sanitizeForFirestore({
      ...settings,
      isClearedToZero: products.length === 0,
      cloudInitialized: true,
    }), { merge: true });

    await batch.commit();
    return true;
  } catch (e) {
    console.error('Batch upload to cloud failed:', e);
    throw e;
  }
}

// Clear all cloud data (start fresh)
export async function clearAllCloudData(currentSettings?: ShopSettings) {
  try {
    const deleteCollection = async (collName: string) => {
      const snap = await getDocs(collection(db, collName));
      if (!snap.empty) {
        const batch = writeBatch(db);
        snap.forEach((d) => batch.delete(d.ref));
        await batch.commit();
      }
    };

    await deleteCollection('products');
    await deleteCollection('movements');
    await deleteCollection('sales');

    // Persist intentional clean-slate state to Firestore
    const setRef = doc(db, 'settings', 'shopConfig');
    await setDoc(
      setRef,
      sanitizeForFirestore({
        ...(currentSettings || {}),
        isClearedToZero: true,
        cloudInitialized: true,
        lastClearedAt: new Date().toISOString(),
      }),
      { merge: true }
    );
    return true;
  } catch (e) {
    console.error('Failed to clear cloud data:', e);
    throw e;
  }
}
