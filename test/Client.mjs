const Client = require("../src/Client.mjs");
const chai = require("chai");
const expect = chai.expect;

describe("Client", () => {
  
  ///////////////
  // MockPages //
  ///////////////
  
  let calls; // array of strings to track calls into MockPages
  beforeEach(() => {
    calls = [];
  });
  
  let mockPages;
  class MockPages {
    constructor(opt) {
      calls.push(`constructor(${JSON.stringify(opt)})`);
      mockPages = this;
    }
    
    get baseUrl() {
      return "https://routerlogin.net";
    }
    
    changeUser() {
      return new Promise((resolve, reject) => {
        calls.push("changeUserImpl");
        return this.changeUserImpl(resolve, reject);
      });
    }
    
    changeUserImpl(resolve, reject) {
      return resolve();
    }
    
    deviceInfo() {
      return new Promise((resolve, reject) => {
        calls.push("deviceInfoImpl");
        return this.deviceInfoImpl(resolve, reject);
      });
    }
    
    deviceInfoImpl(resolve, reject) {
      return resolve([{"ip": "1.2.3.4"}]);
    }
    
    basicHomeResult() {
      return new Promise((resolve, reject) => {
        calls.push("basicHomeResultImpl");
        return this.basicHomeResultImpl(resolve, reject);
      });
    }
    
    basicHomeResultImpl(resolve, reject) {
      return resolve({
        status: "success",
        connectedSatellites: 3,
        connectedDevices: 16
      });
    }
    
    logout() {
      return new Promise((resolve, reject) => {
        calls.push("logoutImpl");
        return this.logoutImpl(resolve, reject);
      });
    }
    
    logoutImpl(resolve, reject) {
      return resolve();
    }
  }
  
  ///////////////////
  // constructor() //
  ///////////////////
  
  describe(".constructor()", () => {
    
    it("works", () => {
      const client = new Client({password: "somePassword", depends: {Pages: MockPages}});
      expect(calls).to.deep.equal([
        "constructor({\"password\":\"somePassword\"})"
      ]);
      expect(client.status).to.equal("unknown");
    });
    
    it("works with opt.baseUrl", () => {
      const client = new Client({password: "somePassword", baseUrl: "http://wefwef.com", depends: {Pages: MockPages}});
      expect(calls).to.deep.equal([
        `constructor({\"password\":\"somePassword\",\"baseUrl\":\"http://wefwef.com\"})`
      ]);
      expect(client.devices).to.deep.equal([]);
    });
    
    it("throws when missing password", () => {
      const client =
        expect(() => {
          new Client({depends: {Pages: MockPages}});
        }).to.throw;
    });
    
  });
  
  ///////////////
  // refresh() //
  ///////////////
  
  describe(".refresh()", () => {
    
    it("works", (done) => {
      const client = new Client({password: "somePassword", depends: {Pages: MockPages}});
      calls = [];
      client.refresh().then(() => {
        expect(client.status).to.equal("success");
        expect(calls.join(",")).to.equal("changeUserImpl,basicHomeResultImpl,deviceInfoImpl,logoutImpl");
        client.on("refreshed", () => {
          done();
        });
      }).catch(() => {
        expect.fail();
      });
    });
    
    function testFailedSteps(opt) {
      const failingCall = opt.failingCall;
      
      const client = new Client({password: "somePassword", depends: {Pages: MockPages}});
      calls = [];
      mockPages[failingCall] = (resolve, reject) => reject("an error");
      
      const normalCalls = [
        "changeUserImpl",
        "basicHomeResultImpl",
        "deviceInfoImpl",
        "logoutImpl"
      ];
      const i = normalCalls.indexOf(failingCall);
      if(i == -1) {
        return expect.fail();
      }
      
      const expectedCalls = normalCalls.slice(0, i + 1);
      return client.refresh().then(() => {
        expect.fail();
      }).catch(() => {
        expect(client.status).to.equal("unknown");
        expect(client.devices).to.deep.equal([]);
        expect(calls.join(",")).to.equal(expectedCalls.join(","));
      });
    }
    
    it("has correct behavior when Pages.changeUser fails", () => testFailedSteps({failingCall: "changeUserImpl"}));
    it("has correct behavior when Pages.basicHomeResult fails", () => testFailedSteps({failingCall: "basicHomeResultImpl"}));
    it("has correct behavior when Pages.deviceInfo fails", () => testFailedSteps({failingCall: "deviceInfoImpl"}));
    it("has correct behavior when Pages.logout fails", () => testFailedSteps({failingCall: "logoutImpl"}));
  });
});
