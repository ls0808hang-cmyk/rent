(function () {
  const form = document.querySelector('[data-compare-form]');
  if (!form) return;

  const formatKRW = (value) => `${new Intl.NumberFormat('ko-KR').format(Math.round(value))}원`;
  const formatKRWMonthly = (value) => `${formatKRW(value)} / 월`;

  const getNumber = (...names) => {
    for (const name of names) {
      const input = form.elements[name] || document.getElementById(name);
      if (!input) continue;
      const raw = String(input.value ?? '').replace(/,/g, '').trim();
      return Number(raw) || 0;
    }

    return 0;
  };

  const setText = (selectors, value) => {
    const targets = Array.isArray(selectors) ? selectors : [selectors];

    targets.forEach((selector) => {
      const node = selector.startsWith('#') ? document.querySelector(selector) : document.querySelector(selector);
      if (node) node.textContent = value;
    });
  };

  const applyStateClass = (selector, tone) => {
    const node = document.querySelector(selector);
    if (!node) return;

    node.classList.remove('good', 'warn');
    if (tone) node.classList.add(tone);
  };

  const bindFormatting = () => {
    form.querySelectorAll('input[data-format="number"]').forEach((input) => {
      input.addEventListener('input', function () {
        const cleaned = this.value.replace(/[^\d]/g, '');
        this.value = cleaned ? new Intl.NumberFormat('ko-KR').format(Number(cleaned)) : '';
      });
    });

    form.querySelectorAll('input[data-format="percent"]').forEach((input) => {
      input.addEventListener('input', function () {
        const cleaned = this.value.replace(/[^\d.]/g, '');
        const parts = cleaned.split('.');
        this.value = parts.length > 2 ? `${parts[0]}.${parts.slice(1).join('')}` : cleaned;
      });
    });
  };

  const calculate = () => {
    const jeonseDeposit = getNumber('jeonseDeposit');
    const loanRate = getNumber('loanRate', 'jeonseRate') / 100;
    const monthlyDeposit = getNumber('monthlyDeposit', 'wolseDeposit');
    const monthlyRent = getNumber('monthlyRent');
    const maintenanceFee = getNumber('maintenanceFee', 'monthlyMaintenance');
    const months = Math.max(getNumber('months', 'stayMonths'), 1);
    const opportunityRate = getNumber('opportunityRate') / 100;
    const brokerFee = getNumber('brokerFee');
    const movingCost = getNumber('movingCost');

    const jeonseLoanInterest = jeonseDeposit * loanRate * (months / 12);
    const jeonseOpportunityCost = jeonseDeposit * opportunityRate * (months / 12);
    const jeonseTotal = jeonseLoanInterest + jeonseOpportunityCost + brokerFee + movingCost;

    const wolseOpportunityCost = monthlyDeposit * opportunityRate * (months / 12);
    const wolseLivingCost = (monthlyRent + maintenanceFee) * months;
    const wolseTotal = wolseLivingCost + wolseOpportunityCost + brokerFee + movingCost;

    const diff = Math.abs(jeonseTotal - wolseTotal);
    const isTie = diff === 0;
    const cheaper = isTie ? '비슷함' : jeonseTotal < wolseTotal ? '전세' : '월세';
    const betterMonthlyAverage = Math.min(jeonseTotal, wolseTotal) / months;
    const summary = isTie
      ? `현재 입력 기준으로는 전세와 월세의 총비용이 거의 같습니다. 월평균 실질 주거비는 약 ${formatKRWMonthly(betterMonthlyAverage)}입니다.`
      : `현재 입력 기준으로는 ${cheaper}가 더 유리하며, 총비용 차이는 약 ${formatKRW(diff)}입니다. 유리한 선택의 월평균 부담은 약 ${formatKRWMonthly(betterMonthlyAverage)}입니다.`;

    setText(['#jeonseTotal', '[data-output="jeonse-total"]'], formatKRW(jeonseTotal));
    setText(['#wolseTotal', '[data-output="wolse-total"]'], formatKRW(wolseTotal));
    setText(['#monthlyAverage'], formatKRWMonthly(betterMonthlyAverage));
    setText(['#difference', '[data-output="difference"]'], formatKRW(diff));
    setText(['#summaryText', '[data-output="summary"]'], summary);

    setText('[data-output="jeonse-monthly-average"]', formatKRWMonthly(jeonseTotal / months));
    setText('[data-output="wolse-monthly-average"]', formatKRWMonthly(wolseTotal / months));
    setText('[data-output="better-option"]', cheaper);

    setText(['#loanInterest', '[data-output="loan-interest"]'], formatKRW(jeonseLoanInterest));
    setText(['#jeonseOpportunity', '[data-output="jeonse-opportunity"]'], formatKRW(jeonseOpportunityCost));
    setText(['#wolseOpportunity', '[data-output="wolse-opportunity"]'], formatKRW(wolseOpportunityCost));
    setText(['#livingCost', '[data-output="living-cost"]'], formatKRW(wolseLivingCost));

    const tone = isTie ? '' : jeonseTotal < wolseTotal ? 'good' : 'warn';
    applyStateClass('#difference', tone);
    applyStateClass('[data-output="difference"]', tone);
    applyStateClass('[data-output="better-option"]', tone);
  };

  bindFormatting();
  form.addEventListener('input', calculate);
  calculate();
})();
