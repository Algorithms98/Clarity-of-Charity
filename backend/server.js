require('dotenv').config()
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const cors = require('cors');
const { log, ExpressAPILogMiddleware } = require('@rama41222/node-logger');
// const mysqlConnect = require('./db');
const routes = require('./routes');
const pool = require('./db');
const { json } = require('body-parser');

// set up some configs for express.
const config = {
  name: 'sample-express-app',
  port: 8000,
  host: '0.0.0.0',
};

// create the express.js object
const app = express();

// create a logger object.  Using logger is preferable to simply writing to the console.
const logger = log({ console: true, file: false, label: config.name });

// specify middleware to use
app.use(bodyParser.json());
app.use(cors({
  origin: '*'
}));
app.use(ExpressAPILogMiddleware(logger, { request: true }));

//include routes
routes(app, logger);

// connecting the express object to listen on a particular port as defined in the config object.
app.listen(config.port, config.host, (e) => {
  if (e) {
    throw new Error('Internal Server Error');
  }
  logger.info(`${config.name} running on ${config.host}:${config.port}`);
});


// -------------------------------------------------------------------
// --------------------------- API routes ----------------------------
// -------------------------------------------------------------------

// Sam
// login & register

// login
app.post('/postit/login', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username == null || password == null)
  return res.status(400).send('Please enter all fields!');
  
  console.log('login check');
  
  pool.query('SELECT * FROM users WHERE username = ?', username, function (err, result, fields) {
    if (err) throw err;
    
    if (result.length == 0)
      return res.status(400).send('Username can not be found');
    else if (password == result[0].password)
      res.end(JSON.stringify(result));
    else
      return res
      .status(400)
      .send("Password incorrect");
  });
});

// register
app.post('/postit/register', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const user_type = req.body.user_type;
  // NPO ONLY INFO
  const title = req.body.title;
  const location = req.body.location;
  const logoURL = req.body.logoURL;
  const description = req.body.description;
  
  console.log('register check');
  console.log(username, password, user_type)
  pool.query('SELECT * FROM users WHERE username = ?', username, function (err, result, fields) {
    console.log(result)
    if (result.length > 0) 
      return res.status(400).send('An account exists with this username');

    if (user_type == 1) {
      pool.query('INSERT INTO users (username, password, user_type) VALUES (?,?,?)', [username, password, user_type], function (err, result, fields) {
        if (err) throw err;
        else {
          res.end(JSON.stringify(result));
        }
      });
    }
    else if (user_type == 3) {
      console.log("Add NPO");

      pool.query('insert into npos (title, location, logoURL, description) values (?, ?, ?, ?)',
        [title, location, logoURL, description], function (err, result, fields) {
          if (err) throw err;
        
          console.log(result.insertId)


          pool.query('INSERT INTO users (username, password, user_type, npoID) VALUES (?,?,?,?)', [username, password, user_type, result.insertId], (err, result, fields) => {
            if (err) throw err;

            res.end(JSON.stringify(result));
          });
        });
    }
  });
});

// Bella
// users table related 
// 1. GET all users
app.get('/getit/users', (req, res) => {
  pool.query('SELECT * FROM users', function (err, result, fields) {
    if (err) {
      logger.error("Error while getting users");
    }
    else{
      res.end(JSON.stringify(result));
    }
  });
});

// 2. GET a specific user by username
app.get('/getit/user', (req, res) => {
  var username = req.param('username');
  pool.query('SELECT * FROM users WHERE username = ?', username, function(err, result, fields) {
    if (err) {
      logger.error('Error while getting user ' + username);
    }
    else{
      res.end(JSON.stringify(result));
    }
  });
});

// 3. GET users by type
app.get('/getit/usertype', (req, res) => {
  var user_type = req.param('user_type');
  pool.query('SELECT * FROM users WHERE user_type = ?', user_type, function(err, result, fields) {
    if (err) {
      logger.error('Error while getting user type ' + type);
    }
    else {
      res.end(JSON.stringify(result));
    }
  });
});

