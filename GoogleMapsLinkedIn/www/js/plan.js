function LinkedInUser1(linkedInUrl) {
    /* not used for now
    this.username;
    this.password;
    this.email;
    this.firstName;
    this.lastName;
    this.lat = p.coords.latitude;
    this.long = p.coords.longitude;
    */
    this.linkedInUrl = linkedInUrl;
}

var plan_users = [
    new LinkedInUser1("https://www.linkedin.com/pub/andrew-kuang/57/241/a93"),
    new LinkedInUser1("https://www.linkedin.com/in/ryanwmchan"),
    new LinkedInUser1("https://www.linkedin.com/in/zacharyli323"),
    new LinkedInUser1("https://hk.linkedin.com/pub/alex-leung/82/690/835")
];
var planLinkedInUserStrings = new Array();

function onDeviceReadyPlan() {
    for (var i = 0; i < plan_users.length; i++) {
        IN.API.Profile("url=" + plan_users[i].linkedInUrl)
            .fields(["firstName", "lastName"])
            .result(function (result) {
                var linkedinUserDivString = result.values[0]["firstName"] + ' ' + result.values[0]["lastName"];
                planLinkedInUserStrings.push(linkedinUserDivString);
            })
            .error(function (error) {
                console.log(error);
            });
    }
    
    window.setTimeout(function(){
        for(var j = 0; j < plan_users.length; j++) {
            var fetchString = "#fetching_users";
            $(fetchString).css("height", "0");
            $(fetchString).css("visibility", "hidden");
            $(fetchString).css("padding-top", "0");
            var elementString = "#user" + (j+1) + "Button";
            $(elementString).css("visibility", "visible");
            $(elementString).css("height", "20%");
            var str = "chat.html?user1="+planLinkedInUserStrings[j] +"?user2=Kevin Wu?rest=blah";
            $(elementString+" a").attr("href", str);
            
            
            elementString += " span";
            $(elementString).html("<i>" + planLinkedInUserStrings[j] + "</i>");

            //$(elementString).href("chat.html?user1="+planLinkedInUserStrings[j]+"?user2=Kevin Wu?rest=blah");
        }
    }, 1500);
}

/*
$("#user1Button").click(function(){
     window.location=$(this).find("a").attr("href"); 
     return false;
});

$("#user2Button").click(function(){
     window.location=$(this).find("a").attr("href"); 
     return false;
});

$("#user3Button").click(function(){
     window.location=$(this).find("a").attr("href"); 
     return false;
});

$("#user4Button").click(function(){
     window.location=$(this).find("a").attr("href"); 
     return false;
});

$("#user5Button").click(function(){
     window.location=$(this).find("a").attr("href"); 
     return false;
});*/

//document.addEventListener("deviceready", onDeviceReadyPlan, false);
window.scrollX = 0;
window.scrollY = 0;