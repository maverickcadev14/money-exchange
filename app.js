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

const state = {
  rates: { ...FALLBACK_RATES },
  isLive: false
};

const elements = {
  amount: document.querySelector('#amountInput'),
  directThb: document.querySelector('#directThbResult'),
  usdReceived: document.querySelector('#usdReceived'),
  withdrawalFee: document.querySelector('#withdrawalFee'),
  twoStepThb: document.querySelector('#twoStepThbResult'),
  thbDifference: document.querySelector('#thbDifference'),
  percentageDifference: document.querySelector('#percentageDifference'),
  differenceMessage: document.querySelector('#differenceMessage'),
  directFormula: document.querySelector('#directFormula'),
  twoStepFormula: document.querySelector('#twoStepFormula'),
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

function calculate(amount) {
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

  return { directThb, usdReceived, withdrawalFee, grossUsdThb, feeThb, twoStepThb, thbDifference, percentageDifference };
}

function render() {
  const amount = Math.max(0, Number(elements.amount.value) || 0);
  const result = calculate(amount);

  elements.directThb.textContent = formatNumber(result.directThb);
  elements.usdReceived.textContent = formatNumber(result.usdReceived, 0);
  elements.withdrawalFee.textContent = formatNumber(result.withdrawalFee, 0);
  elements.twoStepThb.textContent = formatNumber(result.twoStepThb);

  const differenceSign = result.thbDifference > 0 ? '+' : result.thbDifference < 0 ? '−' : '';
  const percentageSign = result.percentageDifference > 0 ? '+' : result.percentageDifference < 0 ? '−' : '';
  elements.thbDifference.textContent = `${differenceSign}${formatNumber(Math.abs(result.thbDifference))}`;
  elements.percentageDifference.textContent = `${percentageSign}${formatNumber(Math.abs(result.percentageDifference), 2)}%`;
  elements.differenceMessage.textContent = result.thbDifference > 0
    ? 'The two-step route returns more THB.'
    : result.thbDifference < 0
      ? 'The direct route returns more THB.'
      : 'Both routes return the same THB.';

  elements.directFormula.textContent = `${formatNumber(amount)} TWD × ${state.rates.twdBuying.toFixed(3)} = ${formatNumber(result.directThb)} THB`;
  elements.twoStepFormula.textContent = `(${formatNumber(result.usdReceived, 0)} USD × ${state.rates.usdBuying.toFixed(2)}) − (${formatNumber(result.withdrawalFee, 0)} TWD × ${state.rates.twdBuying.toFixed(3)}) = ${formatNumber(result.twoStepThb)} THB`;
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
elements.refresh.addEventListener('click', loadRates);

render();
loadRates();
