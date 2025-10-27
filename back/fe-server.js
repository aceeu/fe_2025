// ssl optons
const https = require('https');
const fs = require('fs');
const cors = require('cors'); // Import the cors middleware
let express = require('express');
let session = require('express-session');
let MongoClient = require('mongodb').MongoClient;
let config = require('./config');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const data = require('./data');

const dbName = config.db_name;
let app = express();
const corsOptions = {
  origin: ['http://localhost:3000'],
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions)); // Enable CORS for all routes

// Use environment variable for session secret, fallback to random string for development
const sessionSecret = process.env.SESSION_SECRET || require('crypto').randomBytes(32).toString('hex');
if (!process.env.SESSION_SECRET) {
  console.warn('WARNING: SESSION_SECRET environment variable not set. Using random secret (sessions will not persist across restarts).');
}

app.use(session({
  secret: sessionSecret,
  cookie: { maxAge: 60 * 60 * 25 * 1000, sameSite: 'strict' },
  resave: false,
  saveUninitialized: false
}));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())
// app.use((req, res, next) => {
//   if (req.protocol=='http')
//     res.redirect('https://aceeu.ru:8089');
//     next();
// });
const options = {
    dotfiles: 'ignore',
    etag: false,
    extensions: ['htm', 'html', 'css', 'js'],
    redirect: false,
  }
app.use(express.static(config.public_folder, options));

app.use((req, res, next) => {
  res.setHeader('Content-Type', 'text/json');
  next();
})

app.post('/auth', async function(req, res, next) {
    let client;
    try {
        const { user, password } = req.body;

        if (!user || !password) {
          throw new Error('Username and password are required');
        }

        if (!req.session) {
          throw new Error('Invalid session');
        }

        client = await MongoClient.connect(config.database_url);
        const users = client.db(dbName).collection('users');
        const userDoc = await users.findOne({ user: user });

        if (!userDoc) {
          throw new Error('Invalid username or password');
        }

        // Compare the provided password with the hashed password in database
        const isPasswordValid = await bcrypt.compare(password, userDoc.password);

        if (!isPasswordValid) {
          throw new Error('Invalid username or password');
        }

        req.session.name = userDoc.user;
        res.json({ res: true, name: req.session.name });
    } catch(e) {
        console.error('Authentication error:', e.message);
        res.json({ res: false, text: 'Authentication failed' });
    } finally {
        if (client) {
          await client.close();
        }
        res.end();
    }
});

app.get('/logout', function(req, res, next) {
  try {
    if (!req.session.name)
      throw 'no user logged before';
    delete req.session.name;
    res.json({res: true});
  } catch (e) {
    res.json({res: true, text: e.toString()});
  } finally {
    res.end();
  }
});

app.get('/user', function(req, res, next){
    if (req.session.name)
        res.json({res: true, name: req.session.name});
    else
        res.json({res: false, text: 'no session name'});
    res.end();
});

app.post('/data', data.fetchDataHandler());

app.post('/adddata', data.dataHandler(data.action_handlers[0]));
app.post('/editdata', data.dataHandler(data.action_handlers[1]))
app.post('/deldata', data.dataHandler(data.action_handlers[2]))
app.get('/categories', data.fetchCategories());

app.listen(config.port);

// const ssloptions = {
//     cert: fs.readFileSync('./sslcert/fullchain.pem'),
//     key: fs.readFileSync('./sslcert/privkey.pem')
// };
https.createServer(/*ssloptions,*/ app).listen(config.sslport);
