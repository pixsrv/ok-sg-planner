const PREFIX = 'ok-sg-';

// Store Names / Keys
export const STORES = {
  EMPLOYEES: 'employees',
  MONTHS: 'months',
  SETTINGS: 'settings',
  CURRENT_STATE: 'current',
  UNDO: 'undo',
  JUMPS: 'jumps',
  FILTERS: 'filters',
  DAYS_OFF: 'days-off'
};

const getStorageKey = (storeName) => `${PREFIX}${storeName}`;

/**
 * Generic JSON getter from localStorage with error handling
 */
export const getStorageItem = (key, defaultValue = null) => {
  try {
    const fullKey = key.startsWith(PREFIX) ? key : getStorageKey(key);
    const data = localStorage.getItem(fullKey);
    return data ? JSON.parse(data) : defaultValue;
  } catch (e) {
    console.error(`Error reading ${key} from localStorage`, e);
    return defaultValue;
  }
};

/**
 * Generic JSON setter for localStorage with error handling
 */
export const setStorageItem = (key, value) => {
  try {
    const fullKey = key.startsWith(PREFIX) ? key : getStorageKey(key);
    localStorage.setItem(fullKey, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving ${key} to localStorage`, e);
  }
};

/**
 * Generic remover for localStorage
 */
export const removeStorageItem = (key) => {
  try {
    const fullKey = key.startsWith(PREFIX) ? key : getStorageKey(key);
    localStorage.removeItem(fullKey);
  } catch (e) {
    console.error(`Error removing ${key} from localStorage`, e);
  }
};

/**
 * Generic JSON getter from sessionStorage with error handling
 */
export const getSessionItem = (key, defaultValue = null) => {
  try {
    const fullKey = key.startsWith(PREFIX) ? key : getStorageKey(key);
    const data = sessionStorage.getItem(fullKey);
    return data ? JSON.parse(data) : defaultValue;
  } catch (e) {
    console.error(`Error reading ${key} from sessionStorage`, e);
    return defaultValue;
  }
};

/**
 * Generic JSON setter for sessionStorage with error handling
 */
export const setSessionItem = (key, value) => {
  try {
    const fullKey = key.startsWith(PREFIX) ? key : getStorageKey(key);
    sessionStorage.setItem(fullKey, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving ${key} to sessionStorage`, e);
  }
};

const getStoreData = (storeName) => {
  return getStorageItem(storeName, {});
};

const setStoreData = (storeName, data) => {
  setStorageItem(storeName, data);
};

export const saveItem = async (storeName, key, data) => {
  const storeData = getStoreData(storeName);

  storeData[key] = data;
  setStoreData(storeName, storeData);
  console.log(`Saved to ${storeName}: ${key} =`, data);
};

export const saveItems = async (storeName, itemsMap) => {
  const storeData = getStoreData(storeName);

  Object.entries(itemsMap).forEach(([key, value]) => {
    storeData[key] = value;
  });
  setStoreData(storeName, storeData);
  console.log(`Saved multiple items to ${storeName}`);
};

export const getAllItems = async (storeName) => {
  const storeData = getStoreData(storeName);

  if (storeName === STORES.EMPLOYEES || storeName === STORES.SETTINGS) {
    return storeData;
  } else {
    return Object.values(storeData);
  }
};
