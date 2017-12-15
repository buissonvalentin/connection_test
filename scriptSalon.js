window.addEventListener('load', function(){
    

    var user;
    var key;
    var inARoom = false;
    var socket = io.connect('http://localhost:8080');

    socket.emit('new', localStorage.getItem('key'));
    
    socket.on('userData', function(data){
        user = data;
        key = localStorage.getItem('key');
        document.getElementById('username').innerHTML = data;
    });

   
    $('#createSalon').click(function(){
        createSalon();
    });
    
    
    console.log(document.getElementById('createSalon'));

    socket.on('updateSalon', function(salons){
        $('#list').html('');
        for(var i=0; i < salons.length; i++){          
            $('#list').append(createSalonDiv(salons[i]));
        }
    });

    socket.on('salonCreated', function(){
     

        var btn = $('<img>');
        btn.attr('src','images/exit.png');
        btn.addClass('exit');
        $('#panelHeader').html('test');
        $('#panelHeader').append(btn);
        $('#panelBody').html('');

        btn.click( function(){
            socket.emit('deleteSalon', key );
                $('#panel').html(`
                    <div class="panel-heading title center" id='panelHeader'>
                        Create your room
                    </div>
                    <div class="panel-body" id="panelBody">
                        <form class="form-horizontal" action="#">
                            <div class="form-group">
                                <label  class="text col-sm-3" style="margin-top : 6px" for="salonName">Name</label>
                                <div class="col-sm-9" >
                                    <input type="text" class="form-control col-md-8" id="salonName"/>
                                </div>
                            </div>
                            <button type="submit" class="btn btn-default col" id="createSalon">Create</button> 
                        </form>
                    </div>`);
        });

        
    });


    createSalon = function(){
        var salonName = $('#salonName').val();
        console.log(salonName);
        var salon = {name : salonName, owner : key, players : [] };
        salon.players.push(user);
        inARoom = true;
        socket.emit('createSalon', salon);
    }


    createSalonDiv = function(salon){
        var name = salon.name;

        var salonDiv = $('<li></li>');
        var nbr = $('<span></span>');
        salonDiv.addClass('list-group-item');
        nbr.addClass('badge');
        nbr.html(salon.players.length + '/4');
        

        salonDiv.html(name);
        salonDiv.append(nbr);

        salonDiv.click( function(){
            if(!inARoom){
                socket.emit('joinSalon', {salonOwner : owner, userKey : key })
            }
            else{
                alert("You already are in a Salon");
            }
        });
        return salonDiv; 
    }


    requestImages = function(){
        console.log('requesting images');
        var xml = new XMLHttpRequest();
        var url = 'http://localhost:8080/images/';
        var imagePath = 'exit.png';
        xml.open('GET', url + imagePath, true);
        xml.send();
        xml.onreadystatechange = function(){
            if(xml.readyState == 4 && xml.status == 200){
                console.log(imagePath + ' successfully loaded');
               
            }
        }  
    };
    requestImages();

    
});