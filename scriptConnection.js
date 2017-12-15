
window.addEventListener('load', function(){

    $('#alert').hide();

    var socket = io.connect('http://localhost:8080');
   

    document.getElementById('btnC').addEventListener('click', function(){
        var user = document.getElementById('user').value;
        var pass = document.getElementById('pwd').value;
        var cred = {user : user, pass : pass};
        socket.emit('login', cred );
    });

    document.getElementById('btnR').addEventListener('click', function(){
        var user = document.getElementById('user').value;
        var pass = document.getElementById('pwd').value;
        var cred = {user : user, pass : pass};
        socket.emit('signin', cred );
    });

    socket.on('err', function(error){
        $('#alert').html(error.message);
        $("#alert").slideDown("slow");
        setTimeout(function(){  $("#alert").slideUp("slow"); }, 3000);
    });

    socket.on('connected', function(key){
        console.log('you are connected'); 
        localStorage.setItem('key', key);
        console.log(key);
        window.open("http://localhost:8080/salon.html", '_self');
    });

   
    
});