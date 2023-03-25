import { app, dotenv } from './app.js';
import http from 'http';
import https from 'https';
import fs from 'fs';
import { Server } from 'socket.io';
import { insert, select, update } from './database.js';
import { uuid } from 'uuidv4';

var privateKey = fs.readFileSync('./certs/server.key', 'utf8');
var certificate = fs.readFileSync('./certs/server.crt', 'utf8');

var options = {
  key: privateKey,
  cert: certificate
};

const serv = http.Server(app);

serv.listen(process.env.PORT);

// const servs = https.Server(options, app);

// servs.listen(process.env.PORTHTTPS);
console.log("Server started");

var SOCKET_LIST = [];

/* -- Game -- */
/* -------------------------------------------------------------------------------------- */
global.Game = function (id) {
  let self = { id: id };
  Game.list[id] = self;
  return self;
};

Game.list = {};

Game.onConnect = async function (socket) {
  console.log('=[ Host connected      ' + socket.id);

  let games = await select("SELECT * FROM game");
  socket.emit('allgames', { games: games });

  // connectedControllers++;
  // connectedData[socket.id].status = 'controller';
  // socket.on('sectionChange', function (data) {
  //   activeSection = data.idsection;
  //   sectionChange();
  // });
  socket.on('command', async function (data) {
    let command = 'Unknown command from ' + socket.id + ': ' + data.command;
    switch (data.command) {
      case 'makeGame':
        command = 'game made';
        let v4 = uuid();
        await insert("INSERT INTO `game`(`ID`, `Name`, `TotalTeams`) VALUES ('"+v4+"','"+data.game+"', '"+data.totaalTeams+"')");
        socket.emit('gameChoice', {gameUUID: v4});
        break;
      case 'getAllPlayers':
        command = 'Getting all players';
        let players = await select("SELECT * FROM speler WHERE GameID = '"+data.game+"'")
        let teamSize = await select("SELECT TotalTeams FROM game WHERE ID = '"+data.game+"'")
        console.log(players)
        socket.emit('allPlayers', {players: players, totalTeams: teamSize})
        // updateOnceAll();
        break;
      case 'teamChoice':
        command = 'assigning team to a player';
        console.log(typeof data.team)
        await update("UPDATE `speler` SET `Team`="+parseInt(data.team)+" WHERE `ID` = '"+data.player+"'");
        //miss een update all?
        socket.emit('playerTeamUpdate', {player:data.player, team:data.team})
        break;
      case 'rebootServer':
        command = 'Reboot server';
        for (let i in SOCKET_LIST) {
          let socket = SOCKET_LIST[i];
          socket.emit('reboot');
        }
        process.exit(1);
        break;
    }
    console.log(`> Server command: ${command}`);
  });
  // Controller.updateOnce();
};

/* -- Player -- */
/* -------------------------------------------------------------------------------------- */
global.Player = function(id) {
  let self = { id: id }
  Player.list[id] = self;
  return self;
};

Player.list = {};

Player.onConnect = function(socket) {
  console.log('=[ Player connected          '+socket.id);
  // connectedPlayers++;
  // Player.updateOnce();
  // Controller.updateOnce();

  socket.on('command', async function (data) {
    let command = 'Unknown command from ' + socket.id + ': ' + data.command;
    switch (data.command) {
      case 'joinGame':
        command = 'join game';
        let v4 = uuid();
        let lastGameID = await select("SELECT `ID` FROM `game` order by `MadeOn` desc LIMIT 1;");
        console.log(lastGameID[0].ID);
        await insert("INSERT INTO `speler`(`ID`, `GameID`, `Name`) VALUES ('"+v4+"','"+lastGameID[0].ID+"','"+data.name+"')");
        socket.emit('gameChoice', {gameUUID: v4});
        break;
      case 'startSession':
        command = 'Start session';
        sessionActive = true;
        // updateOnceAll();
        break;
      case 'rebootServer':
        command = 'Reboot server';
        for (let i in SOCKET_LIST) {
          let socket = SOCKET_LIST[i];
          socket.emit('reboot');
        }
        process.exit(1);
        break;
    }
    console.log(`> Server command: ${command}`);
  });

  // // Use this package to pass data to the active section
  // socket.on('playerPackage', function(data) {
  //   data.socketid = socket.id;
  //   sections[activeSection].playerPackage(data);
  // });
  // socket.on('playerReady', function(data) {
  //   // console.log(`Player ${socket.id} is ready`);
  //   connectedData[socket.id].status = 'player-ready';
  //   Player.checkReadyPlayers();
  //   if (sessionActive == true && activeSection != 'idle' && activeSection != 'sticker') { sections['sticker'].ensureStickers(); }
  //   if (activeSection == 'sticker') { sections['sticker'].collectStickerData(); }
  //   updateOnceAll();
  // });
};

/* -- IO -- */
/* -------------------------------------------------------------------------------------- */
// var io = new Server(servs, {});
var io = new Server(serv, {});
io.sockets.on('connection', function (socket) {
  SOCKET_LIST[socket.id] = socket;

  socket.on('meldPlayerAan', function (data) {
    Player(socket.id);
    Player.onConnect(socket);
    // console.log(data.name)
    //do iets met player dingen
  })

  socket.on('getGames', function () {
    Game(socket.id);
    Game.onConnect(socket);
    //do iets met game dingen
  })

  socket.on('addProduct', function (data) {
    Lijst.addProduct(socket, data.id, data.name, data.price);
  })
})