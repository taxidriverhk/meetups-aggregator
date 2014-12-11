/*jslint sloppy:true, browser:true, devel:true, white:true, vars:true, eqeq:true, nomen:true, unparam:true */
/*global intel, google, Marker, device */

//var currentUser;
$.getScript('http://www.parsecdn.com/js/parse-1.3.1.min.js', function()
{
    // script is now loaded and executed.
    // put your dependent JS here.
    Parse.initialize(
            "8kgtDniBqpMIqR431enDHnkKQO1joSenElOwTjsG",
            "iYwv5mh6xC2ihhylRgMBc44ZSEXKJEsLWftZS6sK"
    )
    
}).then(function() {
        var currentUser = Parse.User.current();
        var hc = new Object();
        hc["0oElRsLagv"] = {url: "http://google.com/", qbid: "2063479"};
        hc["JE5BA2czuk"] = {url: "http://reddit.com/", qbid: "2063383"};
        hc["GCxntFDnDg"] = {url: "http://linkedin.com/", qbid: "2063551"};
        
        console.log("before setting connections" + currentUser.id);
        console.log(hc);
        var po = new Parse.Object();
        po = hc;
        currentUser.set("connections") = po.toJSON(); 
        eser.save(null, {
          success: function(gameScore) {
            // Execute any logic that should take place after the object is saved.
            console.log("dude win");
          },
          error: function(gameScore, error) {
            // Execute any logic that should take place if the save fails.
            // error is a Parse.Error with an error code and message.
            console.log(error);
          }
        });
    });

var _map = null;
var _seconds = 5;
var _llbounds = null;
var user = null;
var users = new Array();
var linkedInResultStrings = new Array();
var linkedInResultImgStrings = new Array();
var myLatLng;
var userLatLng;
var oldLatLng = "";
var boolTripTrack = true;
var curProfileImage = "http://24sessions.com/img/profile_empty.jpg";
var iconBase = 'https://maps.google.com/mapfiles/kml/shapes/';
var selectedUser;
//Create the google Maps and LatLng object 

function drawMap() {
    //Creates a new google maps object based on user's current location (as center)
    //var latlng = new google.maps.LatLng(user.lat, user.long);
    
    var latlng = new google.maps.LatLng(currentLatitude, currentLongitude);
    myLatLng = latlng;
    var mapOptions = {
        center: latlng,
        zoom: 12,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        zoomControl: true,
        zoomControlOptions: {
            style: google.maps.ZoomControlStyle.SMALL,
            position: google.maps.ControlPosition.LEFT_BOTTOM
        }
    };
    if (boolTripTrack === true) {
        _map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);
    }
}
//40.7655,-73.97204 = NYC
var currentLatitude = "40.713768";
var currentLongitude = "-73.016696";
var options = {
    timeout: 10000,
    maximumAge: 11000,
    enableHighAccuracy: true
};

function LinkedInUser1(linkedInUrl, p) {
    /* not used for now
    this.username;
    this.password;
    this.email;
    this.firstName;
    this.lastName;
    this.lat = p.coords.latitude;
    this.long = p.coords.longitude;
    */
    
    var neg = Math.floor((Math.random()) + 1);
    if(neg == 0) 
        neg = -1;
    this.lat = currentLatitude + (Math.random() * 0.0225) * neg;
    this.long = currentLongitude + (Math.random() * 0.0225) * neg;
    this.linkedInUrl = linkedInUrl;
}

function populateLocalUsers(){
        
     //grab list of users close to currentUser
        //for now we will simply grab everyone
    //returns a list of [{id,url,qbid}] and stores it to var users
}

function LinkedInUser(n, p) {
    /*
    this.lat = p.coords.latitude + n;
    this.long = p.coords.longitude + n;
    */
    
    this.lat = currentLatitude;
    this.long = currentLongitude;
    this.info = null;
}

$(".buttonClick").click(function(){
     window.location=$(this).find("a").attr("href"); 
     return false;
});

