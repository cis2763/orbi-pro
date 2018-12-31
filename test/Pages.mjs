const Pages = require("../src/Pages.mjs");
const express = require("express");
const basicAuth = require("express-basic-auth");
const chai = require("chai");
const expect = chai.expect;

describe("Pages", () => {
  let pages; // the Pages instance
  let app; // the express app
  let server; // the result of app.listen(...), needed to cleanup after server
  let port; // port of server
  let requests; // array of requests made during this test: ["GET /foo.html", "GET /bar.html"]
  
  ///////////
  // setup //
  ///////////
  
  beforeEach(() => {
    // set up a temporary server
    app = express();
    app.use(basicAuth({
      users: {"admin": "thisIsThePassword"}
    }));
    
    requests = [];
    
    app.use((request, response, next) => {
      requests.push(`${request.method} ${request.path}`);
      next();
    });
    
    return new Promise((resolve, reject) => {
      server = app.listen(0, (error) => {
        if(error) {
          return reject(error);
        }
        port = server.address().port;
        
        pages = new Pages({
          baseUrl: `http://127.0.0.1:${port}`,
          password: "thisIsThePassword"
        });
        
        resolve();
      });
    });
    
  });
  
  //////////////
  // teardown //
  //////////////
  
  afterEach(() => {
    return new Promise((resolve, reject) => {
      server.close((error) => {
        if(error) {
          return reject(error);
        }
        resolve();
      });
    });
  });
  
  ///////////////////
  // constructor() //
  ///////////////////
  
  describe("#constructor()", () => {
    it("happy path", () => {
      let pages = new Pages({password: "123"});
      expect(pages.baseUrl).to.equal("https://routerlogin.net");
    });
    
    it("happy path with baseUrl", () => {
      let pages = new Pages({password: "123", baseUrl: "http://baseUrl.com"});
      expect(pages.baseUrl).to.equal("http://baseUrl.com");
    });
    
    it("missing opt", () => {
      expect(() => new Pages()).to.throw();
    });
    
    it("missing password", () => {
      expect(() => new Pages({})).to.throw();
    });
  });
  
  //////////////////
  // changeUser() //
  //////////////////
  
  describe("#changeUser()", () => {
    
    it("happy path", () => {
      app.get("/change_user.html", (request, response) => {
        response.send("");
      });
      
      return pages.changeUser().then(() => {
        expect(requests).to.deep.equal(["GET /change_user.html"]);
      }).catch((error) => {
        expect.fail();
      });
    });
    
    it("server error", () => {
      app.get("/change_user.html", (request, response) => {
        response.sendStatus(404);
      });
      
      return pages.changeUser().then(() => {
        expect.fail();
      }).catch((error) => {
        expect(requests).to.deep.equal(["GET /change_user.html"]);
        expect(error).to.exist;
      });
    });
    
  });
  
  //////////////
  // logout() //
  //////////////
  
  describe("#logout()", () => {
    
    it("happy path", () => {
      app.get("/LOG_logout.htm", (request, response) => {
        response.send("");
      });
      
      return pages.logout().then(() => {
        expect(requests).to.deep.equal(["GET /LOG_logout.htm"]);
      }).catch((error) => {
        expect.fail();
      });
    });
    
    it("server error", () => {
      app.get("/LOG_logout.htm", (request, response) => {
        response.sendStatus(404);
      });
      
      return pages.logout().then(() => {
        expect.fail();
      }).catch((error) => {
        expect(requests).to.deep.equal(["GET /LOG_logout.htm"]);
        expect(error).to.exist;
      });
    });
    
  });
  
  //////////////////
  // deviceInfo() //
  //////////////////
  
  describe("deviceInfo()", () => {
    
    const device1 = {
      "ip": "10.0.0.34",
      "mac": "00:01:2E:2F:7C:01",
      "contype": "wired",
      "attachtype": "1",
      "devtype": "24",
      "model": "PC Partner Ltd.",
      "name": "marble",
      "accsta": "0",
      "conn_orbi_name": "io",
      "conn_orbi_mac": "8C:3B:AD:C8:96:2A",
      "backhaul_sta": "Good",
      "ledstate": "0",
      "led_func": "0",
      "sync_btn": "0",
      "uprate": "0.00",
      "downrate": "0.00",
      "voice_orbi": "0",
      "voice_lwauserid": "",
      "ceiling_power": "not support",
      "module_name": ""
    };
    const device2 = {
      "ip": "10.0.0.70",
      "mac": "6C:56:97:E4:15:DB",
      "contype": "5G Wireless1",
      "attachtype": "0",
      "devtype": "25",
      "model": "Echo",
      "name": "living-room-echo",
      "accsta": "0",
      "conn_orbi_name": "Orbi Pro Router",
      "conn_orbi_mac": "8C:3B:AD:0E:8D:A0",
      "backhaul_sta": "Good",
      "ledstate": "0",
      "led_func": "0",
      "sync_btn": "0",
      "uprate": "0.00",
      "downrate": "0.00",
      "voice_orbi": "0",
      "voice_lwauserid": "",
      "ceiling_power": "not support",
      "module_name": ""
    };
    
    function testHappyPath(opt) {
      const expectedDevices = opt.expected || [device1, device2];
      const deviceChanged = opt.deviceChanged || "1";
      app.get("/DEV_device_info.htm", (request, response) => {
        response.send(`device_changed=${deviceChanged}\ndevice=${JSON.stringify(expectedDevices)}\n\n\n`);
      });
      return pages.deviceInfo().then((devices) => {
        expect(requests).to.deep.equal(["GET /DEV_device_info.htm"]);
        expect(devices).to.deep.equal(expectedDevices);
      }).catch((error) => {
        expect.fail();
      });
    }
    
    it("happy path with 0 devices", () => testHappyPath({expected: []}));
    it("happy path with 1 device", () => testHappyPath({expected: [device1]}));
    it("happy path with 2 devices", () => testHappyPath({expected: [device1, device1]}));
    it("happy path with device_changed=0", () => testHappyPath({
      expected: [device1, device1],
      deviceChanged: "0"
    }));
    
    it("server returns HTTP error", () => {
      app.get("/DEV_device_info.htm", (request, response) => {
        response.sendStatus(404);
      });
      
      return pages.deviceInfo().then(() => {
        expect.fail();
      }).catch((error) => {
        expect(requests).to.deep.equal(["GET /DEV_device_info.htm"]);
        expect(error).to.exist;
      });
    });
    
    function testInvalidBody(body) {
      app.get("/DEV_device_info.htm", (request, response) => {
        response.send(body);
      });
      return pages.deviceInfo().then(() => {
        expect.fail();
      }).catch((error) => {
        expect(requests).to.deep.equal(["GET /DEV_device_info.htm"]);
        expect(error).to.exist;
      });
    }
    
    it("weird stuff", () => testInvalidBody("this is something else"));
    it("invalid json", () => testInvalidBody("device_changed=1\ndevice=[{ \"abc\": \"123\" },"));
  });
  
  ///////////////////////
  // basicHomeResult() //
  ///////////////////////
  
  describe("basicHomeResult()", () => {
    
    it("happy path", () => {
      app.get("/basic_home_result.txt", (request, response) => {
        response.send("success;3;16;0;0;0;0;\n\n");
      });
      return pages.basicHomeResult().then((result) => {
        expect(requests).to.deep.equal(["GET /basic_home_result.txt"]);
        expect(result).to.exist;
        expect(result).to.deep.equal({
          "status": "success",
          "connectedSatellites": 3,
          "connectedDevices": 16
        });
      }).catch((error) => {
        expect.fail();
      });
    });
    
    it("server returns HTTP error", () => {
      app.get("/basic_home_result.txt", (request, response) => {
        response.sendStatus(404);
      });
      
      return pages.basicHomeResult().then(() => {
        expect.fail();
      }).catch((error) => {
        expect(requests).to.deep.equal(["GET /basic_home_result.txt"]);
        expect(error).to.exist;
      });
    });
    
    function testInvalidBody(body) {
      app.get("/basic_home_result.txt", (request, response) => {
        response.send(body);
      });
      return pages.basicHomeResult().then(() => {
        expect.fail();
      }).catch((error) => {
        expect(requests).to.deep.equal(["GET /basic_home_result.txt"]);
        expect(error).to.exist;
      });
    }
    
    it("body contains weird stuff", () => testInvalidBody("this is an invalid body"));
    it("body contains invalid satellite count", () => testInvalidBody("success;wef;16;0;0;0;0;\n\n"));
    it("body contains invalid device count", () => testInvalidBody("success;3;wef;0;0;0;0;\n\n"));
    it("body is missing stuff", () => testInvalidBody("success;3;16;0;0;0;\n\n"));
    it("body has extra stuff", () => testInvalidBody("success;3;16;0;0;0;0;\n\n"));
  });
  
});
