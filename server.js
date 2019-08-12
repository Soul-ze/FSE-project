var express=require('express'),
		app=express(),
		server=require('http').createServer(app),
		io=require('socket.io').listen(server);
		usernames=[];

var mysql      = require('mysql');
var connection = mysql.createConnection({
  		host     : 'localhost',
  		user     : 'root',
  		password : 'tangtang258',
  		database : 'node_db'
});

connection.connect((err)=>{
	if(err){
		throw err;
	}
	console.log('Mysql Connected....');
});

//=======create database==========================
app.get('/createdb',(req,res)=>{
	let sql='CREATE DATABASE node_db';
	connection.query(sql,(err, result) =>{
		if(err)throw err;
		console.log(result);
		res.send('Database Created.....');
	});
});

//=======create row==========================
app.get('/createusertable',(req,res)=>{
	let sql='CREATE TABLE users(id int AUTO_INCREMENT, username VARCHAR(255), password VARCHAR(255), PRIMARY KEY(id), UNIQUE KEY(username))';
	connection.query(sql,(err, result) =>{
		if(err)throw err;
		console.log(result);
		res.send('.......User Table Created.....');
	});
});

//=======create row==========================
app.get('/createMessagetable',(req,res)=>{
	let sql='CREATE TABLE message(id int AUTO_INCREMENT, username VARCHAR(255), time VARCHAR(255), msg VARCHAR(255),PRIMARY KEY(id))';
	connection.query(sql,(err, result) =>{
		if(err)throw err;
		console.log(result);
		res.send('.......Message Table Created.....');
	});
});

app.get('/dropMessagetable',(req,res)=>{
	let sql='DROP TABLE message';
	connection.query(sql,(err, result) =>{
		if(err)throw err;
		console.log(result);
		res.send('.......Message Table Dropped.....');
	});
});
//==================adding new user===================================
app.get('/addingnewuser',(req,res)=>{
	let newuser={username:'gilbert', password:'niyongere'};
	let sql='INSERT INTO users SET ?';
	connection.query(sql,newuser,(err, result) =>{
		if(err)throw err;
		console.log(result);
		res.send('New User added.....');
	});
});

//=====================get message===========================================
app.get('/getMessage',(req,res)=>{
	let sql='SELECT * FROM message';
	connection.query(sql, (err, results) =>{
		if(err)throw err;
		console.log(results);
		res.send('Message Selected....');
	});
});

//=====================get users===========================================
app.get('/getusers',(req,res)=>{
	
	let sql='SELECT * FROM users';
	connection.query(sql, (err, results) =>{
		if(err)throw err;
		console.log(results);
		res.send('Users Selected....');
	});
});

//===================================select single user=================================================
app.get('/getuser/:id',(req,res)=>{
	
	let sql =`SELECT * FROM users WHERE id = ${req.params.id}`;
	connection.query(sql, (err, result) =>{
		if(err)throw err;
		console.log(result);
		res.send('User Selected....');
	});
});

//==========================================================================
server.listen(3000);
console.log('Server Running..');
app.get('/',function(req,res){
	res.sendFile(__dirname + '/index.html');
});

io.sockets.on('connection',function(socket){
	console.log('Socket Connected..');

	socket.on('newuser', function(data1, data2,callback){
		console.log(data1);
		console.log(data2); 
		let sql =`SELECT * FROM users WHERE username=` + data1;
  		console.log(sql); 
		connection.query(sql, (err, res) =>{
			console.log(res);
			if(err)throw err;
			if (res.length > 0 ){		
				console.log('Already registered!');
				callback('failed');				
	  		}else{ 
	  			console.log('Register successfully');
	            let newuser={username:data1, password:data2};
				let sql='INSERT INTO users SET ?';
				connection.query(sql,newuser,(err, result) =>{
						if(err)throw err;
						console.log(result);
					//res.send('New User added.....');
				});
				callback('ok');
	  		}
	  	});
	});

  socket.on('login', function(data1, data2, callback){
  		console.log(usernames);
  		socket.username = data1
  		let sql =`SELECT * FROM users WHERE username=` + data1 + ' AND password=' + data2 ;
  		console.log(sql);
		connection.query(sql, (err, res) =>{
			console.log(res);
			if(err)throw err;
			if (res.length > 0 ){		
				//if(usernames.indexOf(data1)==-1){
					console.log('welcome!');
					callback('ok');
					usernames.push(data1);
  					updateUsernames();
  					// history 					
  		}else{ 
  			console.log('refuse!')
  			callback('refuse');}
  			
  		}); //end connection
  	});




  //update username
  function updateUsernames(){
  	io.sockets.emit('usernames',usernames);
  }
	//send message...
  socket.on('newMessage', function(content){
  		var currentdate = new Date(); 
   			var datetime = currentdate.getDate() + "/"
                + (currentdate.getMonth()+1)  + "/" 
                + currentdate.getFullYear() + " "  
                + currentdate.getHours() + ":"  
                + currentdate.getMinutes() + ":" 
                + currentdate.getSeconds();
        newmsg = {msg: content, username: socket.username, time:datetime};
		let sql='INSERT INTO message SET ?';
		console.log(sql)
		connection.query(sql,newmsg,(err, result) =>{
				if(err)throw err;
				console.log(result);
			//res.send('New User added.....');
		});
  		io.sockets.emit('showMessage', newmsg);
  		
  });

//===========disconnect =======
  socket.on('disconnect', function(data1){
  	if(!socket.username){
  		return;
  	}
  	usernames.splice(usernames.indexOf(socket.username,1));
  	updateUsernames();

  });

});
