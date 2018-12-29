const fs = require("fs");
const request = require("request");
const requestPromise = require("request-promise-native");

class Pages {
  constructor(opt) {
    if(!opt.password) {
      throw {code: "invalid argument"};
    }
    this._baseUrl = opt.baseUrl || "https://routerlogin.net";
    this._auth = {
      username: opt.username || "admin",
      password: opt.password
    };
  }
  
  static _httpGet(path) {
    return requestPromise(`${this._baseUrl}/${path}`, {auth: this._auth}).then((body) => {
      fs.writeFile(`tmp/${Date.now().getUTCMilliseconds()}.${path}`, body, () => {});
      return body;
    });
  }
  
  // the router prevents multiple admin logins by redirecting to change_user.html.
  // to override this, do a GET against change_user.html
  changeUser() {
    return this._httpGet("change_user.html");
  }
  
  deviceInfo(callback) {
    return this._httpGet("DEV_device_info.htm").then((body) => {
      const BODY_REGEX = /^device_changed=1 device=(.*)$/;
      const match = body.match(BODY_REGEX);
      if(!match) {
        throw {code: "unexpected result from DEV_device_info.htm"};
      }
      return JSON.parse(match[1]); // throws
    });
  }
  
  basicHomeResult(callback) {
    return this._httpGet("basic_home_result.txt").then((body) => {
      const BODY_REGEX = /^([^ \t;]+);([0-9]+);([0-9]+);([0-9]+);([0-9]+);([0-9]+);$/;
      const match = body.match(BODY_REGEX);
      if(!match) {
        throw {code: "unexpected result from basic_home_result.txt"};
      }
      
      const status = match[1];
      const connectedSatellites = Number.parse(match[2]);
      const connectedDevices = Number.parse(match[3]);
      
      return {status, connectedSatellites, connectedDevices};
    });
  }
  
  logout(callback) {
    return requestPromise(`${this._baseUrl}/LOG_logout.htm`, {auth: this._auth});
  }
}
