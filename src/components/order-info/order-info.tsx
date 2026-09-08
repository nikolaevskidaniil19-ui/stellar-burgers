import { FC, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from '../../services/store';
import { selectIngredientsState } from '../../services/ingredientsSlice';
import { fetchOrderByNumber } from '../../services/feedsSlice';

import { Preloader } from '../ui/preloader';
import { OrderInfoUI } from '../ui/order-info';
import { TIngredient, TOrder } from '@utils-types';

export const OrderInfo: FC = () => {
  const dispatch = useDispatch();

  const { number } = useParams<{ number: string }>();
  const orderNumber = Number(number);

  const { ingredients } = useSelector(selectIngredientsState);

  const { orders, orderByNumber } = useSelector((state) => state.feeds);

  const profileOrders: TOrder[] = useSelector(
    (state) => (state as any).profileOrders?.orders || []
  );

  const orderData = useMemo(() => {
    const foundInFeeds = orders.find((item) => item.number === orderNumber);
    if (foundInFeeds) return foundInFeeds;

    const foundInProfile = profileOrders.find(
      (item) => item.number === orderNumber
    );
    if (foundInProfile) return foundInProfile;

    if (orderByNumber && orderByNumber.number === orderNumber)
      return orderByNumber;

    return null;
  }, [orderNumber, orders, profileOrders, orderByNumber]);

  useEffect(() => {
    if (!orderData && orderNumber) {
      dispatch(fetchOrderByNumber(orderNumber));
    }
  }, [dispatch, orderData, orderNumber]);

  const orderInfo = useMemo(() => {
    if (!orderData || !ingredients.length) return null;

    const date = new Date(orderData.createdAt);

    type TIngredientsWithCount = {
      [key: string]: TIngredient & { count: number };
    };

    const ingredientsInfo = orderData.ingredients.reduce(
      (acc: TIngredientsWithCount, item) => {
        if (!acc[item]) {
          const ingredient = ingredients.find((ing) => ing._id === item);
          if (ingredient) {
            acc[item] = {
              ...ingredient,
              count: 1
            };
          }
        } else {
          acc[item].count++;
        }

        return acc;
      },
      {}
    );

    const total = Object.values(ingredientsInfo).reduce(
      (acc, item) => acc + item.price * item.count,
      0
    );

    return {
      ...orderData,
      ingredientsInfo,
      date,
      total
    };
  }, [orderData, ingredients]);

  if (!orderInfo) {
    return <Preloader />;
  }

  return <OrderInfoUI orderInfo={orderInfo} />;
};
