class FicheTechnique {
    private recette: Recette
    private cout_assaisonnement: number
    private cout_personnel: number
    private cout_fluide: number
    private coef_marge: number

    constructor(recette, cout_assaisonnement, cout_personnel, cout_fluide, double, coef_marge) {
        this.cout_assaisonnement = cout_assaisonnement;
        this.cout_personnel = cout_personnel;
        this.cout_fluide = cout_fluide;
        this.coef_marge = coef_marge;
    }

    getCoutProd(){

    }
}

class Recette implements StepComponent {
    private name: string
    private nb_couvert: number
    private steps: Step[]
    private user: User

    constructor(name: string, nb_couvert: number, steps: Step[], user: User) {
        this.name = name;
        this.nb_couvert = nb_couvert;
        this.steps = steps;
        this.user = user
    }

    getDescription(): string {
        return "";
    }

    getDuration(): number {
        return 0;
    }

    getIngredients(): Ingredient[] {
        return [];
    }

    getName(): string {
        return "";
    }
}

class Step implements StepComponent {
    private name: string
    private description: string
    private duration: number
    private components: StepComponentQuantity[]

    getDescription(): string {
        return "";
    }

    getDuration(): number {
        return 0;
    }

    getIngredients(): Ingredient[] {
        return [];
    }

    getName(): string {
        return "";
    }
}

class StepComponentQuantity {
    private stepComponent: StepComponent
    private quantity: number
}

interface StepComponent {
    getIngredients(): Ingredient[]
    getName(): string
    getDescription(): string
    getDuration(): number
}

class Ingredient {
    private name: string
    private price: number
}

class User {
    private username: string
    private password: string
}