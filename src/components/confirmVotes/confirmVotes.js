import React from 'react';
import { Button, PrimaryButton } from '../toolbox/buttons/button';
import styles from './confirmVotes.css';
import Checkbox from '../toolbox/sliderCheckbox';
import fees from '../../constants/fees';
import { fromRawLsk } from '../../utils/lsk';
import Piwik from '../../utils/piwik';

class ConfirmVotes extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      didSend: false,
    };
  }

  componentDidMount() {
    if (typeof this.props.onMount === 'function') {
      this.props.onMount(false, 'ConfirmVotes');
    }
  }

  componentWillUnmount() {
    clearTimeout(this.timeout);
  }

  goToNextStep({ success, text }) {
    const { t, updateList, nextStep } = this.props;
    let message = {
      title: t('Error'),
      success: false,
      body: text,
    };
    if (success) {
      message = {
        title: t('Votes submitted'),
        success: true,
        body: t('Your votes are being processed. It may take up to 10 minutes for it to be secured in the blockchain.'),
      };
    }
    updateList(false);
    nextStep(message);
  }

  votePlacedDelayed(value) {
    this.timeout = setTimeout(() => {
      this.props.votePlaced(value);
    }, 120);
  }

  onNext(data) {
    Piwik.trackingEvent('ConfirmVotes', 'button', 'Next step');
    this.setState({ didSend: true });
    this.props.votePlaced(data);
  }

  onPrev() {
    Piwik.trackingEvent('ConfirmVotes', 'button', 'Previous step');
    this.props.prevStep({ reset: this.props.skipped });
  }

  render() {
    const {
      t,
      votes,
      account,
      secondPassphrase,
      passphrase,
    } = this.props;
    const data = {
      account,
      votes,
      passphrase: passphrase.value,
      secondPassphrase: secondPassphrase.value,
      goToNextStep: this.goToNextStep.bind(this),
    };

    const deviceModel = this.props.account.hwInfo && this.props.account.hwInfo.deviceModel;
    const isHwWallet = account.hwInfo && account.hwInfo.deviceId;
    return (
      <div className={styles.wrapper}>
        <article className={styles.content}>
          <h2 className={styles.header}>{isHwWallet ?
            t('Confirm vote on {{deviceModel}}', { deviceModel })
            : t('Final confirmation') }</h2>
          <p className={styles.message}>
            {t('Are you certain of your choice?')}
          </p>
          <PrimaryButton
            disabled={this.state.didSend}
            className={`${styles.confirmButton} confirm`}
            onClick={() => this.onNext(data)}>{t('Confirm (Fee: 1 LSK)')}</PrimaryButton>
          <Button
            disabled={isHwWallet}
            className={`${styles.backButton} back`}
            onClick={() => this.onPrev()}>{t('Back')}</Button>
          <Checkbox
            className={`${styles.checkbox} confirmSlider`}
            label={t(`Confirm (Fee: ${fromRawLsk(fees.vote)} LSK)`)}
            icons={{
              done: 'checkmark',
            }}
            onChange={this.votePlacedDelayed.bind(this, data)}
            input={{
              value: 'confirm-vote',
            }}/>
        </article>
      </div>
    );
  }
}

export default ConfirmVotes;

