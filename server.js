const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const bodyParserJson = bodyParser.json();

const app = express();
app.use(bodyParserJson);  // It will parse all the requests below

let contacts = [];
let settings = {
  contactsLastId:1
};

// get contacts
app.get("/contacts", function(req,res){  // get all contacts
  let responseBody = {
    Success: true,
    Error: "",
    Data: contacts
  }
  res.send(responseBody);
})
app.get("/contacts/:id", function(req,res){  // get a contact by id
  let contact = contacts.find(x => x.Id == req.params.id);
  let responseBody = {
    Success: true,
    Error: "",
    Data: contact
  }
  if(!contact){
    responseBody.Success = false;
    responseBody.Error = "Contact Not Found";
  }
  res.send(responseBody);
})

// add contact
app.post("/contacts", function(req, res){

  // any other validations should be here above push
  let responseBody = {
    Success: true,
    Error: "",
    Data: req.body
  }
  
  let validationResult = validateContact(req.body);
  responseBody.Success = validationResult.Success;
  responseBody.Error = validationResult.Error;

  if(responseBody.Success){
    req.body.Id = settings.contactsLastId ++;
    contacts.push(req.body);
    saveToDB();
  }

  res.send(responseBody);
})

// update contact
app.put("/contacts", function(req, res){  // put is common for updates
  let contact = contacts.find(x => x.Id == req.body.Id);
  let responseBody = {
    Success: true,
    Error: "",
    Data: contact
  }
  if(!contact){
    responseBody.Success = false;
    responseBody.Error = "Contact Not Found";
  }

  if (responseBody.Success) {
    let validationResult = validateContact(req.body);
    responseBody.Success = validationResult.Success;
    responseBody.Error = validationResult.Error;
  } 

  if (responseBody.Success) {
    contact.Name = req.body.Name;
    contact.Phone = req.body.Phone;
    saveToDB();
  }
  res.send(responseBody);
})

// delete contact
app.delete("/contacts/:id", function(req, res){  // put is common for updates
  let contactIndex = contacts.findIndex(x => x.Id == req.params.id);
  let responseBody = {
    Success: true,
    Error: "",
    Data: req.params.id
  }
  if(contactIndex == -1){  // it means If id is not exist
    responseBody.Success = false;
    responseBody.Error = "Contact Not Found";
  }

  if (responseBody.Success) {
    contacts.splice(contactIndex, 1);
    saveToDB();
  }
  res.send(responseBody);
})

// save db
function saveToDB(){
  fs.writeFile("contacts.db", JSON.stringify(contacts), function(err){
    if(err) 
      console.log(err);
  })
  fs.writeFile("settings.db", JSON.stringify(settings), function(err){
    if(err) 
      console.log(err);
  })
}

function loadFromDB(){
  fs.readFile("contacts.db", function(err, data){
    if(err)
      console.log(err);
    else
      contacts = JSON.parse(data);
  })
  fs.readFile("settings.db", function(err, data){
    if(err)
      console.log(err);
    else
      settings = JSON.parse(data);
  })
}
loadFromDB();

app.listen(8080);



function validateContact(contact){
  let validationResult = {Success: true, Error: ""};

  if(!contact.Name || contact.Name.length < 3){
    validationResult.Success = false;
    validationResult.Error = "Contact Name Should Be At Least 3 Characters";
  }

  let exists = contacts.find(x => x.Name == contact.Name);
  if(exists){
    validationResult.Success = false;
    validationResult.Error = "Contact Name Already Exists";
  }

  return validationResult;
}