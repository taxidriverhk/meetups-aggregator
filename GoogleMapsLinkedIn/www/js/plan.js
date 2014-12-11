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
    new LinkedInUser1("https://www.linkedin.com/in/zhengyusun"),
    new LinkedInUser1("https://www.linkedin.com/pub/kevin-wu/88/357/a60"),
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
            var elementString = "#user" + (j+1) + "Button span";
            $(elementString).html(planLinkedInUserStrings[j]);
        }
    }, 1500);
}


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
});

//document.addEventListener("deviceready", onDeviceReadyPlan, false);
window.scrollX = 0;
window.scrollY = 0;