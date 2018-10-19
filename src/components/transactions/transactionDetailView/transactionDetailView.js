import React from 'react';
import { Link } from 'react-router-dom';
import grid from 'flexboxgrid/dist/flexboxgrid.css';
// import { loadTransaction } from '../../../actions/transactions';
import CopyToClipboard from '../../copyToClipboard';
import AccountVisual from '../../accountVisual';
import styles from './transactionDetailView.css';
import { FontIcon } from '../../fontIcon';
import TransactionType from '../transactionType';
import LiskAmount from '../../liskAmount';
import Amount from '../amount';
import routes from './../../../constants/routes';
import transactions from './../../../constants/transactionTypes';
import TransactionDetailViewField from './transactionDetailViewField';
import TransactionDetailViewRow from './transactionDetailViewRow';
import DateField from './transactionDetailDateField';

class TransactionsDetailView extends React.Component {
  constructor(props) {
    super(props);

    const transactionId = this.getTransactionIdFromURL();

    if (props.peers.data && transactionId) {
      this.props.loadTransaction({
        id: transactionId,
      });
    }
    console.log('TransactionsDetailView', props);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.location && !nextProps.location.search) this.props.prevStep();

    // It rerenders component when pending status changed to confirmed
    if (nextProps.pendingTransactions &&
      nextProps.pendingTransactions.length === 0 && typeof nextProps.transaction === 'string') {
      const transactionId = this.getTransactionIdFromURL();

      if (this.props.peers.data && transactionId) {
        this.props.loadTransaction({
          id: transactionId,
        });
      }
    }
  }

  getTransactionIdFromURL() {
    const { search } = this.props.location || window.location;
    const params = new URLSearchParams(search);

    return params.get('id');
  }

  getVoters(dataName) {
    const data = this.props.transaction.votesName && this.props.transaction.votesName[dataName];

    return data ? data
      .sort((delegate1, delegate2) => delegate1.username - delegate2.username)
      .map((delegate, key) => (
        <Link className={`${styles.addressLink} ${styles.clickable} voter-address`}
          to={`${routes.explorer.path}${routes.accounts.path}/${delegate.account.address}`}
          key={`${key}-${dataName}`}>
          {`${delegate.username} `}
        </Link>
      )) : '';
  }

  isPendingTransaction() {
    const transactionId = this.getTransactionIdFromURL();
    return this.props.pendingTransactions &&
    this.props.pendingTransactions.find(tx => tx.id === transactionId);
  }

  isTransactionEmpty() {
    return (typeof this.props.transaction === 'object' &&
    Object.keys(this.props.transaction).length !== 0);
  }

  getFirstRow() {
    const isPendingTransaction = this.isPendingTransaction();
    const isTransactionEmpty = this.isTransactionEmpty();

    const transaction = isTransactionEmpty || (isTransactionEmpty && isPendingTransaction) ?
      this.props.transaction : (isPendingTransaction || {});

    const isSendTransaction = this.props.transaction.type === transactions.send
      || (this.props.pendingTransactions && this.props.pendingTransactions.length > 0);

    return (
      <TransactionDetailViewRow>
        <TransactionDetailViewField
          label={this.props.t('Sender')}
          value={
            <Link className={`${styles.addressLink} ${styles.clickable}`} id='sender-address'
              to={`${routes.explorer.path}${routes.accounts.path}/${transaction.senderId}`}>
              {transaction.senderId}
            </Link>
          }
          column>
          {transaction.senderId ?
            <figure className={styles.accountVisual}>
              <AccountVisual address={transaction.senderId} size={43} />
            </figure> : null}
        </TransactionDetailViewField>

        {!isSendTransaction ? <DateField {...this.props} /> :
          <TransactionDetailViewField
            shouldShow={transaction.recipientId}
            label={this.props.t('Recipient')}
            style={styles.sender}
            value={
              <Link className={`${styles.addressLink} ${styles.clickable}`} id='receiver-address'
                to={`${routes.explorer.path}${routes.accounts.path}/${transaction.recipientId}`}>
                {transaction.recipientId}
              </Link>
            }
            column>
            {transaction.recipientId ?
              <figure className={styles.accountVisual}>
                <AccountVisual address={transaction.recipientId} size={43} />
              </figure> : null
            }
          </TransactionDetailViewField>
        }
      </TransactionDetailViewRow>
    );
  }

  render() {
    const isPendingTransaction = this.isPendingTransaction();
    const isTransactionEmpty = this.isTransactionEmpty();
    const transaction = isTransactionEmpty || (isTransactionEmpty && isPendingTransaction) ?
      this.props.transaction : (isPendingTransaction || {});

    return (
      <div className={`${styles.details}`}>
        {
          this.props.prevStep ?
            <header>
              <h3>
                <small className={`${styles.backButton} transaction-details-back-button`}
                  onClick={() => this.props.history.push(this.props.history.location.pathname)}>
                  <FontIcon className={`${styles.arrow}`} value='arrow-left'/>
                  <span className={`${styles.text}`}>{this.props.t('Back to overview')}</span>
                </small>
              </h3>
            </header> : null
        }
        <div>
          <TransactionDetailViewRow shouldShow={!this.props.match.params.id}>
            <div className={`${grid['col-xs-12']} ${grid['col-sm-7']} ${grid['col-md-7']} ${styles.columnNarrow}`}>
              <header>
                <h2 className={styles.title}>
                  <TransactionType
                    {...transaction}
                    address={transaction.senderId}
                    showTransaction />
                </h2>
              </header>
            </div>
          </TransactionDetailViewRow>

          {this.getFirstRow()}

          <TransactionDetailViewRow shouldShow={transaction.type === 0}>
            <DateField {...this.props} />
            <TransactionDetailViewField
              label={this.props.t('Amount (LSK)')}
              value={
                <Amount
                  value={transaction}
                  address={this.props.address}>
                </Amount>
              }
              style={styles.amount} />
          </TransactionDetailViewRow>

          <TransactionDetailViewRow shouldShow={transaction.type === transactions.vote}>
            <TransactionDetailViewField
              label={this.props.t('Added votes')}
              value={this.getVoters('added')} />
            <TransactionDetailViewField
              label={this.props.t('Removed votes')}
              value={this.getVoters('deleted')} />
          </TransactionDetailViewRow>

          <TransactionDetailViewRow>
            <TransactionDetailViewField
              label={this.props.t('Additional fee')}
              value={<LiskAmount val={transaction.fee} />} />
            <TransactionDetailViewField
              label={this.props.t('Confirmations')}
              value={<span>{transaction.confirmations}</span>} />
          </TransactionDetailViewRow>

          <TransactionDetailViewRow>
            {this.props.prevStep &&
              <TransactionDetailViewField
                label={this.props.t('Transaction ID')}
                value={
                  <CopyToClipboard
                    value={transaction.id}
                    text={transaction.id}
                    copyClassName={`${styles.copy}`} />
                } />
            }
            <TransactionDetailViewField
              style={styles.referenceField}
              shouldShow={transaction.asset && transaction.asset.data}
              label={this.props.t('Reference')}
              value={(transaction.asset && transaction.asset.data) || '-'} />
          </TransactionDetailViewRow>
        </div>
        <footer>
        </footer>
      </div>
    );
  }
}

export default TransactionsDetailView;
