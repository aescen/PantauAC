var $$ = Dom7;
var $$data;
var $$fbI;
var $$fbO;
var $$db;
var $$err = false;
var $$devReady = false;
var $$nid = 0;
var $$tmp = {
  "kondensor": -1
};

var app = new Framework7({
  root: '#app', // App root element
  id: 'id.ycmlg.monitoringac', // App bundle ID
  name: 'Monitoring AC', // App name
  theme: 'md', // Automatic theme detection
  autoDarkTheme : true,
  // App root data
  data() {
    return {
      foo: 'bar'
    };
  },
  // App root methods
  methods: {
    doSomething() {
      // ...
    }
  },
  // App routes
  routes: routes,
  // Input settings
  input: {
    scrollIntoViewOnFocus: Framework7.device.cordova && !Framework7.device.electron,
    scrollIntoViewCentered: Framework7.device.cordova && !Framework7.device.electron,
  },
  // Cordova Statusbar settings
  statusbar: {
    iosOverlaysWebView: false,
    androidOverlaysWebView: true,
  },
  on: {
    init: function () {
      var f7 = this;
      if (f7.device.cordova) {
        // Init cordova APIs (see cordova-app.js)
        cordovaApp.init(f7);
      }
    },
    pageInit: function () {
      console.log('Page initialized');
      $$devReady = true;
      refOnce();
    },
  },
});

var mainView = app.views.create('.view-main', {
  url: '/'
});

window.onerror = function (msg, url, line) {
    $$err = true;
    app.preloader.hide();
    let msgs = "Message : " + msg + "<br>Line number : " + line + "<br>Url : " + url ;
    // Alert
    app.dialog.alert(msgs, 'Error', function(){
        if (typeof cordova !== 'undefined') {
            if (navigator.app) {
                navigator.app.exitApp();
            }
            else if (navigator.device) {
                navigator.device.exitApp();
            }
        } else {
            window.close();
        }
    });
}

function consoleToast(str){
    // Create bottom toast
    if (app.device.cordova) {
        let toastBottom = app.toast.create({
        text: str,
        closeTimeout: 2000,
        });
        toastBottom.open();
    }
}

//notifications
function addNotification(titlestr, textstr) {
  if (app.device.cordova) {
      cordovaApp.addNotification($$nid, titlestr, textstr);
      $$nid++;
      console.log("Notification added.");
      //consoleToast("Notification added.");
  }
  let loc = window.location.pathname;
  let dir = loc.substring(0, loc.lastIndexOf('/'));
  ////consoleToast('Loc:' + loc + ' Dir:' + dir);
  console.log('Loc:' + loc + ' Dir:' + dir);
}

// Initialize Firebase
function fbInit(){
    let config = {
        apiKey: "...",
        authDomain: "...",
        databaseURL: "...",
        projectId: "...",
        storageBucket: "...",
        messagingSenderId: "...",
        appId: "...",
        measurementId: "..."
    };
    // Initialize Firebase
    firebase.initializeApp(config);
    //firebase.analytics();
    
    $$db = firebase.database();
    $$fbI = true;
    console.log("fbInit");    
}

function fbOn(){
    /* obtain data when app is starting or data is updated */
    $$db.ref("/ACAmbang/").on("value", function(snapshot) {
        $$data = snapshot.val();
        //console.log($$data);
        document.getElementById('imgSuhuKondensator').src = './assets/suhuudara.png';
        document.getElementById('imgTekananKondensator').src = './assets/tekananudara.png';
        document.getElementById('imgSuhuUdara').src = './assets/suhuudara.png';
        document.getElementById('suhukondensator').innerHTML = $$data.Suhu + ' \u00B0C';
        document.getElementById('tekanankondensator').innerHTML = $$data.TekananUdara + ' bar';
        document.getElementById('suhuudara').innerHTML = $$data.SuhuUdara + ' \u00B0C';
        
        let kondensator = "";
        let statusKondensator = "";
        let suhu = parseInt($$data.Suhu);
        if(suhu > 40){
          kondensator = './assets/kondensator-rusak.png';
          statusKondensator = "Kondensor rusak!";
        } else if(suhu <= 40){
          kondensator = './assets/kondensator-normal.png';
          statusKondensator = "Normal";
        } else{
          kondensator = './assets/kondensator-grey.png';
          statusKondensator = "...";
        }

        if($$tmp.kondensor != suhu){
          if(suhu > 40){
              addNotification("Kondensor rusak!", "Suhu: " + suhu);
          }
          $$tmp.kondensor = suhu;
        }
        
        let tekanan = "";
        let statusTekanan = "";
        const rendah = 3.97;
        const tinggi = 5.8;
        let tekananUdara = parseFloat($$data.TekananUdara);
        if(tekananUdara < rendah){
          tekanan = './assets/tekanan-status-abnormal.png';
          statusTekanan = "Freon habis!";
        } else if(tekananUdara >= rendah && tekananUdara <= tinggi){
          tekanan = './assets/tekanan-status-normal.png';
          statusTekanan = "Normal";
        } else if(tekananUdara > tinggi){
          tekanan = './assets/tekanan-status-abnormal.png';
          statusTekanan = "Tekanan freon tinggi";
        } else{
          tekanan = './assets/tekananudara-grey.png';
          statusTekanan = "...";
        }

        document.getElementById('imgKondensator').src = kondensator;
        document.getElementById('kondensator').innerHTML = statusKondensator;

        document.getElementById('imgTekananStatus').src = tekanan;
        document.getElementById('statustekanan').innerHTML = statusTekanan;

        console.log("fbOn");
        app.preloader.hide();
        $$fbO = true;
        }, function (error) {
    });
}

