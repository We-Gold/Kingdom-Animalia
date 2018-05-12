if('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
    .then(()=>{
        console.log("SW registered");
    });
}

var config = {
    apiKey: "AIzaSyBwM-yeiPdpfjmmfpSU_E6zbb-b67PC3Ks",
    authDomain: "animalia-a531b.firebaseapp.com",
    databaseURL: "https://animalia-a531b.firebaseio.com",
    projectId: "animalia-a531b",
    storageBucket: "animalia-a531b.appspot.com",
    messagingSenderId: "978722263260"
};
firebase.initializeApp(config);

firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        $('#login').hide();
        $('#home').show();
        $('#camera').hide();
        $('#search').hide();
        $('#community').hide();
        $('#profile').hide();
        $('.footer').show();
    } else {
        $('#login').show();
        $('#home').hide();
        $('#camera').hide();
        $('#search').hide();
        $('#community').hide();
        $('#profile').hide();
        $('.footer').hide();
    }
});

window.addEventListener('load',()=>{
    $('#login').show();
    $('#home').hide();
    $('#camera').hide();
    $('#search').hide();
    $('#community').hide();
    $('#profile').hide();
    $('.footer').hide();
});

function navigate(el) {
    if (el.id=="homeBtn") {
        $('#home').show();
        $('#camera').hide();
        $('#search').hide();
        $('#community').hide();
        $('#profile').hide();
    }
    else if (el.id=="cameraBtn") {
        $('#home').hide();
        $('#camera').show();
        $('#search').hide();
        $('#community').hide();
        $('#profile').hide();
    }
    else if (el.id=="searchBtn") {
        $('#home').hide();
        $('#camera').hide();
        $('#search').show();
        $('#community').hide();
        $('#profile').hide();
    }
    else if (el.id=="communityBtn"){
        $('#home').hide();
        $('#camera').hide();
        $('#search').hide();
        $('#community').show();
        $('#profile').hide();
    }
    else if (el.id=="profileBtn"){
        $('#home').hide();
        $('#camera').hide();
        $('#search').hide();
        $('#community').hide();
        $('#profile').show();
    }
}

$('#toggleAuth').click(()=>{
    $('#loginForm').toggle();
    $('#signupForm').toggle();
    if($('#toggleAuth').text()=="Sign Up Instead!") {
        $('#toggleAuth').text("Login Instead!");
    } else {
        $('#toggleAuth').text("Sign Up Instead!");
    }
});

