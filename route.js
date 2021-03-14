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


const insertQuery='INSERT INTO workouts (`name`, `reps`, `weight`, `date`, `lbs`) VALUES (?,?,?,?,?)';
const getAllCerts='SELECT * FROM Certifications';
const getAllTrainers = 'SELECT * FROM Trainers';
const getAllClients = 'SELECT Clients.ClientID, Clients.ClientEmail, Clients.ClientLN, Clients.ClientFN, Trainers.TrainerFN, Trainers.TrainerLN, ExercisePlans.ExerciseGoal FROM Clients lEFT JOIN Trainers ON Clients.TrainerID = Trainers.TrainerID LEFT JOIN ClientPlans ON Clients.ClientID = ClientPlans.ClientID LEFT JOIN ExercisePlans ON ClientPlans.ExerciseID = ExercisePlans.ExerciseID';
const insertClient = 'INSERT INTO Clients (`ClientFN`, `ClientLN`, `ClientEmail`) VALUES (?, ?, ?)';
const deleteClientPlan = 'DELETE FROM ClientPlans WHERE ClientPlans.ClientID = ?';
const deleteClient = 'DELETE FROM Clients WHERE Clients.ClientID = ?';
const getTrainersWithCerts = 'SELECT Trainers.TrainerID, Certifications.CertID, Trainers.TrainerFN, Trainers.TrainerLN, Trainers.TrainerEmail, Certifications.CertTitle FROM Trainers LEFT JOIN TrainerCerts ON Trainers.TrainerID = TrainerCerts.TrainerID LEFT JOIN Certifications ON TrainerCerts.CertID = Certifications.CertID';
const insertCert = 'INSERT INTO Certifications SET CertTitle = ?';
const insertTrainer = 'INSERT INTO `Trainers` (`TrainerLN`, `TrainerFN`, `TrainerEmail`) VALUES (?,?,?)';
const insertTrainerCert = 'INSERT INTO `TrainerCerts` (TrainerID, CertID) VALUES ((SELECT TrainerID from Trainers WHERE TrainerFN=? AND TrainerLN=?), (SELECT CertID from Certifications WHERE CertTitle = ?))';
const insertExercisePlan = 'INSERT INTO ExercisePlans (ExerciseGoal) VALUES (?)';
const insertClientPlan = 'INSERT INTO ClientPlans (ClientID, ExerciseID) VALUES ((SELECT ClientID from Clients WHERE ClientLN = ? AND ClientFN = ?),(SELECT ExerciseID FROM ExercisePlans WHERE ExerciseGoal = ?))';
const deleteClientExercisePlan = 'DELETE FROM ClientPlans WHERE ClientPlans.ClientID = ?';
const insertClientTrainer = 'UPDATE Clients SET TrainerID = (SELECT TrainerID from Trainers WHERE TrainerLN =? AND TrainerFN = ? AND TrainerEmail = ?) WHERE (ClientEmail = ?)';
const searchClientFN = 'SELECT * FROM Clients WHERE ClientFN = ?';
const searchClientLN = 'SELECT * FROM Clients WHERE ClientLN = ?';
const searchClientEmail = 'SELECT * FROM Clients WHERE ClientEmail = ?';
const searchClientTrainer = 'SELECT * FROM Clients WHERE Clients.TrainerID = (SELECT TrainerID FROM Trainers WHERE TrainerFN = ? and TrainerLN = ?)';

const removeClientTrainerByEmail= 'UPDATE Clients SET Clients.TrainerID = Null WHERE (Clients.TrainerID = (SELECT TrainerID FROM Trainers WHERE Trainers.TrainerEmail = ?))';
const removeClientTrainerV2 = 'UPDATE Clients SET TrainerID = NULL WHERE Clients.ClientID = ?'; 
// queries for deleting Trainers from Trainers, TrainerCerts, and from Clients

const removeClientTrainer = 'UPDATE Clients SET TrainerID = NULL WHERE Clients.TrainerID = ?'; 
const deleteTrainerCert  = 'DELETE FROM TrainerCerts WHERE TrainerID = ?';
const deleteTrainer = 'DELETE FROM Trainers WHERE TrainerID = ?'

// queries for deleting Certifications from TrainerCerts, and Certifications

const deleteCertTrainer = 'DELETE FROM TrainerCerts WHERE CertID = ?';
const deleteCert = 'DELETE FROM Certifications WHERE CertID = ?';

