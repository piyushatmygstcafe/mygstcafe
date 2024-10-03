frappe.pages["pay-slips-report"].on_page_load = function (wrapper) {
  var page = frappe.ui.make_app_page({
    parent: wrapper,
    title: "Pay Slips",
    single_column: true,
  });

  let $form = $(`
        <div class="row">
            <!-- Year Field -->
            <div class="col-md-3 form-group">
                <label for="year">Year</label>
                <input type="number" id="year" class="form-control" placeholder="Enter year" min="1000" max="9999" value="${new Date().getFullYear()}">
            </div>

            <!-- Month Field -->
            <div class="col-md-3 form-group">
                <label for="month">Month</label>
                <select id="month" class="form-control">
                    <option value="">Select month</option>
                    <option value="1">January</option>
					<option value="2">Fabruary</option>
					<option value="3">March</option>
					<option value="4">April</option>
					<option value="5">May</option>
					<option value="6">June</option>
					<option value="7">July</option>
					<option value="8">August</option>
					<option value="9">September</option>
					<option value="10">October</option>
					<option value="11">November</option>
					<option value="12">December</option>
                </select>
            </div>

            <!-- Button to Fetch Records -->
            <div class="col-md-3 form-group d-flex align-items-end">
                <button id="fetch_records" class="btn btn-primary">Get Records</button>
            </div>
            
            <!-- Email Button Container -->
            <div class="col-md-3 form-group d-flex align-items-end" id="email-btn"></div>
        </div>
        <div id="pay_slip_table"></div>
    `).appendTo(page.body);

  $form.find("#fetch_records").click(function () {
    let year = $form.find("#year").val();
    if (year < 1000 || year > 9999) {
      return frappe.throw("Invalid Year!");
    }
    let month = $form.find("#month").val();
    if (year && month) {
      currUser = frappe.session.user_email
      frappe.call({
        method: "mygstcafe.api.get_pay_slips_list",
        args: {
          year: year,
          month: month,
          curr_user:currUser,
        },
        callback: function (res) {
          if (res.message) {
            records = res.message;
            pay_slip_list(records);
          }
        },
      });
    } else {
      frappe.msgprint("Please select both year and month");
    }
  });
};

function pay_slip_list(records) {
  let table = `<table class="table table-bordered">
                    <thead>
                        <tr>
                            <th>Select</th>
                            <th>Pay Slip</th>
                            <th>Employee Name</th>
                            <th>Salary</th>
                        </tr>
                    </thead>
                    <tbody>`;

  records.forEach((record) => {
    table += `<tr>
                    <td><input type="checkbox" value="${record.name}" /></td>
                    <td><a href="/app/pay-slips/${record.name}">${record.name}</a></td>
                    <td>${record.employee_name}</td>
                    <td>${record.net_payble_amount}</td>
                  </tr>`;
  });

  table += `</tbody></table>`;
  
  document.getElementById("pay_slip_table").innerHTML = table;

  document.querySelectorAll('input[type="checkbox"]').forEach((checkbox) => {
    checkbox.addEventListener("change", (event) => {
      const emailButtonContainer = document.getElementById("email-btn");
      const anyChecked =
        document.querySelectorAll('input[type="checkbox"]:checked').length > 0;

      if (anyChecked) {
        let email_btn = `<button id="email_pay_slips" class="btn btn-primary">Email Pay Slips</button>`;
        emailButtonContainer.innerHTML = email_btn;

        emailButtonContainer
          .querySelector("#email_pay_slips")
          .addEventListener("click", function () {
            let selected_rows = get_selected();
            frappe.call({
              method: "mygstcafe.api.email_pay_slip",
              args: {
                pay_slips: selected_rows,
              },
              callback: function (res) {
                console.log(res);
              },
              error: function (r) {
                frappe.msgprint(r.message);
              },
            });
          });
      } else {
        emailButtonContainer.innerHTML = "";
      }
    });
  });
}

// Function to Get Selected Pay Slips
function get_selected() {
  return Array.from(
    document.querySelectorAll('input[type="checkbox"]:checked')
  ).map((checkbox) => checkbox.value);
}
