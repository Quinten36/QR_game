// const express = require('express');
import pkg from 'express';
import dotenv from 'dotenv';

dotenv.config();
const express = pkg;

export const app = express();
export {dotenv};



console.log(process.env.__dirname)
app.get('/', function(req, res) { 
    res.sendFile(process.env.__dirname + '/client/index.html');
});
app.get('/v', function(req, res) { 
    res.sendFile(process.env.__dirname + '/client/indexV.html');
});
app.get('/admin', function(req, res) { 
    res.sendFile(process.env.__dirname + '/client/admin.html');
});
// app.get('/', function(req, res) { res.sendFile('F:/.Projects/basicUserSystem/client/index.html') });
app.use(express.static('client'));

