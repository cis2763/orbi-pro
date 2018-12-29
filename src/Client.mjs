const EventEmitter = require("events");
const fs = require("fs");
const pages = require("./Pages.mjs");

class Client extends EventEmitter {
  constructor(opt) {
    super();
    this._basic = {};
    this._devices = [];
    this._pages = new Pages(opt);
  }
  
  refresh() {
    let result = {};
    return this._pages.changeUser().then(() => {
      return basicHomeResult();
    }).then((basicResult) => {
      result._basic = basicResults;
      return deviceInfo();
    }).then((devices) => {
      result._devices = devices;
      return this._pages.logout();
    }).then(() => {
      this._basic = basic;
      this._devices = devices;
      this.emit("refreshed");
      return this;
    });
  }
}
