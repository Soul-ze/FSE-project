$(function(){
	var socket=io.connect();
	var $messageForm = $('#messageForm');
	var $typingArea = $('#typingArea');
	var $chating = $('#chatWindow');
	var $usernameForm = $('#usernameForm');
	var $registerForm = $('#registerForm');
	var $users = $('#users');
	var $registerName = $('#registerName');
	var $registerPassword = $('#registerPassword');
	var $username= $('#username');
	var $password= $('#password');
	var $error= $('#error');
	var $registerError = $('#registerError');
	var $oldMessage = $('#oldMessage');
	var $logoutButton = $('#logoutButton');
	var $registerButton = $('#registerButton');


	$logoutButton.click(function(e){
		//start registering
		alert('Already Logout');
		$('#registerWrapper').hide();
		$('#namesWrapper').show();
		$('#mainWrapper').hide();
	});

	$registerButton.click(function(e){
		//start registering
		$('#registerWrapper').show();
		$('#namesWrapper').hide();
		$('#mainWrapper').hide();
	});

	$usernameForm.submit(function(e){
	    e.preventDefault();

		socket.emit('login',  $username.val(), $password.val(), function(data){
			if(data =='ok'){
				$('#namesWrapper').hide();
				$('#mainWrapper').show();

			}else{
				$error.html('Wrong username or password')
			}	
		});
	});

	
	$registerForm.submit(function(e){
	    e.preventDefault();

		socket.emit('newuser',  $registerName.val(), $registerPassword.val(), function(data){
			console.log(data)
			if(data =='ok'){
				alert("Register Successfully!");
				$('#registerWrapper').hide();
				$('#namesWrapper').show();
				$('#mainWrapper').hide();
			}else{
				$registerError.html('Register Failed, username has been taken.');
			}
		});
	});
	
	
	$messageForm.submit(function(e){
	    e.preventDefault();
		socket.emit('newMessage', $typingArea.val());
		$typingArea.val('');
	});

	socket.on('showMessage', function(data){
		$oldMessage.empty();
		for(i = 0; i < data.length; i++){
			var time = '<div class="dialogTime">'+data[i].time+'</div>';
	 		
			var user = '<div class="userName">'+data[i].user+'</div>';

			var msg = '<div class="bubble">'+data[i].msg+ '</div>';

			$oldMessage.append(time,user,msg);
		}		
	});

});