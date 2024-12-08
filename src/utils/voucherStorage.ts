export const VOUCHERS_STORAGE_KEY = 'vouchers';

export const getVouchersFromStorage = () => {
  try {
    const storedVouchers = localStorage.getItem(VOUCHERS_STORAGE_KEY);
    return storedVouchers ? JSON.parse(storedVouchers) : {};
  } catch (error) {
    console.error('Error reading vouchers from storage:', error);
    return {};
  }
};

export const saveVouchersToStorage = (vouchers: Record<string, any>) => {
  try {
    localStorage.setItem(VOUCHERS_STORAGE_KEY, JSON.stringify(vouchers));
  } catch (error) {
    console.error('Error saving vouchers to storage:', error);
  }
};