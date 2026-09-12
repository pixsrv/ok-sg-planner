const DB_NAME = 'SGPlannerDB';
const DB_VERSION = 2;
const EMPLOYEES_STORE = 'employees';
const MONTHS_STORE = 'months';

export const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error('IndexedDB error:', event.target.error);
      reject('Error opening IndexedDB');
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(EMPLOYEES_STORE)) {
        db.createObjectStore(EMPLOYEES_STORE);
      }
      if (!db.objectStoreNames.contains(MONTHS_STORE)) {
        db.createObjectStore(MONTHS_STORE);
      }
    };
  });
};

export const saveItem = async (storeName, key, data) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.put(data, key);

    request.onsuccess = () => resolve();
    request.onerror = (event) => {
      console.error(`Error saving to ${storeName} at ${key}:`, event.target.error);
      reject(`Error saving to ${storeName}`);
    };
  });
};

export const saveItems = async (storeName, itemsMap) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    
    Object.entries(itemsMap).forEach(([key, value]) => {
      store.put(value, key);
    });

    transaction.oncomplete = () => resolve();
    transaction.onerror = (event) => {
      console.error(`Error saving items to ${storeName}:`, event.target.error);
      reject(`Error saving items to ${storeName}`);
    };
  });
};

export const getItem = async (storeName, key) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get(key);

    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => {
      console.error(`Error getting from ${storeName} at ${key}:`, event.target.error);
      reject(`Error getting from ${storeName}`);
    };
  });
};

export const getAllItems = async (storeName) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    
    // Check if it's an object store that uses keys manually or auto-increment
    // Since we are using IDs as keys, we want to return a map/object for employees
    // and potentially an array for months if we stored them differently, 
    // but the issue specifically asks for employees to be separate items.
    
    const request = store.openCursor();
    const result = {};
    const arrayResult = [];

    request.onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor) {
        if (storeName === EMPLOYEES_STORE) {
          result[cursor.key] = cursor.value;
        } else {
          arrayResult.push(cursor.value);
        }
        cursor.continue();
      } else {
        resolve(storeName === EMPLOYEES_STORE ? result : arrayResult);
      }
    };

    request.onerror = (event) => {
      console.error(`Error getting all items from ${storeName}:`, event.target.error);
      reject(`Error getting all items from ${storeName}`);
    };
  });
};
