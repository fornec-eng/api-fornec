const mongoose = require("mongoose");
require('dotenv').config()

const DB_PASS= process.env.DB_PASS;
const DB_HOST= process.env.DB_HOST;
const DB_USER= process.env.DB_USER;
const DB_NAME= process.env.DB_NAME;

class Connection {
    constructor() {
      this.mongodb();
    }
    mongodb() {
      mongoose.connect(
          `mongodb+srv://${DB_USER}:${DB_PASS}@${DB_HOST}/${DB_NAME}?retryWrites=true&w=majority` 
          , {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
            useCreateIndex: true,
      }).then(() => {
        console.log("Conexão DB realizada com sucesso!");
      }).catch((exception) => {
        console.log("Erro de conexão com o banco." + exception);
      });
    }
  }
  
module.exports =  new Connection();