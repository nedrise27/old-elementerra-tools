import _ from 'lodash';

import { ExtendedRecipe } from '../../pages/elements';
import { BASE_ELEMENTS } from '../constants/elements';
import { Element, PADDING_ADDRESS } from '../../app/stores/shopElements';

function recipeOrSelf(nextTier: number, element: Element): string[] {
    if (BASE_ELEMENTS.includes(element.address)) {
        return [element.address];
    }
    if (element.tier < nextTier) {
        return [element.address];
    }
    return element.recipe.filter((e) => e !== PADDING_ADDRESS);
}

function allBaseElements(recipe: string[]): boolean {
    for (const address of recipe) {
        if (!BASE_ELEMENTS.includes(address)) {
            return false;
        }
    }
    return true;
}

export function getExtendedRecipe(element: Element, elementsRecord: Record<string, Element>): ExtendedRecipe[] {
    const receipes: string[][] = [element.recipe];
    const extendedRecipes: ExtendedRecipe[] = [];

    let sanityCheck = 0;

    let nextTier = element.tier - 1;

    while (true) {
        const lastRecipe = _.last(receipes)!;

        let nextLevel: string[] = [];
        const extendedNextLevel: ExtendedRecipe = {};

        for (const item of lastRecipe) {
            const extendedItem = elementsRecord[item];

            if (_.isNil(extendedItem)) {
                continue;
            }

            const elementName = extendedItem.name;
            if (!_.has(extendedNextLevel, elementName)) {
                extendedNextLevel[elementName] = {
                    element: extendedItem,
                    amount: 1,
                };
            } else {
                extendedNextLevel[elementName].amount += 1;
            }

            nextLevel = [...nextLevel, ...recipeOrSelf(nextTier, extendedItem)];
        }

        extendedRecipes.push(extendedNextLevel);

        if (allBaseElements(lastRecipe)) {
            break;
        }

        receipes.push(nextLevel);

        nextTier--;

        sanityCheck++;
        if (sanityCheck > 20) {
            break;
        }
    }

    

    return extendedRecipes;
}
