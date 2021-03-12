
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `ClientPlans`;
DROP TABLE IF EXISTS `ExercisePlans`;
DROP TABLE IF EXISTS `Clients`;
DROP TABLE IF EXISTS `TrainerCerts`;
DROP TABLE IF EXISTS `Certifications`;
DROP TABLE IF EXISTS `Trainers`;
SET FOREIGN_KEY_CHECKS = 1;

-- Create Trainers table
CREATE TABLE `Trainers` (
    `TrainerID` INT(11) NOT NULL AUTO_INCREMENT,
    `TrainerLN` VARCHAR(255) NOT NULL,
    `TrainerFN` VARCHAR(255) NOT NULL,
    `TrainerEmail` VARCHAR(255) NOT NULL,
    PRIMARY KEY (`TrainerID`),
    UNIQUE (TrainerEmail)
);

-- Create Clients table
CREATE TABLE `Clients` (
    `ClientID` INT(11) NOT NULL AUTO_INCREMENT,
    `ClientEmail` VARCHAR(255) NOT NULL,
    `ClientLN` VARCHAR(255) NOT NULL,
    `ClientFN` VARCHAR(255) NOT NULL,
    `TrainerID` INT(11),
    PRIMARY KEY (`ClientID`),
    FOREIGN KEY (`TrainerID`) REFERENCES `Trainers`(`TrainerID`),
    UNIQUE (ClientEmail)
);

-- Create Certifications table
CREATE TABLE `Certifications` (
    `CertID` INT(11) NOT NULL AUTO_INCREMENT,
    `CertTitle` VARCHAR(255) NOT NULL,
    PRIMARY KEY (`CertID`),
    UNIQUE (CertTitle)
);

-- Create TrainerCerts table
CREATE TABLE `TrainerCerts` (
    `TrainerID` INT(11) NOT NULL,
    `CertID` INT(11) NOT NULL,
    FOREIGN KEY (`TrainerID`) REFERENCES `Trainers`(`TrainerID`),
    FOREIGN KEY (`CertID`) REFERENCES `Certifications`(`CertID`),
    CONSTRAINT TrainerCertKey UNIQUE (`TrainerID`, `CertID`)
);



-- Create ExercisePlans table
CREATE TABLE `ExercisePlans` (
    `ExerciseID` INT(11) NOT NULL AUTO_INCREMENT,
    `ExerciseGoal` VARCHAR(255) NOT NULL,
    PRIMARY KEY (`ExerciseID`),
    UNIQUE (ExerciseGoal)
);

-- Create ClientPlans table
CREATE TABLE `ClientPlans` (
    `ClientID` INT(11) NOT NULL,
    `ExerciseID` INT(11) NULL,
    FOREIGN KEY (`ClientID`) REFERENCES `Clients`(`ClientID`),
    FOREIGN KEY (`ExerciseID`) REFERENCES `ExercisePlans`(`ExerciseID`),
    UNIQUE (ClientID)
);



-- Insert pre-populated data into the database


-- Insert certifications into table

INSERT INTO Certifications(CertTitle) VALUES ("NASM"),("ACE"),("ISSA");

-- Insert clients into table
INSERT INTO Clients (ClientEmail, ClientLN, ClientFN) VALUES ('JandJ@gmail.com', 'Joseph', 'John'),
 ('JandG@gmail.com', 'Glafira', 'Jervis'),
 ('TandB@gmail.com', 'Blanco', 'Tracy');



-- Insert Trainers into table
INSERT INTO Trainers (TrainerLN, TrainerFN, TrainerEmail) VALUES ('Romero', 'Boyd', 'bromero@gmail.com'),
 ('Rodriguez', 'Christina', 'crodriguez@gmail.com'), ('Kohl', 'Josh', 'jkhol@gmail.com');


-- Insert assigned trainers to clients

UPDATE Clients SET TrainerID = (SELECT TrainerID from Trainers WHERE TrainerLN ='Romero' AND TrainerFN = 'Boyd') WHERE (ClientEmail = 'JandJ@gmail.com');
UPDATE Clients SET TrainerID = (SELECT TrainerID from Trainers WHERE TrainerLN ='Rodriguez' AND TrainerFN = 'Christina') WHERE (ClientEmail = 'JandG@gmail.com');
UPDATE Clients SET TrainerID = (SELECT TrainerID from Trainers WHERE TrainerLN ='Kohl' AND TrainerFN = 'Josh') WHERE (ClientEmail = 'TandB@gmail.com');


-- Insert data into trainercerts table

INSERT INTO TrainerCerts (TrainerID, CertID) VALUES ((SELECT TrainerID from Trainers WHERE TrainerLN ='Romero' AND TrainerFN = 'Boyd'),
 (SELECT CertID from Certifications WHERE CertTitle = 'NASM'));

INSERT INTO TrainerCerts (TrainerID, CertID) VALUES ((SELECT TrainerID from Trainers WHERE TrainerLN ='Rodriguez' AND TrainerFN = 'Christina'),
 (SELECT CertID from Certifications WHERE CertTitle = 'ACE'));

INSERT INTO TrainerCerts (TrainerID, CertID) VALUES ((SELECT TrainerID from Trainers WHERE TrainerLN ='Kohl' AND TrainerFN = 'Josh'),
 (SELECT CertID from Certifications WHERE CertTitle = 'ISSA'));


-- Insert exercise goals

INSERT INTO ExercisePlans (ExerciseGoal) VALUES ('Gain muscle mass'), ('Lose fat'), ('Gain muscle but lose fat');


-- Insert into ClientPlans
INSERT INTO ClientPlans (ClientID, ExerciseID) VALUES ((SELECT ClientID from Clients WHERE ClientLN = 'Joseph' AND ClientFN = 'John'),
 (SELECT ExerciseID FROM ExercisePlans WHERE ExerciseGoal = 'Gain muscle mass'));

INSERT INTO ClientPlans (ClientID, ExerciseID) VALUES ((SELECT ClientID from Clients WHERE ClientLN = 'Glafira' AND ClientFN = 'Jervis'),
 (SELECT ExerciseID FROM ExercisePlans WHERE ExerciseGoal = 'Lose fat'));

INSERT INTO ClientPlans (ClientID, ExerciseID) VALUES ((SELECT ClientID from Clients WHERE ClientLN = 'Blanco' AND ClientFN = 'Tracy'),
 (SELECT ExerciseID FROM ExercisePlans WHERE ExerciseGoal = 'Gain muscle but lose fat'));

