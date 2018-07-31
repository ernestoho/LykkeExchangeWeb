import {Dialog} from '@lykkex/react-components';
import {observable} from 'mobx';
import {inject, observer} from 'mobx-react';
import * as React from 'react';
import * as CopyToClipboard from 'react-copy-to-clipboard';
import {RouteComponentProps} from 'react-router-dom';
import {RootStoreProps} from '../../App';
import {APPSTORE_LINK, GOOGLEPLAY_LINK} from '../../components/Apps';
import ClientDialog from '../../components/ClientDialog';
import Spinner from '../../components/Spinner';
import WalletTabs from '../../components/WalletTabs/index';
import {ROUTE_WALLETS_TRADING} from '../../constants/routes';
import {STORE_ROOT} from '../../constants/stores';
import {DialogModel} from '../../models';
import {DialogConditionType} from '../../models/dialogModel';

// tslint:disable-next-line:no-var-requires
const QRCode = require('qrcode.react');

import './style.css';

interface DepositCryptoPageProps
  extends RootStoreProps,
    RouteComponentProps<any> {}

export class DepositCryptoPage extends React.Component<DepositCryptoPageProps> {
  @observable copiedToClipboardText = '';
  @observable addressLoaded = false;

  readonly assetStore = this.props.rootStore!.assetStore;
  readonly dialogStore = this.props.rootStore!.dialogStore;
  readonly uiStore = this.props.rootStore!.uiStore;

  componentDidMount() {
    const {assetId} = this.props.match.params;
    const asset = this.assetStore.getById(assetId);

    const clientDialog = this.dialogStore.pendingDialogs.find(
      (dialog: DialogModel) =>
        dialog.conditionType === DialogConditionType.Predeposit
    );
    if (clientDialog) {
      clientDialog.visible = true;
    }
    if (assetId === 'ETH' || (asset && asset.name === 'ETH')) {
      this.uiStore.showEthWarning = true;
      this.addressLoaded = true;
    } else {
      this.assetStore
        .fetchAddress(assetId)
        .then(() => {
          this.addressLoaded = true;
        })
        .catch(() => {
          this.addressLoaded = true;
        });
    }

    window.scrollTo(0, 0);
  }

