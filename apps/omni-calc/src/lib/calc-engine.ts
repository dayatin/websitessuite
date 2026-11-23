/**
 * OmniCalc Multi-Domain Calculation Engine
 * Covers Financial Amortization, Compound Growth, Health Biometrics & Everyday Math.
 */

export interface MortgageResult {
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  yearlySchedule: {
    year: number;
    principalPaid: number;
    interestPaid: number;
    remainingBalance: number;
  }[];
}

export interface CompoundInterestResult {
  futureValue: number;
  totalPrincipal: number;
  totalContributions: number;
  totalInterestEarned: number;
  yearlyBreakdown: {
    year: number;
    deposits: number;
    interest: number;
    balance: number;
  }[];
}

export interface BMIResult {
  bmi: number;
  category: "Underweight" | "Normal Weight" | "Overweight" | "Obesity";
  healthyMinKg: number;
  healthyMaxKg: number;
  summary: string;
}

export interface TDEEResult {
  bmr: number;
  maintenanceCalories: number;
  mildDeficitCalories: number; // 15% deficit for fat loss
  mildSurplusCalories: number; // 10% surplus for lean muscle
}

export interface CalculatorMeta {
  slug: string;
  title: string;
  category: "finance" | "health" | "math";
  icon: string;
  description: string;
  formulaDescription: string;
}

export const CALCULATORS: CalculatorMeta[] = [
  {
    slug: "mortgage-calculator",
    title: "Mortgage & Loan Amortization Calculator",
    category: "finance",
    icon: "🏠",
    description:
      "Calculate exact monthly mortgage payments, total interest costs, and full yearly amortization schedules.",
    formulaDescription:
      "Uses standard fixed-rate annuity amortization formula M = P [ r(1 + r)^n ] / [ (1 + r)^n - 1 ].",
  },
  {
    slug: "compound-interest-calculator",
    title: "Compound Interest & Investment Growth",
    category: "finance",
    icon: "📈",
    description:
      "Simulate long-term wealth accumulation with periodic monthly contributions and compound frequency.",
    formulaDescription:
      "Calculates future balance with periodic compounding: A = P(1 + r/n)^(nt) + PMT * [ ((1 + r/n)^(nt) - 1) / (r/n) ].",
  },
  {
    slug: "bmi-calculator",
    title: "BMI Body Mass Index Calculator",
    category: "health",
    icon: "⚖️",
    description:
      "Determine your official WHO Body Mass Index classification and healthy target weight range.",
    formulaDescription:
      "Standard World Health Organization BMI formula: Weight (kg) / [ Height (m) ]^2.",
  },
  {
    slug: "calorie-tdee-calculator",
    title: "TDEE & Caloric Maintenance Calculator",
    category: "health",
    icon: "🔥",
    description:
      "Calculate your Basal Metabolic Rate (BMR) and Total Daily Energy Expenditure (TDEE) for cutting, bulking, or maintenance.",
    formulaDescription:
      "Powered by the clinically validated Mifflin-St Jeor equation and physical activity multipliers.",
  },
  {
    slug: "tip-and-split-calculator",
    title: "Tip & Bill Splitter Calculator",
    category: "math",
    icon: "🧾",
    description:
      "Calculate fair restaurant tipping percentages, tax additions, and split the final bill evenly among diners.",
    formulaDescription:
      "Calculates proportional gratuity and per-person contributions with rounding precision.",
  },
  {
    slug: "percentage-change-calculator",
    title: "Percentage Change & Difference Calculator",
    category: "math",
    icon: "🔢",
    description:
      "Calculate percentage increases, discounts, profit margins, and relative differences between two values.",
    formulaDescription:
      "Computes relative difference: [ (New Value - Original Value) / Original Value ] * 100.",
  },
];

// --- 1. Financial Functions ---

export function calculateMortgage(
  principal: number,
  annualRatePercent: number,
  termYears: number,
): MortgageResult {
  if (principal <= 0 || termYears <= 0) {
    throw new Error("Principal and term years must be greater than zero");
  }

  const n = termYears * 12; // Total monthly payments
  const r = annualRatePercent > 0 ? annualRatePercent / 100 / 12 : 0; // Monthly interest rate

  let monthlyPayment = 0;
  if (r === 0) {
    monthlyPayment = principal / n;
  } else {
    monthlyPayment = (principal * (r * (1 + r) ** n)) / ((1 + r) ** n - 1);
  }

  const yearlySchedule: MortgageResult["yearlySchedule"] = [];
  let balance = principal;
  let totalInterest = 0;

  for (let y = 1; y <= termYears; y++) {
    let yearPrincipal = 0;
    let yearInterest = 0;

    for (let m = 1; m <= 12; m++) {
      const interestMonth = balance * r;
      const principalMonth = monthlyPayment - interestMonth;

      yearInterest += interestMonth;
      yearPrincipal += principalMonth;
      balance = Math.max(0, balance - principalMonth);
    }

    totalInterest += yearInterest;
    yearlySchedule.push({
      year: y,
      principalPaid: Math.round(yearPrincipal),
      interestPaid: Math.round(yearInterest),
      remainingBalance: Math.round(balance),
    });
  }

  const totalPayment = principal + totalInterest;

  return {
    monthlyPayment: Math.round(monthlyPayment * 100) / 100,
    totalPayment: Math.round(totalPayment * 100) / 100,
    totalInterest: Math.round(totalInterest * 100) / 100,
    yearlySchedule,
  };
}

