var express = require('express');
var mysql = require('./dbcon.js');


var app = express();
var handlebars = require('express-handlebars').create({defaultLayout:'main'});
app.use(express.static(__dirname + '/public'));         // this is needed to allow for the form to use the ccs style sheet

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', 3499);

var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


const getAllCerts='SELECT * FROM Certifications';
const getAllTrainers = 'SELECT * FROM Trainers';
const getAllClients = 'SELECT * FROM Clients INNER JOIN Trainers ON Clients.TrainerID = Trainers.TrainerID INNER JOIN ClientPlans ON Clients.ClientID = ClientPlans.ClientID INNER JOIN ExercisePlans ON ClientPlans.ExerciseID = ExercisePlans.ExerciseID';
const getTrainersWithCerts = 'SELECT Trainers.TrainerFN, Trainers.TrainerLN, Trainers.TrainerEmail, Certifications.CertTitle FROM Trainers INNER JOIN TrainerCerts ON Trainers.TrainerID = TrainerCerts.TrainerID INNER JOIN Certifications ON TrainerCerts.CertID = Certifications.CertID';


app.get('/',function(req,res){
  res.render('index', {});
});


app.get('/home',function(req,res){                    // render home page when you visit the home url 
  res.render('index', {});
});


app.get('/certs',function(req,res, next){                    // render certs page when you visit certs url
  var context = {};
  mysql.pool.query(getAllCerts, function(err, rows, fields){ //homework6 project page
    if (err){
      next(err);
      return;
    }
    context.results = rows;
    console.log(context);
    res.render('certs', context)
  });
});


app.get('/clients',function(req,res){ 
  var context = {};
  mysql.pool.query(getAllClients, function(err, rows, fields) {
    if (err) {
      next(err);
      return;
    }
    context.results = rows;
    console.log(context);
    res.render('clients', context);
  });              // render clients page when you visit certs url
});

app.get('/mngclients',function(req,res){                // render manage clients page when you visit mngclients url
  res.render('manageclients', {});
});

app.get('/trainers',function(req,res){                // render  trainers page when you visit mngclients url
  var context = {};
  mysql.pool.query(getAllTrainers, function(err, rows, fields){ 
    if (err){
      next(err);
      return;
    }
    context.results = JSON.stringify(rows);
    console.log(context);
    res.render('trainers', context)
  });
});

app.get('/mngtrainers',function(req,res){                // render manage trainers page when you visit mngclients url
  var context = {};
  mysql.pool.query(getTrainersWithCerts, function(err, rows, fields){ 
    if (err){
      next(err);
      return;
    }
    context.results = JSON.stringify(rows);
    console.log(context);
    res.render('managetrainers', context)
  });
});

app.get('/mngplans',function(req,res){                // render manage plans page when you visit mngclients url
  res.render('managexerciseplans', {});
});

app.get('/srchclients',function(req,res){                // render search clients page when you visit mngclients url
  res.render('searchclients', {});
});

app.use(function(req,res){
  res.status(404);
  res.render('404');
});

app.use(function(err, req, res, next){
  console.error(err.stack);
  res.type('plain/text');
  res.status(500);
  res.render('500');
});

app.listen(app.get('port'), function(){
  console.log('localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
  
});