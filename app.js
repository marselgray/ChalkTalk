var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var exphbs = require('express-handlebars');
var expressValidator = require('express-validator');
var flash = require('connect-flash');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongo = require('mongodb');
var MongoClient = require('mongodb').MongoClient;
var mongoose = require('mongoose');

var client = require('socket.io').listen(4000).sockets;

mongoose.connect('mongodb://localhost/loginapp', function(err, db){
  //deployment
if (process.env.NODE_ENV == "production") {
  mongoose.connect(process.env.MLAB_URL)
} else {
  mongoose.connect("mongodb://localhost/whenpresident");
}



  // Connection to Socket.io
client.on('connection', function(socket){
    let chat = db.collection('chats');

// Function to send status
    sendStatus = function(s){
        socket.emit('status', s);
    }

// Get chats from mongo collection
    chat.find().limit(100).sort({_id:1}).toArray(function(err, res){
        if(err){
            throw err;
        }

// Emit the messages
    socket.emit('output', res);
        });

// Handle input events
    socket.on('input', function(data){
        let name = data.name;
        let message = data.message;

// Check for name and message
    if(name == '' || message == ''){
    
    // Send error status
        sendStatus('Please enter a name and message');
            } else {
    // Insert message
                chat.insert({name: name, message: message}, function(){
                    client.emit('output', [data]);

    // Send status object
                    sendStatus({
                        message: 'Message sent',
                        clear: true
                    });
                });
            }
        });

// Clear messages
        socket.on('clear', function(data){
            // Remove all messages from board
            chat.remove({}, function(){
                // Cleared executed
                socket.emit('cleared');
            });
        });
    });
});





var db = mongoose.connection;
// var db = mongoose.connection;

var routes = require('./routes/index');
var users = require('./routes/users');



//Application Initialization
var app = express();

//View Engine
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', exphbs({defaultLayout:'layout'}));
app.set('view engine', 'handlebars');

//Middleware Goes Here
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));

//Session for Express
app.use(session({
    secret: 'secret',
    proxy: true,
    resave: true,
    saveUninitialized: true
}));

// app.use(session({
// 	secret: 'secret',
// 	saveUnitialized: true,
// 	resave: true
// }));


//Passport Initialization
app.use(passport.initialize());
app.use(passport.session());

//Validator 

app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));



// Flash Connection
app.use(flash());

app.use(function (req, res, next) {
	res.locals.success_msg = req.flash('success_msg');
	res.locals.error_msg = req.flash('error_msg');
	res.locals.error = req.flash('error');
	res.locals.user = req.user || null;
  next();
});



app.use('/', routes);
app.use('/users', users);

//Port Setup

app.set('port', process.env.PORT || 3001)

  app.listen(app.get('port'), () => {
    console.log(`✅ PORT: ${app.get('port')} 🌟`)
  })



// app.set('port', (process.env.PORT || 3000));


// app.listen(app.get('port'), function(){
//   console.log('yo server is working, so dope at port ' +app.get('port'));
// });












// var { JwtGenerator } = require('virgil-sdk');
// var { VirgilCrypto, VirgilAccessTokenSigner } = require('virgil-crypto');

// app.use(bodyParser.json())

// // Enable cors, you don't need this, if you using same domain
// app.use(function(req, res, next) {
//     res.header("Access-Control-Allow-Origin");
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//     next();
// });

// // Serve static
// app.use(express.static('public'))

// const crypto = new VirgilCrypto();
// const { APP_ID, API_KEY_ID, API_KEY } = require('./config');

// var generator = function JwtGenerator(appId, apiKeyId, apiKey, accessTokenSigner){
//     this.appId = APP_ID;
//     this.apiKeyId = API_KEY_ID;
//     this.apiKey = crypto.importPrivateKey(API_KEY);
//     this.accessTokenSigner = new VirgilAccessTokenSigner(crypto);
// };

// app.post('/generate_jwt', (req, res) => {
//     if (!req.body || !req.body.identity) return res.status(400).send('identity param is required');
//     const virgilJwtToken = generator.generateToken(req.body.identity);
//     res.send(virgilJwtToken.toString());
// });



























