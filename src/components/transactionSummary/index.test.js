import React from 'react';
import { mount } from 'enzyme';
import TransactionSummary from './index';
import accounts from '../../../test/constants/accounts';

describe('TransactionSummary', () => {
  const props = {
    title: 'mock title',
    account: {},
    confirmButton: {
      label: 'Confirm',
      onClick: jest.fn(),
    },
    cancelButton: {
      label: 'Cancel',
    },
    t: key => key,
  };

  it('should render title', () => {
    const wrapper = mount(<TransactionSummary {...props}/>);
    expect(wrapper.find('h2').text()).toEqual(props.title);
  });

  it('should disable confirm button if props.acount.secondPublicKey and valid 2nd passphrase is not provided', () => {
    const wrapper = mount(<TransactionSummary {...{
      ...props,
      account: {
        address: accounts['second passphrase account'].address,
        secondPublicKey: accounts['second passphrase account'].secondPublicKey,
      },
      }}/>);
    expect(wrapper.find('.confirm-button').at(0).prop('disabled')).toBeTruthy();
    const clipboardData = {
      getData: () => accounts['second passphrase account'].secondPassphrase,
    };
    wrapper.find('passphraseInputV2 input').first().simulate('paste', { clipboardData });
    expect(wrapper.find('.confirm-button').at(0).prop('disabled')).toBeFalsy();
    wrapper.find('passphraseInputV2 input').first().simulate('paste', {
      clipboardData: { getData: () => 'invalid passphrase' },
    });
    expect(wrapper.find('.confirm-button').at(0).prop('disabled')).toBeTruthy();
  });

  it('should render hw wallet confirmation if props.acount.hwInfo', () => {
    const wrapper = mount(<TransactionSummary {...{
      ...props,
      account: {
        hwInfo: {
          deviceModel: 'Trezor Model T',
          deviceId: 'mock id',
        },
      },
      }}/>);
    expect(wrapper.find('h1')).toHaveLength(1);
    expect(wrapper.find('.confirm-button')).toHaveLength(0);
    expect(props.confirmButton.onClick).toHaveBeenCalled();
  });
});

