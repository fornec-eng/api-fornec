const jwt = require("jsonwebtoken");
const jwt_decode = require("jwt-decode")
const { promisify } = require("util");
require('dotenv').config()

module.exports = function authorize(arrayOfAuthUsers) {
  return async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        error: true,
        code: 160,
        message: "Erro: Token não encontrado!",
      });
    }

    const [, token] = authHeader.split(" ")

    try {
      const decode = jwt_decode(token);
      req.userID = decode.id;
      req.userRole = decode.role;
      // logica
      if (arrayOfAuthUsers.indexOf(decode.role) == -1) {
        return res.status(401).json({
          error: true,
          code: 161,
          message: "Erro: Usuário não autorizado!",
        });
      }
      return next();
    } catch (err) {
      return res.status(401).json({
        error: true,
        code: 162,
        message: "Erro: Token inválido!",
      });
    }
  };
}