// 4. GET password by username
app.get('/getit/userpwd', (req, res) => {
  var username = req.param('username');
  pool.query('SELECT password FROM users WHERE username = ?', username, function(err, result, fields) {
    if (err) {
      logger.error('Error while getting password for user ' + username);
    }
    else {
      res.end(JSON.stringify(result));
    }
  });
});

// 5. UPDATE user password
app.put('/putit/userpwd', (req, res) => {
  var userid = req.param('userid');
  var newpwd = req.param('newpwd');
  pool.query('update users set password = ? where userID = ?', [newpwd, userid], function(err, result, fields) {
    if (err) {
      logger.error('Error while setting password for user ' + userid);
    }
    else {
      res.end(JSON.stringify(result));
    }
  });
});

// 6. POST a specific user
app.post('/postit/user', (req, res) => {
  var username = req.param('username');
  var password = req.param('password');
  var user_type = req.param('user_type');

  pool.query('INSERT INTO users (username, password, user_type) VALUES (?,?,?)', [username, password, user_type], function (err, result, fields) {
    if (err) {
      logger.error("Error while inserting new user to users");
    }
    else{
      res.end(JSON.stringify(result));
    }
  });
});

// 7. DELETE a user by username
app.delete('/deleteit/username', (req, res) => {
  var username = req.param('username');
  pool.query('delete from ratings where raterID = (select userID from users where username = ? ); delete from users where username = ?; ', [username, username], function (err, result, fields) {
    if (err) {
      logger.error("Error while deleting user " + username);
    }
    else{
      res.end(JSON.stringify(result));
    }
  });
});

// 8. DELETE a user by userID
app.delete('/deleteit/:userID', (req, res) => {
  var userID = req.param('userID');
  pool.query('delete from ratings where raterID = ?; delete from users where userID = ?; ', [userID, userID], function (err, result, fields) {
    if (err) {
      logger.error("Error while deleting user " + userID);
    }
    else{
      res.end(JSON.stringify(result));
    }
  });
});

// 9. Get userID by username
app.get('/getit/userID', (req, res) => {
  var username = req.param('username');
  pool.query('select userID from users where username = ? ', username, function (err, result, fields) {
    if (err) {
      logger.error("Error while getting userID for user " + username);
    }
    else{
      res.end(JSON.stringify(result));
    }
  });
});

// 10. Get npoID by npo title
app.get('/getit/npoIDByTitle', (req, res) => {
  var npoTitle = req.param('npoTitle');
  pool.query('select npoID from npos where title = ? ', npoTitle, function (err, result, fields) {
    if (err) {
      logger.error("Error while getting npoID for npo " + npoTitle);
    }
    else{
      res.end(JSON.stringify(result));
    }
  });
});

// 11. Get npoID by userID - after npo is linked to user table
app.get('/getit/npoIDByUserID', (req, res) => {
  var userID = req.param('userID');
  pool.query('select npoID from users where userID = ? ', userID, function (err, result, fields) {
    if (err) {
      logger.error("Error while getting npoID for userID " + userID);
    }
    else{
      res.end(JSON.stringify(result));
    }
  });
});

// 12. Get npoID by username - after npo is linked to user table
app.get('/getit/npoIDByUsername', (req, res) => {
  var username = req.param('username');
  pool.query('select npoID from users where username = ? ', username, function (err, result, fields) {
    if (err) {
      logger.error("Error while getting npoID for username " + username);
    }
    else{
      res.end(JSON.stringify(result));
    }
  });
});

// 13. GET average rating for a specific npo
app.get('/getit/avgrating', (req, res) => {
  var npoID = req.param('npoID');
  pool.query('select avg(rating) from ratings where npoID = ?', npoID, function (err, result, fields) {
    if (err) {
      logger.error("Error while getting average rating for npo " + npoID);
    }
    else{
      res.end(JSON.stringify(result));
    }
  });
});

// 14. GET username by userID
app.get('/getit/username/:userID', (req, res) => {
  var userID = req.param('userID');
  pool.query('select username from users where userID = ?', userID, function (err, result, fields) {
    if (err) {
      logger.error("Error while getting average rating for npo " + npoID);
    }
    else{
      res.end(JSON.stringify(result));
    }
  });
});