export function calculateCompoundInterest(
  principal: number,
  annualRatePercent: number,
  years: number,
  monthlyContribution = 0,
): CompoundInterestResult {
  const r = annualRatePercent / 100;
  const monthlyRate = r / 12;
  let balance = principal;
  let totalDeposits = principal;
  const yearlyBreakdown: CompoundInterestResult["yearlyBreakdown"] = [];

  for (let y = 1; y <= years; y++) {
    for (let m = 1; m <= 12; m++) {
      balance += monthlyContribution;
      totalDeposits += monthlyContribution;
      const interest = balance * monthlyRate;
      balance += interest;
    }

    yearlyBreakdown.push({
      year: y,
      deposits: Math.round(totalDeposits),
      interest: Math.round(balance - totalDeposits),
      balance: Math.round(balance),
    });
  }

  const totalContributions = totalDeposits - principal;
  const totalInterestEarned = Math.max(0, balance - totalDeposits);

  return {
    futureValue: Math.round(balance * 100) / 100,
    totalPrincipal: Math.round(principal * 100) / 100,
    totalContributions: Math.round(totalContributions * 100) / 100,
    totalInterestEarned: Math.round(totalInterestEarned * 100) / 100,
    yearlyBreakdown,
  };
}

// --- 2. Health & Fitness Functions ---

export function calculateBMI(weightKg: number, heightCm: number): BMIResult {
  if (weightKg <= 0 || heightCm <= 0) {
    throw new Error("Weight and height must be positive numbers");
  }

  const heightM = heightCm / 100;
  const bmiRaw = weightKg / (heightM * heightM);
  const bmi = Math.round(bmiRaw * 10) / 10;

  let category: BMIResult["category"] = "Normal Weight";
  let summary = "Your BMI falls in the healthy weight range (18.5 - 24.9).";

  if (bmi < 18.5) {
    category = "Underweight";
    summary = "Your BMI is under 18.5, indicating you may be underweight.";
  } else if (bmi >= 25 && bmi < 30) {
    category = "Overweight";
    summary = "Your BMI is between 25.0 and 29.9, categorized as overweight.";
  } else if (bmi >= 30) {
    category = "Obesity";
    summary = "Your BMI is 30.0 or higher, classified in the obesity range.";
  }

  const healthyMinKg = Math.round(18.5 * heightM * heightM * 10) / 10;
  const healthyMaxKg = Math.round(24.9 * heightM * heightM * 10) / 10;

  return {
    bmi,
    category,
    healthyMinKg,
    healthyMaxKg,
    summary,
  };
}

export function calculateBMR(
  weightKg: number,
  heightCm: number,
  ageYears: number,
  gender: "male" | "female",
): number {
  // Mifflin-St Jeor equation
  if (gender === "male") {
    return Math.round(10 * weightKg + 6.25 * heightCm - 5 * ageYears + 5);
  }
  return Math.round(10 * weightKg + 6.25 * heightCm - 5 * ageYears - 161);
}

export function calculateTDEE(
  bmr: number,
  activityLevel: "sedentary" | "light" | "moderate" | "active" | "very_active",
): TDEEResult {
  const multipliers: Record<typeof activityLevel, number> = {
    sedentary: 1.2, // Little or no exercise
    light: 1.375, // Light exercise 1-3 days/week
    moderate: 1.55, // Moderate exercise 3-5 days/week
    active: 1.725, // Hard exercise 6-7 days/week
    very_active: 1.9, // Very intense daily exercise & physical job
  };

  const factor = multipliers[activityLevel] || 1.2;
  const maintenance = Math.round(bmr * factor);

  return {
    bmr,
    maintenanceCalories: maintenance,
    mildDeficitCalories: Math.round(maintenance * 0.85), // 15% deficit
    mildSurplusCalories: Math.round(maintenance * 1.1), // 10% surplus
  };
}

// --- 3. Everyday Math Functions ---

export function calculateTip(
  billAmount: number,
  tipPercent: number,
  splitWays = 1,
): { tipTotal: number; billTotal: number; perPersonTotal: number; perPersonTip: number } {
  const validSplit = Math.max(1, splitWays);
  const tipTotal = Math.round(((billAmount * tipPercent) / 100) * 100) / 100;
  const billTotal = Math.round((billAmount + tipTotal) * 100) / 100;
  const perPersonTotal = Math.round((billTotal / validSplit) * 100) / 100;
  const perPersonTip = Math.round((tipTotal / validSplit) * 100) / 100;

  return {
    tipTotal,
    billTotal,
    perPersonTotal,
    perPersonTip,
  };
}

export function calculatePercentageChange(
  originalValue: number,
  newValue: number,
): { difference: number; percentChange: number; isIncrease: boolean } {
  if (originalValue === 0) {
    return { difference: newValue, percentChange: 0, isIncrease: newValue > 0 };
  }
  const difference = newValue - originalValue;
  const percentChange = Math.round((difference / Math.abs(originalValue)) * 10000) / 100;
  return {
    difference: Math.round(difference * 100) / 100,
    percentChange,
    isIncrease: difference >= 0,
  };
}
