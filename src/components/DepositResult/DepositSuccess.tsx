import {Icon} from '@lykkex/react-components';
import {inject, observer} from 'mobx-react';
import queryString from 'qs';
import * as React from 'react';
import {Link, RouteComponentProps} from 'react-router-dom';
import {RootStoreProps} from '../../App';
import Spinner from '../../components/Spinner';
import {AnalyticsEvent, Place} from '../../constants/analyticsEvents';
import {ROUTE_WALLETS} from '../../constants/routes';
import {STORE_ROOT} from '../../constants/stores';
import {NumberFormat} from '../NumberFormat';

import './style.css';

export class DepositSuccess extends React.Component<
  RootStoreProps & RouteComponentProps<any>
> {
  private readonly depositStore = this.props.rootStore!.depositStore;
  private readonly assetStore = this.props.rootStore!.assetStore;
  private readonly analyticsService = this.props.rootStore!.analyticsService;

  componentDidMount() {
    window.scrollTo(0, 0);

    const location = this.props.location;
    const qs = queryString.parse(location.search, {ignoreQueryPrefix: true});
    const transactionId = qs.transactionId as string;

    if (transactionId) {
      this.depositStore.fetchTransactionDetails(transactionId);
    }

    this.analyticsService.track(
      AnalyticsEvent.FinishDeposit(
        Place.SuccessPage,
        'Credit Card',
        this.depositStore.newDeposit.asset &&
          this.depositStore.newDeposit.asset.id
      )
    );
  }

  render() {
    const {transactionDetailsLoading, transactionDetails} = this.depositStore;

    if (transactionDetailsLoading || !transactionDetails) {
      return <Spinner />;
    }

    const amount = Number(transactionDetails.Amount);
    const asset = this.assetStore.getById(transactionDetails.AssetId);

    return (
      <div className="deposit-result">
        <Icon
          className="deposit-result__icon deposit-result__icon_success"
          type="check_circle"
        />
        <div className="deposit-result__desc">
          Your deposit request has been successfully sent
        </div>
        {asset && (
          <div className="deposit-result__amount">
            <NumberFormat value={amount} accuracy={asset.accuracy} />{' '}
            {asset.name}
          </div>
        )}
        <div className="deposit-result__button">
          <Link to={ROUTE_WALLETS} className="btn btn--primary">
            Go back to wallets
          </Link>
        </div>
      </div>
    );
  }
}

export default inject(STORE_ROOT)(observer(DepositSuccess));