/* obtain data once */
function refOnce(){
    if(!$$err && $$devReady){
        if(!$$fbI){
            fbInit();
            if(!$$fbO){
                fbOn();
            }
        } else {
            $$db.ref("/ACAmbang/").once("value").then(
                function(snapshot) {
                    $$data = snapshot.val();
                    //console.log($$data);
                    document.getElementById('imgSuhuKondensator').src = './assets/suhuudara.png';
                    document.getElementById('imgTekananKondensator').src = './assets/tekananudara.png';
                    document.getElementById('imgSuhuUdara').src = './assets/suhuudara.png';
                    document.getElementById('suhukondensator').innerHTML = $$data.Suhu + ' \u00B0C';
                    document.getElementById('tekanankondensator').innerHTML = $$data.TekananUdara + ' bar';
                    document.getElementById('suhuudara').innerHTML = $$data.SuhuUdara + ' \u00B0C';

                    let kondensator = "";
                    let statusKondensator = "";
                    let suhu = parseInt($$data.Suhu);
                    if(suhu > 40){
                      kondensator = './assets/kondensator-rusak.png';
                      statusKondensator = "Kondensor rusak!";
                    } else if(suhu <= 40){
                      kondensator = './assets/kondensator-normal.png';
                      statusKondensator = "Normal";
                    } else{
                      kondensator = './assets/kondensator-grey.png';
                      statusKondensator = "...";
                    }

                    if($$tmp.kondensor != suhu){
                      if(suhu > 40){
                          addNotification("Kondensor rusak!", "Suhu: " + suhu);
                      }
                      $$tmp.kondensor = suhu;
                    }
                    
                    let tekanan = "";
                    let statusTekanan = "";
                    const rendah = 3.97;
                    const tinggi = 5.8;
                    let tekananUdara = parseFloat($$data.TekananUdara);
                    if(tekananUdara < rendah){
                      tekanan = './assets/tekanan-status-abnormal.png';
                      statusTekanan = "Freon habis!";
                    } else if(tekananUdara >= rendah && tekananUdara <= tinggi){
                      tekanan = './assets/tekanan-status-normal.png';
                      statusTekanan = "Normal";
                    } else if(tekananUdara > tinggi){
                      tekanan = './assets/tekanan-status-abnormal.png';
                      statusTekanan = "Tekanan freon tinggi";
                    } else{
                      tekanan = './assets/tekananudara-grey.png';
                      statusTekanan = "...";
                    }

                    document.getElementById('imgKondensator').src = kondensator;
                    document.getElementById('kondensator').innerHTML = statusKondensator;

                    document.getElementById('imgTekananStatus').src = tekanan;
                    document.getElementById('statustekanan').innerHTML = statusTekanan;

                    console.log("fbOnce");
                    app.preloader.hide();
                }
            )
        }
    } else {
        console.log("Error/device not ready.");
        //consoleToast("Error/device not ready.");
        app.preloader.hide();
    }
};

// Pull to refresh content
var $ptrContent = $$('.ptr-content');
$ptrContent.on('ptr:refresh', function (e) {
  setTimeout(function () {
    $$db.ref("/ACAmbang/").once("value").then(
            function(snapshot) {
                $$data = snapshot.val();
                //console.log($$data);
                document.getElementById('imgSuhuKondensator').src = './assets/suhuudara.png';
                document.getElementById('imgTekananKondensator').src = './assets/tekananudara.png';
                document.getElementById('imgSuhuUdara').src = './assets/suhuudara.png';
                document.getElementById('suhukondensator').innerHTML = $$data.Suhu + ' \u00B0C';
                document.getElementById('tekanankondensator').innerHTML = $$data.TekananUdara + ' bar';
                document.getElementById('suhuudara').innerHTML = $$data.SuhuUdara + ' \u00B0C';

                let kondensator = "";
                let statusKondensator = "";
                let suhu = parseInt($$data.Suhu);
                if(suhu > 40){
                  kondensator = './assets/kondensator-rusak.png';
                  statusKondensator = "Kondensor rusak!";
                } else if(suhu <= 40){
                  kondensator = './assets/kondensator-normal.png';
                  statusKondensator = "Normal";
                } else{
                  kondensator = './assets/kondensator-grey.png';
                  statusKondensator = "...";
                }
                
                if($$tmp.kondensor != suhu){
                  if(suhu > 40){
                      addNotification("Kondensor rusak!", "Suhu: " + suhu);
                  }
                  $$tmp.kondensor = suhu;
                }

                let tekanan = "";
                let statusTekanan = "";
                const rendah = 3.97;
                const tinggi = 5.8;
                let tekananUdara = parseFloat($$data.TekananUdara);
                if(tekananUdara < rendah){
                  tekanan = './assets/tekanan-status-abnormal.png';
                  statusTekanan = "Freon habis!";
                } else if(tekananUdara >= rendah && tekananUdara <= tinggi){
                  tekanan = './assets/tekanan-status-normal.png';
                  statusTekanan = "Normal";
                } else if(tekananUdara > tinggi){
                  tekanan = './assets/tekanan-status-abnormal.png';
                  statusTekanan = "Tekanan freon tinggi";
                } else{
                  tekanan = './assets/tekananudara-grey.png';
                  statusTekanan = "...";
                }

                document.getElementById('imgKondensator').src = kondensator;
                document.getElementById('kondensator').innerHTML = statusKondensator;

                document.getElementById('imgTekananStatus').src = tekanan;
                document.getElementById('statustekanan').innerHTML = statusTekanan;
            }
        );
        console.log("Ptr done...");
        consoleToast("Updated.");
        app.ptr.done();
  }, 2000);
});