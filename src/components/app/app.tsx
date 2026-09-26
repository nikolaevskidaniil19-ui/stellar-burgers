import { useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from '../../services/store';
import {
  fetchIngredients,
  selectIngredientsState
} from '../../services/ingredientsSlice';
import {
  checkUserAuth,
  authChecked,
  selectUserState
} from '../../services/userSlice';

import {
  ConstructorPage,
  Feed,
  Login,
  Register,
  ForgotPassword,
  ResetPassword,
  Profile,
  ProfileOrders,
  NotFound404
} from '@pages';

import {
  AppHeader,
  Modal,
  IngredientDetails,
  OrderInfo,
  ProtectedRoute
} from '@components';
import { Preloader } from '@ui';

import '../../index.css';
import styles from './app.module.css';

const App = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  const {
    ingredients,
    isLoading: isIngredientsLoading,
    error
  } = useSelector(selectIngredientsState);

  const { isAuthChecked } = useSelector(selectUserState);
  const backgroundLocation = location.state?.background;

  useEffect(() => {
    dispatch(fetchIngredients());

    if (localStorage.getItem('refreshToken')) {
      dispatch(checkUserAuth());
    } else {
      dispatch(authChecked());
    }
  }, [dispatch]);

  const closeModal = () => {
    navigate(-1);
  };

  return (
    <div className={styles.app}>
      <AppHeader />

      {!isAuthChecked || isIngredientsLoading ? (
        <Preloader />
      ) : error ? (
        <div className={`${styles.error} text text_type_main-medium pt-4`}>
          {error}
        </div>
      ) : (
        <>
          {/* Основные маршруты приложения */}
          <Routes location={backgroundLocation || location}>
            <Route
              path='/'
              element={
                ingredients.length > 0 ? (
                  <ConstructorPage />
                ) : (
                  <div
                    className={`${styles.title} text text_type_main-medium pt-4`}
                  >
                    Нет ингредиентов
                  </div>
                )
              }
            />
            <Route path='/feed' element={<Feed />} />

            {/* Публичные отдельные страницы */}
            <Route path='/ingredients/:id' element={<IngredientDetails />} />
            <Route path='/feed/:number' element={<OrderInfo />} />

            {/* Маршруты для НЕавторизованных гостей */}
            <Route
              path='/login'
              element={
                <ProtectedRoute onlyUnAuth>
                  <Login />
                </ProtectedRoute>
              }
            />
            <Route
              path='/register'
              element={
                <ProtectedRoute onlyUnAuth>
                  <Register />
                </ProtectedRoute>
              }
            />
            <Route
              path='/forgot-password'
              element={
                <ProtectedRoute onlyUnAuth>
                  <ForgotPassword />
                </ProtectedRoute>
              }
            />
            <Route
              path='/reset-password'
              element={
                <ProtectedRoute onlyUnAuth>
                  <ResetPassword />
                </ProtectedRoute>
              }
            />

            {/* Защищенные маршруты для авторизованных пользователей */}
            <Route
              path='/profile'
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path='/profile/orders'
              element={
                <ProtectedRoute>
                  <ProfileOrders />
                </ProtectedRoute>
              }
            />
            <Route
              path='/profile/orders/:number'
              element={
                <ProtectedRoute>
                  <OrderInfo />
                </ProtectedRoute>
              }
            />

            {/* 404 ошибки */}
            <Route path='*' element={<NotFound404 />} />
          </Routes>

          {/* окно поверх фонового роута при кликах */}
          {backgroundLocation && (
            <Routes>
              <Route
                path='/ingredients/:id'
                element={
                  <Modal title='Детали ингредиента' onClose={closeModal}>
                    <IngredientDetails />
                  </Modal>
                }
              />
              <Route
                path='/feed/:number'
                element={
                  <Modal title='Информация о заказе' onClose={closeModal}>
                    <OrderInfo />
                  </Modal>
                }
              />
              <Route
                path='/profile/orders/:number'
                element={
                  <ProtectedRoute>
                    <Modal title='Информация о заказе' onClose={closeModal}>
                      <OrderInfo />
                    </Modal>
                  </ProtectedRoute>
                }
              />
            </Routes>
          )}
        </>
      )}
    </div>
  );
};

export default App;
