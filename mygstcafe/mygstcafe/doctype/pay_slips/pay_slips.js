// Copyright (c) 2024, mygstcafe and contributors
// For license information, please see license.txt

frappe.ui.form.on("Pay Slips", {
  full_day_working_days: function (frm) {
    frm.set_value(
      "full_day_working_amount",
      frm.doc.full_day_working_days * frm.doc.full_days_working_rate * 1
    );
    calculate_gross(frm);
  },
  quarter_day_working_days: function (frm) {
    frm.set_value(
      "quarter_day_working_amount",
      frm.doc.quarter_day_working_days * quarter_day_working_rate * 0.75
    );
    calculate_gross(frm);
  },
  half_day_working_days: function (frm) {
    frm.set_value(
      "half_day_working_amount",
      frm.doc.half_day_working_days * half_day_working_rate * 0.5
    );
    calculate_gross(frm);
  },
  three_four_quarter_days_working_days: function (frm) {
    frm.set_value(
      "three_four_quarter_days_working_amount",
      frm.doc.three_four_quarter_days_working_days *
        three_four_quarter_days_rate *
        0.25
    );
    calculate_gross(frm);
  },

  lates_days: function (frm) {
    frm.set_value(
      "lates_amount",
      frm.doc.lates_days * frm.doc.lates_rate * 0.1
    );
    calculate_gross(frm);
  },

  sundays_working_days: function (frm) {
    frm.set_value(
      "sunday_working_amount",
      frm.doc.sundays_working_days * frm.doc.sunday_working_rate
    );
    calculate_net_payable(frm);
  },

  other_earnings_incentives: function (frm) {
    setOthersEarningAmount(frm);
  },

  other_earning_project_deadline_allowance: function (frm) {
    setOthersEarningAmount(frm);
  },

  other_earnings_special_incentives: function (frm) {
    setOthersEarningAmount(frm);
  },

  other_earnings_special_incentives: function (frm) {
    setOthersEarningAmount(frm);
  },

  other_earnings_overtime: function (frm) {
    setOthersEarningAmount(frm);
  },

  other_ernings_holidays_amount: function (frm) {
    setOthersEarningAmount(frm);
  },

  other_earnings_amount: function (frm) {
    calculate_net_payable(frm);
  },

  adjustments: function (frm) {
    calculate_net_payable(frm);
  },

  before_save(frm) {
    const fields = [
      "full_days_working_rate",
      "half_day_working_rate",
      "quarter_day_working_rate",
      "three_four_quarter_days_rate",
      "lates_rate",
      "sunday_working_rate",
    ];
    fields.forEach((field) => {
      frm.set_value(field, frm.doc.per_day_salary);
    });
  },
});

function calculate_gross(frm) {
  let total =
    (frm.doc.full_day_working_amount || 0) +
    (frm.doc.quarter_day_working_amount || 0) +
    (frm.doc.half_day_working_amount || 0) +
    (frm.doc.three_four_quarter_days_working_amount || 0) -
    (frm.doc.lates_amount || 0);

  frm.set_value("total", total);
}

function calculate_net_payable(frm) {
  let net_payable =
    (frm.doc.total || 0) +
    (frm.doc.sunday_working_amount || 0) +
    (frm.doc.other_earnings_amount || 0) -
    (frm.doc.adjustments || 0);

  frm.set_value("net_payble_amount", net_payable);
}

function setOthersEarningAmount(frm) {
  let otherEarningsAmount =
    (frm.doc.other_ernings_holidays_amount || 0) +
    (frm.doc.other_earnings_incentives || 0) +
    (frm.doc.other_earning_project_deadline_allowance || 0) +
    (frm.doc.other_earnings_special_incentives || 0) +
    (frm.doc.other_earnings_overtime || 0);
  frm.set_value("other_earnings_amount", otherEarningsAmount);
}
