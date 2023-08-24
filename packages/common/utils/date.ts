const TIME_UNITS = {
  second: 1,
  minute: 60,
  hour: 60 * 60,
  day: 24 * 60 * 60,
  week: 7 * 24 * 60 * 60,
  // After that you need more context a single number can provide. So we'll just skip that for now.
};

const SORTED_TIME_UNIT_PAIRS = [...Object.entries(TIME_UNITS)].sort(
  (a, b) => a[1] - b[1],
);

export function humanTime(seconds: number) {
  let index = SORTED_TIME_UNIT_PAIRS.length;
  for (let i = 1; i < SORTED_TIME_UNIT_PAIRS.length; i++) {
    if (seconds < SORTED_TIME_UNIT_PAIRS[i][1]) {
      index = i;
      break;
    }
  }
  const [unit, unitValue] = SORTED_TIME_UNIT_PAIRS[index - 1];
  const value = seconds / unitValue;
  if (value === 1) {
    return {
      value: value,
      units: unit,
    };
  } else {
    // TODO: replace with proper i18n
    return {
      value: value,
      units: `${unit}s`,
    };
  }
}
