const FALLBACK_RATES = {
  usdBuying: 32.8,
  twdBuying: 1.0,
  megaUsdSpotSell: 31.73,
  superRichUpdatedAt: '2026-08-28T17:57:00+07:00',
  megaBankUpdatedAt: '2026/08/27 17:18:11',
  branch: 'Headquarter Rajdamri 1'
};

const WITHDRAWAL_BLOCK_USD = 900;
const WITHDRAWAL_FEE_TWD = 100;
const USD_DENOMINATION = 100;
const MEGA_TRANSFER_FEE_USD = 9.46;
const DIME_LOW_FEE_USD = 9;
const DIME_HIGH_FEE_USD = 16;
const DIME_FEE_THRESHOLD_USD = 4000;
const DIME_ADDITIONAL_FEE_USD = 15;
const DIME_FCD_RECEIVING_FEE_THB = 500;

const state = {
  rates: { ...FALLBACK_RATES },
  isLive: false
};

const elements = {
  amount: document.querySelector('#amountInput'),
  dimeRate: document.querySelector('#dimeRateInput'),
  directThb: document.querySelector('#directThbResult'),
  usdReceived: document.querySelector('#usdReceived'),
  withdrawalFee: document.querySelector('#withdrawalFee'),
  twoStepThb: document.querySelector('#twoStepThbResult'),
  dimeUsdReceived: document.querySelector('#dimeUsdReceived'),
  megaTransferFee: document.querySelector('#megaTransferFee'),
  dimeTransactionFee: document.querySelector('#dimeTransactionFee'),
  dimeTransactionFormula: document.querySelector('#dimeTransactionFormula'),
  dimeFcdFee: document.querySelector('#dimeFcdFee'),
  dimeUsdFeesTotal: document.querySelector('#dimeUsdFeesTotal'),
  dimeThb: document.querySelector('#dimeThbResult'),
  thbDifference: document.querySelector('#thbDifference'),
  percentageDifference: document.querySelector('#percentageDifference'),
  differenceMessage: document.querySelector('#differenceMessage'),
  dimeThbDifference: document.querySelector('#dimeThbDifference'),
  dimePercentageDifference: document.querySelector('#dimePercentageDifference'),
  dimeDifferenceMessage: document.querySelector('#dimeDifferenceMessage'),
  directFormula: document.querySelector('#directFormula'),
  twoStepFormula: document.querySelector('#twoStepFormula'),
  dimeFormula: document.querySelector('#dimeFormula'),
  updatedLine: document.querySelector('#updatedLine'),
  megaUsdRate: document.querySelector('#megaUsdRate'),
  usdRate: document.querySelector('#usdRate'),
  twdRate: document.querySelector('#twdRate'),
  refresh: document.querySelector('#refreshButton'),
  liveBadge: document.querySelector('#liveBadge')
};

function formatNumber(value, maximumFractionDigits = 2) {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits
  }).format(value);
}

