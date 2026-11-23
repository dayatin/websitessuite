/**
 * UnitAtlas High-Precision Unit Conversion Engine
 * Universal dimensional analysis across scientific, engineering, and everyday metrics.
 */

export type DimensionKey =
  | "length"
  | "mass"
  | "temperature"
  | "digital"
  | "speed"
  | "pressure"
  | "energy";

export interface UnitDefinition {
  key: string;
  name: string;
  symbol: string;
  ratioToBase?: number; // Multiplier to reach base unit (for linear dimensions)
}

export interface DimensionMeta {
  key: DimensionKey;
  name: string;
  icon: string;
  baseUnit: string;
  units: UnitDefinition[];
}

export const DIMENSIONS: Record<DimensionKey, DimensionMeta> = {
  length: {
    key: "length",
    name: "Length & Distance",
    icon: "📏",
    baseUnit: "m",
    units: [
      { key: "m", name: "Meters", symbol: "m", ratioToBase: 1 },
      { key: "km", name: "Kilometers", symbol: "km", ratioToBase: 1000 },
      { key: "cm", name: "Centimeters", symbol: "cm", ratioToBase: 0.01 },
      { key: "mm", name: "Millimeters", symbol: "mm", ratioToBase: 0.001 },
      { key: "in", name: "Inches", symbol: "in", ratioToBase: 0.0254 },
      { key: "ft", name: "Feet", symbol: "ft", ratioToBase: 0.3048 },
      { key: "yd", name: "Yards", symbol: "yd", ratioToBase: 0.9144 },
      { key: "mi", name: "Miles", symbol: "mi", ratioToBase: 1609.344 },
      { key: "nmi", name: "Nautical Miles", symbol: "nmi", ratioToBase: 1852 },
    ],
  },
  mass: {
    key: "mass",
    name: "Mass & Weight",
    icon: "⚖️",
    baseUnit: "kg",
    units: [
      { key: "kg", name: "Kilograms", symbol: "kg", ratioToBase: 1 },
      { key: "g", name: "Grams", symbol: "g", ratioToBase: 0.001 },
      { key: "mg", name: "Milligrams", symbol: "mg", ratioToBase: 0.000001 },
      { key: "lb", name: "Pounds", symbol: "lb", ratioToBase: 0.45359237 },
      { key: "oz", name: "Ounces", symbol: "oz", ratioToBase: 0.028349523125 },
      { key: "st", name: "Stone", symbol: "st", ratioToBase: 6.35029318 },
      { key: "t", name: "Metric Tons", symbol: "t", ratioToBase: 1000 },
    ],
  },
  temperature: {
    key: "temperature",
    name: "Temperature",
    icon: "🌡️",
    baseUnit: "c",
    units: [
      { key: "c", name: "Celsius", symbol: "°C" },
      { key: "f", name: "Fahrenheit", symbol: "°F" },
      { key: "k", name: "Kelvin", symbol: "K" },
      { key: "r", name: "Rankine", symbol: "°R" },
    ],
  },
  digital: {
    key: "digital",
    name: "Digital Data Storage",
    icon: "💾",
    baseUnit: "B",
    units: [
      { key: "B", name: "Bytes", symbol: "B", ratioToBase: 1 },
      { key: "KB", name: "Kilobytes (Decimal)", symbol: "KB", ratioToBase: 1e3 },
      { key: "MB", name: "Megabytes (Decimal)", symbol: "MB", ratioToBase: 1e6 },
      { key: "GB", name: "Gigabytes (Decimal)", symbol: "GB", ratioToBase: 1e9 },
      { key: "TB", name: "Terabytes (Decimal)", symbol: "TB", ratioToBase: 1e12 },
      { key: "KiB", name: "Kibibytes (Binary)", symbol: "KiB", ratioToBase: 1024 },
      { key: "MiB", name: "Mebibytes (Binary)", symbol: "MiB", ratioToBase: 1048576 },
      { key: "GiB", name: "Gibibytes (Binary)", symbol: "GiB", ratioToBase: 1073741824 },
      { key: "TiB", name: "Tebibytes (Binary)", symbol: "TiB", ratioToBase: 1099511627776 },
    ],
  },
  speed: {
    key: "speed",
    name: "Speed & Velocity",
    icon: "⚡",
    baseUnit: "m/s",
    units: [
      { key: "m/s", name: "Meters per second", symbol: "m/s", ratioToBase: 1 },
      { key: "km/h", name: "Kilometers per hour", symbol: "km/h", ratioToBase: 1 / 3.6 },
      { key: "mph", name: "Miles per hour", symbol: "mph", ratioToBase: 0.44704 },
      { key: "knot", name: "Knots", symbol: "kn", ratioToBase: 1852 / 3600 },
      { key: "ft/s", name: "Feet per second", symbol: "ft/s", ratioToBase: 0.3048 },
    ],
  },
  pressure: {
    key: "pressure",
    name: "Pressure",
    icon: "🌀",
    baseUnit: "Pa",
    units: [
      { key: "Pa", name: "Pascals", symbol: "Pa", ratioToBase: 1 },
      { key: "kPa", name: "Kilopascals", symbol: "kPa", ratioToBase: 1000 },
      { key: "bar", name: "Bar", symbol: "bar", ratioToBase: 100000 },
      { key: "psi", name: "Pounds per sq inch", symbol: "psi", ratioToBase: 6894.757293168 },
      { key: "atm", name: "Atmospheres", symbol: "atm", ratioToBase: 101325 },
      { key: "torr", name: "Torr (mmHg)", symbol: "Torr", ratioToBase: 101325 / 760 },
    ],
  },
  energy: {
    key: "energy",
    name: "Energy & Work",
    icon: "🔋",
    baseUnit: "J",
    units: [
      { key: "J", name: "Joules", symbol: "J", ratioToBase: 1 },
      { key: "kJ", name: "Kilojoules", symbol: "kJ", ratioToBase: 1000 },
      { key: "cal", name: "Calories", symbol: "cal", ratioToBase: 4.184 },
      { key: "kcal", name: "Kilocalories (Food)", symbol: "kcal", ratioToBase: 4184 },
      { key: "Wh", name: "Watt-hours", symbol: "Wh", ratioToBase: 3600 },
      { key: "kWh", name: "Kilowatt-hours", symbol: "kWh", ratioToBase: 3.6e6 },
      { key: "BTU", name: "British Thermal Units", symbol: "BTU", ratioToBase: 1055.05585 },
    ],
  },
};

