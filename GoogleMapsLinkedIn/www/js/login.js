function logout() {
            Parse.User.logOut();
            window.location = "index.html";
            //$( "#content" ).load( "login.html" );
            //IN.User.logout();
        }
        
        function onLinkedInLoad() {
            //IN.User.logout();
            //Parse.User.logOut();
            IN.User.authorize(function(){
                IN.API.Profile("me")
                   .fields("firstName", "lastName", "headline", "emailAddress", "location",
                          "pictureUrl")
                   .result(function(result) {
                        newLinkedInUser(result.values[0]);})
                                    
                //$( "#content" ).load( "splash.html" );
                
            });
           
        }
        
      function getlocation(user){

          
        var suc = function(p){
            if (p.coords.latitude != undefined)
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
                        
                        
        function newLinkedInUser(linkedInData) {
            
            var password = 123456789012345678901234;
            var strpass = window.btoa(password.toString());
            var username = linkedInData["emailAddress"];
            
            var currentUser = Parse.User.current();
            if (currentUser) {
                // do stuff with the user
                console.log("Current User");
                var params = {login: username, password: strpass};
                var authparams = {login: 'cs130Intel', password: 'cs130IntelGroup'};
              QB.createSession(authparams, function(err, result) {
              // callback function
                    QB.login(authparams, function(err, result) {
                                      // callback function
                                        console.log(err);
                                      console.log("Complete LOGIN");
                                    });
                  console.log(err);
            });
                
                //update geolocation
                loc = getlocation(currentUser);
                
                
            } 
            else {
                // login if accnt already created; else create account (qb, linkedin)
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
                            loc = getlocation(user);
                          
                          
                    });
                  },
                  error: function(user, error) {
                    // The login failed. Create account
                        createNewUser();
                        //update geolocation
                        loc = getlocation(user);
                      
                        
                  }
                });
            }
        }