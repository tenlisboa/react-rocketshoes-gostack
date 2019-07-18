import { call, select, put, all, takeLatest } from 'redux-saga/effects';
import { toast } from 'react-toastify';

import api from '../../../services/api';
import { formatPrice } from '../../../util/format';

import { addToCartSuccess, updateAmount } from './actions';

function* addToCart({ id }) {
  const productExists = yield select(state =>
    state.cart.find(p => p.id === id)
  );

  const stock = yield call(api.get, `/stock/${id}`);

  const stockAmount = stock.data.amount;
  const currentAmount = productExists ? productExists.amount : 0;

  const amount = currentAmount + 1;

  if (amount > stockAmount) {
    toast.error('Quantity needed out of stock');
    return;
  }

  if (productExists) {
    yield put(updateAmount(id, amount));
  } else {
    const { data } = yield call(api.get, `/products/${id}`);

    const product = {
      ...data,
      amount: 1,
      priceFormatted: formatPrice(data.price),
    };

    yield put(addToCartSuccess(product));
  }
}

export default all([takeLatest('@cart/ADD_REQUEST', addToCart)]);