var i = 0;
//Success callback
var suc = function(p) {
        console.log("geolocation success", 4);
    
        user = new LinkedInUser("https://www.linkedin.com/in/zhengyusun", p);
    
        //Draws the map initially
        if (_map === null) {
            /*
            currentLatitude = p.coords.latitude;
            currentLongitude = p.coords.longitude;
            */
            
            /* LA - WESTWOOD latlng
            currentLatitude = 34.056;
            currentLongitude = -118.44;
            */
            
            currentLatitude = 37.7458;
            currentLongitude = -122.4416;
            drawMap();
        } else {
            myLatLng = new google.maps.LatLng(p.coords.latitude, p.coords.longitude);
        }
    
        // grabs users into users array
        $.when( populateLocalUsers() ).done(function() {
           
            //inside here, users array is populated...
        });
    
        
        console.log(users);
    
        document.getElementById("goYelpButton").onclick = function(){ 
            console.log("GO button has been clicked"); 
            
            var pData = new Array();
            var query = new Parse.Query(Parse.User);
            
            query.equalTo("objectId", currentUser.id);
            query.first({
              success: function(object) {
                //console.log("");
                console.log(object);
                  pData = object.attributes["connections"];
              },
              error: function(error) {
                console.log("Error: " + error.code + " " + error.message);
              }
            }).done(function() {
               //check to see if current user is in connections list
                //if so, update info, and move to next view.
                var select = pData[(users[selectedUser]["id"])];
                if( select !== undefined) {
                    select["url"] = users[selectedUser]["url"];
                }
                //else add user in and move to next view
                else {
                    pData[users[selectedUser]["id"]] = {url: users[selectedUser]["id"],
                                                        qbid: users[selectedUser]["qbid"]};
                }
                //update parse
                currentUser.set("connections") = pData;
                currentUser.save().then(function() {
                    //move to different view 
                });
            });
        };
    
        //Creates a new google maps marker object for using with the pins
        while (i < users.length) {
            //Create a new map marker
            userLatLng = new google.maps.LatLng(users[i].lat, users[i].long);
            var Marker = new google.maps.Marker({
                position: userLatLng,
                map: _map,
                icon: 'http://i.imgur.com/NyckpY1.png'
            });
            
            
            google.maps.event.addListener(Marker, 'click', markerClickCallback(i));
            
            if (_llbounds === null) {
                //Create the rectangle in geographical coordinates
                _llbounds = new google.maps.LatLngBounds(new google.maps.LatLng(p.coords.latitude, p.coords.longitude)); //original
            } else {
                //Extends geographical coordinates rectangle to cover current position
                //_llbounds.extend(userLatLng);
            }
            //Sets the viewport to contain the given bounds & triggers the "zoom_changed" event
            //_map.fitBounds(_llbounds);
            
            i++;
        }
    };

var fail = function() {
        console.log("Geolocation failed. \nPlease enable GPS in Settings.", 1);
    };
var getLocation = function() {
        console.log("in getLocation", 4);
    };
    //Execute when the DOM loads

function markerClickCallback(id) {
    return function() {
        selectedUser = id;
        document.getElementById("user_info").innerHTML = linkedInResultStrings[id];
        document.getElementById("thirdDiv").innerHTML = linkedInResultImgStrings[id];
    };
}

function onLinkedInAuth() {
    console.log("onLinkedInAuth called");
}

function setText() {
    document.getElementById("user_info").innerHTML = "HELLO";
}

function onDeviceReady() {
    try {
        var connects = new Object();
        connects = grabConnections;
        $.when(connects()).done(function(retval){
            console.log(retval);
        });
        if (device.platform.indexOf("Android") != -1) {
            //intel.xdk.display.useViewport(480, 480);
            document.getElementById("map_canvas").style.width = "480px";
        } 
        else if (device.platform.indexOf("iOS") != -1) {
            if (device.model.indexOf("iPhone") != -1 || device.model.indexOf("iPod") != -1) {
                //intel.xdk.display.useViewport(320, 320);
                document.getElementById("map_canvas").style.width = "320px";
            } else if (device.model.indexOf("iPad") != -1) {
                //intel.xdk.display.useViewport(768, 768);
                document.getElementById("map_canvas").style.width = "768px";
            }
        }
        if (device.platform.indexOf("Win") != -1) {
            document.getElementById("map_canvas").style.width = screen.width + "px";
            document.getElementById("map_canvas").style.height = screen.height + "px";
        }
        if (navigator.geolocation !== null) {
            document.getElementById("map_canvas").style.height = screen.height*7/8 + "px";
            document.getElementById("user_info").style.height = screen.height*1/8 + "px";
            document.getElementById("user_info").innerHTML="Name</br>Header Title</br>Location Area</br>";
            navigator.geolocation.watchPosition(suc, fail, options);
        }
    } catch (e) {
        alert(e.message);
    }

    try {
        //hide splash screen
        navigator.splashscreen.hide(); 
    } catch (e) {}
}
document.addEventListener("deviceready", onDeviceReady, false);
window.scrollX = 0;
window.scrollY = 0;