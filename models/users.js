// users.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: [true, "Campo NOME deve ser preenchido"],
  },
  email: {
    type: String,
    required: [true, "Campo email deve ser preenchido"],
    unique: true,
  },
  senha: {
    type: String,
    required: [true, "O campo senha deve ser preenchido"],
  },
  approved: {
    type: Boolean,
    default: false,
  },
  role: {
    type: String,
    enum: ["PreAprovacao", "User", "Admin"],
    default: "PreAprovacao",
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model("User", userSchema);