export interface ConversionResult {
  value: number;
  result: number;
  fromUnit: UnitDefinition;
  toUnit: UnitDefinition;
  dimension: DimensionKey;
  formula: string;
  formattedResult: string;
}

// Temperature affine transformation helpers
function convertTemperature(
  value: number,
  from: string,
  to: string,
): { result: number; formula: string } {
  // 1. Convert from any to Celsius
  let celsius = 0;
  if (from === "c") celsius = value;
  else if (from === "f") celsius = ((value - 32) * 5) / 9;
  else if (from === "k") celsius = value - 273.15;
  else if (from === "r") celsius = ((value - 491.67) * 5) / 9;
  else throw new Error(`Unknown temperature unit: ${from}`);

  // 2. Convert from Celsius to target
  let result = 0;
  let formula = "";

  if (to === "c") {
    result = celsius;
    formula = from === "f" ? "(°F - 32) × 5/9 = °C" : from === "k" ? "K - 273.15 = °C" : "°C";
  } else if (to === "f") {
    result = (celsius * 9) / 5 + 32;
    formula =
      from === "c" ? "(°C × 9/5) + 32 = °F" : from === "k" ? "(K - 273.15) × 9/5 + 32 = °F" : "°F";
  } else if (to === "k") {
    result = celsius + 273.15;
    formula =
      from === "c" ? "°C + 273.15 = K" : from === "f" ? "((°F - 32) × 5/9) + 273.15 = K" : "K";
  } else if (to === "r") {
    result = ((celsius + 273.15) * 9) / 5;
    formula = "(°C + 273.15) × 9/5 = °R";
  } else {
    throw new Error(`Unknown temperature unit: ${to}`);
  }

  return { result, formula };
}

export function convertUnit(
  value: number,
  dimensionKey: DimensionKey,
  fromKey: string,
  toKey: string,
): ConversionResult {
  const dimension = DIMENSIONS[dimensionKey];
  if (!dimension) {
    throw new Error(`Invalid dimension: ${dimensionKey}`);
  }

  const fromUnit = dimension.units.find((u) => u.key === fromKey);
  const toUnit = dimension.units.find((u) => u.key === toKey);

  if (!fromUnit || !toUnit) {
    throw new Error(`Invalid unit keys '${fromKey}' or '${toKey}' in dimension '${dimensionKey}'`);
  }

  if (dimensionKey === "temperature") {
    const { result, formula } = convertTemperature(value, fromKey, toKey);
    const rounded = Math.round(result * 10000) / 10000;
    return {
      value,
      result: rounded,
      fromUnit,
      toUnit,
      dimension: dimensionKey,
      formula,
      formattedResult: rounded.toLocaleString("en-US", { maximumFractionDigits: 4 }),
    };
  }

  const ratioFrom = fromUnit.ratioToBase ?? 1;
  const ratioTo = toUnit.ratioToBase ?? 1;

  // Linear dimensional calculation
  const baseValue = value * ratioFrom;
  const rawResult = baseValue / ratioTo;
  const rounded = Math.round(rawResult * 1e8) / 1e8;

  const factor = ratioFrom / ratioTo;
  const formula = `Multiply by ${factor >= 0.0001 && factor <= 10000 ? factor : factor.toExponential(4)}`;

  return {
    value,
    result: rounded,
    fromUnit,
    toUnit,
    dimension: dimensionKey,
    formula,
    formattedResult:
      Math.abs(rounded) < 0.0001 && rounded !== 0
        ? rounded.toExponential(4)
        : rounded.toLocaleString("en-US", { maximumFractionDigits: 6 }),
  };
}

