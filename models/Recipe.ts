import mongoose from "mongoose";

const RecipeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  ingredients: [{ type: String, required: true}],
  recipes: { type: String, required: true},
});

export default mongoose.models.Recipe || mongoose.model("Recipe", RecipeSchema);
