// // Copyright (c) 2024, mygstcafe and contributors
// // For license information, please see license.txt

// frappe.ui.form.on("Check Status Pay Slip Request", {
//   refresh(frm) {},

//   select_date: function (frm) {
//     let selectedDate = frm.doc.select_date;
//     let selectedRequestedBy = frm.doc.requested_by;
//     getPaySlipRequest(frm, selectedDate, selectedRequestedBy);
//   },
//   select_requested_by: function (frm) {
//     let selectedDate = frm.doc.select_date;
//     let selectedRequestedBy = frm.doc.select_requested_by;
//     getPaySlipRequest(frm, selectedDate, selectedRequestedBy);
//   },
// });

// function getPaySlipRequest(
//   frm,
//   selectedDate = null,
//   selectedRequestedBy = null
// ) {
//   frappe.call({
//     method: "mygstcafe.api.get_pay_slip_request",
//     args: {
//       date: selectedDate,
//       requested_by: selectedRequestedBy,
//     },
//     callback: function (res) {
//       if (res.message) {
//         let data = res.message;
//         let options = data.join("\n");

//         console.log(options);
//         frm.set_df_property("selected_pay_slip_request", "options", options);
//       } else {
//         frappe.msgprint(
//           "No data found for the selected date and requested by."
//         );
//       }
//     },
//     error: function (r) {
//       frappe.msgprint(r.message);
//     },
//   });
// }
