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
let icons = ['Bison','Dolphin','Eagle','Gorilla','Lobster','Monkey','Cow','Deer','Duck','Rabbit','Spider','Wolf','Turkey','Lion','Pig','Snake','Shark','Bear','Fish','Chicken','Horse','Cat','Dog'];
let rank = ['Amateur','Bacteria','Ant','Mouse','Capybara','Kangaroo','Gorilla','Elephant','Blue Whale'];


if (!firebase.apps.length) {
    firebase.initializeApp(config);
}

let db = firebase.firestore();
const settings = {timestampsInSnapshots: true};
db.settings(settings);
let usersRef = db.collection('users');
let dbKey;
let firUser;
let mapLayer;
let pMap;

firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        firUser = user;
        $('#login').hide();
        $('#home').show();
        $('#camera').hide();
        $('#search').hide();
        $('#community').hide();
        $('#profile').hide();
        $('.footer').show();
        usersRef.where("uid","==",user.uid).get().then(function(querySnapshot) {
            if (querySnapshot.docs.length!==0) {
                dbKey = querySnapshot.docs[0].id;
                $('#userIcon').attr('src',`src/img/icons/${querySnapshot.docs[0].data().icon}.jpeg`);
                $('#userName').text(querySnapshot.docs[0].data().name);
                $('#userRank').text(querySnapshot.docs[0].data().rank);
                if (querySnapshot.docs[0].data().locationPerm==false) {
                    $('#noGeo').show();
                } else {
                    $('#noGeo').hide();
                }
                
            } else {
                let email = user.email.split("@");
                let name = email[0];
                let uid = user.uid;
                let rank = "Amateur";
                let iconNum = Math.floor(Math.random() * icons.length);
                let icon = icons[iconNum];
                usersRef.add({
                    uid:uid,
                    name:name,
                    rank:rank,
                    icon:icon,
                    locationPerm: false
                })
                .then(function(docRef) {
                    dbKey = docRef.id;
                });
            }
        })
        .catch(function(error) {
            console.log("Error getting documents: ", error);
        });
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

function toUpper(str) {
    return str
    .toLowerCase()
    .split(' ')
    .map(function(word) {
        return word[0].toUpperCase() + word.substr(1);
    })
    .join(' ');
}
    

function editProfile() {
    let html = "";
    for (let i=0; i<icons.length; i++) {
        html += `<option value="${icons[i].toLowerCase()}" style="background-image:url('src/img/icons/${icons[i].toLowerCase()}.jpeg');">${icons[i]}</option>`;
    }
    $('#newIcon').html(html);
    let icon = $('#userIcon').attr("src");
    let iconp2 = icon.split('/');
    let iconp3 = iconp2[iconp2.length-1];
    let iconp4 = iconp3.split('.');
    let iconp5 = iconp4[0];
    let userName = $('#userName').text();
    $('#newIcon').val(iconp5.toLowerCase());
    $('#newName').val(userName);

    $('#profileEdit').show();
}
function hideEdit() {
    $('#profileEdit').hide();
}
function saveProfile() {
    let icon_o = $('#newIcon').val();
    let icon = toUpper($('#newIcon').val());
    let name = $('#newName').val();
    usersRef.where("uid","==",firUser.uid).get().then(function(querySnapshot) {
        if (querySnapshot.docs.length!==0) {
            let doc = usersRef.doc(querySnapshot.docs[0].id);
            doc.update({
                name:name,
                icon:icon
            }); 
        } 
    
        $('#userIcon').attr('src',`src/img/icons/${icon_o}.jpeg`);
        $('#userName').text(name);
        $('#profileEdit').fadeOut(1000);
    })
}

window.addEventListener('load',()=>{
    $('#login').show();
    $('#home').hide();
    $('#camera').hide();
    $('#search').hide();
    $('#community').hide();
    $('#profile').hide();
    $('.footer').hide();
});

function toggleFooter() {
    $('.footer').toggle();
}

function navigate(el) {
    stopVideo()
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
        initMedia();
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
        usersRef.doc(dbKey).get().then((doc)=>{
            if (doc.data().locationPerm){
                $('#profMap').show();
                updateProfMap();
            }
        });
    }
}

