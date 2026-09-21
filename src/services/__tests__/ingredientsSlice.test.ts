import ingredientsReducer, { fetchIngredients } from '../ingredientsSlice';
import { TIngredient } from '../../utils/types';

describe('Тестирование редьюсера ingredientsSlice', () => {
  const initialState = {
    ingredients: [] as TIngredient[],
    isLoading: false,
    error: null as string | null,
  };

  const mockIngredients: TIngredient[] = [
    {
      _id: '1',
      name: 'Булка',
      type: 'bun',
      proteins: 10,
      fat: 10,
      carbohydrates: 10,
      calories: 100,
      price: 100,
      image: 'bun.png',
      image_mobile: 'bun-mob.png',
      image_large: 'bun-large.png',
    },
  ];

  it('должен возвращать исходное состояние при передаче неизвестного экшена', () => {
    expect(ingredientsReducer(undefined, { type: 'UNKNOWN' })).toEqual(initialState);
  });

  it('должен обрабатывать экшен fetchIngredients.pending', () => {
    const action = { type: fetchIngredients.pending.type };
    const state = ingredientsReducer(initialState, action);
    expect(state.isLoading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('должен обрабатывать экшен fetchIngredients.fulfilled', () => {
    const action = {
      type: fetchIngredients.fulfilled.type,
      payload: mockIngredients,
    };
    const state = ingredientsReducer(initialState, action);
    expect(state.isLoading).toBe(false);
    expect(state.ingredients).toEqual(mockIngredients);
  });

  it('должен обрабатывать экшен fetchIngredients.rejected', () => {
    const errorMessage = 'Ошибка сети';
    const action = {
      type: fetchIngredients.rejected.type,
      error: { message: errorMessage },
    };
    const state = ingredientsReducer(initialState, action);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBe(errorMessage);
  });
});