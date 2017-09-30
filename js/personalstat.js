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

var pstat = {};
pstat.webdb = {};
pstat.webdb.db = null;

pstat.webdb.open = function(callback) {
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
    var store = db.createObjectStore('manga', {keypath:  ["mirror","manga"]});
    store.createIndex('mirror', 'mirror', {unique:false});
    db.createObjectStore('pstat', {autoIncrement:true});
    db.createObjectStore('website', {keypath: 'id'});
  };
  request.onsuccess = function(event) {
    pstat.webdb.db = event.target.result;
    if (callback)
      callback();
  };
};

pstat.webdb.addStat = function(obj, callback) {
  var db = pstat.webdb.db;
  var t = db.transaction('pstat', 'readwrite');
  var store = t.objectStore('pstat');

  obj.timeSpent = 0;
  obj.addedOn = new Date().getTime();

  var req = store.add(obj);
  req.oncomplete = function(event) {
    callback(event.target.result);
  };
  req.onerror = function() {
    console.log("Error while inserting statistic.");
  };
};

pstat.webdb.updateStat = function(id, time, callback) {
  var db = pstat.webdb.db;
  var t = db.transaction('pstat', 'readwrite');
  var store = t.objectStore('pstat');

  var req = store.get(id);
  req.onsuccess = function(event) {
    var data = event.target.result;
    data.timeSpent = time;
    var r2 = store.put(data, key);
    r2.onsuccess = function() {
      callback();
    };
    r2.onerror = req.onerror;
  };
  req.onerror = function () {
    console.log("Error while updating stat.");
  };
};

pstat.webdb.deleteStat = function(id, callback) {
  var db = pstat.webdb.db;
  var t = db.transaction('pstat', 'readwrite');
  var store = t.objectStore('pstat');

  var req = store.delete(id);
  req.onsuccess = function() {
    callback();
  };
  req.onerror = function() {
    console.log("Error deleting stat");
  };
};

pstat.webdb.onError = function(tx, e) {
  alert("There has been an error: " + e.message);
};

pstat.webdb.getAllPStat = function(callback) {
  var db = pstat.webdb.db;
  var t = db.transaction('pstat','readonly');
  var store = t.objectStore('pstat');

  var req = store.getAll();
  req.onsuccess = function(event) {
    callback(event.target.result);
  };
  req.onerror = function() {
    console.log("Error while retrieving stats.");
  };
};

pstat.init = function(callback) {
  pstat.webdb.open(callback);
};
