if('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
    .then(()=>{
        console.log("SW registered");
    });
}

window.addEventListener('load',()=>{
    $('#home').show();
    $('#camera').hide();
    $('#search').hide();
    $('#community').hide();
    $('#profile').hide();
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