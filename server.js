const app = require('./app.js');
require('dotenv').config()

// servidor
app.listen(process.env.PORT || 4000, () => {
  console.log("Servidor iniciado na porta 4000!");
});