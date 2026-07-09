const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'];
const MONTHS = [
  'януари', 'февруари', 'март', 'април', 'май', 'юни',
  'юли', 'август', 'септември', 'октомври', 'ноември', 'декември',
];

let activePickerClose = null;

function parseDateKey(dateKey) {
  const [y, m, d] = dateKey.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function toDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate();
}

export function formatChipDate(dateKey, todayKey) {
  const date = parseDateKey(dateKey);
  const primary = dateKey === todayKey
    ? 'Днес'
    : date.toLocaleDateString('bg-BG', { weekday: 'long' });
  const secondary = date.toLocaleDateString('bg-BG', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  return { primary, secondary };
}

export function initTrackerCalendar({
  chipEl,
  primaryEl,
  secondaryEl,
  popupEl,
  todayBtnEl,
  rootEl,
  getSelectedDate,
  setSelectedDate,
  getTodayKey,
  onDateChange,
  useFixedPosition = false,
}) {
  const pickerRoot = rootEl || chipEl?.parentElement;
  let viewDate = parseDateKey(getSelectedDate());
  let open = false;

  function updateChip() {
    const { primary, secondary } = formatChipDate(getSelectedDate(), getTodayKey());
    primaryEl.textContent = primary;
    secondaryEl.textContent = secondary;
    chipEl.classList.toggle('is-today', getSelectedDate() === getTodayKey());
    if (todayBtnEl) {
      todayBtnEl.hidden = getSelectedDate() === getTodayKey();
    }
  }

  function positionPopup() {
    if (!useFixedPosition) {
      popupEl.style.position = '';
      popupEl.style.top = '';
      popupEl.style.left = '';
      popupEl.style.width = '';
      return;
    }
    const rect = chipEl.getBoundingClientRect();
    popupEl.style.position = 'fixed';
    popupEl.style.top = `${rect.bottom + 8}px`;
    popupEl.style.left = `${Math.max(12, rect.left)}px`;
    popupEl.style.width = `${Math.min(18.5 * 16, window.innerWidth - 24)}px`;
    popupEl.style.zIndex = '1065';
  }

  function close() {
    open = false;
    popupEl.hidden = true;
    chipEl.setAttribute('aria-expanded', 'false');
    if (activePickerClose === close) activePickerClose = null;
  }

  function openPopup() {
    if (activePickerClose && activePickerClose !== close) {
      activePickerClose();
    }
    activePickerClose = close;

    viewDate = parseDateKey(getSelectedDate());
    open = true;
    positionPopup();
    popupEl.hidden = false;
    chipEl.setAttribute('aria-expanded', 'true');
    render();
  }

  function selectDate(dateKey) {
    setSelectedDate(dateKey);
    updateChip();
    onDateChange(dateKey);
    close();
  }

  function render() {
    const today = parseDateKey(getTodayKey());
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const startOffset = (firstDay.getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    let cells = '';
    for (let i = 0; i < startOffset; i++) {
      cells += '<span class="md-cal-day md-cal-day--empty"></span>';
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateKey = toDateKey(date);
      const isFuture = date > today;
      const isToday = isSameDay(date, today);
      const isSelected = dateKey === getSelectedDate();
      const classes = [
        'md-cal-day',
        isToday ? 'md-cal-day--today' : '',
        isSelected ? 'md-cal-day--selected' : '',
        isFuture ? 'md-cal-day--disabled' : '',
      ].filter(Boolean).join(' ');
      cells += `<button type="button" class="${classes}" data-day="${dateKey}" ${isFuture ? 'disabled' : ''}>${day}</button>`;
    }

    popupEl.innerHTML = `
      <div class="md-cal-header">
        <button type="button" class="md-cal-nav" data-nav="-1" aria-label="Предишен месец"><i class="bi bi-chevron-left"></i></button>
        <span class="md-cal-title">${MONTHS[month]} ${year}</span>
        <button type="button" class="md-cal-nav" data-nav="1" aria-label="Следващ месец"><i class="bi bi-chevron-right"></i></button>
      </div>
      <div class="md-cal-weekdays">${WEEKDAYS.map((d) => `<span>${d}</span>`).join('')}</div>
      <div class="md-cal-grid">${cells}</div>`;

    popupEl.querySelectorAll('[data-nav]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        viewDate.setMonth(viewDate.getMonth() + Number(btn.dataset.nav));
        render();
      });
    });

    popupEl.querySelectorAll('[data-day]:not([disabled])').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        selectDate(btn.dataset.day);
      });
    });
  }

  chipEl.addEventListener('click', (e) => {
    e.stopPropagation();
    if (open) close();
    else openPopup();
  });

  todayBtnEl?.addEventListener('click', () => {
    selectDate(getTodayKey());
  });

  const onDocumentClick = (e) => {
    if (!open) return;
    if (!popupEl.contains(e.target) && !chipEl.contains(e.target)) {
      close();
    }
  };

  const onKeyDown = (e) => {
    if (e.key === 'Escape' && open) close();
  };

  const onResize = () => {
    if (open) positionPopup();
  };

  document.addEventListener('click', onDocumentClick);
  document.addEventListener('keydown', onKeyDown);
  window.addEventListener('resize', onResize);

  updateChip();

  return {
    updateChip,
    close,
    destroy: () => {
      close();
      document.removeEventListener('click', onDocumentClick);
      document.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('resize', onResize);
    },
  };
}