function calculate(amount, dimeRate) {
  const directThb = amount * state.rates.twdBuying;
  const usdReceived = Math.floor((amount / state.rates.megaUsdSpotSell) / USD_DENOMINATION) * USD_DENOMINATION;
  const withdrawalFee = usdReceived > 0
    ? Math.ceil(usdReceived / WITHDRAWAL_BLOCK_USD) * WITHDRAWAL_FEE_TWD
    : 0;
  const grossUsdThb = usdReceived * state.rates.usdBuying;
  const feeThb = withdrawalFee * state.rates.twdBuying;
  const twoStepThb = Math.max(0, grossUsdThb - feeThb);
  const thbDifference = twoStepThb - directThb;
  const percentageDifference = directThb > 0 ? (thbDifference / directThb) * 100 : 0;

  const megaTransferFee = usdReceived > 0 ? MEGA_TRANSFER_FEE_USD : 0;
  const dimeBaseFee = usdReceived > 0
    ? (usdReceived < DIME_FEE_THRESHOLD_USD ? DIME_LOW_FEE_USD : DIME_HIGH_FEE_USD)
    : 0;
  const dimeAdditionalFee = usdReceived > 0 ? DIME_ADDITIONAL_FEE_USD : 0;
  const dimeTransactionFee = dimeBaseFee + dimeAdditionalFee;
  const dimeUsdFeesTotal = megaTransferFee + dimeTransactionFee;
  const dimeFcdFee = usdReceived > 0 ? DIME_FCD_RECEIVING_FEE_THB : 0;
  const dimeNetUsd = Math.max(0, usdReceived - dimeUsdFeesTotal);
  const dimeThb = dimeRate > 0 ? Math.max(0, (dimeNetUsd * dimeRate) - dimeFcdFee) : 0;
  const dimeThbDifference = dimeThb - twoStepThb;
  const dimePercentageDifference = twoStepThb > 0 ? (dimeThbDifference / twoStepThb) * 100 : 0;

  return {
    directThb,
    usdReceived,
    withdrawalFee,
    grossUsdThb,
    feeThb,
    twoStepThb,
    thbDifference,
    percentageDifference,
    megaTransferFee,
    dimeBaseFee,
    dimeAdditionalFee,
    dimeTransactionFee,
    dimeUsdFeesTotal,
    dimeFcdFee,
    dimeNetUsd,
    dimeThb,
    dimeThbDifference,
    dimePercentageDifference
  };
}

