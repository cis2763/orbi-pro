const EventEmitter = require("events");
const Pages = require("./Pages.mjs");

class Client extends EventEmitter {
  constructor(opt) {
    super();
    this._basic = {status: "unknown"};
    this._devices = [];
    const depends = opt.depends || {};
    const pagesClass = depends.Pages || Pages;
    
    const pagesOpt = {};
    if(opt.password) {
      pagesOpt.password = opt.password;
    }
    if(opt.baseUrl) {
      pagesOpt.baseUrl = opt.baseUrl;
    }
    this._pages = new pagesClass(pagesOpt);
  }
  
  get status() {
    return this._basic.status || "unknown";
  }
  
  get devices() {
    return this._devices;
  }
  
  refresh() {
    let result = {};
    return this._pages.changeUser().then(() => {
      return this._pages.basicHomeResult();
    }).then((basicResult) => {
      result.basic = basicResult;
      return this._pages.deviceInfo();
    }).then((devices) => {
      result.devices = devices;
      return this._pages.logout();
    }).then(() => {
      this._basic = result.basic;
      this._devices = result.devices;
      setTimeout(() => {
        this.emit("refreshed");
      }, 0);
    });
  }
}

module.exports = Client;