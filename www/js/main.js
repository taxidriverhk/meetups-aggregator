
$(".LinkedInButton").click(function(){
     window.location=$(this).find("a").attr("href"); 
     return false;
});

$(".YelpButton").click(function(){
     window.location=$(this).find("a").attr("href"); 
     return false;
});

function onDeviceReady() {

    try {
        //hide splash screen
        navigator.splashscreen.hide(); 
    } catch (e) {}
}

document.addEventListener("deviceready", onDeviceReady, false);
window.scrollX = 0;
window.scrollY = 0;