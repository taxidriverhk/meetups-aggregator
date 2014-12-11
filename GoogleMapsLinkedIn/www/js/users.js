$(function(){
        //Authenticate via LinkedIn
        
        OAuth.callback('linkedin', function(error,success) {

            success.me().done(function (response) {
                console.log('Firstname: ', response.firstname);
                console.log('Lastname: ', response.lastname);
                var username = "";
                if(response.email !== undefined) {
                    username = response.email;
                }
                else {
                    username = response.firstname+response.lastname+"@example.com";   
                }
                var login = function() {

                    // login if accnt already created; else create account (qb, linkedin)
                    Parse.User.logIn(username,strpass, {
                      success: function(user) {
                        //Login qb then redirect to homepage
                          var params = {login: username, password: strpass};
                          QB.createSession(params, function(err, result) {
                          // callback function
                              console.log(err);
                              //user.preventDefault();
                              //update geolocation
                        });
                      },
                      error: function(user, error) {
                        // The login failed. Create account
                            var newuser = createNewUser(linkedInData);
                      }
                    });
                };

                $.when( login() ).done(function() {
                    currentUser = Parse.User.current();

                    // Log into QuickBlox and update geolocation
                    var params = {login: currentUser.get('username'), password: strpass};
                    var authparams = {login: 'cs130Intel', password: 'cs130IntelGroup'};
                    QB.createSession(authparams, function(err, result) {
                        QB.login(params, function(err, result) {
                                          // callback function
                                            console.log(err);
                                            console.log("Logged in QB");
                                        });
                        console.log(err);
                    }).done(function(){
                        //update geolocation  
                        getlocation(currentUser).done(function() {
                        return true;
                        });  
                    });
                })

            }).fail(function (err) {
                //handle error with err
                console.log('Result.me error');
            });
        
        if(error){
            console.log('Complete Error..');
            console.log(error);
        }
            
        });
});
function UserLogout() {
            Parse.User.logOut();
            window.location = "index.html";
            //$( "#content" ).load( "login.html" );
            //IN.User.logout();
}
        
function UserLogin() {
    
    var password = 123456789012345678901234;
    var strpass = window.btoa(password.toString());
    var currentUser = Parse.User.current();
    
    //If they are already logged in via Parse..
    if (currentUser) {
        var login = function() {
            
            // Log into QuickBlox and update geolocation
            console.log("Current User");
            var params = {login: currentUser.get('username'), password: strpass};
            var authparams = {login: 'cs130Intel', password: 'cs130IntelGroup'};
            QB.createSession(authparams, function(err, result) {
            QB.login(authparams, function(err, result) {
                              // callback function
                                console.log(err);
                              console.log("Complete LOGIN");
                            });
                  console.log(err);
            });

            //update geolocation
            loc = getlocation(currentUser);
        };
        
        $.when( login() ).done(function() {
         
                return true;
            
        });
    }
    else {
        //Login or create user
        IN.User.authorize(function(){
                IN.API.Profile("me")
                   .fields("firstName", "lastName", "headline", "emailAddress", "location",
                          "pictureUrl")
                   .result(function(result) {
                        var username = "";
                        if(result.values[0]["emailAddress"] !== undefined) {
                            username = result.values[0]["emailAddress"];
                        }
                        else {
                            username = result.values[0]["firstName"]+
                                result.values[0]["lastName"]+"@example.com";   
                        }
                        Parse.User.logIn(username,strpass, {
                          success: function(user) {
                            // Do stuff after successful login.
                              console.log("LOG IN");
                            //Login qb then redirect to homepage
                              var params = {login: username, password: strpass};
                              QB.createSession(params, function(err, result) {
                              // callback function
                                  console.log(err);
                                  //user.preventDefault();
                                  //update geolocation
                                    loc = getlocation(user).done(function() {
                                      return true;  
                                    });


                            });
                          },
                          error: function(user, error) {
                            // The login failed. Create account
                                var newuser = createNewUser(result.values[0]).done(
                                    function() {
                                  return true;  
                                });
                          }
                        });
                    })   
                //$( "#content" ).load( "splash.html" );   
            });
    
    }
}
        
