// loginController.js
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config();

const User = require("../models/users");

class LoginController {
  async login(req, res, next) {
    try {
      const { email, senha } = req.body;
      const userExiste = await User.findOne({ email });

      if (!userExiste) {
        return res.status(401).json({
          error: true,
          code: 150,
          message: "Erro: Usuário não encontrado!",
        });
      }

      const senhaValida = await bcrypt.compare(senha, userExiste.senha);
      if (!senhaValida) {
        return res.status(401).json({
          error: true,
          code: 151,
          message: "Erro: Senha inválida!",
        });
      }

      // Se não estiver aprovado, não retorna token
      if (!userExiste.approved) {
        return res.json({
          message: "Usuário aguardando aprovação",
          user: {
            _id: userExiste._id,
            nome: userExiste.nome,
            role: userExiste.role,
            email: userExiste.email,
          },
        });
      }

      // Usuário aprovado => retorna token
      return res.json({
        user: {
          _id: userExiste._id,
          nome: userExiste.nome,
          role: userExiste.role,
          email: userExiste.email,
        },
        token: jwt.sign(
          { id: userExiste._id, role: userExiste.role },
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