// 15. DELETE npo by npoID
app.delete('/deleteit/npos/:npoID', (req, res) => {
  var npoID = req.param('npoID');
  pool.query('delete from images where npoID = ?; delete from users where npoID = ?; delete from npos where npoID = ?', [npoID, npoID, npoID], function (err, result, fields) {
    if (err) {
      logger.error("Error while deleting npoID " + npoID);
    }
    else{
      res.end(JSON.stringify(result));
      console.log(npoID);
    }
  });
});

// 16. POST a review
app.post('/postit/review', (req, res) => {
  var rating = req.param('rating');
  var raterID = req.param('raterID');
  var flagged = req.param('flagged');
  var comment = req.param('comment');
  var npoID = req.param('npoID');
  var ratingDate = req.param('ratingDate');
  pool.query('insert into ratings (rating, raterID, flagged, comment, npoID, ratingDate) values (?,?,?,?,?,?)', [rating, raterID, flagged, comment, npoID, ratingDate], function (err, result, fields) {
    if (err) {
      logger.error("Error while adding review ");
    }
    else{
      res.end(JSON.stringify(result));
    }
  });
});


///Peter
// PUT update npo location by npoID (use JSON body for location)
app.put('/npos/:npoID/updateLocation', (req,res) => {
  var npoID = req.params.npoID;
  var location = req.body.location;
  pool.query('update npos set location = ? where npoID = ?', [location,npoID], function (err,result,fields){
    if(err){
      logger.error("Error updating location for npoID " + npoID);
    }
    else{
      res.end(JSON.stringify(result));
    }
  });
});
// DELETE remove npo image by npoID and imageID
app.delete('/images/:npoID/:imageID', (req,res) => {
  var npoID = req.params.npoID;
  var imageID = req.params.imageID;
  pool.query('delete from images where npoID = ? and imageID = ?', [npoID,imageID], function (err,result,fields) {
    if(err){
      logger.error("Error removing image from npo " + npoID + " with imageID " + imageID);
    }
    else{
      res.end(JSON.stringify(result));
    }
  });
});
// PUT update npo description (use JSON body for description)
app.put('/npos/:npoID/updateDescription', (req,res) => {
  var npoID = req.params.npoID;
  var description = req.body.description;
  pool.query('update npos set description = ? where npoID = ?', [description,npoID], function (err,result,fields) {
    if(err){
      logger.error("Error updating description for npoID " + npoID);
    }
    else{
      res.end(JSON.stringify(result));
    }
  });
});
// PUT update npo logo (use JSON body for logoURL)
app.put('/npos/:npoID/updateLogo', (req,res) => {
  var npoID = req.params.npoID;
  var logoURL = req.body.logoURL;
  pool.query('update npos set logoURL = ? where npoID = ?', [logoURL,npoID], function (err,result,fields) {
    if(err){
      logger.error("Error updating logoURL " + logoURL + " for npoID " + npoID);
    }
    else {
      res.end(JSON.stringify(result));
    }
  });
});
// GET flag status of rating by ratingID
app.get('/ratings/:ratingID/isFlagged', (req,res) => {
  var ratingID = req.params.ratingID;
  pool.query('select flagged from ratings where ratingID = ?', ratingID, function (err,result,fields) {
    if(err){
      logger.error("Error getting flagged status of rating " + ratingID);
    }
    else{
      res.end(JSON.stringify(result));
    }
  })
})
// PUT toggle flag status of rating by ratingID
app.put('/ratings/:ratingID/toggleFlag', (req,res) => {
  var ratingID = req.params.ratingID;
  var sql = "update ratings set flagged = (case when (select flagged where ratingID = ?) = 1 then 0 when (select flagged where ratingID = ?) = 0 then 1 end ) where ratingID = ?";
  pool.query(sql, [ratingID,ratingID,ratingID], function (err,result,fields) {
    if(err){
      logger.error("Error toggling flag status of rating " + ratingID);
    }
    else{
      res.end(JSON.stringify(result));
    }
  });
});
// PUT flag rating by ratingID
app.put('/ratings/:ratingID/flag', (req,res) => {
  var ratingID = req.params.ratingID;
  pool.query('update ratings set flagged = 1 where ratingID = ?', ratingID, function (err,result,fields) {
    if (err) {
      logger.error("Error flagging rating " + ratingID);
    }
    else {
      res.end(JSON.stringify(result));
    }
  });
});
// PUT unflag rating by ratingID
app.put('/ratings/:ratingID/unflag', (req,res) => {
  var ratingID = req.params.ratingID;
  pool.query('update ratings set flagged = 0 where ratingID = ?', ratingID, function (err,result,fields) {
    if (err) {
      logger.error("Error unflagging rating " + ratingID);
    }
    else {
      res.end(JSON.stringify(result));
    }
  });
});
// PUT approve npo by npoID
app.put('/npos/:npoID/approve', (req,res) => {
  var npoID = req.params.npoID;
  pool.query('update npos set isApproved = true where npoID = ?', npoID, function (err,result,fields) {
    if(err){
      logger.error("Error approving NPO " + npoID);
    }
    else {
      res.end(JSON.stringify(result));
    }
  });
});
// PUT update password (use JSON body for password)
app.put('/users/:userID/password', (req,res) => {
  var userID = req.params.userID;
  var password = req.body.password;
  pool.query('update users set password = ? where userID = ?', [password,userID], function (err,result,fields) {
    if(err){
      logger.error("Error updating password for " + userID);
    }
    else {
      res.end(JSON.stringify(result));
    }
  });
});
// GET all npos
app.get('/npos', (req,res) => {
  pool.query('select * from npos', function (err, result, fields) {
    if (err) {
      logger.error("Error while getting npos");
    }
    else {
      res.end(JSON.stringify(result));
    }
  });
});
// GET all NPOs needing approval
app.get('/npos/notApproved', (req,res) => {
  pool.query('select * from npos where isApproved = false', function (err,result,fields) {
    if (err) {
      logger.error("Error getting all npos needing approval");
    }
    else {
      res.end(JSON.stringify(result));
    }
  });
});
// GET all approved npos
app.get('/npos/approved', (req,res) => {
  pool.query('select * from npos where isApproved = true', function (err,result,fields) {
    if (err) {
      logger.error("Error getting approved npos");
    }
    else {
      res.end(JSON.stringify(result));
    }
  });
});
// GET specific npo by npoID
app.get('/npos/:npoID', (req,res) => {
  var npoID = req.params.npoID;
  pool.query('select * from npos where npoID = ?', npoID, function (err,result,fields) {
    if (err) {
      logger.error("Error while getting npo by id " + npoID);
    }
    else {
      res.end(JSON.stringify(result));
    }
  });
});
// GET all images for specific npo by npoID
app.get('/npos/:npoID/images', (req,res) => {
  var npoID = req.params.npoID;
  pool.query('select * from images where npoID = ?', npoID, function (err,result,fields) {
    if (err) {
      logger.error("Error getting images for npo with id " + npoID);
    }
    else {
      res.end(JSON.stringify(result));
    }
  });
});
// POST new npo (use JSON body including: title, location, logoURL, description). the resulting npoID will be returned
app.post('/npos', async (req,res) => {
  var title = req.body.title;
  var location = req.body.location;
  var logoURL = req.body.logoURL;
  var description = req.body.description;
  var sql = "insert into npos (title, location, logoURL, description) values (?, ?, ?, ?)";
  pool.query(sql, [title, location, logoURL, description], function (err, result, fields) {
    if (err) {
      logger.error("Error posting new npo");
    }
    else {
      var npoID = result.insertId;
      res.end(JSON.stringify(npoID));
    }
  });
});
// POST image by npoID (use JSON body for imageURL). the resulting imageID will be returned
app.post('/npos/:npoID/images', async (req,res) => {
  var npoID = req.params.npoID;
  var imageURL = req.body.imageURL;
  pool.query('insert into images (imageURL, npoID) values (?,?)', [imageURL,npoID], function (err, result, fields) {
    if (err) {
      logger.error("Error posting image to npoID " + npoID + ", image url: " + imageURL);
    }
    else {
      var imageID = result.insertId;
      res.end(JSON.stringify(imageID));
    }
  });
});


