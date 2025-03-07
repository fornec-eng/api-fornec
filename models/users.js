const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
{   
      nome: {
        type: String,
        required: [true, "Campo NOME deve ser preenchido"],
      },
      email: {
        type: String,
        required: [true, "Campo email deve ser preenchido"],
    }    
},
  {
    timestamps: true,
    discriminatorKey: "_role"
  }
);

const UserModel = mongoose.model("User", UserSchema);

module.exports.UserModel = UserModel;

module.exports.AdminModel = UserModel.discriminator(
  "Admin",
  new mongoose.Schema({    
    senha: {
      type: String,
      required: [true, "O campo senha deve ser preenchido"],
    }}
    )
);