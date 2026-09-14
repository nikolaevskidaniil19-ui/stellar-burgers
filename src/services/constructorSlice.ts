import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TIngredient, TConstructorIngredient } from '../utils/types';

type TConstructorState = {
  bun: TIngredient | null;
  ingredients: TConstructorIngredient[];
};

const initialState: TConstructorState = {
  bun: null,
  ingredients: []
};

export const constructorSlice = createSlice({
  name: 'constructorBurger',
  initialState,
  reducers: {
    addIngredient: {
      reducer: (state, action: PayloadAction<TConstructorIngredient>) => {
        if (action.payload.type === 'bun') {
          state.bun = action.payload;
        } else {
          state.ingredients.push(action.payload);
        }
      },
      prepare: (ingredient: TIngredient) => {
        const id = crypto.randomUUID();
        return { payload: { ...ingredient, id } };
      }
    },
    removeIngredient: (state, action: PayloadAction<string>) => {
      state.ingredients = state.ingredients.filter(
        (item) => item.id !== action.payload
      );
    },
    moveIngredient: (
      state,
      action: PayloadAction<{ fromIndex: number; toIndex: number }>
    ) => {
      const { fromIndex, toIndex } = action.payload;
      const movingIngredient = state.ingredients[fromIndex];
      state.ingredients.splice(fromIndex, 1);
      state.ingredients.splice(toIndex, 0, movingIngredient);
    },
    clearConstructor: (state) => {
      state.bun = null;
      state.ingredients = [];
    }
  }
});

export const {
  addIngredient,
  removeIngredient,
  moveIngredient,
  clearConstructor
} = constructorSlice.actions;

export const selectConstructorBun = (state: {
  constructorBurger: TConstructorState;
}) => state.constructorBurger.bun;

export const selectConstructorIngredients = (state: {
  constructorBurger: TConstructorState;
}) => state.constructorBurger.ingredients;

export const selectConstructorTotalPrice = (state: {
  constructorBurger: TConstructorState;
}) => {
  const { bun, ingredients } = state.constructorBurger;
  const bunPrice = bun ? bun.price * 2 : 0;
  const ingredientsPrice = ingredients.reduce(
    (sum, item) => sum + item.price,
    0
  );
  return bunPrice + ingredientsPrice;
};

export default constructorSlice.reducer;
