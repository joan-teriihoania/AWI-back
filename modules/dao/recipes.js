const db = require('../db')
const {getRecipeCategory} = require("./recipe_categories");
const {getUserInfo} = require("../users");
const {getRecipeStep} = require("./recipe_steps");

function editRecipe(recipe_id, arr){
    return db.update("recipes", arr, "recipe_id = " + recipe_id)
}

function deleteRecipe(recipe_id){
    return db.run("DELETE FROM recipes WHERE recipe_id = ?", [recipe_id])
}

function createRecipe(name, nb_couvert, user_id, recipe_category_id){
    return db.insert("recipes", [
        {
            name: name,
            nb_couvert: nb_couvert,
            user_id: user_id,
            recipe_category_id: recipe_category_id
        }
    ])
}

function getRecipe(recipe_id){
    return new Promise((resolve, reject) => {
        db.select("SELECT * FROM recipes WHERE recipe_id = ?", [recipe_id], async (recipe) => {
            if(recipe && recipe.length > 0){
                recipe.category = await getRecipeCategory(recipe.recipe_category_id);
                recipe.author = await getUserInfo(recipe.user_id)
                recipe.steps = []
                recipe.ingredients = []

                await new Promise((resolve) => {
                    db.select("SELECT * FROM recipe_steps WHERE recipe_id = ?", [recipe_id], async (recipe_steps) => {
                        if(recipe_steps && recipe_steps.length > 0){
                            for (let i = 0; i < recipe_steps; i++) {
                                const t = await getRecipeStep(recipe_steps.recipe_step_id)
                                recipe.steps.push(t)
                                recipe.ingredients.push(t.ingredients)
                            }
                        }
                        resolve()
                    })
                })
                resolve(recipe)
            } else {
                reject()
            }
        })
    })
}

module.exports = {
    getRecipe,
    createRecipe,
    deleteRecipe,
    editRecipe
}