// remove certificaiton from a specific trainer only

const removeTrainerCert = 'DELETE FROM TrainerCerts WHERE CertID = ? AND TrainerID = ?';

// check if client plan exist 
//const checkClientPlan = 'SELECT COUNT(1) FROM ClientPlans WHERE ClientPlans.ClientID = (SELECT ClientID FROM Clients WHERE Clients.ClientEmail = ?)';

//updated trainer certs insertion
const insertTrainerCertUpdated = 'INSERT INTO `TrainerCerts` (TrainerID, CertID) VALUES (?,?)';

// new revised insert query
const newInsertClientPlans = 'INSERT INTO ClientPlans (ClientID, ExerciseID) VALUES (?,?)';

// get all exercise plans query
const getAllExercisePlans = 'SELECT * FROM ExercisePlans';

app.get('/',function(req,res){
  res.render('index', {});
});


app.get('/home',function(req,res){                    // render home page when you visit the home url 
  res.render('index', {});
});


app.get('/certs',certPage);

function certPage(req,res){
  var context = {};
  mysql.pool.query(getAllCerts, function(err, rows, fields){   
    if (err){
      res.status(500).send("ServerError");
      return;
    }
    context.results = rows;
    console.log(context);
    res.render('certs', context)
  }); 
}

app.post('/certs', function(req, res){
    mysql.pool.query(insertCert, [req.body.name], function(err,rows,fields){
    certPage(req,res);
    })
})



app.delete('/certs/:id', function(req, res) {
  var context = {};
  mysql.pool.query(deleteCertTrainer, [req.params.id], function(err, rows, fields) {
    if (err) {
      next(err);
      return;
    }
  });

  mysql.pool.query(deleteCert, [req.params.id], function(err, rows, fields) {
    if (err) {
      next(err);
      return;
    }
  });

  certPage(req,res);
});


//Citation for the following function:
//Date: 3/14/2021
// Adapted from /OR/ Based on:
//Source URL: http://www.oregonstate.edu/courses/1784187

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

app.post('/clients', function(req, res) {
  console.log(req.body);
  mysql.pool.query(insertClient, [req.body.Fname, req.body.Lname, req.body.email], function(err, rows, fields) {
    var context = {};
    mysql.pool.query(getAllClients, function(err, rows, fields) {
      if (err) {
        next(err);
        return;
      }
      context.results = rows;
      console.log(JSON.stringify(context));
      res.render('clients', context);
    });
    if (err) {
      console.log(JSON.stringify(err));
      return;
    }
  });
});

app.delete('/clients/:ClientID', function(req, res) {
  context = {}
  console.log("got to delete clients page!")
  
  mysql.pool.query(deleteClientExercisePlan, [req.params.ClientID], function(err,rows,fields) {
    if (err) {
      next(err);
      return;
    }
  });

  mysql.pool.query(deleteClient, [req.params.ClientID], function(err,rows,fields) {
    if (err) {
      next(err);
      return;
    }
  });

  mysql.pool.query(getAllClients, function(rows,fields) {
    context.results = rows;
    res.render('clients', context);
  });
});

app.get('/mngclients',function(req,res){                // render manage clients page when you visit mngclients url
  var context = {};
  mysql.pool.query(getAllClients, function(err, rows, fields) {
    if (err) {
      next(err);
      return;
    }
    context.results = rows;
    context.trainers = rows.filter(row => row.TrainerFN != null);
    console.log(context)
    res.render('manageclients', context);
  });
});

app.delete('/mngclients/:id', function(req, res) {
  context = {};
  console.log(req.body);
  mysql.pool.query(removeClientTrainerV2, [req.params.id], function(err, rows, fields) {
  if (err) {
    next(err);
    return;
  }});

  mysql.pool.query(getAllClients, function(err, rows, fields){
    if (err) {
      next(err);
      return;
    }
    context.results = rows;
    console.log(context);
    res.render('manageclients', context);
  })
})


function manageTrainersPage(req,res){
  var context = {};
  mysql.pool.query(getAllClients, function(err, rows, fields){ 
    if (err){
      res.status(500).send("ServerError");
      return;
    }
    context.results = rows;
    console.log(context);
    res.render('manageclients', context);
  }); 
}

