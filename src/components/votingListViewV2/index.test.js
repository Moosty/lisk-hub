import React from 'react';
import { expect } from 'chai';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import PropTypes from 'prop-types';
import { BrowserRouter as Router } from 'react-router-dom';

import store from '../../store';
import VotingListViewV2 from './index';
import i18n from '../../i18n';
import history from '../../history';

describe.skip('VotingListViewV2', () => {
  let wrapper;
  const account = { address: '16313739661670634666L' };
  const voting = {
    votes: {},
    delegates: [],
    totalDelegates: 10,
    refresh: false,
  };
  const confirmed = [];
  const pending = [];
  const transactions = {
    pending,
    confirmed,
    count: confirmed.length,
  };

  beforeEach(() => {
    store.getState = () => ({
      account,
      voting,
      transactions,
      delegate: {},
      loading: [],
    });
    wrapper = mount(<Provider store={store}>
        <Router>
          <VotingListViewV2 history={{ location: { search: '' } }} />
        </Router>
      </Provider>, {
      context: { store, history, i18n },
      childContextTypes: {
        store: PropTypes.object.isRequired,
        history: PropTypes.object.isRequired,
        i18n: PropTypes.object.isRequired,
      },
    });
  });

  it('should render delegate list', () => {
    expect(wrapper.find(VotingListViewV2)).to.have.lengthOf(1);
  });
});
