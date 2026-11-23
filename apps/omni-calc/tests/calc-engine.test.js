import assert from "node:assert/strict";
import test from "node:test";
import {
  CALCULATORS,
  calculateBMI,
  calculateBMR,
  calculateCompoundInterest,
  calculateMortgage,
  calculatePercentageChange,
  calculateTDEE,
  calculateTip,
} from "../src/lib/calc-engine.ts";

test("CALCULATORS catalog metadata integrity", () => {
  assert.equal(CALCULATORS.length, 6);
  for (const calc of CALCULATORS) {
    assert.ok(calc.slug.length > 0);
    assert.ok(calc.title.length > 0);
    assert.ok(["finance", "health", "math"].includes(calc.category));
    assert.ok(calc.icon.length > 0);
    assert.ok(calc.description.length > 0);
    assert.ok(calc.formulaDescription.length > 0);
  }
});

test("calculateMortgage computes fixed-rate monthly payments and schedule correctly", () => {
  // $400,000 at 6.5% for 30 years
  const res = calculateMortgage(400000, 6.5, 30);
  assert.equal(res.monthlyPayment, 2528.27);
  assert.ok(res.totalInterest > 500000);
  assert.equal(res.yearlySchedule.length, 30);
  assert.equal(res.yearlySchedule[0].year, 1);
  assert.equal(res.yearlySchedule[29].remainingBalance, 0);

  // 0% interest loan: $120,000 for 10 years = $1000/mo
  const zeroInterest = calculateMortgage(120000, 0, 10);
  assert.equal(zeroInterest.monthlyPayment, 1000);
  assert.equal(zeroInterest.totalInterest, 0);
  assert.equal(zeroInterest.totalPayment, 120000);

  // Invalid inputs throw
  assert.throws(() => calculateMortgage(0, 5, 30), /greater than zero/);
  assert.throws(() => calculateMortgage(100000, 5, 0), /greater than zero/);
});

test("calculateCompoundInterest computes principal growth with monthly deposits", () => {
  // $10,000 principal at 7% for 10 years with $100/mo contribution
  const res = calculateCompoundInterest(10000, 7, 10, 100);
  assert.ok(res.futureValue > 35000);
  assert.equal(res.totalPrincipal, 10000);
  assert.equal(res.totalContributions, 12000); // $100 * 120 months
  assert.ok(res.totalInterestEarned > 15000);
  assert.equal(res.yearlyBreakdown.length, 10);
  assert.equal(res.yearlyBreakdown[9].year, 10);

  // Zero monthly contribution test
  const resNoDeposit = calculateCompoundInterest(10000, 5, 5, 0);
  assert.ok(resNoDeposit.futureValue > 12500 && resNoDeposit.futureValue < 13000);
  assert.equal(resNoDeposit.totalContributions, 0);
});

test("calculateBMI computes WHO classifications and healthy boundaries", () => {
  // Normal weight: 70kg, 175cm -> BMI 22.9
  const normal = calculateBMI(70, 175);
  assert.equal(normal.bmi, 22.9);
  assert.equal(normal.category, "Normal Weight");
  assert.equal(normal.healthyMinKg, 56.7);
  assert.equal(normal.healthyMaxKg, 76.3);

  // Underweight: 45kg, 175cm -> BMI 14.7
  const under = calculateBMI(45, 175);
  assert.equal(under.category, "Underweight");

  // Overweight: 85kg, 175cm -> BMI 27.8
  const over = calculateBMI(85, 175);
  assert.equal(over.category, "Overweight");

  // Obesity: 105kg, 175cm -> BMI 34.3
  const obese = calculateBMI(105, 175);
  assert.equal(obese.category, "Obesity");

  // Invalid throws
  assert.throws(() => calculateBMI(-5, 175), /positive/);
  assert.throws(() => calculateBMI(70, 0), /positive/);
});

test("calculateBMR & calculateTDEE adhere to Mifflin-St Jeor formula", () => {
  // Male: 75kg, 180cm, 30 years -> 10*75 + 6.25*180 - 5*30 + 5 = 1730
  const bmrMale = calculateBMR(75, 180, 30, "male");
  assert.equal(bmrMale, 1730);

  // Female: 60kg, 165cm, 28 years -> 10*60 + 6.25*165 - 5*28 - 161 = 1330
  const bmrFemale = calculateBMR(60, 165, 28, "female");
  assert.equal(bmrFemale, 1330);

  // TDEE calculation
  const tdee = calculateTDEE(1730, "moderate");
  assert.equal(tdee.bmr, 1730);
  assert.equal(tdee.maintenanceCalories, Math.round(1730 * 1.55));
  assert.equal(tdee.mildDeficitCalories, Math.round(tdee.maintenanceCalories * 0.85));
  assert.equal(tdee.mildSurplusCalories, Math.round(tdee.maintenanceCalories * 1.1));
});

test("calculateTip computes gratuity and split shares accurately", () => {
  const tipSingle = calculateTip(100, 20, 1);
  assert.equal(tipSingle.tipTotal, 20);
  assert.equal(tipSingle.billTotal, 120);
  assert.equal(tipSingle.perPersonTotal, 120);
  assert.equal(tipSingle.perPersonTip, 20);

  const tipSplit = calculateTip(150, 18, 3);
  assert.equal(tipSplit.tipTotal, 27);
  assert.equal(tipSplit.billTotal, 177);
  assert.equal(tipSplit.perPersonTotal, 59);
  assert.equal(tipSplit.perPersonTip, 9);
});

test("calculatePercentageChange computes relative changes and direction", () => {
  const increase = calculatePercentageChange(100, 125);
  assert.equal(increase.difference, 25);
  assert.equal(increase.percentChange, 25);
  assert.equal(increase.isIncrease, true);

  const decrease = calculatePercentageChange(100, 75);
  assert.equal(decrease.difference, -25);
  assert.equal(decrease.percentChange, -25);
  assert.equal(decrease.isIncrease, false);

  const fromZero = calculatePercentageChange(0, 50);
  assert.equal(fromZero.difference, 50);
  assert.equal(fromZero.percentChange, 0);
  assert.equal(fromZero.isIncrease, true);
});