  render() {
    const {assetId} = this.props.match.params;
    const asset = this.assetStore.getById(assetId);
    const clientDialog = this.dialogStore.pendingDialogs.find(
      (dialog: DialogModel) =>
        dialog.conditionType === DialogConditionType.Predeposit
    );

    return (
      <div className="container">
        {clientDialog && (
          <ClientDialog
            dialog={clientDialog}
            onDialogCancel={this.handleDialogCancel}
            onDialogConfirm={this.handleDialogConfirm}
          />
        )}
        <Dialog
          className="eth-warning-modal"
          visible={this.uiStore.showEthWarning}
          onCancel={this.handleCancelEthWarning}
          confirmButton={{text: ''}}
          cancelButton={{text: 'Close and go back'}}
          title=""
          description={
            <div>
              <div className="eth-warning-modal__icon">
                <img
                  src={`${process.env.PUBLIC_URL}/images/mobile-app-icn.svg`}
                />
              </div>
              <div className="eth-warning-modal__title">
                Use Lykke mobile app to deposit
              </div>
              <div className="eth-warning-modal__description">
                ETH deposit functionality is currently under development and
                will be available soon. Please use your Lykke Wallet mobile app
                to deposit ETH to your trading wallet in the meantime.
              </div>
              <div className="eth-warning-modal__actions">
                <a
                  href={APPSTORE_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="app-link"
                >
                  <img
                    src={`${process.env.PUBLIC_URL}/images/apple-icn.svg`}
                    alt="App Store"
                  />
                  Download for iOS
                </a>
                <a
                  href={GOOGLEPLAY_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="app-link"
                >
                  <img
                    src={`${process.env.PUBLIC_URL}/images/google-play-icn.svg`}
                    alt="Google Play"
                  />
                  Download for Android
                </a>
              </div>
            </div>
          }
        />
        <WalletTabs activeTabRoute={ROUTE_WALLETS_TRADING} />
        {asset &&
          !this.uiStore.showEthWarning && (
            <div className="deposit-crypto">
              <div className="deposit-crypto__title">Deposit {asset.name}</div>
              <div className="deposit-crypto__subtitle">
                Blockchain transfer
              </div>
              {asset.addressBase && asset.addressExtension ? (
                <div>
                  <div className="deposit-crypto__description">
                    To deposit {asset.name} to your trading wallet please use
                    the following address and deposit tag or scan the QR codes.
                  </div>
                  <div className="deposit-crypto__address-qr">
                    <QRCode size={240} value={asset.addressBase} />
                  </div>
                  <div className="deposit-crypto__address-info">
                    <div>
                      <div className="deposit-crypto__address-label">
                        Your wallet address
                      </div>
                      <div className="deposit-crypto__address">
                        {asset.addressBase}
                      </div>
                    </div>
                    <div>
                      <CopyToClipboard
                        text={asset.addressBase}
                        onCopy={this.handleCopyAddress}
                      >
                        <button className="btn btn--icon" type="button">
                          <i className="icon icon--copy_thin" />
                        </button>
                      </CopyToClipboard>
                      {this.copiedToClipboardText === asset.addressBase && (
                        <small className="copy-to-clipboard-message">
                          Copied!
                        </small>
                      )}
                    </div>
                  </div>
                  <div className="deposit-crypto__address-qr">
                    <QRCode size={240} value={asset.addressExtension} />
                  </div>
                  <div className="deposit-crypto__address-info">
                    <div>
                      <div className="deposit-crypto__address-label">
                        Deposit tag
                      </div>
                      <div className="deposit-crypto__address">
                        {asset.addressExtension}
                      </div>
                    </div>
                    <div>
                      <CopyToClipboard
                        text={asset.addressExtension}
                        onCopy={this.handleCopyAddress}
                      >
                        <button className="btn btn--icon" type="button">
                          <i className="icon icon--copy_thin" />
                        </button>
                      </CopyToClipboard>
                      {this.copiedToClipboardText ===
                        asset.addressExtension && (
                        <small className="copy-to-clipboard-message">
                          Copied!
                        </small>
                      )}
                    </div>
                  </div>
                </div>
              ) : asset.address ? (
                <div>
                  <div className="deposit-crypto__description">
                    To deposit {asset.name} to your trading wallet please use
                    the following address.
                  </div>
                  <div className="deposit-crypto__address-qr">
                    <QRCode size={240} value={asset.address} />
                  </div>
                  <div className="deposit-crypto__address-info">
                    <div>
                      <div className="deposit-crypto__address-label">
                        Your wallet address
                      </div>
                      <div className="deposit-crypto__address">
                        {asset.address}
                      </div>
                    </div>
                    <div>
                      <CopyToClipboard
                        text={asset.address}
                        onCopy={this.handleCopyAddress}
                      >
                        <button className="btn btn--icon" type="button">
                          <i className="icon icon--copy_thin" />
                        </button>
                      </CopyToClipboard>
                      {this.copiedToClipboardText === asset.address && (
                        <small className="copy-to-clipboard-message">
                          Copied!
                        </small>
                      )}
                    </div>
                  </div>
                </div>
              ) : this.addressLoaded ? (
                <div className="deposit-crypto__description text-center">
                  Not available
                </div>
              ) : (
                <Spinner />
              )}
              <div className="go-back-btn">
                <a
                  href="#"
                  onClick={this.props.history.goBack}
                  className="btn btn--flat"
                >
                  Go back
                </a>
              </div>
            </div>
          )}
      </div>
    );
  }

  private handleCancelEthWarning = () => {
    this.props.history.goBack();
  };

  private readonly handleCopyAddress = (text: string) => {
    this.copiedToClipboardText = text;
    setTimeout(() => {
      this.copiedToClipboardText = '';
    }, 2000);
  };

  private handleDialogConfirm = (dialog: DialogModel) => {
    this.dialogStore.pendingDialogs = this.dialogStore.pendingDialogs.filter(
      (d: DialogModel) => dialog.id !== d.id
    );
  };

  private handleDialogCancel = async (dialog: DialogModel) => {
    this.dialogStore.pendingDialogs = this.dialogStore.pendingDialogs.filter(
      (d: DialogModel) => dialog.id !== d.id
    );
  };
}

export default inject(STORE_ROOT)(observer(DepositCryptoPage));