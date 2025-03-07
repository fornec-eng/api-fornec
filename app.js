const express = require("express");
const cors = require('cors')

//rotas
const routes = require("./routes/routes");
//CONEXAO COM BANCO DE DADOS
require("./Database/db.js");
require('dotenv').config()


class App {
  constructor() {
    this.app = express();
    this.middlewares();
    this.routes()
  }
  middlewares() {
    this.app.use(express.json());
    this.app.use(cors())
    
  }
  routes() {
    this.app.use(routes);
  }
  
}

module.exports =  new App().app;
