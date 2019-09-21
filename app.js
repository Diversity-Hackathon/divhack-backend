const express = require('express')
const helmet = require('helmet')
const bodyParser  = require('body-parser');
//models
const users = require('./models/users');
const user_logs = require('./models/user_logs');

// for passwords
const bcrypt = require('bcrypt');
const saltRounds = 12;


const app = express()
const port = 3000
require('dotenv').config()

// database
const Pool = require('pg').Pool
const pool = new Pool({
  //user: 'me',
  host: 'localhost',
  database: 'hackathon',
  //password: 'password',
  port: 5432,
})


app.use(helmet())


app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
)

// middleware
app.use(function middleware(req,res,next) {
  console.log(req.method + " " + req.path + " - " + req.ip);
  next();
});

// Error Handling middleware
app.use((err, req, res, next) => {
  let errCode, errMessage

  if (err.errors) {
    // mongoose validation error
    errCode = 400 // bad request
    const keys = Object.keys(err.errors)
    // report the first validation error
    errMessage = err.errors[keys[0]].message
  } else {
    // generic or custom error
    errCode = err.status || 500
    errMessage = err.message || 'Internal Server Error'
  }
  res.status(errCode).type('txt')
    .send(errMessage)
})

// this will be the login page
app.get('/', function(req,res,done) {
	res.json({"message": "hello!"}); // this will be changed later
})

app.post('/login', function(req,res,done) {
	var name = req.body.name;
	var email = req.body.email;
	pool.query('SELECT * FROM users WHERE id = $1', [id], (error, results) => {
    if (error) {
      throw error
    }
    if (results.length == 0) {
    	res.status(404)
    } else {
    	var hashedPass = results[0].password;
    	bcrypt.compare(myPlaintextPassword, hash, function(err, res) {
		    // res == true
		    if (err) return done(err);
		    res.redirect('/user/' + results[0].id);
		});
    }
  })
})

// user stuff
app.route('/user').post(function(req,res,done) {
	// create the user: need the email, username, and password; need to hash password
	var name = req.body.name;
	var email = req.body.email;
	var passwordHash;
	bcrypt.hash(req.body.password, saltRounds,function(err,hash) {
		if (err) return done(err);
		passwordHash = hash;
	});

	// save the user
	pool.query('INSERT INTO users (name, email, password) VALUES ($1, $2, $3)', [name, email, passwordHash], (error, results) => {
    if (error) {
      throw error
    }
    response.status(201).send(`User added with ID: ${result.insertId}`)
  })

}).get(function(req,res,done) {
	var id = req.query.id;
	pool.query('SELECT * FROM users WHERE id = $1', [id], (error, results) => {
    if (error) {
      throw error
    }
    res.status(200).json(results.rows)
  })
	//res.json({"name": res.body.name, "email": res.body.email, "user_log": res.body.user_log})
});



app.listen(port, () => console.log(`Example app listening on port ${port}!`))