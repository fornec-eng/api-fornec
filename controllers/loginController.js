const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require('dotenv').config()

const { UserModel } = require("../models/users");

class LoginController {
  
  async login(req, res, next) {
    try {
      
      const {email, senha} = req.body.data;

      const userExiste = await UserModel.findOne({ email: email });
      if (!userExiste) {
        return res.status(401).json({
          error: true,
          code: 150,
          message: "Erro: Usuário não encontrado!",
        });
      }

      if (!(await bcrypt.compare(senha, userExiste.senha))) {
        return res.status(402).json({
          error: true,
          code: 151,
          message: "Erro: Senha inválida!",
        });
      }

      return res.json({
        user: {
          _id: userExiste._id,
          nome: userExiste.nome,
          _role: userExiste._role,
          instrumento: userExiste.instrumento,
          email,
        },
        token: jwt.sign(
          { id: userExiste._id, role: userExiste._role },
          process.env.SECRET,
          { expiresIn: process.env.EXPIRES_IN }
        ),
      });
    } catch (error) {
      return next(error);
    }
  }
}

module.exports = new LoginController();