const DB_NAME = 'SGPlannerDB';
const DB_VERSION = 3;
const EMPLOYEES_STORE = 'employees';
const MONTHS_STORE = 'months';
const SETTINGS_STORE = 'settings';

let dbInstance = null;

export const initDB = () => {
  if (dbInstance) return Promise.resolve(dbInstance);

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error('IndexedDB error:', event.target.error);
      reject('Error opening IndexedDB');
    };

    request.onsuccess = (event) => {
      dbInstance = event.target.result;
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(EMPLOYEES_STORE)) {
        db.createObjectStore(EMPLOYEES_STORE);
      }
      if (!db.objectStoreNames.contains(MONTHS_STORE)) {
        db.createObjectStore(MONTHS_STORE);
      }
      if (!db.objectStoreNames.contains(SETTINGS_STORE)) {
        db.createObjectStore(SETTINGS_STORE);
      }
    };
  });
};

export const saveItem = async (storeName, key, data) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    store.put(data, key);

    transaction.oncomplete = () => {
      console.log(`Saved to ${storeName}: ${key} =`, data);
      resolve();
    };
    transaction.onerror = (event) => {
      console.error(`Transaction error saving to ${storeName} at ${key}:`, event.target.error);
      reject(`Error saving to ${storeName}`);
    };
    transaction.onabort = () => {
      console.error(`Transaction aborted saving to ${storeName} at ${key}:`, transaction.error);
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

    transaction.oncomplete = () => {
      console.log(`Saved multiple items to ${storeName}`);
      resolve();
    };
    transaction.onerror = (event) => {
      console.error(`Transaction error saving items to ${storeName}:`, event.target.error);
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
    transaction.onerror = (event) => {
      console.error(`Transaction error getting from ${storeName} at ${key}:`, event.target.error);
    };
  });
};

export const getAllItems = async (storeName) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);

    const request = store.openCursor();
    const result = {};
    const arrayResult = [];

    request.onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor) {
        if (storeName === EMPLOYEES_STORE || storeName === SETTINGS_STORE) {
          result[cursor.key] = cursor.value;
        } else {
          arrayResult.push(cursor.value);
        }
        cursor.continue();
      } else {
        resolve((storeName === EMPLOYEES_STORE || storeName === SETTINGS_STORE) ? result : arrayResult);
      }
    };

    request.onerror = (event) => {
      console.error(`Error getting all items from ${storeName}:`, event.target.error);
      reject(`Error getting all items from ${storeName}`);
    };
    transaction.onerror = (event) => {
      console.error(`Transaction error getting all items from ${storeName}:`, event.target.error);
    };
  });
};
