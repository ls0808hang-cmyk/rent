function formatKRW(value) {
  return new Intl.NumberFormat('ko-KR').format(Math.round(value)) + '원';
}

function getNumber(id) {
  const element = document.getElementById(id);
  if (!element) return 0;

  const value = Number(element.value);
  return Number.isFinite(value) ? value : 0;
}

function clampMin(value, min = 0) {
  return value < min ? min : value;
}

function calculate() {
  const jeonseDeposit = clampMin(getNumber('jeonseDeposit'));
  const loanRate = clampMin(getNumber('loanRate')) / 100;
  const monthlyDeposit = clampMin(getNumber('monthlyDeposit'));
  const monthlyRent = clampMin(getNumber('monthlyRent'));
  const maintenanceFee = clampMin(getNumber('maintenanceFee'));
  const months = Math.max(1, Math.floor(getNumber('months') || 1));
  const opportunityRate = clampMin(getNumber('opportunityRate')) / 100;
  const brokerFee = clampMin(getNumber('brokerFee'));
  const movingCost = clampMin(getNumber('movingCost'));

  const jeonseLoanInterest = jeonseDeposit * loanRate * (months / 12);
  const jeonseOpportunityCost = jeonseDeposit * opportunityRate * (months / 12);
  const jeonseTotal = jeonseLoanInterest + jeonseOpportunityCost + brokerFee + movingCost;

  const wolseOpportunityCost = monthlyDeposit * opportunityRate * (months / 12);
  const wolseTotal =
    (monthlyRent + maintenanceFee) * months +
    wolseOpportunityCost +
    brokerFee +
    movingCost;

  const difference = Math.abs(jeonseTotal - wolseTotal);
  const cheaperType = jeonseTotal < wolseTotal ? '전세' : '월세';
  const cheaperTotal = Math.min(jeonseTotal, wolseTotal);
  const monthlyAverage = cheaperTotal / months;

  const jeonseTotalEl = document.getElementById('jeonseTotal');
  const wolseTotalEl = document.getElementById('wolseTotal');
  const monthlyAverageEl = document.getElementById('monthlyAverage');
  const differenceEl = document.getElementById('difference');
  const summaryTextEl = document.getElementById('summaryText');
  const loanInterestEl = document.getElementById('loanInterest');
  const jeonseOpportunityEl = document.getElementById('jeonseOpportunity');
  const wolseOpportunityEl = document.getElementById('wolseOpportunity');
  const livingCostEl = document.getElementById('livingCost');

  if (jeonseTotalEl) jeonseTotalEl.textContent = formatKRW(jeonseTotal);
  if (wolseTotalEl) wolseTotalEl.textContent = formatKRW(wolseTotal);
  if (monthlyAverageEl) monthlyAverageEl.textContent = formatKRW(monthlyAverage);
  if (differenceEl) differenceEl.textContent = formatKRW(difference);
  if (loanInterestEl) loanInterestEl.textContent = formatKRW(jeonseLoanInterest);
  if (jeonseOpportunityEl) jeonseOpportunityEl.textContent = formatKRW(jeonseOpportunityCost);
  if (wolseOpportunityEl) wolseOpportunityEl.textContent = formatKRW(wolseOpportunityCost);
  if (livingCostEl) livingCostEl.textContent = formatKRW((monthlyRent + maintenanceFee) * months);

  if (summaryTextEl) {
    if (jeonseTotal === wolseTotal) {
      summaryTextEl.textContent =
        `현재 입력 기준으로 전세와 월세의 총비용 차이는 거의 없으며, 총비용은 약 ${formatKRW(jeonseTotal)}입니다.`;
    } else {
      summaryTextEl.textContent =
        `현재 입력 기준으로는 ${cheaperType}가 더 유리하며, 총비용 차이는 약 ${formatKRW(difference)}입니다. 더 유리한 선택의 월평균 실질 주거비는 약 ${formatKRW(monthlyAverage)}입니다.`;
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('compareForm');
  if (!form) return;

  const inputs = form.querySelectorAll('input, select, textarea');
  inputs.forEach((input) => {
    input.addEventListener('input', calculate);
    input.addEventListener('change', calculate);
  });

  calculate();
});
