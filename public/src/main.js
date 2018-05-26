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
let icons = ['bison','dolphin','eagle','gorilla','lobster','monkey','cow','deer','duck','rabbit','spider','wolf','turkey','lion','pig','snake','shark','bear','fish','chicken','horse','cat','dog'];
let rank = ['Amateur','Bacteria','Ant','Mouse','Capybara','Kangaroo','Gorilla','Elephant','Blue Whale'];

var mdit = window.markdownit({
    typographer: true,
    breaks: true,
}).enable('image');

let mde = new SimpleMDE({ 
    element: document.getElementById("wikiEditor"),
    autosave: {
		enabled: false
	},
});

if (!firebase.apps.length) {
    firebase.initializeApp(config);
}

let db = firebase.firestore();
let storage = firebase.storage().ref();
const settings = {timestampsInSnapshots: true};
db.settings(settings);
let usersRef = db.collection('users');
let dbImageRef = db.collection('images');
let qRef = db.collection('questions');
let wRef = db.collection('wikis');
let dbKey;
let firUser;
let mapLayer;
let pMap;
let markers = [];
let locationPerm;
let qsDef;
let animals;
let ranks;
let wikiTemp = `## Image 
...
## Description
...
## Size
...
## Traits
...
## Behavior
...
## Habitat
...
## Endangered
...
`;

