const fs = require("fs");
const request = require("request");
const requestPromise = require("request-promise-native");

class Pages {
  constructor(opt) {
    opt = opt || {};
    if(!opt.password) {
      throw {code: "invalid argument"};
    }
    this._baseUrl = opt.baseUrl || "https://routerlogin.net";
    this._auth = {
      username: "admin",
      password: opt.password
    };
  }
  
  get baseUrl() {
    return this._baseUrl;
  }
  
  _httpGet(path) {
    return requestPromise(`${this._baseUrl}/${path}`, {auth: this._auth}).then((body) => {
      // fs.writeFile(`tmp/${Date.now().getUTCMilliseconds()}.${path}`, body, () => {});
      return body;
    });
  }
  
  // the router prevents multiple admin logins by redirecting to change_user.html.
  // to override this, do a GET against change_user.html
  changeUser() {
    return this._httpGet("change_user.html");
  }
  
  deviceInfo() {
    return this._httpGet("DEV_device_info.htm").then((body) => {
      const BODY_REGEX = /^device_changed=[^\n]+\ndevice=(.*)$/m;
      const match = body.match(BODY_REGEX);
      if(!match) {
        throw {code: "unexpected result from DEV_device_info.htm"};
      }
      return JSON.parse(match[1]); // throws
    });
  }
  
  basicHomeResult() {
    return this._httpGet("basic_home_result.txt").then((body) => {
      const BODY_REGEX = /^([^;]+);([0-9]+);([0-9]+);[0-9]+;[0-9]+;[0-9]+;[0-9]+;[\n\t ]*$/m;
      const match = body.match(BODY_REGEX);
      if(!match) {
        throw {code: "unexpected result from basic_home_result.txt"};
      }
      
      const status = match[1];
      const connectedSatellites = parseInt(match[2]);
      const connectedDevices = parseInt(match[3]);
      
      return {status, connectedSatellites, connectedDevices};
    });
  }
  
  logout() {
    return this._httpGet("LOG_logout.htm");
  }
}

module.exports = Pages;