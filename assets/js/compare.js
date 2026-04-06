(function () {
  const form = document.querySelector('[data-compare-form]');
  if (!form) return;

  const formatKRW = (value) => `${new Intl.NumberFormat('ko-KR').format(Math.round(value))}원`;
  const formatKRWMonthly = (value) => `${formatKRW(value)} / 월`;

  const getNumber = (name) => {
    const input = form.elements[name];
    if (!input) return 0;
    const raw = String(input.value).replace(/,/g, '').trim();
    return Number(raw) || 0;
  };

  const setText = (selector, value) => {
    const node = document.querySelector(selector);
    if (node) node.textContent = value;
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
    const loanRate = getNumber('jeonseRate') / 100;
    const monthlyDeposit = getNumber('wolseDeposit');
    const monthlyRent = getNumber('monthlyRent');
    const maintenanceFee = getNumber('monthlyMaintenance');
    const months = getNumber('stayMonths');
    const opportunityRate = getNumber('opportunityRate') / 100;
    const brokerFee = getNumber('brokerFee');
    const movingCost = getNumber('movingCost');

    const jeonseLoanInterest = jeonseDeposit * loanRate * (months / 12);
    const jeonseOpportunityCost = jeonseDeposit * opportunityRate * (months / 12);
    const jeonseTotal = jeonseLoanInterest + jeonseOpportunityCost + brokerFee + movingCost;

    const wolseOpportunityCost = monthlyDeposit * opportunityRate * (months / 12);
    const wolseLivingCost = (monthlyRent + maintenanceFee) * months;
    const wolseTotal = wolseLivingCost + wolseOpportunityCost + brokerFee + movingCost;

    const cheaper = jeonseTotal < wolseTotal ? '전세' : '월세';
    const diff = Math.abs(jeonseTotal - wolseTotal);
    const jeonseMonthlyAverage = months > 0 ? jeonseTotal / months : 0;
    const wolseMonthlyAverage = months > 0 ? wolseTotal / months : 0;
    const avg = Math.min(jeonseTotal, wolseTotal) / (months || 1);

    setText('[data-output="jeonse-total"]', formatKRW(jeonseTotal));
    setText('[data-output="wolse-total"]', formatKRW(wolseTotal));
    setText('[data-output="jeonse-monthly-average"]', formatKRWMonthly(jeonseMonthlyAverage));
    setText('[data-output="wolse-monthly-average"]', formatKRWMonthly(wolseMonthlyAverage));
    setText('[data-output="difference"]', formatKRW(diff));
    setText('[data-output="better-option"]', diff === 0 ? '비슷함' : cheaper);
    setText('[data-output="summary"]', `현재 입력 기준으로는 ${cheaper}가 더 유리하며, 총비용 차이는 약 ${formatKRW(diff)}입니다. 유리한 선택의 월평균 부담은 약 ${formatKRWMonthly(avg)}입니다.`);

    setText('[data-output="loan-interest"]', formatKRW(jeonseLoanInterest));
    setText('[data-output="jeonse-opportunity"]', formatKRW(jeonseOpportunityCost));
    setText('[data-output="wolse-opportunity"]', formatKRW(wolseOpportunityCost));
    setText('[data-output="living-cost"]', formatKRW(wolseLivingCost));

    const diffTarget = document.querySelector('[data-output="difference"]');
    const betterTarget = document.querySelector('[data-output="better-option"]');
    if (diffTarget) diffTarget.className = `kpi-value ${cheaper === '전세' ? 'good' : 'warn'}`;
    if (betterTarget) betterTarget.className = `kpi-value ${cheaper === '전세' ? 'good' : 'warn'}`;
  };

  bindFormatting();
  form.addEventListener('input', calculate);
  calculate();
})();
