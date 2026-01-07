import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // hashed
  recipes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Recipe", // links to Recipe model
      },
    ],
});

export default mongoose.models.User || mongoose.model("User", UserSchema);
