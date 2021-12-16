const db = require("../db");
const {getIngredientCategory} = require("./ingredient_categories");
const {getUnit} = require("./units");
const {getAllergene} = require("./allergenes");


function editIngredient(ingredient_id, arr){
    return db.update("ingredients", arr, "ingredient_id = " + ingredient_id)
}

function deleteIngredient(ingredient_id){
    return db.run("DELETE FROM ingredients WHERE ingredient_id = ?", [ingredient_id])
}

function createIngredient(unit_id, ingredient_category_id, name, price){
    return db.insert("ingredients", [
        {
            unit_id: unit_id,
            ingredient_category_id: ingredient_category_id,
            name: name,
            price: price
        }
    ])
}

function getIngredient(ingredient_id){
    return new Promise((resolve, reject) => {
        db.select("SELECT * FROM ingredients WHERE ingredient_id = ?", [ingredient_id], async (ingredients) => {
            if(ingredients && ingredients.length > 0){
                ingredients[0].ingredient_category = await getIngredientCategory(ingredients[0].ingredient_category_id)
                ingredients[0].unit = await getUnit(ingredients[0].unit_id)
                ingredients[0].allergenes = []

                await new Promise((resolve) => {
                    db.select("SELECT * FROM ingredient_allergenes WHERE ingredient_id = ?", [ingredient_id], async (allergenes) => {
                        if(allergenes){
                            for (let j = 0; j < allergenes; j++) {
                                const allergene = allergenes[j]
                                ingredients[0].allergenes.push(await getAllergene(allergene.allergene_id))
                            }
                        }
                        resolve()
                    })
                })
                resolve(ingredients[0])
            } else {
                reject()
            }
        })
    })
}

function addAllergene(ingredient_id, allergene_id){
    return db.insert("ingredient_allergenes", [
        {
            ingredient_id: ingredient_id,
            allergene_id: allergene_id
        }
    ])
}

function removeAllergene(ingredient_id, allergene_id){
    return db.run("DELETE FROM ingredient_allergenes WHERE ingredient_id = ? AND allergene_id = ?", [ingredient_id, allergene_id])
}

module.exports = {
    getIngredient,
    createIngredient,
    deleteIngredient,
    editIngredient,
    removeAllergene
}