// PUT link user to npo by userID and npoID
app.put('/users/:userID/:npoID', async (req,res) => {
  var userID = req.params.userID;
  var npoID = req.params.npoID;
  pool.query('update users set npoID = ? where userID = ?', [npoID,userID], function (err, result, fields) {
    if (err) {
      console.log("Error linking user " + userID + " to npo " + npoID);
      logger.error("Error linking user " + userID + " to npo " + npoID);
    }
    else {
      res.end(JSON.stringify(result));
    }
  });
});



///Prince 
//3.1 User viewing charity's ratings by npoID
app.get('/ratings/:npoID', (req,res) => {
  var npoID = req.param('npoID')
  pool.query('select * from ratings WHERE npoID = ?', npoID, function (err, result, fields) {
    if (err) {
      logger.error("Error while getting ratings");
    }
    else {
      res.end(JSON.stringify(result));
    }
  });
});

//3.2.1 User viewing charity's description by npoID
app.get('/descriptionbyID/:npoID', (req,res) => {
  var npoID = req.param('npoID')
  pool.query('select description from npos WHERE npoID = npoID',npoID, function (err, result, fields) {
    if (err){
      logger.error("Error while getting descriptiong for npo " + npoID);
    }
    else {
      res.end(JSON.stringify(result));
    }
  });
});