app.post('/mngclients', function(req, res) {
  console.log(req.body);
  mysql.pool.query(insertClientTrainer, [req.body.TrainerLN, req.body.TrainerFN,req.body.TrainerEmail, req.body.ClientEmail], function(err,rows,fields){
  manageTrainersPage(req,res);
  })

})



app.delete('/trainers/:id', function(req, res) {
  var context = {};
  mysql.pool.query(removeClientTrainer, [req.params.id], function(err, rows, fields) {
    if (err) {
      next(err);
      return;
    }
  });

  mysql.pool.query(deleteTrainerCert, [req.params.id], function(err, rows, fields) {
    if (err) {
      next(err);
      return;
    }
  });


  mysql.pool.query(deleteTrainer, [req.params.id], function(err, rows, fields) {
    if (err) {
      next(err);
      return;
    }
  });

  trainerPage(req,res);

});



app.get('/trainers',trainerPage);

function trainerPage(req,res){
  var context = {};
  mysql.pool.query(getAllTrainers, function(err, rows, fields){ 
    if (err){
      res.status(500).send("ServerError");
      return;
    }
    context.results = rows;
    console.log(context);
    res.render('trainers', context);
  }); 
}


app.post('/trainers', function(req, res){
    console.log(req.body);
    mysql.pool.query(insertTrainer, [req.body.TrainerLN, req.body.TrainerFN,req.body.TrainerEmail], function(err,rows,fields){
    trainerPage(req,res);
    })
})

app.get('/mngtrainers',function(req,res){                // render manage trainers page when you visit mngclients url
  var context = {};
  mysql.pool.query(getTrainersWithCerts, function(err, rows, fields){
    context.results = rows;
    mysql.pool.query(getAllCerts, function(err, rows, fields){
      context.certs = rows;
      console.log(context);
      
      mysql.pool.query(getAllTrainers, function(err, rows, fields){
      context.trainers = rows;
      console.log(context);
      res.render('managetrainers', context); 
      });
    });
  });

});

app.delete('/mngtrainers/:CertID:TrainerID', function(req, res) {
  var context = {};
  console.log("Got to manage trainers delete route");
  console.log(req.params);
  mysql.pool.query(removeTrainerCert, [req.params.CertID, req.params.TrainerID], function(err, rows, fields) {
    if (err) {
      next(err);
      return;
    }
  });

  mysql.pool.query(getTrainersWithCerts, function(err, rows, fields){ 
  if (err){
    next(err);
    return;
  }
  context.results = rows;
  res.render('managetrainers', context);
  });

});


function TrainerCertPage(req,res){
  var context = {};
  mysql.pool.query(getTrainersWithCerts, function(err, rows, fields){
    context.results = rows;
    mysql.pool.query(getAllCerts, function(err, rows, fields){
      context.certs = rows;
      console.log(context);
      
      mysql.pool.query(getAllTrainers, function(err, rows, fields){
      context.trainers = rows;
      console.log(context);
      res.render('managetrainers', context); 
      });
    });
  });
}


function ManagePlanPage(req,res){
  var context = {};
  mysql.pool.query(getAllClients, function(err, rows, fields) {
    if (err) {
      next(err);
      return;
    }
    context.results = rows;
    mysql.pool.query(getAllExercisePlans, function(err, rows, fields) {
    context.ExerciseGoal = rows;
    console.log(context);
    res.render('managexerciseplans', context);
   });   
  });
}


app.post('/mngtrainers', function(req, res){
    console.log(req.body);
    mysql.pool.query(insertTrainerCertUpdated, [req.body.TrainerID, req.body.CertID], function(err,rows,fields){
    TrainerCertPage(req,res);
    });
})

app.post('/mngplans', function(req, res){
    console.log(req.body);

    mysql.pool.query(deleteClientPlan, [req.body.ClientID], function(err,rows,fields){
    mysql.pool.query(newInsertClientPlans, [req.body.ClientID,req.body.ExerciseID], function(err,rows,fields){
    ManagePlanPage(req,res)
    });
    });
});

app.get('/mngplans',function(req,res){                
  var context = {};
  mysql.pool.query(getAllClients, function(err, rows, fields) {
    if (err) {
      next(err);
      return;
    }
    context.results = rows;
    mysql.pool.query(getAllExercisePlans, function(err, rows, fields) {
    context.ExerciseGoal = rows;
    console.log(context);
    res.render('managexerciseplans', context);
   });   
  });
});

