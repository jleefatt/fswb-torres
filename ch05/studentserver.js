//studentserver.js 


const express = require('express')
const app = express()
const bodyParser = require('body-parser');
const fs = require('fs');
const glob = require("glob")

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static('./public'));


/** 
* @method POST
* @type post
* @param record_id
* @param first_name
* @param last_name
* @param gpa
* @param enrolled
* @description Method for adding a student by first & last name, GPA, & enrolled
*/

app.post('/students', function(req, res) {
  var record_id = new Date().getTime();

  var obj = {};
  obj.record_id = record_id;
  obj.first_name = req.body.first_name;
  obj.last_name = req.body.last_name;
  obj.gpa = req.body.gpa;
  obj.enrolled = req.body.enrolled;

  var str = JSON.stringify(obj, null, 2);

  fs.writeFile("students/" + record_id + ".json", str, function(err) {
    var rsp_obj = {};
    if(err) {
      rsp_obj.record_id = -1;
      rsp_obj.message = 'error - unable to create resource';
      return res.status(200).send(rsp_obj);
    } else {
      rsp_obj.record_id = record_id;
      rsp_obj.message = 'successfully created';
      return res.status(201).send(rsp_obj);
    }
  }); //end writeFile method
  
}); //end post method

/** 
* @description Method for getting students by record id
* @method GET
* @type get
* @param record_id
*/

app.get('/students/:record_id', function(req, res) {
  var record_id = req.params.record_id;

  fs.readFile("students/" + record_id + ".json", "utf8", function(err, data) {
    if (err) {
      var rsp_obj = {};
      rsp_obj.record_id = record_id;
      rsp_obj.message = 'error - resource not found';
      return res.status(404).send(rsp_obj);
    } else {
      return res.status(200).send(data);
    }
  });
}); 

function readFiles(files,arr,res) {
  fname = files.pop();
  if (!fname)
    return;
  fs.readFile(fname, "utf8", function(err, data) {
    if (err) {
      return res.status(500).send({"message":"error - internal server error"});
    } else {
      arr.push(JSON.parse(data));
      if (files.length == 0) {
        var obj = {};
        obj.students = arr;
        return res.status(200).send(obj);
      } else {
        readFiles(files,arr,res);
      }
    }
  });  
}

/** 
* @description Method for getting students by file server 
* @method GET_ALL_STUDENTS
* @type get
* @param filesread
*/

app.get('/students', function(req, res) {
  var obj = {};
  var arr = [];
  filesread = 0;

  glob("students/*.json", null, function (err, files) {
    if (err) {
      return res.status(500).send({"message":"error - internal server error"});
    }
    readFiles(files,[],res);
  });

});

/** 
* @method PUT 
* @type put
* @param record_id
* @param first_name
* @param last_name
* @param gpa
* @param enrolled
* @description Method for updating a student record
*/

app.put('/students/:record_id', function(req, res) {
  var record_id = req.params.record_id;
  var fname = "students/" + record_id + ".json";
  var rsp_obj = {};
  var obj = {};

  obj.record_id = record_id;
  obj.first_name = req.body.first_name;
  obj.last_name = req.body.last_name;
  obj.gpa = req.body.gpa;
  obj.enrolled = req.body.enrolled;

  var str = JSON.stringify(obj, null, 2);

  //check if file exists
  fs.stat(fname, function(err) {
    if(err == null) {

      //file exists
      fs.writeFile("students/" + record_id + ".json", str, function(err) {
        var rsp_obj = {};
        if(err) {
          rsp_obj.record_id = record_id;
          rsp_obj.message = 'error - unable to update resource';
          return res.status(200).send(rsp_obj);
        } else {
          rsp_obj.record_id = record_id;
          rsp_obj.message = 'successfully updated';
          return res.status(201).send(rsp_obj);
        }
      });
      
    } else {
      rsp_obj.record_id = record_id;
      rsp_obj.message = 'error - resource not found';
      return res.status(404).send(rsp_obj);
    }

  });

}); //end put method

/** 
* @description Method for deleting a student by record id
* @method DELETE
* @type delete
* @param record_id
*/

app.delete('/students/:record_id', function(req, res) {
  var record_id = req.params.record_id;
  var fname = "students/" + record_id + ".json";

  fs.unlink(fname, function(err) {
    var rsp_obj = {};
    if (err) {
      rsp_obj.record_id = record_id;
      rsp_obj.message = 'error - resource not found';
      return res.status(404).send(rsp_obj);
    } else {
      rsp_obj.record_id = record_id;
      rsp_obj.message = 'record deleted';
      return res.status(200).send(rsp_obj);
    }
  });

}); //end delete method

app.listen(5678); //start the server
console.log('Server is running..');
console.log(`Server is running on http://localhost:${server.address().port}`);