function getlocation(user){
    
    var suc = function(p){
        if (p.coords.latitude !== undefined)
        {
            currentLatitude = p.coords.latitude;
            currentLongitude = p.coords.longitude;
            console.log("geolocation " + currentLatitude + " " + currentLongitude);
            event = Parse.Object.extend("QBLIData");
            var query = new Parse.Query(event);
            //event.preventDefault();
            query.equalTo("user_id", user.id);

            query.first({
              success: function(results) {
                console.log("found and updated");
                results.set("latitude",currentLatitude);
                results.set("longitude",currentLongitude);
                results.save();
                  console.log("WORKS");
                    window.location = "main.html";
              },
              error: function(error) {
                console.log("Error: " + error.code + " " + error.message);
              }
            });

            console.log("after it all...");
        }
    };

    var fail = function(){ 
        console.log("geolocation failed"); 
        getLocation();
    };

    navigator.geolocation.getCurrentPosition(suc,fail);

}
function createNewUser(linkedInData){
        var username = linkedInData["emailAddress"];
        var password = 123456789012345678901234;
        var strpass = window.btoa(password.toString()); 
        console.log("Create account"+username+strpass);
        var user = new Parse.User();
        user.set("username", username);
        user.set("password", strpass);
        user.set("email", linkedInData["emailAddress"]);
        user.set("firstName",linkedInData["firstName"]);
        user.set("lastName",linkedInData["lastName"]);
        var params = {login: username, password: strpass,
                     full_name: linkedInData["firstName"]+' '+linkedInData["lastName"]};
        var authparams = {login: 'cs130Intel', password: 'cs130IntelGroup'};
        user.signUp(null, {
          success: function(user) {
              var qbid;
              //Sign up the user in Quickblox ()
              QB.createSession(authparams,function(err, result) {
                  // callback function
                    QB.users.create(params, function(err, result) {
                      // callback function
                        console.log("Create QB");
                        console.log(err);
                        console.log(result);
                        qbid = result["id"];
                        var qblidata = Parse.Object.extend("QBLIData");
                        var qb = new qblidata();
                        qb.set("user_id", user.id);
                        qb.set("qb_id", qbid);
                        qb.set("pictureUrl", linkedInData["pictureUrl"]);
                        qb.set("location", linkedInData["location"]);
                        qb.set("headline", linkedInData["headline"]);
                        qb.save();

                         Parse.User.logIn(username,strpass, {
                          success: function(user) {
                            // Do stuff after successful login.
                            //Login qb then redirect to homepage
                              QB.login(authparams, function(err, result) {
                                  // callback function

                                  console.log("Complete LOGIN");
                                });
                          },
                          error: function(user, error) {
                              console.log("LIError: " + error.code + " " + error.message);
                          }
                        });

                        return user;
                    });
                });
                  //Update Parse with the QB user Object Id
                 // login parse, login qb

                  //console.log("What the heck is going on?.....");

                },
              error: function(user, error) {
                // Show the error message somewhere and let the user try again.
                console.log("SIError: " + error.code + " " + error.message);
              }
            });
}

function connectUser(withUser) {
    
    return false;
}

function grabConnections() {
 //grabs connections of current user and returns a list of dictionaries 
 //(one for each connection)
 //Each dictionary will have 'headline','location', 'first', 'last'
    //'pictureUrl','qd_id','latitude','longitude'
    var retarray = new Array();
    var connects = [];
    var currentUser = Parse.User.current();
    event = Parse.Object.extend("Connections");
    var query = new Parse.Query(event);
    //event.preventDefault();
    query.equalTo("currentUser", currentUser.id);

    query.find({
      success: function(results) {
        console.log("found and updated");
        for (var i = 0; i < results.length; i++) { 
          var object = results[i];
          console.log(object);
            connects[connects.length] = object;
            
        }
      },
      error: function(error) {
        console.log("Error: " + error.code + " " + error.message);
      }
    }).done(function(){
      
      for (var i = 0; i < connects.length; i++) { 
        var one = connects[i].attributes;
          console.log(one["connectionUser"]);
        var deets = new Parse.Query(Parse.Object.extend("QBLIData"));
            deets.equalTo("user_id",one["connectionUser"]);
            deets.first({
                success: function(obj) {
                    console.log("found user");
                    var first = obj.attributes["first"];
                    var last = obj.attributes["last"];
                    var headline = obj.attributes["headline"];
                    var location = obj.attributes["location"];
                    var pictureUrl = obj.attributes["pictureUrl"];
                    var latitude = obj.attributes["latitude"];
                    var longitude = obj.attributes["longitude"];
                    var qbid = obj.attributes["qb_id"];
                    var dict = {first: first, last: last, healine: headline,
                                location: location, pictureUrl: pictureUrl,
                                qbid: qbid, latitude: latitude, longitude: longitude};
                    retarray[retarray.length] = dict;
                },
                error: function(error) {
                    console.log("missed connection");
                }    
            });
      }
        console.log(retarray);
        return retarray;  
    });
}