fetch('/src/data.json')
  .then(function(response) {
    return response.json();
  })
  .then(function(JSON) {
    animals = JSON.english;
    ranks = JSON.ranks;
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

let userLocationIcon = L.icon({
    iconUrl: "/src/img/current-location.png",
    shadowUrl: "/src/img/current-location.png",
    iconSize: [24,24],
    shadowSize: [24,24],
    iconAnchor: [12,12],
    shadowAnchor: [12,12],
    popupAnchor: [0,0]
});

firebase.auth().onAuthStateChanged(async function(user) {
    if (user) {
        firUser = user;
        $('#login').hide();
        $('#home').hide();
        $('#camera').hide();
        $('#search').hide();
        $('#community').hide();
        $('#profile').hide();
        $('.footer').show();
        updateHomeFeed();
        await usersRef.where("uid","==",user.uid).get().then(function(querySnapshot) {
            if (querySnapshot.docs.length!==0) {
                dbKey = querySnapshot.docs[0].id;
                $('#userIcon').attr('src',`src/img/icons/${querySnapshot.docs[0].data().icon}.jpeg`);
                $('#userName').text(querySnapshot.docs[0].data().name);
                $('#userRank').text(rank[Math.floor(querySnapshot.docs[0].data().rank)]);
                locationPerm = querySnapshot.docs[0].data().locationPerm;
                if (querySnapshot.docs[0].data().locationPerm==false) {
                    $('#noGeo').show();
                } else {
                    $('#noGeo').hide();
                }
                
            } else {
                let email = user.email.split("@");
                let name = email[0];
                let uid = user.uid;
                let rank = 0;
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
        updateCoords();
        navigate(document.getElementById('profileBtn'));
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
        html += `<option value="${icons[i].toLowerCase()}" style="background-image:url('src/img/icons/${icons[i].toLowerCase()}.jpeg');">${toUpper(icons[i])}</option>`;
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
    let icon = $('#newIcon').val();
    let name = $('#newName').val();
    usersRef.doc(dbKey).update({
        name:name,
        icon:icon
    }); 

    $('#userIcon').attr('src',`src/img/icons/${icon_o}.jpeg`);
    $('#userName').text(name);
    $('#profileEdit').fadeOut(1000);
}


function toggleFooter() {
    $('.footer').toggle();
}

function navigate(el) {
    stopVideo()
    if (el.id=="homeBtn") {
        $('#home').show();
        clearHomeFeed();
        updateHomeFeed();
        $('#camera').hide();
        $('#search').hide();
        $('#community').hide();
        $('#profile').hide();
    }
    else if (el.id=="cameraBtn") {
        $('#latPick').val(0);
        $('#longPick').val(0);
        $('#animalOp').val("know");
        $('#animalName').val("");
        $('#imagePick').val('');
        updateCoords();
        $('#imageTaken').hide();
        $('#animalName').autocomplete({
            source: animals,
            delay: 100,
        });
        $('#home').hide();
        $('#camera').show();
        $('#search').hide();
        $('#community').hide();
        $('#profile').hide();
        initMedia();
    }
    else if (el.id=="searchBtn") {
        $('#searchAnimInp').autocomplete({
            source: animals,
            delay: 200,
        });
        $('#home').hide();
        $('#camera').hide();
        $('#search').show();
        $('#pMap').appendTo('#searchBody');
        $('#pMap').css("min-height",($(document).height()-48-51-44));
        $('#community').hide();
        $('#profile').hide();
        updateSearchMap();
    }
    else if (el.id=="communityBtn"){
        $('#home').hide();
        $('#camera').hide();
        $('#search').hide();
        $('#community').show();
        $('#profile').hide();
        navQuestions();
    }
    else if (el.id=="profileBtn"){
        $('#home').hide();
        $('#camera').hide();
        $('#search').hide();
        $('#community').hide();
        $('#profile').show();
        if (locationPerm) {
            $('#profMap').show();
            updateProfMap();
        }
        $('#pMap').appendTo('#profMap');
        $('#pMap').css("min-height","240px");
    }
}

function sightingCode(uid,coords,url,animal, size="2",know,key) {
    /*let userName = "";
    usersRef.where("uid", "==", uid).get().then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
            userName = doc.data().name;
        });
    }) 
    .catch(function(error) {
        console.log("Error getting documents: ", error);
    });*/
    let newCoords = [];
    newCoords[0] = (coords[0].substr(0,1)=="-"?coords[0].substr(0,8):coords[0].substr(0,7));
    newCoords[1] = (coords[1].substr(0,1)=="-"?coords[1].substr(0,8):coords[1].substr(0,7));
    return `
        <div>
            <p class="title${(size=="2"?"":" is-6")}">${animal.charAt(0).toUpperCase()+animal.substr(1)}</p>
            <img class="sightImg" src="${url}"${(size="2"?"":" width='50px'")}>
        <p class="${(size=="1"?"-m":"mt")}">${newCoords[0]}, ${newCoords[1]}</p>
        </div>
    `;
    // <p class="-m${(size=="2"?"":" is-6")}">By ${userName}</p>

}

async function updateProfMap() {
    $('#updatingLocation').show();
    let coords;
    let init = true;
    var geoSuccess = function(position) {
        if ($('#profile').is(':visible')) { 
            localStorage.setItem("coords",JSON.stringify([position.coords.latitude,position.coords.longitude]));
            $('#updatingLocation').hide();
            if(!init) {
                coords = JSON.parse(localStorage.getItem("coords"));
                pMap.setView([coords[0], coords[1]], 1);
                L.marker([coords[0], coords[1]],{icon:userLocationIcon}).addTo(pMap)
                .bindPopup('Your Location');
            }
            dbImageRef.where("user", "==", firUser.uid).get().then( function(querySnapshot) {
                querySnapshot.forEach(async function(doc) {
                    let popup = await sightingCode(firUser.uid,doc.data().coords,doc.data().imageURL,(doc.data().animal==""?"Unknown Animal":doc.data().animal),"1",doc.data().know,doc.key);

                    let marker = L.marker([doc.data().coords[0], doc.data().coords[1]]).addTo(pMap)
                    .bindPopup(popup);

                    markers.push(marker);
                })
            });
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
        if(markers.length!=0) {
            for(let i=0;i<markers.length; i++) {
                markers[i].remove();
            }
        }
        
    } 

    pMap = L.map('pMap').setView([coords[0], coords[1]], 11);
    
    mapLayer = L.tileLayer('https://api.mapbox.com/styles/v1/sci-ranch/cjh4soqa72hkb2sqqoh8sympp/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1Ijoic2NpLXJhbmNoIiwiYSI6ImNqaDRzbjQyNjBxZGwyd28yeGVxOGE3dHUifQ.JTSE-HY4u1v3MWIRhoT8ig', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
    }).addTo(pMap);

    init=false;

    await navigator.geolocation.getCurrentPosition(geoSuccess,geoErr);
}

async function updateSearchMap() {
    let coords = JSON.parse(localStorage.getItem("coords"));

    if(pMap && pMap.hasLayer(mapLayer)) {
        pMap.remove();
        for(let i=0;i<markers.length; i++) {
            markers[i].remove();
        }
    }

    pMap = L.map('pMap').setView([coords[0], coords[1]], 3);
    
    mapLayer = L.tileLayer('https://api.mapbox.com/styles/v1/sci-ranch/cjh4soqa72hkb2sqqoh8sympp/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1Ijoic2NpLXJhbmNoIiwiYSI6ImNqaDRzbjQyNjBxZGwyd28yeGVxOGE3dHUifQ.JTSE-HY4u1v3MWIRhoT8ig', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
    }).addTo(pMap);
}

async function showAnimalMarkers() {
    if ($('#search').is(':visible')) {
        let searchAnimal = $('#searchAnimInp').val();
        searchAnimal = searchAnimal.toLowerCase();
        await dbImageRef.where('animal','==',searchAnimal).get().then(function(snap){
            snap.forEach(async function(doc){
                let popup = await sightingCode(firUser.uid,doc.data().coords,doc.data().imageURL,(doc.data().animal==""?"Unknown Animal":doc.data().animal),"1",doc.data().know,doc.key);

                let marker = L.marker([doc.data().coords[0], doc.data().coords[1]]).addTo(pMap)
                .bindPopup(popup);

                markers.push(marker);
            });
        });

        let mArr = new L.featureGroup(markers);
        pMap.fitBounds(mArr.getBounds());
        pMap.setZoom(2);
    }
}

async function updateCoords() {
    var geoSuccess = function(position) {
        localStorage.setItem("coords",JSON.stringify([position.coords.latitude,position.coords.longitude]));
    };
    var geoErr = function(err) {
        if (err.code == 1) {
            navigate(document.getElementById('profile'));
            $('#blockedGeo').show();
        }
    }
    await navigator.geolocation.getCurrentPosition(geoSuccess,geoErr);
}

$('#searchAnimBtn').click(()=>{
    showAnimalMarkers();
});

$('#deviceBlocked').change(()=>{
    let newVal = $('#deviceBlocked').val();
    if(newVal=="ios") {
        $('#iosG').show();
        $('#androidG').hide();
        $('#computerG').hide();
    } else if(newVal=="android") {
        $('#iosG').hide();
        $('#androidG').show();
        $('#computerG').hide();
    } else if(newVal=="computer") {
        $('#iosG').hide();
        $('#androidG').hide();
        $('#computerG').show();
    }
});

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
    signup(email,pass);
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
        $('#mediaAccess').show();
        $('#noAccess').hide();
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

HTMLCanvasElement.prototype.renderImage = function(blob){
    var ctx = this.getContext('2d');
    var img = new Image();
    let self = this;
    img.onload = function(){
        img.width;
        ctx.drawImage(img,0,0,self.width, img.height/(img.width/self.width));
    }
    img.src = URL.createObjectURL(blob);
};

$('#switchUpload').click(()=>{
    $('#mediaAccess').hide();
    $('#noAccess').show();
});
  
$('#takePhoto').click(()=>{
    $('#frameCanvas').show();
    $('#mediaStream').hide();
    $('#takePhoto').hide();
    $('#switchUpload').hide();
    let ctx = document.getElementById('frameCanvas').getContext('2d');
    let vid = document.getElementById('mediaStream');
    let canvas = document.getElementById('frameCanvas');
    ctx.drawImage(vid,0,0,canvas.width, vid.videoHeight/(vid.videoWidth/canvas.width));
    vid.srcObject.getVideoTracks().forEach(function(track) {
        track.stop();
    });
    $('#imageTaken').show();
    let coords = JSON.parse(localStorage.getItem('coords'));
    $('#latPick').val(coords[0]);
    $('#longPick').val(coords[1]);
});
let imagePick;
$('#imagePick').on('change',(e)=>{
    imagePick = document.getElementById('imagePick');
    let image = imagePick.files[0];
    $('#frameCanvas').show();
    $('#noAccess').hide();
    let canvas = document.getElementById('frameCanvas');
    canvas.renderImage(image);
    $('#imageTaken').show();
    let coords = JSON.parse(localStorage.getItem('coords'));
    $('#latPick').val(coords[0]);
    $('#longPick').val(coords[1]);
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

$('#animalOp').change(()=>{
    if($('#animalOp').val()=="know") {
        $('#know').show();
    } else {
        $('#know').hide();
    }
});

$('#postAnimal').click(function(){
    let canvas = document.getElementById('frameCanvas');
    let image = dataURItoBlob(canvas.toDataURL("image/jpeg"));
    let fileName = `${firUser.uid}-${Math.round((new Date()).getTime() / 1000)}`;
    let coords = [$('#latPick').val(),$('#longPick').val()];
    let animalOption = $('#animalOp').val();
    let know = false;
    let animal;
    let userID = firUser.uid;
    let ts = Math.round((new Date()).getTime() / 1000);
    if (animalOption=="know") {
        know = true;
        animal = $('#animalName').val();

        if (!animal || !coords || !coords[0] || !coords[1] || animal=="") {
            return;
        }
        animal = animal.toLowerCase();
    } 
    if (!coords || !coords[0] || !coords[1]) {
        return;
    }
 

    // NOT IMPLEMENTED - Check if image is appropriate/contains an animal/etc..

    let imageRef = storage.child(`images/${fileName}`);

    let task = imageRef.put(image);
    task.on('state_changed',
        function progress(snapshot) {
            $('#uploadProgress').show();
            let percent = (snapshot.bytesTransferred/snapshot.totalBytes) *100;
            $('#uploadProgress').val('"'+percent+'"');
        },
        function error(err) {
            console.log(err.code);
        },
        function complete() {
            $('#uploadProgress').val(0);
            $('#uploadProgress').hide();

            task.snapshot.ref.getDownloadURL().then(function(downloadURL) {
                // param is a full url 
                let newAnimal = (animal===undefined?"":animal);
                dbImageRef.add({
                    imageURL:downloadURL,
                    user:userID,
                    coords:coords,
                    know:know,
                    animal:newAnimal,
                    timestamp: ts
                });
            });
            let r;
            usersRef.doc(dbKey).get().then((doc)=>{
                r=doc.data().rank+0.2;
                if(!(r>ranks.length-1)) {
                    usersRef.doc(dbKey).update({
                        rank:r
                    });
                }
            });
            

            // Go to animal sighting
            navigate(document.getElementById('profileBtn'));
        }
    );
});

function clearHomeFeed() {
    $('#feed').html("");
}

function showModal() {
    $('#modal').addClass('is-active');
}

function closeModal() {
    $('#modal').removeClass('is-active');
}

function changeName(id,url) {
    showModal();
    $('#newSpecies').val("");
    $('#modal-img').attr('src',url);
    $('#saveNewSpecies').attr("onclick","saveNewSpecies('"+id+"')");
}

function saveNewSpecies(id) {
    let species = $('#newSpecies').val();
    species = species.toLowerCase();
    if(species && species!=""){
        dbImageRef.doc(id).update({
            know: true,
            animal: species,
        });
        closeModal();
        clearHomeFeed();
        updateHomeFeed();
    }
}

function updateHomeFeed() {
    if($('#home').is(':visible')){
        dbImageRef.orderBy("timestamp","desc").limit(10).get().then(function(snap){
            snap.forEach(function(doc){
                let item = `
                <div class="card mt">
                    <div class="card-content">
                        ${sightingCode(firUser.uid,doc.data().coords,doc.data().imageURL,(doc.data().animal==""?"Unknown Animal":doc.data().animal),"2",doc.data().know,doc.key)}
                    </div>
                    <div class="card-footer">
                        <a class="card-footer-item ${(doc.data().animal==""?"":"hide")}" onclick="changeName('${doc.id}','${doc.data().imageURL}')">Identify Animal</a>
                    </div>
                </div>`;
                document.getElementById('feed').innerHTML += item;
                //<a class="card-footer-item">Suggest Change</a>
            });
        });
    }
}

function updateIDAnim() {
    if($('#comID').is(':visible')){
        document.getElementById('comID').innerHTML = "There are no unidentified animals.";
        dbImageRef.where("know","==",false).limit(10).get().then(function(snap){
            snap.forEach(function(doc){
                let item = `
                <div class="card mt">
                    <div class="card-content">
                        ${sightingCode(firUser.uid,doc.data().coords,doc.data().imageURL,(doc.data().animal==""?"Unknown Animal":doc.data().animal),"2",doc.data().know,doc.key)}
                    </div>
                    <div class="card-footer">
                        <a class="card-footer-item ${(doc.data().animal==""?"":"hide")}" onclick="changeName('${doc.id}','${doc.data().imageURL}')">Identify Animal</a>
                    </div>
                </div>`;
                document.getElementById('comID').innerHTML += item;
            });
        });
    }
}

function navQuestions() {
    $('#comQuestions').show();
    $('#comWiki').hide();
    $('#comID').hide();

    $('#navQ').addClass('is-active');
    $('#navW').removeClass('is-active');
    $('#navID').removeClass('is-active');

    $('#qt').show();
    $('#qDiv').hide();
    $('#addQDiv').hide();
    $('#newQ').show();

    if (!qsDef) {
        qRef.orderBy("timestamp","desc").limit(10).get().then((snap)=>{
            snap.forEach((doc)=>{
                 document.getElementById('qtb').innerHTML+=`
                    <tr onclick="showQuestion('${doc.id}')">
                        <td>${doc.data().question}</td>
                        <td>${doc.data().responses.length}</td>
                    </tr>
                `;
            });
        });
    }
    qsDef=true;
}

function showQuestion(id) {
    $('#qt').hide();
    $('#qDiv').show();
    $('#newQ').hide();
    qRef.doc(id).get().then((doc)=>{
        let ques = "";
        for (let i=0; i<doc.data().responses.length; i++) {
            ques+=`
                <tr>
                    <td>${doc.data().responses[i]}</td>
                </tr>
            `;
        }
        let html = `
            <h1 class="title mt">${doc.data().question}</h1>
            <table class="table is-fullwidth">
                <thead>
                    <tr>
                        <th>Responses</th>
                    </tr>
                </thead>
                <tbody>
                    ${ques}
                </tbody>
            </table>
            <hr>
            <textarea id="${doc.id}" class="textarea" maxlength="250" placeholder="Add A Response!" rows="3"></textarea>
            <button class="button is-success is-fullwidth nbr" onclick="respondQ('${doc.id}')">Respond</button>
            `;
        $('#qDiv').html(html);
    });
}

async function respondQ(id) {
    await qRef.doc(id).get().then((doc)=>{
        let oldRes = doc.data().responses;
        oldRes.push($('#'+id).val());
        qRef.doc(id).update({
            responses: oldRes
        });
    });
    // Respond
    showQuestion(id);
}

function navWiki() {
    $('#comQuestions').hide();
    $('#comWiki').show();
    $('#comID').hide();

    $('#makeWikiBtn').show();
    $('#makeWiki').hide();
    $('#wikiEditorDiv').hide();
    $('#searchWikis').show();
    $('#wikiFeed').show();
    $('#wikiSearch').hide();

    $('#navQ').removeClass('is-active');
    $('#navW').addClass('is-active');
    $('#navID').removeClass('is-active'); 
    
    $('#searchWikiInp').autocomplete({
        source: animals,
        delay: 200,
    });
    $('#wikiFeed').html("");
    wRef.orderBy("timestamp","desc").limit(3).get().then((snap)=>{
        snap.forEach((doc)=>{
            let animal = doc.data().animal;
            let inmd = doc.data().md;
            let md = inmd.substr(0,125);
            let mdHTML = mdit.render(md);
            let html = `
            <div class="card mt">
                <header class="card-header">
                    <p class="card-header-title">${animal.charAt(0).toUpperCase()+animal.substr(1)}</p>
                </header>
                <div class="card-content">
                    <div class="content">
                        ${mdHTML}
                    </div>
                </div>
                <div class="card-footer">
                    <a class="card-footer-item" onclick="editWiki('${doc.id}')">Edit Wiki Page</a>
                </div>
            </div>
            `;
            let oldHTML = $('#wikiFeed').html();
            $('#wikiFeed').html(oldHTML+html);
        });
    });
}

function navIDAnim() {
    $('#comQuestions').hide();
    $('#comWiki').hide();
    $('#comID').show();

    $('#navQ').removeClass('is-active');
    $('#navW').removeClass('is-active');
    $('#navID').addClass('is-active');

    updateIDAnim();
}

function showAddQ() {
    $('#qt').hide();
    $('#qDiv').hide();
    $('#addQDiv').show();
    $('#newQ').hide();
}

function addQuestion() {
    let newQText = $('#newQText').val();
    let ts = Math.round((new Date()).getTime() / 1000);
    let arr = [];
    if (newQText && newQText!="") {
        qRef.add({
            question: newQText,
            timestamp: ts,
            responses: arr,
        });
    }
    syncQ();
}

function syncQ() {
    qsDef = false;
    $('#qtb').html("");
    navQuestions();
}

function makeWiki() {
    $('#makeWikiBtn').hide();
    $('#makeWiki').show();
    $('#wikiEditorDiv').hide();
    $('#searchWikis').hide();
    $('#wikiSearch').hide();
    $('#wikiFeed').hide();

    $('#newWikiAnim').autocomplete({
        source: animals,
        delay: 200,
    });
}

function createWiki() {
    let anim = $('#newWikiAnim').val();
    anim = anim.toLowerCase();
    let ts = Math.round((new Date()).getTime() / 1000);
    if(anim!=undefined && anim!= "") {
        wRef.where("animal","==",anim).get().then((snap)=>{
            if(snap.docs.length>0) {
                editWiki(snap.docs[0].id);
            } else {
                wRef.add({
                    animal: anim,
                    timestamp: ts,
                    md: wikiTemp
                }).then((docRef)=>{
                    editWiki(docRef.id,wikiTemp);
                }); 
            }
        });
    }
}

function editWiki(id,md="") {
    $('#makeWikiBtn').hide();
    $('#makeWiki').hide();
    $('#wikiEditorDiv').show();
    $('#searchWikis').hide();
    $('#wikiSearch').hide();
    $('#wikiFeed').hide();
    $('#saveWiki').attr("onclick",`saveWiki('${id}')`);

    if(md=="") {
        wRef.doc(id).get().then((doc)=>{
            mde.value(doc.data().md);
        });
    } else {
        mde.value(md);
    }
}

function saveWiki(id) {
    let mdVal = mde.value();
    wRef.doc(id).update({
        md: mdVal
    });
    
    navWiki();
}

function searchWikis() {
    let term = $('#searchWikiInp').val().toLowerCase();

    $('#makeWikiBtn').hide();
    $('#makeWiki').hide();
    $('#wikiEditorDiv').hide();
    $('#searchWikis').hide();
    $('#wikiSearch').show();
    $('#wikiFeed').hide();
    $('#wikiSearch').html("");

    wRef.where("animal","==",term).get().then((snap)=>{
        snap.forEach((doc)=>{
            let oldHTML = $('#wikiSearch').html();
            let animal = doc.data().animal;
            let mdHTML = mdit.render(doc.data().md);
            let html = `
            <div class="card mt">
                <header class="card-header">
                    <p class="card-header-title">${animal.charAt(0).toUpperCase()+animal.substr(1)}</p>
                </header>
                <div class="card-content">
                    <div class="content">
                        ${mdHTML}
                    </div>
                </div>
                <div class="card-footer">
                    <a class="card-footer-item" onclick="editWiki('${doc.id}')">Edit Wiki Page</a>
                </div>
            </div>
            `;
            $('#wikiSearch').html(oldHTML+html);
        });
    });
}