app.delete('/mngplans/:id', function(req, res) {
  var context = {};
  mysql.pool.query(deleteClientExercisePlan, [req.params.id], function(err, rows, fields) {
    if (err) {
      next(err);
      return;
    }
    context.results = rows;
    res.render('managexerciseplans', context);
  })
})



app.post('/srchclients', function(req, res){
    console.log(req.body);

    var count = Object.keys(req.body).length;
    console.log(count);

    if ((count == 2) && ((Object.keys(req.body)[0]) === "ClientFN")){                            // check if they searched by client name
        console.log("Sucess!");
        var context = {};
        mysql.pool.query(searchClientFN, [req.body.ClientFN], function(err,rows,fields){
          if (err) {
            next(err);
            return;
          }
        context.results = rows;
        console.log(context);

        mysql.pool.query(getAllTrainers, function(err, rows, fields) {
        if (err) {
        next(err);
        return;
        }
        context.trainers = rows;
        console.log(context);
        res.render('searchclients', context);
  });
  });}

  if ((count == 2) && ((Object.keys(req.body)[0]) === "ClientLN")){                            // check if they searched by client last name
        console.log("Sucess!");
        var context = {};
        mysql.pool.query(searchClientLN, [req.body.ClientLN], function(err,rows,fields){
          if (err) {
            next(err);
            return;
          }
        context.results = rows;
        console.log(context);

        mysql.pool.query(getAllTrainers, function(err, rows, fields) {
        if (err) {
        next(err);
        return;
        }
        context.trainers = rows;
        console.log(context);
        res.render('searchclients', context);
  });    
  });}

  if ((count == 2) && ((Object.keys(req.body)[0]) === "ClientEmail")){                            // check if they searched by client email
        console.log("Sucess!");
        var context = {};
        mysql.pool.query(searchClientEmail, [req.body.ClientEmail], function(err,rows,fields){
          if (err) {
            next(err);
            return;
          }
        context.results = rows;
        
        mysql.pool.query(getAllTrainers, function(err, rows, fields) {
        if (err) {
        next(err);
        return;
        }
        context.trainers = rows;
        console.log(context);
        res.render('searchclients', context);
  });
  });}

  console.log("got here sear")
  console.log(req.body);
  console.log("the count is", count);

  if ((Object.keys(req.body)[0] == "TrainerFullName")) {
    console.log("YES");
    var fullName = req.body.TrainerFullName;
    commaLocation = "test";

    for (i=0; i < fullName.length; i++) {
        if (fullName[i] == ",") {
          commaLocation = i;
          break; 
        }
    }

    console.log("The comma is at this index", commaLocation);

    firstName = '';
    lastName = '';
    helperCounter = 0;

    while (helperCounter < commaLocation) {   
      firstName += fullName[helperCounter];
      helperCounter+=1;
    }
    console.log(firstName);

    helperCounter = commaLocation + 1;

    while (helperCounter < fullName.length) {   
      lastName += fullName[helperCounter];
      helperCounter+=1;
    }
    console.log(lastName);
    req.body.newFName = firstName;
    req.body.newLName = lastName;
    console.log(req.body.newFName);
    console.log(req.body.newLName);

    var context = {};
        mysql.pool.query(searchClientTrainer, [req.body.newFName, req.body.newLName], function(err,rows,fields){
          if (err) {
            next(err);
            return;
          }
        context.results = rows;
        console.log("This is context")
        console.log(context);
        mysql.pool.query(getAllTrainers, function(err, rows, fields) {
        if (err) {
        next(err);
        return;
        }
        context.trainers = rows;
        console.log(context);
        res.render('searchclients', context);
  });
});
};});

app.get('/srchclients',function(req,res){                // render search clients page when you visit mngclients url
  var context = {};
  mysql.pool.query(getAllTrainers, function(err, rows, fields) {
    if (err) {
      next(err);
      return;
    }
    context.trainers = rows;
    console.log(context);
    res.render('searchclients', context);
  });
});


app.get('/exerciseplans',function(req,res){                // render search clients page when you visit mngclients url
  var context = {};
  mysql.pool.query(getAllExercisePlans, function(err, rows, fields) {
    if (err) {
      next(err);
      return;
    }
    context.results = rows;
    res.render('exerciseplans', context);
  });
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