if (!global.crypto) {
  Object.defineProperty(global, 'crypto', {
    value: {
      randomUUID: () => 'test-uuid-12345'
    }
  });
} else if (!global.crypto.randomUUID) {
  Object.defineProperty(global.crypto, 'randomUUID', {
    value: () => 'test-uuid-12345',
    configurable: true
  });
}

import constructorReducer, {
  addIngredient,
  removeIngredient,
  moveIngredient,
  clearConstructor,
} from '../constructorSlice';
import { TIngredient, TConstructorIngredient } from '../../utils/types';

describe('Тестирование редьюсера constructorSlice', () => {
  const initialState = {
    bun: null as TIngredient | null,
    ingredients: [] as TConstructorIngredient[],
  };

  const mockBun: TIngredient = {
    _id: 'bun1',
    name: 'Краторная булка',
    type: 'bun',
    proteins: 1,
    fat: 1,
    carbohydrates: 1,
    calories: 1,
    price: 150,
    image: '',
    image_mobile: '',
    image_large: '',
  };

  const mockSauce: TIngredient = {
    _id: 'sauce1',
    name: 'Соус фирменный',
    type: 'sauce',
    proteins: 2,
    fat: 2,
    carbohydrates: 2,
    calories: 2,
    price: 50,
    image: '',
    image_mobile: '',
    image_large: '',
  };

  it('должен возвращать исходное состояние при передаче неизвестного экшена', () => {
    expect(constructorReducer(undefined, { type: 'UNKNOWN' })).toEqual(initialState);
  });

  it('должен добавлять булку в конструктор', () => {
    const action = addIngredient(mockBun);
    const state = constructorReducer(initialState, action);
    expect(state.bun).toEqual(expect.objectContaining({ _id: 'bun1', type: 'bun' }));
  });

  it('должен добавлять начинку/соус в конструктор', () => {
    const action = addIngredient(mockSauce);
    const state = constructorReducer(initialState, action);
    expect(state.ingredients).toHaveLength(1);
    
    const addedIngredient = state.ingredients[0] as TConstructorIngredient;
    expect(addedIngredient._id).toBe('sauce1');
    expect(addedIngredient.id).toBeDefined(); 
  });

  it('должен удалять ингредиент из конструктора', () => {
    const preparedState = {
      bun: null,
      ingredients: [{ ...mockSauce, id: 'test-id-123' }],
    };
    const action = removeIngredient('test-id-123');
    const state = constructorReducer(preparedState, action);
    expect(state.ingredients).toHaveLength(0);
  });

  it('должен перемещать ингредиенты местами', () => {
    const item1: TConstructorIngredient = { ...mockSauce, id: 'id-1', name: 'Соус 1' };
    const item2: TConstructorIngredient = { ...mockSauce, id: 'id-2', name: 'Соус 2' };
    const preparedState = {
      bun: null,
      ingredients: [item1, item2],
    };

    const action = moveIngredient({ fromIndex: 0, toIndex: 1 });
    const state = constructorReducer(preparedState, action);
    
    const resultIngredients = state.ingredients as TConstructorIngredient[];
    expect(resultIngredients[0].id).toBe('id-2');
    expect(resultIngredients[1].id).toBe('id-1');
  });

  it('должен очищать конструктор', () => {
    const preparedState = {
      bun: mockBun,
      ingredients: [{ ...mockSauce, id: 'id-1' }],
    };
    const action = clearConstructor();
    const state = constructorReducer(preparedState, action);
    expect(state.bun).toBeNull();
    expect(state.ingredients).toHaveLength(0);
  });
});