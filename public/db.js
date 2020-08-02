let db;
// create a new db request for a "budget" database.
const request = indexedDB.open("budget", 1);

request.onupgradeneeded = function (event) {
  // create object store called "pending" and set autoIncrement to true
  const db = event.target.result;

  const objectStore = db.createObjectStore("pending", {
    autoIncrement: true,
  });
  objectStore.createObjectStore("");
};

request.onsuccess = function (event) {
  db = event.target.result;

  if (navigator.onLine) {
    checkDatabase();
  }
};

request.onerror = function (event) {
  // log error here
  console.log("help me I don't know what I'm doing");
};

function saveRecord(record) {
  // create a transaction on the pending db with readwrite access
  const transaction = db.transaction(["budget"], "readwrite");
  // access your pending object store
  const budgetListStore = transaction.objectStore("budget");
  // add record to your store with add method.
  const budgetIndex = budgetListStore.index("budgetIndex");
  
  budgetListStore.add(record);

}

function checkDatabase() {
  // open a transaction on your pending db
  const getCursorRequest = objectStore.open("pending");
  // access your pending object store
  getCursorRequest.openCursor()
  // get all records from store and set to a variable

  getAll.onsuccess = function () {
    if (getAll.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then(() => {
          // if successful, open a transaction on your pending db
          const openReq = transaction.open("pending")
          // access your pending object store
          openReq.openCursor()
          // clear all items in your store
          budgetListStore.objectStore.clear()
          // budgetListStore.clear()
        });
    }
  };
}

// listen for app coming back online
window.addEventListener("online", checkDatabase);
