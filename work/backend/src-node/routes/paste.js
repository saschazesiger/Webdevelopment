const express = require("express");
const crypto = require("crypto");
const { handleAsync } = require("../util");
const { executeQuery } = require("../db");
const { exit } = require("process");
const { request } = require("http");
const { exec } = require("child_process");
const { access } = require("fs");

const pasteRouter = express.Router();

// Example route that can be deleted or adapted.
// This can be called via GET http://localhost:4000/api/paste/blubb
pasteRouter.get(
  "/:var1",
  handleAsync(async (req, res, next) => {
    let var1 = req.params.var1
    const results = await executeQuery(
      "SELECT id, content, content_type,encoding,expiration, title,created_at,updated_at,access_token from paste where access_token = ?",
      [var1]
    );

    if (!results[0]) {
      res.status(404).json({ "error": "Paste not found" })
    }
    olddate = new Date(results[0].expiration)
    newdate = new Date()
    if (olddate < newdate) {
      res.status(404).json({ "error": "Paste not found" })
    } else {
      res.send(results[0]);
    }

  })
);

pasteRouter.post('/', (req, res) => {

  const reqbody = req.body
  const datenow = new Date()
  const dateexp = new Date(reqbody.expiration)

  if (!reqbody.content_type) {
    reqbody.content_type = "text/plain"
  } else if (reqbody.content_type != "text/plain" && reqbody.content_type != "application/json") {
    res.status(400).json({ "error": "Request body is not valid.", "invalid": true, "violations": { "content_type": { "message": "Attribute must be one of empty, text/plain, application/json" } } })
    return
  }

  if (!reqbody.encoding) {
    reqbody.encoding = "UTF-8"
  } else if (reqbody.encoding.toLowerCase() != "utf-8") {
    res.status(400).json({ "error": "Request body is not valid.", "invalid": true, "violations": { "encoding": { "message": "Attribute must be one of empty, UTF-8" } } })
    return
  }

  if (!reqbody.expiration) {
    reqbody.expiration = new Date()
    reqbody.expiration.setHours(reqbody.expiration.getHours() + 24)
  } else if (dateexp < datenow) {
    res.status(400).json({ "error": "Request body is not valid.", "invalid": true, "violations": { "expiration": { "message": `Attribute must be greater than ${datenow}.` } } })
    return
  }

  if (!reqbody.title) {
    reqbody.title = ""
  } else if (reqbody.title.length > 50) {
    res.status(400).json({ "error": "Request body is not valid.", "invalid": true, "violations": { "title": { "message": `Attribute must be at most 50 characters long.` } } })
    return
  }

  if (!reqbody.content) {
    res.status(400).json({ "error": "Request body is not valid.", "invalid": true, "violations": { "content": { "message": `Attribute is required` } } })
    return
  } else if (reqbody.content.length > 1048576) {
    res.status(400).json({ "error": "Request body is not valid.", "invalid": true, "violations": { "content": { "message": `Attribute must be at most 1048576 characters long.` } } })
    return
  }


  datetime = new Date()
  const id = crypto.randomUUID()
  const access_token = crypto.randomUUID()
  const edit_token = crypto.randomUUID()
  jsonvar = { "created_at": datetime, "updated_at": datetime, "id": id, "access_token": access_token, "edit_token": edit_token, "content": reqbody.content, "title": reqbody.title, "expiration": reqbody.expiration, "content_type": reqbody.content_type, "encoding": reqbody.encoding }
  const query = executeQuery('INSERT INTO paste(id,content,content_type,encoding,expiration,title,created_at,updated_at,access_token,edit_token) VALUES (?,?,?,?,?,?,?,?,?,?)',[id,reqbody.content,reqbody.content_type,reqbody.encoding,reqbody.expiration,reqbody.title,reqbody.created_at,reqbody.updated_at,access_token,edit_token])
  res.status(201).json(jsonvar)

}
)

pasteRouter.delete(
  "/:var1",
  handleAsync(async (req, res, next) => {
  key = req.params.var1
  ekey = req.header('X-PASTE-EDIT-TOKEN')

  const query = await executeQuery("SELECT id FROM paste WHERE edit_token = ?",[ekey])
  if(query[0]){
    res.status(204)
  }else{
    res.status(401).json({"error": "Edit token does not match. Please specify the header X-PASTE-EDIT-TOKEN."})
  }
  
}))

pasteRouter.post(
  "/:var1/fork",
  handleAsync(async (req, res, next) => {
  key = req.params.var1
  ekey = req.header('X-PASTE-EDIT-TOKEN')

  const query = await executeQuery("SELECT * FROM paste WHERE access_token = ?",[key])
  if(query[0]){
    const id = crypto.randomUUID()
    const access_token = crypto.randomUUID()
    const edit_token = crypto.randomUUID()
    const created =  new Date()
    const updated = new Date()
    const olddate = new Date(req.body.expiration)
    let expiration = ""
    if(!req.body.expiration){
    expiration = new Date()
    expiration.setHours(expiration.getHours() + 24);
    }else{
      if(olddate < created){
        res.status(400).json({ "error": "Request body is not valid.", "invalid": true, "violations": { "expiration": { "message": `Attribute must be greater than ${created}.` } } })
        return
      }
      expiration =  req.body.expiration
    }
    const query2 = executeQuery('INSERT INTO paste(id,content,content_type,encoding,expiration,title,created_at,updated_at,access_token,edit_token) VALUES (?,?,?,?,?,?,?,?,?,?)',[id,query[0].content,query[0].content_type,query[0].encoding,expiration,query[0].title,created,updated,access_token,edit_token])
    const query3 = await executeQuery("SELECT * FROM paste WHERE access_token = ?",[access_token])
    res.status(201).json(query3[0])
  }else{
    res.status(404).json({ "error": "Paste not found" })
  }
  
}))


module.exports = { pasteRouter };
