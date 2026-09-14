const PREFIX = 'ok-sg-';
const EMPLOYEES_STORE = 'employees';
const MONTHS_STORE = 'months';
const SETTINGS_STORE = 'settings';

const getStorageKey = (storeName) => `${PREFIX}${storeName}`;

export const initDB = () => {
  return Promise.resolve(true);
};

const getStoreData = (storeName) => {
  const key = getStorageKey(storeName);
  const data = localStorage.getItem(key);
  try {
    return data ? JSON.parse(data) : {};
  } catch (e) {
    console.error(`Error parsing data from localStorage for ${key}`, e);
    return {};
  }
};

const setStoreData = (storeName, data) => {
  const key = getStorageKey(storeName);
  localStorage.setItem(key, JSON.stringify(data));
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

export const getItem = async (storeName, key) => {
  const storeData = getStoreData(storeName);
  return storeData[key];
};

export const getAllItems = async (storeName) => {
  const storeData = getStoreData(storeName);
  if (storeName === EMPLOYEES_STORE || storeName === SETTINGS_STORE) {
    return storeData;
  } else {
    return Object.values(storeData);
  }
};
