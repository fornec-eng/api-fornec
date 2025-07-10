// auth.js
const jwt = require("jsonwebtoken");
require('dotenv').config();

module.exports = function authorize(arrayOfAuthUsers) {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({
        error: true,
        code: 160,
        message: "Erro: Token não encontrado!",
      });
    }

    const [, token] = authHeader.split(" ");
    try {
      const decoded = jwt.verify(token, process.env.SECRET);
      req.userID = decoded.id;
      req.userRole = decoded.role;

      if (arrayOfAuthUsers.indexOf(decoded.role) === -1) {
        return res.status(401).json({
          error: true,
          code: 161,
          message: "Erro: Usuário não autorizado!",
        });
      }
      next();
    } catch (err) {
      return res.status(401).json({
        error: true,
        code: 162,
        message: "Erro: Token inválido!",
      });
    }
  };
};
