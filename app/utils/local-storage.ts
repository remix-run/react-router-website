export class LocalStorage {
  static setItem(
    key: string,
    value: string,
    // default to 24 hours
    expiry: number = 8.64e7
  ): void {
    let now = new Date();
    let item = {
      value,
      expiry: now.getTime() + expiry,
    };
    localStorage.setItem(key, JSON.stringify(item));
  }

  static getItem(key: string): string | null {
    let itemString = localStorage.getItem(key);
    // if the item doesn't exist, return null
    if (!itemString) {
      return null;
    }
    try {
      let item = JSON.parse(itemString);
      let now = new Date();

      if (now.getTime() > item.expiry) {
        // If the item is expired, delete the item from storage and return null
        localStorage.removeItem(key);
        return null;
      }
      return item.value;
    } catch (_) {
      return itemString;
    }
  }

  static removeItem(key: string): void {
    localStorage.removeItem(key);
  }
}
