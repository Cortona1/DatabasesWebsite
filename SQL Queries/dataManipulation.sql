


-- Inserting into table queries

-- Trainers table
INSERT INTO `Trainers` (TrainerLN, TrainerFN, TrainerEmail)
VALUES (:TrainerLN, :TrainerFN, :TrainerEmail);

-- Clients table
INSERT INTO `Clients` (ClientFN, ClientLN, ClientEmail)
VALUES (:ClientFN, :ClientLN, :ClientEmail);

-- Certifications table
INSERT INTO `Certifications` (CertTitle)
VALUES (:CertTitle);

-- TrainerCerts table
INSERT INTO `TrainerCerts` (TrainerID, CertID)
VALUES (:TrainerID, :CertID);

-- ExercisePlans table
INSERT INTO ExercisePlans (ExerciseGoal) VALUES (:ExerciseGoal);

-- ClientPlans table
INSERT INTO ClientPlans (ClientID, ExerciseID) VALUES (:ClientID, :ExerciseID);


-- Inserting END



-- Manipulation queries for searching for clients by client's columns on search clients page


-- Select clients by first name
SELECT * FROM Clients WHERE ClientFN = ':ClientFN';

-- Select clients by last name
SELECT * FROM Clients WHERE ClientLN = ':ClientLN';

-- Select clients by email
SELECT * FROM Clients WHERE ClientEmail = ':ClientEmail';

-- Select clients by assigned Trainer
SELECT * FROM Clients WHERE Clients.TrainerID = (SELECT TrainerID FROM Trainers WHERE TrainerFN = ':TrainerFN' and TrainerLN = ':TrainerLN')


-- Manipulation queries for removing certifications

DELETE FROM TrainerCerts WHERE TrainerCerts.CertID = (SELECT CertID FROM Certifications WHERE CertTitle = ':CertTitle');
DELETE FROM Certifications WHERE CertTitle = ':CertTitle';



-- Manipulation queries for removing / assigning trainer from /to client

UPDATE Clients
SET Clients.TrainerID  = Null
WHERE Clients.TrainerID = (SELECT TrainerID FROM Trainers WHERE TrainerFN = ':TrainerFN' AND TrainerLN = ':TrainerLN');


UPDATE Clients
SET Clients.TrainerID  = (SELECT TrainerID FROM Trainers WHERE TrainerFN = ':TrainerFN' and TrainerLN = ':TrainerLN' AND TrainerEmail = ':TrainerEmail')
WHERE ClientID = (SELECT ClientID FROM Clients WHERE ClientFN = ':ClientFN' AND ClientLN = ':ClientLN' AND ClientEmail = ':ClientEmail');



-- queries for selecting Trainers

SELECT * FROM Trainers


-- queries for selecting Trainers in a table with their respective certification they have


SELECT Trainers.TrainerFN, Trainers.TrainerLN, Trainers.TrainerEmail, Certifications.CertTitle FROM Trainers

LEFT JOIN TrainerCerts ON Trainers.TrainerID = TrainerCerts.TrainerID

LEFT JOIN Certifications ON TrainerCerts.CertID = Certifications.CertID;






--Deleting Trainers


--Update Client's Trainer column to null if their trainer is the one being removed

UPDATE Clients SET TrainerID = NULL WHERE Clients.TrainerID = :TrainerID; 


--Delete row in trainercerts where the trainerID is the trainer ID of the trainer being removed

DELETE FROM TrainerCerts WHERE TrainerID = :TrainerID;


--Finally delete the trainer from trainers table where the id is the id of the trainer being removed

DELETE FROM Trainers WHERE TrainerID = :TrainerID;



-- Removing Cerification from Trainer

DELETE FROM TrainerCerts WHERE CertID = ? AND TrainerID = ?;



-- Deleting a certificaiton


--Delete the row in trianerCerts where certID is the id of the ceritfication to be deleted

DELETE FROM TrainerCerts WHERE CertID = :CertID;


--Delete the row in the certificaiton table where certid is the id of the certificaiton to be deleted

DELETE FROM Certifications WHERE CertID = :CertID;




-- Selecting Clients info with full trainer name and their respective exercise plan

SELECT Clients.ClientID, Clients.ClientEmail, Clients.ClientLN, Clients.ClientFN, Trainers.TrainerFN, Trainers.TrainerLN, ExercisePlans.ExerciseGoal 
FROM Clients
lEFT JOIN Trainers ON Clients.TrainerID = Trainers.TrainerID
LEFT JOIN ClientPlans ON Clients.ClientID = ClientPlans.ClientID
LEFT JOIN ExercisePlans ON ClientPlans.ExerciseID = ExercisePlans.ExerciseID;


--Removing a client's trainer

UPDATE Clients SET TrainerID = NULL WHERE Clients.ClientID = ?;


-- Delete a client

DELETE FROM ClientPlans WHERE ClientPlans.ClientID = ?;
DELETE FROM Clients WHERE Clients.ClientID = ?;