async function updateProfMap() {
    $('#updatingLocation').show();
    let coords;
    let init = true;
    var geoSuccess = function(position) {
        localStorage.setItem("coords",JSON.stringify([position.coords.latitude,position.coords.longitude]));
        $('#updatingLocation').hide();
        if(!init) {
            coords = JSON.parse(localStorage.getItem("coords"));
            pMap.setView([coords[0], coords[1]], 11);
            L.marker([coords[0], coords[1]]).addTo(pMap)
            .bindPopup('Your Location')
            .openPopup();
        }
    };
    var geoErr = function(err) {
        if (err.code == 1) {
            $('#blockedGeo').show();
        }
        console.log(err);
    }
    if (localStorage.getItem("coords") === null) {
        await navigator.geolocation.getCurrentPosition(geoSuccess,geoErr);
    } 

    coords = JSON.parse(localStorage.getItem("coords"));

    if(pMap && pMap.hasLayer(mapLayer)) {
        pMap.remove();
    }

    pMap = L.map('pMap').setView([coords[0], coords[1]], 11);
    
    mapLayer = L.tileLayer('https://api.mapbox.com/styles/v1/sci-ranch/cjh4soqa72hkb2sqqoh8sympp/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1Ijoic2NpLXJhbmNoIiwiYSI6ImNqaDRzbjQyNjBxZGwyd28yeGVxOGE3dHUifQ.JTSE-HY4u1v3MWIRhoT8ig', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
    }).addTo(pMap);

    init=false;

    await navigator.geolocation.getCurrentPosition(geoSuccess,geoErr);
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

$('#actGeo').click(()=>{
    var geoSuccess = function(position) {
        $('#noGeo').hide();
        $('#profMap').show();
        usersRef.doc(dbKey).update({
            locationPerm: true
        }); 
    };
    var geoErr = function(err) {
        console.log(err);
    }
    navigator.geolocation.getCurrentPosition(geoSuccess,geoErr);
});

function initMedia() {
    if (!('mediaDevices' in navigator)) {
        navigator.mediaDevices = {};
    }
    if (!('getUserMedia' in navigator.mediaDevices)) {
        navigator.mediaDevices.getUserMedia = function(constraints) {
            let getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

            if (!getUserMedia) {
                return Promise.reject(new Error('getUserMedia is not implemented!'));
            }

            return new Promise(function(resolve, reject) {
                getUserMedia.call(navigator, constraints, resolve, reject);
            });
        }
    }

    navigator.mediaDevices.getUserMedia({video: {width: { min: 1280 },height: { min: 720 }}})
    .then(function(stream) {
        $('#mediaStream').show();
        $('#frameCanvas').hide();
        $('#takePhoto').show();

        let vidPlayer = document.getElementById('mediaStream');
        vidPlayer.srcObject = stream;
    })
    .catch(function(err) {
        $('#mediaAccess').hide();
        $('#noAccess').show();
    });
}

$('#takePhoto').click(()=>{
    $('#frameCanvas').show();
    $('#mediaStream').hide();
    $('#takePhoto').hide();
    let ctx = document.getElementById('frameCanvas').getContext('2d');
    let vid = document.getElementById('mediaStream');
    let canvas = document.getElementById('frameCanvas');
    ctx.drawImage(vid,0,0,canvas.width, vid.videoHeight/(vid.videoWidth/canvas.width));
    vid.srcObject.getVideoTracks().forEach(function(track) {
        track.stop();
    });
});

function stopVideo() {
    let vid = document.getElementById('mediaStream');
    if(!(vid.srcObject)) {
        return;
    }
    vid.srcObject.getVideoTracks().forEach(function(track) {
        track.stop();
    });
}

function dataURItoBlob(dataURI) {
    var byteString = atob(dataURI.split(',')[1]);
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]
    var ab = new ArrayBuffer(byteString.length);
    var ia = new Uint8Array(ab);
    for (var i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    var blob = new Blob([ab], {type: mimeString});
    return blob;
}