const bcrypt = require("bcrypt");
const User = require("../models/users");

class UserController {
  // Listar todos os usuários
  async list(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 3;
      const page = parseInt(req.query.page) || 1;
      const skip = (page - 1) * limit;

      const users = await User.find({})
        .select("-senha")
        .limit(limit)
        .skip(skip);

      return res.json({ error: false, users });
    } catch (error) {
      return res.status(500).json({ status: "error", msg: error.message });
    }
  }

  // Buscar um usuário pelo ID
  async listOne(req, res) {
    try {
      const user = await User.findById(req.params.id)
        .select("_id nome email createdAt updatedAt role approved");
      if (!user) {
        return res.status(404).json({
          error: true,
          message: "Usuário não encontrado!",
        });
      }
      return res.json({ error: false, user });
    } catch (error) {
      return res.status(400).json({
        error: true,
        code: 110,
        message: "Erro: Não foi possível executar a solicitação!",
      });
    }
  }

  // Listar usuários pendentes de aprovação
  async listPendingApprovals(req, res) {
    try {
      const pendingUsers = await User.find({ approved: false })
        .select("-senha");
      return res.json({ error: false, pendingUsers });
    } catch (error) {
      return res.status(500).json({ status: "error", msg: error.message });
    }
  }

  // Criar novo usuário
  async create(req, res) {
    try {
      const { email, senha, nome, role } = req.body;

      // Verifica duplicidade de email
      const emailExiste = await User.findOne({ email });
      if (emailExiste) {
        return res.status(400).json({
          error: true,
          code: 120,
          message: "Erro: Este e-mail já está cadastrado!",
        });
      }

      // Se tentar criar um Admin, verifica se quem está logado é Admin
      if (role === "Admin") {
        if (req.userRole !== "Admin") {
          return res.status(403).json({
            error: true,
            message: "Erro: Apenas um Admin pode criar outro Admin!",
          });
        }
      }

      // Define role padrão (PreAprovacao) se não vier nada
      let userRole = role || "PreAprovacao";
      let approved = false;

      // Se for "Admin" ou "User", já definimos approved = true
      if (userRole === "Admin" || userRole === "User") {
        approved = true;
      }

      const senhaCriptografada = await bcrypt.hash(senha, 8);

      const novoUsuario = await User.create({
        nome,
        email,
        senha: senhaCriptografada,
        role: userRole,
        approved,
      });

      return res.json(novoUsuario);
    } catch (error) {
      return res.status(500).json({ status: "error", msg: error.message });
    }
  }

  // Atualizar um usuário (usado pelo Admin para aprovar ou promover)
  async update(req, res) {
    try {
      const usuarioExiste = await User.findById(req.params.id);
      if (!usuarioExiste) {
        return res.status(404).json({
          error: true,
          message: "Erro: Usuário não encontrado!",
        });
      }

      // Se está mudando role para Admin ou User, verifique se quem faz a ação é Admin
      if (req.body.role === "Admin") {
        if (req.userRole !== "Admin") {
          return res.status(403).json({
            error: true,
            message: "Somente um Admin pode promover outro usuário a Admin!",
          });
        }
        usuarioExiste.role = "Admin";
        usuarioExiste.approved = true;
      } else if (req.body.role === "User") {
        if (req.userRole !== "Admin") {
          return res.status(403).json({
            error: true,
            message: "Somente um Admin pode aprovar usuário como User!",
          });
        }
        usuarioExiste.role = "User";
        usuarioExiste.approved = true;
      } else if (req.body.role === "PreAprovacao") {
        // Se quiser rebaixar alguém para pré-aprovação, se fizer sentido
        if (req.userRole !== "Admin") {
          return res.status(403).json({
            error: true,
            message: "Somente um Admin pode rebaixar usuário para PreAprovacao!",
          });
        }
        usuarioExiste.role = "PreAprovacao";
        usuarioExiste.approved = false;
      }

      // Se o body tiver 'approved: true' sem alterar o role, checar se é Admin
      if (req.body.approved === true && req.userRole !== "Admin") {
        return res.status(403).json({
          error: true,
          message: "Somente Admin pode aprovar usuários!",
        });
      }
      if (typeof req.body.approved === "boolean") {
        usuarioExiste.approved = req.body.approved;
      }

      // Verifica se quer alterar email
      if (req.body.email && req.body.email !== usuarioExiste.email) {
        const emailExiste = await User.findOne({ email: req.body.email });
        if (emailExiste) {
          return res.status(400).json({
            error: true,
            message: "Erro: Este e-mail já está cadastrado!",
          });
        }
        usuarioExiste.email = req.body.email;
      }

      // Se veio senha, criptografa
      if (req.body.senha) {
        usuarioExiste.senha = await bcrypt.hash(req.body.senha, 8);
      }

      // Se veio nome
      if (req.body.nome) {
        usuarioExiste.nome = req.body.nome;
      }

      // Salva
      await usuarioExiste.save();

      return res.json({ error: false, message: "Usuário editado com sucesso!" });
    } catch (error) {
      return res.status(500).json({ status: "error", msg: error.message });
    }
  }

  // Deletar um usuário (somente Admin)
  async delete(req, res) {
    try {
      await User.deleteOne({ _id: req.params.id });
      return res.json({ error: false, message: "Usuário apagado com sucesso!" });
    } catch (error) {
      return res.status(500).json({ status: "error", msg: error.message });
    }
  }

  // Atualiza os dados do próprio usuário (role "User" ou "Admin")
  async updateSelf(req, res) {
    try {
      const userId = req.userID;
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: true, message: "Usuário não encontrado." });
      }

      // Verifica se o email está mudando
      if (req.body.email && req.body.email !== user.email) {
        const emailExiste = await User.findOne({ email: req.body.email });
        if (emailExiste) {
          return res.status(400).json({ error: true, message: "Este e-mail já está cadastrado!" });
        }
        user.email = req.body.email;
      }

      // Se veio senha
      if (req.body.senha) {
        user.senha = await bcrypt.hash(req.body.senha, 8);
      }

      // Se veio nome
      if (req.body.nome) {
        user.nome = req.body.nome;
      }

      // Nunca muda role ou approved aqui, pois somente Admin pode aprovar
      // (depende da sua lógica de negócio)

      await user.save();
      return res.json({ error: false, message: "Usuário atualizado com sucesso!" });
    } catch (error) {
      return res.status(500).json({ error: true, message: error.message });
    }
  }

  // Deleta o próprio usuário
  async deleteSelf(req, res) {
    try {
      const userId = req.userID;
      await User.deleteOne({ _id: userId });
      return res.json({ error: false, message: "Usuário deletado com sucesso!" });
    } catch (error) {
      return res.status(500).json({ error: true, message: error.message });
    }
  }
}

module.exports = new UserController();