/**

  This file is part of All Mangas Reader.
  
  All Mangas Reader is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.
  
  All Mangas Reader is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.
  
  You should have received a copy of the GNU General Public License
  along with All Mangas Reader.  If not, see <http://www.gnu.org/licenses/>. 

*/

/*

*/

var amrcsql = {};
amrcsql.webdb = {};
amrcsql.webdb.db = null;

amrcsql.webdb.open = function(callback) {
  // webkit for Chrome
  window.indexedDB = window.indexedDB || window.webkitIndexedDB;
  if ('webkitIndexedDB' in window) {
    window.IDBTransaction = window.webkitIDBTransaction;
    window.IDBKeyRange = window.webkitIDBKeyRange;
  }
  
  var request = window.indexedDB.open('AMR');
  request.onerror = function(){
    alert('could not open database');
  };
  request.onupgradeneeded = function(event) {
    var db = event.target.result;
    var store = db.createObjectStore('manga', {keypath: ["mirror","manga"]});
    store.createIndex('mirror', 'mirror', {unique:false});
    db.createObjectStore('pstat', {autoIncrement:true});
    db.createObjectStore('website', {keypath: 'id'});
  };
  request.onsuccess = function(event) {
    amrcsql.webdb.db = event.target.result;
    if (callback)
      callback();
  };

};

amrcsql.webdb.storeWebsite = function(amrcObject, callback) {
  amrcObject["activated"] = 1;
  this.updateWebsite(amrcObject, callback);
};

amrcsql.webdb.updateWebsite = function(amrcObject, callback) {
  var db = amrcsql.webdb.db;
  var trans = db.transaction('website', 'readwrite');
  var store = trans.objectStore('website');

  var req = store.put(amrcObject, amrcObject.id);
  req.onsuccess = function(event){
    callback();
  };
  req.onerror = function() {
    console.log("Error while inserting " + amrcObject.id + " for mirror " + amrcObject.mirrorName);
  };
  
};

amrcsql.webdb.onError = function(tx, e) {
  alert("There has been an error: " + e.message);
};

amrcsql.webdb.getWebsites = function(callback) {
  var db = amrcsql.webdb.db;
  var trans = db.transaction('website', 'readonly');
  var store = trans.objectStore('website');

  var req = store.getAll();
  req.onsuccess = function(event) {
    callback(event.target.result);
  };
  req.onerror = function() {
    console.log("Error while retrieving websites");
  };
};

amrcsql.init = function(callback) {
  amrcsql.webdb.open(callback);
};
