document.addEventListener("DOMContentLoaded", bindButtons());

function bindButtons(){
	document.getElementById("myForm").addEventListener("submit", function (event) {
		event.preventDefault();
        var name = document.getElementById("toDoName").value;                                                       // pull value data from form entrys by id
        var reps = document.getElementById("toDoReps").value;
        var weight = document.getElementById("toDoWeight").value;
        var date = document.getElementById("toDoDate").value;
        var pounds= document.getElementById("pounds").checked;

        var repsString = "&reps=" + reps;
        var weightString = "&weight=" + weight;
        var dateString = "&date=" + date;
        var poundsString = "&lbs=" + pounds;

        
        var url = "http://localhost:3599/?name=" +name + repsString +weightString + dateString + poundsString;	// add the strings to the url so they can all be passed in the post request
        
        var myData = {
            name,reps,weight,date,lbs:pounds
        }
        console.log(JSON.stringify(myData));
        const method=document.getElementById("method").value;

        if (method == "put"){
            myData.id = document.getElementById("workout").value;
        }
        fetch("/",{
            method: method,
            headers: {"Content-Type":"application/json"},
            body: JSON.stringify(myData)
        }).then(format).then(display)                                                                           //documentation on fetch:https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
    });
}

function format(results){
	return results.json();
}

function display(results){
    console.log(results);
    let template ="<table>";

    template += createTitle();                                  // table needs to have a proper caption
    template += createHeader();                                 // table needs to have headers for identifying what each column represents

    results.rows.forEach(function(row){
        template += printRow(row);
    })
    template += "</table>";
	document.getElementById("testOutput").innerHTML = template;
}


function createTitle(){
    return `
    <caption>Your personal workout table</caption>
    `
}


function createHeader(){
    return `
    
    <tr>
    <th>Workout Name</th>
    <th>Reps</th>
    <th>Weight</th>
    <th>Date</th>
    <th>Metric</th>
    <th>Delete Row</th>
    <th>Edit Row</th>
    </tr>

    `
}
function printRow(row){
    let date = new Date(row.date);                          // convert it to a date
    return `
    <tr>
    <td>${row.name}</td>
    <td>${row.reps}</td>
    <td>${row.weight}</td>
    <td>${date.toLocaleDateString()}</td>
    <td>${row.lbs?"lbs":"kg"}</td>                                  
    <td><button onclick="deleteRow(this)" data-id="${row.id}">Delete</button></td>
    <td><a href="/edit/${row.id}">Edit</a></td>
    </tr>


    `;                                                          // if true lbs else kg for weight metric

}

function deleteRow(event){
    console.log(event.dataset);
    fetch("/?id="+event.dataset.id,{
        method: "delete",
        headers: {"Content-Type":"application/json"}
    }).then(getAll);
}

function getAll(){
    fetch("/all-data").then(format).then(display);               // get new table after deletion
}

getAll();
