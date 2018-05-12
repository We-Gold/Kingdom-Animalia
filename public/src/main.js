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
    if($('#toggleAuth').text()=="No Account? Sign Up") {
        $('#toggleAuth').text("Have An Account? Login");
    } else {
        $('#toggleAuth').text("No Account? Sign Up");
    }
});

$('#loginResForm').click(()=>{
    let email = $('#loginEmail')[0].value;
    let pass = $('#loginPass')[0].value;
    login(email,pass);
});

$('#signupResForm').click(()=>{
    let email = $('#signupEmail')[0].value;
    let pass = $('#signupPass')[0].value;
    login(email,pass);
});

function login(email,pass) {
    firebase.auth().signInWithEmailAndPassword(email, pass).catch(function(error) {
        let errorMessage = error.message;
        $('#loginNotification').show();
        $('#loginNotificationText').text(errorMessage);
        setTimeout(()=>{
            $('#loginNotification').fadeOut(500);
        },3000);
    });
}

function signup(email,pass) {
    firebase.auth().createUserWithEmailAndPassword(email, pass).catch(function(error) {
        let errorMessage = error.message;
        $('#loginNotification').show();
        $('#loginNotificationText').text(errorMessage);
        setTimeout(()=>{
            $('#loginNotification').fadeOut(500);
        },3000);
    });
}