var http = require('http');
var fs = require('fs')
var express = require('express');

var session = require('express-session')({
    secret: "my-secret",
    resave: true,
    saveUninitialized: true
});
var sharedsession = require("express-socket.io-session");

// Use express-session middleware for express


var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);

app.use(session);

// Use shared session middleware for socket.io
// setting autoSave:true
io.use(sharedsession(session, {
    autoSave:true
})); 


var users = [];
var salons = [];
var sess;
users.push({user : 'v', pass : 'v'});
users.push({user : 'b', pass : 'b'});


app.get('/', function(req, res){
    req.session.connected = false;
    res.sendFile(__dirname + '/index.html');
});

app.get('/index.css', function(req, res){
    res.sendFile(__dirname + '/index.css');
});

app.get('/scriptConnection.js', function(req, res){
    res.sendFile(__dirname + '/scriptConnection.js')
});

app.get('/salon.html', function(req,res){
    if(req.session.connected){
        res.sendFile(__dirname + '/salon.html')
    }
    else{
        res.sendFile(__dirname + '/fuckyou.html')
    }
});

app.get('/scriptSalon.js', function(req, res){
    res.sendFile(__dirname + '/scriptSalon.js');
})

app.get('/cssSalon.css', function(req, res){
    res.sendFile(__dirname + '/cssSalon.css');
});

app.get('/images/exit.png', function(req,res){
    fs.readFile('images/exit.png', function(err, data){
        res.writeHead(200, {'Content-Type': 'image/png' });
        res.end(data, 'binary');
    });
});

app.get('/images/user.png', function(req, res){
    fs.readFile('images/user.png', function(err, data){
        res.writeHead(200, {'Content-Type': 'image/png' });
        res.end(data, 'binary');
    });
});

app.get('/images/background.jpg', function(req,res){
    fs.readFile('images/background.jpg', function(err, data){
        res.writeHead(200, {'Content-Type' : 'image/jpg'});
        res.end(data, 'binary');
    });
});





io.sockets.on('connection', function(socket){
    
    socket.on('login', function(cred){
        for(var i = 0; i < users.length; i++){
            if(cred.user == users[i].user && cred.pass == users[i].pass){
              
                key = generateKey();
                users[i].key = key;
                socket.handshake.session.connected = true;
                socket.handshake.session.save();
                socket.emit('connected', key);

                
              
                
                return;
            }
        }
        var error = {message : "Invalid credentials"};
        socket.emit('err', error );

    });

    socket.on('signin', function(cred){
        for(var i = 0; i < users.length; i++){
            if(cred.user == users[i].user){
                socket.emit('err', {message : "Username not available"});
                
                return;
            }         
        }
        
        users.push(cred);
        console.log('new register');
        
    });

    socket.on('new', function(key){
       var user = getUserByKey(key);
       if(user){
           socket.emit('userData', user.user);
           socket.emit('updateSalon', salons);
       }
    });

    socket.on('createSalon', function(salon){
        salons.push(salon);
        io.emit('updateSalon', salons);
        socket.emit('salonCreated', '');
    });


    socket.on('deleteSalon', function(key){
        console.log(key);
        var salon = getSalonByKey(key);
        salons.splice(salons.indexOf(salon), 1);   
        io.emit('updateSalon', salons);
    });

    socket.on('joinSalon', function(obj){
        var salon = getSalonByKey(obj.salonOwner);
        if(salon.players.length < 4){
            salon.players.push(getUserByKey(obj.userKey).user);
            io.emit('updateSalon', salons);
        }
    });

 


});

generateKey = function(){
    return Math.random().toString(36).substr(2, 9);
};

getUserByKey = function(key){
    for(var i = 0; i < users.length ; i++){
        if(users[i].key == key){
             return users[i];
        }
    }
};

getSalonByKey = function(key){
    for(var i = 0; i < salons.length; i++){
        if(salons[i].owner == key) return salons[i];
    }
}

server.listen(8080);




