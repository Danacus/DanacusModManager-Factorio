import {Map, fromJS} from 'immutable';
import {expect} from 'chai';

import makeStore from '../src/store';

describe('store', () => {

  it('is a Redux store configured with the correct reducer', () => {
    const store = makeStore();
    expect(store.getState()).to.equal(new Map({
      userData: new Map(),
      mods: new Map()
    }))

    store.dispatch({
      type: 'SET_LOGIN_DATA',
      username: 'my_username',
      token: 'my_token'
    });
    expect(store.getState().getIn(['userData', 'account'])).to.equal(fromJS({
      username: 'my_username',
      token: 'my_token'
    }))
  })
})