export interface PairwiseRouteMeta {
  slug: string;
  fromKey: string;
  toKey: string;
  dimension: DimensionKey;
  title: string;
  description: string;
}

export const POPULAR_CONVERSIONS: PairwiseRouteMeta[] = [
  {
    slug: "meters-to-feet",
    fromKey: "m",
    toKey: "ft",
    dimension: "length",
    title: "Meters to Feet Converter (m to ft)",
    description:
      "Convert meters to feet with precision decimal calculation and printable conversion table.",
  },
  {
    slug: "feet-to-meters",
    fromKey: "ft",
    toKey: "m",
    dimension: "length",
    title: "Feet to Meters Converter (ft to m)",
    description: "Convert feet to metric meters instantly with standard international SI ratio.",
  },
  {
    slug: "celsius-to-fahrenheit",
    fromKey: "c",
    toKey: "f",
    dimension: "temperature",
    title: "Celsius to Fahrenheit Converter (°C to °F)",
    description:
      "Convert Celsius temperature degrees to Fahrenheit with instant formula breakdown (°C × 9/5 + 32).",
  },
  {
    slug: "fahrenheit-to-celsius",
    fromKey: "f",
    toKey: "c",
    dimension: "temperature",
    title: "Fahrenheit to Celsius Converter (°F to °C)",
    description:
      "Convert Fahrenheit degrees to Celsius with exact thermodynamic calculation ((°F - 32) × 5/9).",
  },
  {
    slug: "kilograms-to-pounds",
    fromKey: "kg",
    toKey: "lb",
    dimension: "mass",
    title: "Kilograms to Pounds Converter (kg to lbs)",
    description:
      "Convert metric kilograms to avoirdupois pounds with official NBS conversion ratio.",
  },
  {
    slug: "pounds-to-kilograms",
    fromKey: "lb",
    toKey: "kg",
    dimension: "mass",
    title: "Pounds to Kilograms Converter (lbs to kg)",
    description:
      "Convert pounds to kilograms for fitness, travel baggage, and scientific measurement.",
  },
  {
    slug: "gigabytes-to-megabytes",
    fromKey: "GB",
    toKey: "MB",
    dimension: "digital",
    title: "Gigabytes to Megabytes Converter (GB to MB)",
    description:
      "Convert decimal storage Gigabytes to Megabytes (1 GB = 1,000 MB) for bandwidth and cloud storage.",
  },
  {
    slug: "miles-per-hour-to-kilometers-per-hour",
    fromKey: "mph",
    toKey: "km/h",
    dimension: "speed",
    title: "Miles per Hour to Kilometers per Hour (mph to km/h)",
    description:
      "Convert vehicle speed from imperial mph to metric km/h for international road travel.",
  },
  {
    slug: "psi-to-bar",
    fromKey: "psi",
    toKey: "bar",
    dimension: "pressure",
    title: "PSI to Bar Pressure Converter (psi to bar)",
    description: "Convert tire and hydraulic pressure from pounds per square inch to bar units.",
  },
  {
    slug: "kilowatt-hours-to-joules",
    fromKey: "kWh",
    toKey: "J",
    dimension: "energy",
    title: "Kilowatt-Hours to Joules Converter (kWh to J)",
    description:
      "Convert electrical energy from kilowatt-hours to SI metric joules (1 kWh = 3,600,000 J).",
  },
];

export function generateReferenceTable(
  dimensionKey: DimensionKey,
  fromKey: string,
  toKey: string,
  values = [1, 2, 5, 10, 20, 50, 100],
): { input: number; output: number; formattedOutput: string }[] {
  return values.map((val) => {
    const res = convertUnit(val, dimensionKey, fromKey, toKey);
    return {
      input: val,
      output: res.result,
      formattedOutput: res.formattedResult,
    };
  });
}