function render() {
  const amount = Math.max(0, Number(elements.amount.value) || 0);
  const dimeRate = Math.max(0, Number(elements.dimeRate.value) || 0);
  const result = calculate(amount, dimeRate);

  elements.directThb.textContent = formatNumber(result.directThb);
  elements.usdReceived.textContent = formatNumber(result.usdReceived, 0);
  elements.withdrawalFee.textContent = formatNumber(result.withdrawalFee, 0);
  elements.twoStepThb.textContent = formatNumber(result.twoStepThb);
  elements.dimeUsdReceived.textContent = formatNumber(result.usdReceived, 0);
  elements.megaTransferFee.textContent = formatNumber(result.megaTransferFee, 2);
  elements.dimeTransactionFee.textContent = formatNumber(result.dimeTransactionFee, 2);
  elements.dimeTransactionFormula.textContent = result.usdReceived > 0
    ? `${formatNumber(result.dimeBaseFee, 0)} + ${formatNumber(result.dimeAdditionalFee, 0)} USD`
    : 'No transfer';
  elements.dimeFcdFee.textContent = formatNumber(result.dimeFcdFee, 0);
  elements.dimeUsdFeesTotal.textContent = formatNumber(result.dimeUsdFeesTotal, 2);
  elements.dimeThb.textContent = dimeRate > 0 ? formatNumber(result.dimeThb) : '—';

  const differenceSign = result.thbDifference > 0 ? '+' : result.thbDifference < 0 ? '−' : '';
  const percentageSign = result.percentageDifference > 0 ? '+' : result.percentageDifference < 0 ? '−' : '';
  elements.thbDifference.textContent = `${differenceSign}${formatNumber(Math.abs(result.thbDifference))}`;
  elements.percentageDifference.textContent = `${percentageSign}${formatNumber(Math.abs(result.percentageDifference), 2)}%`;
  elements.thbDifference.classList.toggle('positive', result.thbDifference > 0);
  elements.thbDifference.classList.toggle('negative', result.thbDifference < 0);
  elements.percentageDifference.classList.toggle('positive', result.percentageDifference > 0);
  elements.percentageDifference.classList.toggle('negative', result.percentageDifference < 0);
  elements.differenceMessage.textContent = result.thbDifference > 0
    ? 'MEGA BANK ATM USD CASH WITHDRAWAL route returns more THB.'
    : result.thbDifference < 0
      ? 'The direct route returns more THB.'
      : 'Both routes return the same THB.';

  if (dimeRate > 0) {
    const dimeDifferenceSign = result.dimeThbDifference > 0 ? '+' : result.dimeThbDifference < 0 ? '−' : '';
    const dimePercentageSign = result.dimePercentageDifference > 0 ? '+' : result.dimePercentageDifference < 0 ? '−' : '';
    elements.dimeThbDifference.textContent = `${dimeDifferenceSign}${formatNumber(Math.abs(result.dimeThbDifference))}`;
    elements.dimePercentageDifference.textContent = `${dimePercentageSign}${formatNumber(Math.abs(result.dimePercentageDifference), 2)}%`;
    elements.dimeThbDifference.classList.toggle('positive', result.dimeThbDifference > 0);
    elements.dimeThbDifference.classList.toggle('negative', result.dimeThbDifference < 0);
    elements.dimePercentageDifference.classList.toggle('positive', result.dimePercentageDifference > 0);
    elements.dimePercentageDifference.classList.toggle('negative', result.dimePercentageDifference < 0);
    elements.dimeDifferenceMessage.textContent = result.dimeThbDifference > 0
      ? 'The Dime! route returns more THB than option 2.'
      : result.dimeThbDifference < 0
        ? 'Option 2 returns more THB than the Dime! route.'
        : 'Options 2 and 3 return the same THB.';
  } else {
    elements.dimeThbDifference.textContent = '—';
    elements.dimePercentageDifference.textContent = '—';
    elements.dimeThbDifference.classList.remove('positive', 'negative');
    elements.dimePercentageDifference.classList.remove('positive', 'negative');
    elements.dimeDifferenceMessage.textContent = 'Enter the Dime! USD rate to compare options 2 and 3.';
  }

  elements.directFormula.textContent = `${formatNumber(amount)} TWD × ${state.rates.twdBuying.toFixed(3)} = ${formatNumber(result.directThb)} THB`;
  elements.twoStepFormula.textContent = `(${formatNumber(result.usdReceived, 0)} USD × ${state.rates.usdBuying.toFixed(2)}) − (${formatNumber(result.withdrawalFee, 0)} TWD × ${state.rates.twdBuying.toFixed(3)}) = ${formatNumber(result.twoStepThb)} THB`;
  elements.dimeFormula.textContent = dimeRate > 0
    ? `(${formatNumber(result.usdReceived, 0)} − ${formatNumber(result.dimeUsdFeesTotal, 2)}) USD × ${dimeRate.toFixed(4)} − ${formatNumber(result.dimeFcdFee, 0)} THB = ${formatNumber(result.dimeThb)} THB`
    : 'Enter a Dime! rate to calculate the final THB.';
  elements.megaUsdRate.textContent = state.rates.megaUsdSpotSell.toFixed(4);
  elements.usdRate.textContent = state.rates.usdBuying.toFixed(2);
  elements.twdRate.textContent = state.rates.twdBuying.toFixed(3);

  elements.liveBadge.classList.toggle('offline', !state.isLive);
  elements.liveBadge.lastChild.textContent = state.isLive ? ' Live market data' : ' Reference rates';
  const status = state.isLive ? 'Live rates' : 'Last known rates';
  elements.updatedLine.textContent = `${status} · Mega Bank ${state.rates.megaBankUpdatedAt} · SuperRich ${state.rates.branch}`;
}

async function loadRates() {
  elements.refresh.disabled = true;
  elements.refresh.classList.add('loading');
  elements.updatedLine.textContent = 'Refreshing Mega Bank and SuperRich rates…';

  if (window.location.protocol === 'file:') {
    state.isLive = false;
    elements.refresh.disabled = false;
    elements.refresh.classList.remove('loading');
    render();
    elements.updatedLine.textContent = 'Reference snapshot · Open http://localhost:4173 for live rates';
    return;
  }

  try {
    const response = await fetch('/api/rates', { cache: 'no-store' });
    if (!response.ok) throw new Error('Rate request failed');
    state.rates = await response.json();
    state.isLive = true;
  } catch (error) {
    state.isLive = false;
  } finally {
    elements.refresh.disabled = false;
    elements.refresh.classList.remove('loading');
    render();
  }
}

elements.amount.addEventListener('input', render);
elements.dimeRate.addEventListener('input', render);
elements.refresh.addEventListener('click', loadRates);

render();
loadRates();
