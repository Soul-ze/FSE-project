var express=require('express'),
		app=express(),
		server=require('http').createServer(app),
		io=require('socket.io').listen(server);
		usernames=[];

var mysql      = require('mysql');
var connection = mysql.createConnection({
  		host     : 'localhost',
  		user     : 'root',
  		password : 'fseproject',
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

app.get('/dropUsertable',(req,res)=>{
	let sql='DROP TABLE users';
	connection.query(sql,(err, result) =>{
		if(err)throw err;
		console.log(result);
		res.send('.......Message Table Dropped.....');
	});
});

//=======create row==========================
app.get('/createMessagetable',(req,res)=>{
	let sql='CREATE TABLE message(id int AUTO_INCREMENT, user VARCHAR(255), time VARCHAR(255), msg VARCHAR(255),PRIMARY KEY(id))';
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

app.use(express.static(__dirname));
app.get('/', function (req, res) {
    res.sendfile('index.html');
});

io.sockets.on('connection',function(socket){

	console.log('Socket Connected..');
	socket.on('newuser', function(data1, data2,callback){
		console.log(typeof(data1));
		console.log(data2); 

		let sql =`SELECT * FROM users WHERE username is NULL OR username=`+data1;
  		console.log(sql); 
		connection.query(sql, (err, res) =>{
			console.log(res);
			if (res == null || res.length==0 ){	
	  			console.log('Register successfully');
	            let newuser={username:data1, password:data2};
				let sql='INSERT INTO users SET ?';
				connection.query(sql,newuser,(err, result) =>{
						if(err)throw err;
						console.log(result);
					//res.send('New User added.....');
				callback('ok');	
				});
	  		}else{ 
				console.log('Already registered!');
				callback('failed');	
	  		}
	  	});
	});

	socket.on('login', function(data1, data2, callback){
		console.log(usernames);
		socket.username = data1
		let sql = "SELECT * FROM users WHERE username='" + data1 + "' AND password='" + data2 +"'" ;
		console.log(sql);
		connection.query(sql, (err, res) =>{
			console.log(res);
			if (res == null || res.length == 0 ){		
				//if(usernames.indexOf(data1)==-1){
					console.log('refuse!');
					callback('refuse');
					
						// history 					
			}else{ 
				console.log('welcome!');
				callback('ok');
				usernames.push(data1);
				showHistory();}
				
			}); //end connection
	});

	//send message...
	socket.on('newMessage', function(content){
		var currentdate = new Date(); 
	    var hour = currentdate.getHours();  
	    var minute = currentdate.getMinutes(); 
	    var second = currentdate.getSeconds();
	    if (hour<10) {hour='0'+hour;}
	    if (minute<10) {minute='0'+minute;}
	    if (second<10) {second='0'+second;}
	    var datetime = currentdate.getDate() + "/"
	            + (currentdate.getMonth()+1)  + "/" 
	            + currentdate.getFullYear() + " " 
	            + hour + ":" 
	            + minute + ":" 
	            + second; 
	    newmsg = {msg: content, user: socket.username, time:datetime};
		let sql='INSERT INTO message SET ?';	
		connection.query(sql,newmsg,(err, result) =>{
				if(err)throw err;
				console.log(result);
		});
		showHistory();
	});

    function showHistory(){
	  	let sql='SELECT * FROM message';
		connection.query(sql, (err, results) =>{
			if(err)throw err;
			io.sockets.emit('showMessage', results);		
		});
  	}

});