//3.2.2 User viewing charity's description by npo name
app.get('/descriptionbyName/:username', (req,res) => {
  var username = req.param('username')
  pool.query('select description from npos WHERE npoID = (select npoID from users where username = ?)',username, function (err, result, fields) {
    if (err){
      logger.error("Error while getting descriptiong for npo " + username);
    }
    else {
      res.end(JSON.stringify(result));
    }
  });
});



//3.3.1 User vieweing charity's location by npoID
app.get('/locationbyID/:npoID', (req, res) => {
  var npoID = req.param('npoID')
  pool.query('select location from npos WHERE npoID = ?', npoID , function (err, result, fields) {
    if (err){
      logger.error("Error while getting charity location")
    }
    else {
      res.end(JSON.stringify(result));
    }
  });
});

//3.3.2 User vieweing charity's location
app.get('/locationbyName/:username', (req, res) => {
  var username = req.param('username')
  pool.query('select location from npos WHERE npoID = (select npoID from users where username = ?)', username , function (err, result, fields) {
    if (err){
      logger.error("Error while getting charity location")
    }
    else {
      res.end(JSON.stringify(result));
    }
  });
});


// 8.1  View flagged ratings as an Admin
app.get('/flagged', (req, res) => {
  pool.query('select * from ratings WHERE flagged = 1', function(err, result, fields) {
    if (err){
      logger.error("Error while getting flagged reviews")
    }
    else {
      res.end(JSON.stringify(result));
    }
  });
});

// 8.2 Unflag ratings as an Admin
app.put('/ratings/:rating', async(req, res) => {

  var oldRating = req.param('oldRating');
  var newRating = req.param('newRating');

  pool.query('UPDATE ratings SET rating = ? WHERE rating = ?', [newRating, oldRating], function (err, result, fields){
    if (err){
      logger.error("Failed updating ratings")
    }
    else {
      res.end(JSON.stringify(result));
    }
  });
});

//8.3 delete reviews as an Admin
app.delete('/reviews/:ratingID', async(req, res) => {

  var ratingID = req.param('ratingID');

  pool.query('DELETE FROM ratings WHERE ratingID = ?', ratingID, function(err, result, fields){
    if (err) {
      logger.error("Failed to delete review")
    }
    else {
      res.end(JSON.stringify(result));
    }
  });
});


//10.1 flag reviews or ratings as an NPO
app.put('/ratings/:ratingID', async(req, res) =>{

  var ratingID = req.param('ratingID')

  pool.query('UPDATE ratings SET rating = 1 WHERE ratingID = ?',ratingID, function(err, result, fields){
    if(err){
      logger.error("Failed to flag ratings")
    }
    else{
      res.end(JSON.stringify(result));
    }
  });
});


