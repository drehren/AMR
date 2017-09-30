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
Usage : 
 - background request actmirrors : enrich each mirror with list of mangas
 - background request getListManga : return list of mangas for a website
 - background desactivateMirror : empty list of mangas
 - background refreshNewMirrorsMangaLists : check if empty or not... + get list
 - background mangaListLoaded  : store list
 - popupSearch refreshSearchAll : getList for mirror
 
Method to add
 - getMangaList(mirror, callback)
 - isEmpty(mirror, callback);
 - empty(mirror);
 - storeMangaList(mirror);
 
*/

var wssql = {};
wssql.webdb = {};
wssql.webdb.db = null;

wssql.webdb.open = function(callback) {
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
    wssql.webdb.db = event.target.result;
    if (callback)
      callback();
  };
};

wssql.webdb.storeMangaList = function(mirrorname, list) {
  var db = wssql.webdb.db;
  var trans = db.transaction('manga', 'readwrite');
  var store = trans.objectStore('manga');
  var i = 0;

  putItem();

  function putItem() {
    if (i < list.length) {
      var rq = store.put({ mirror: mirrorname, manga: list[i][0], mgurl: list[i][1] }, [mirrorname,list[i][0]]);
      rq.onsuccess = putItem;
      rq.onerror = function() {
        console.log('Error while inserting ' + list[i][0] + ' for mirror ' + mirrorname);
      };
      i++;
    }
  }
};

wssql.webdb.empty = function(mirror, callback) {
  var db = wssql.webdb.db;
  var trans = db.transaction('manga', 'readwrite');
  var store = trans.objectStore('manga');

  var req = store.delete(mirror);
  req.onsuccess = function(ev) {
    callback(ev, req.result);
  };
  req.onerror = function() {
    console.log("Error while deleting " + mirror);
  };
};

wssql.webdb.onError = function(tx, e) {
  alert("There has been an error: " + e.message);
};

wssql.webdb.isEmpty = function(mirror, callback) {
  var db = wssql.webdb.db;
  var trans = db.transaction('manga', 'readonly');
  var store = trans.objectStore('manga');
  var index = store.index('mirror');

  var req = index.openCursor(IDBKeyRange.only(mirror));
  req.onsuccess = function(event) {
    var req2 = index.count();
    req2.onsuccess = function(ev) {
      callback(req.result == 0);
    };
    req2.onerror = function() {
      console.log("Error when counting mangas.");
    };
  };
  req.onerror = function() {
    console.log("Error when opening index to count mangas.");
  };
};

wssql.webdb.getMangaList = function(mirror, callback) {
  var db = wssql.webdb.db;
  var trans = db.transaction('manga', 'readonly');
  var store = trans.objectStore('manga');
  var index = store.index('mirror');

  var ret = [];

  var req = index.openCursor(IDBKeyRange.only(mirror));
  req.onsuccess = function(event) {
    var cursor = event.target.result;
    if (cursor) {
      ret[ret.length] = [cursor.value.manga, cursor.value.mgurl];
      cursor.continue();
    }
    else {
      if (callback)
        callback(ret, mirror);
    }
  };
  req.onerror = function() {
    console.log("Error when opening index to count mangas.");
  };
};

wssql.init = function(callback) {
  wssql.webdb.open(callback);
};
