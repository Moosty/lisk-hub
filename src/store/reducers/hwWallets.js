import actionTypes from '../../constants/actions';

const hwWallets = (state = {
  devices: [],
}, action) => {
  switch (action.type) {
    case actionTypes.deviceListUpdated:
      return {
        devices: action.data,
      };
    default:
      return state;
  }
};

export default hwWallets;
