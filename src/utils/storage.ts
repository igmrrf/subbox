export async function clearAllBrowserData() {
  // 1. Clear LocalStorage and SessionStorage
  localStorage.clear();
  sessionStorage.clear();

  // 2. Clear all Cookies for the current domain
  const cookies = document.cookie.split(";");
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i];
    const eqPos = cookie.indexOf("=");
    const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
    document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
  }

  // 3. Delete all IndexedDB databases
  if (window.indexedDB.databases) {
    const dbs = await window.indexedDB.databases();
    dbs.forEach((db) => {
      if (db.name) window.indexedDB.deleteDatabase(db?.name);
    });
  }

  // 4. Unregister all Service Workers
  if ("serviceWorker" in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (const registration of registrations) {
      await registration.unregister();
    }
  }

  // 5. Clear Cache API storage
  if ("caches" in window) {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map((name) => caches.delete(name)));
  }

  console.log("All site data cleared. Reloading page...");
  window.location.reload();
}
