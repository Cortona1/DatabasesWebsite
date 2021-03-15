-- This file contains all the used data manipulation queries for various things such as searching, inserting, updating, deleting, etc.
-- Names starting with a colon : denote input fields that would be recieved by the backend of the site.


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



-- Delete Queries

-- Deleting certifications from TrainerCerts intersection table and then deleting certifications from the Certification table itself

DELETE FROM TrainerCerts WHERE TrainerCerts.CertID = :CertID AND TrainerID = :TrainerID;
DELETE FROM Certifications WHERE CertTitle = ':CertTitle';

-- Deleting a row from the Trainer table

DELETE FROM Trainers WHERE TrainerID = :TrainerID;


-- Deleting rows in the ClientPlans table which has a relationship between clients and exercise plans

DELETE FROM ClientPlans WHERE ClientPlans.ClientID = :ClientID;

-- Deleting a client form the Clients table

DELETE FROM Clients WHERE Clients.ID = :ClientID;



-- Delete END





-- Update Queries


-- Updating Clients table to set their assigned Trainer to Null
UPDATE Clients
SET Clients.TrainerID  = Null
WHERE Clients.TrainerID = :TrainerID;

-- Updating Clients table to set the TrainerID to a valid TrainerID FK from the Trainers table
UPDATE Clients
SET Clients.TrainerID  = :TrainerID
WHERE ClientID = :ClientID;


-- Update END



-- Get Queries

-- Select everything from the Certificaitons table
SELECT * FROM Certifications;

-- Select everything from the Trainers table
SELECT * FROM Trainers;

-- Select everything from the Exercise Plans table
SELECET * FROM ExercisePlans;

-- Select ClientID, ClientEmail, ClientLN, and ClientFN from the clients table and TrainerLN, TrianerFN, TrainerEmail from Trainers
-- and CertTitle from the Certifications table through a left join that combines these three tables into one

SELECT Clients.ClientID, Clients.ClientEmail, Clients.ClientLN, Clients.ClientFN, Trainers.TrainerFN, Trainers.TrainerLN, ExercisePlans.ExerciseGoal
FROM Clients 
lEFT JOIN Trainers ON Clients.TrainerID = Trainers.TrainerID 
LEFT JOIN ClientPlans ON Clients.ClientID = ClientPlans.ClientID 
LEFT JOIN ExercisePlans ON ClientPlans.ExerciseID = ExercisePlans.ExerciseID;


-- Select TrainerID, TrainerFN, TrainerLN, and TrainerEmail from Trainers and CertID and CertTitle from Certifications table and combine
-- them into one table via left joins 


SELECT Trainers.TrainerID, Certifications.CertID, Trainers.TrainerFN, Trainers.TrainerLN, Trainers.TrainerEmail, Certifications.CertTitle 
FROM Trainers 
LEFT JOIN TrainerCerts ON Trainers.TrainerID = TrainerCerts.TrainerID
LEFT JOIN Certifications ON TrainerCerts.CertID = Certifications.CertID';



-- Searching for Client through different filters queries

-- Get client by last name

SELECT * FROM Clients WHERE ClientLN = :ClientLN;

-- Get client by first name

SELECT * FROM Clients WHERE ClientFN = :ClientFN;

-- Get client by their email

SELECT * FROM Clients WHERE ClientEmail = :ClientEmail;

-- Get Client by their Trainer by querying the FK for Trainers in the Clients table via a subquery

SELECT * FROM Clients WHERE Clients.TrainerID = (SELECT TrainerID FROM Trainers WHERE TrainerFN = :TrainerFN and TrainerLN = :TrainerLN);

-- Get END






