var expenseid;
var expenseamount;
var expensecategory;
var	expensemethod;
var	expensedate;

 function getUrlVars() {
	    var vars = [], hash;
	    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
	    for(var i = 0; i < hashes.length; i++)
	    {
	        hash = hashes[i].split('=');
	        vars.push(hash[0]);
	        vars[hash[0]] = hash[1];
	    }
	    return vars;
 }

function expensedialog(id) {
	expenseid = id;
	$.mobile.changePage( "#expensedialog", { role: 'dialog', transition: "slideup"} );
 }
 
function transaction_error(tx, error) {
	$('#busy').hide();
    alert("Database Error:" + error);
//    console.log("Database Error: " + error.message + "\nCode=" + error.code);
}

function populateDB_success() {
	$('#busy').hide();
}

function showexpense() {
//    location.href= '#deletedialog(' + getUrlVars()["id"] + ')';
    db.transaction(showExpense, transaction_error, populateDB_success);
}


 function showExpense(tx) {
	var sql;
	sql = "select x.amount, x.dateOccured, y.elDescription, x.subcategory, x.method, x.type from expense x, category y where x.sn = " + expenseid + " and x.category = y.code and x.type=y.type";
	tx.executeSql(sql, [], showExpense_success, transaction_error);
 }
 
 function showExpense_success(tx, results) {
	var emethod;
	var etype;
	$.mobile.changePage( "#showexpense", { transition: "slideup"} );
    var len = results.rows.length;
    for (var i=0; i<len; i++)
    	{var expense = results.rows.item(i);};
	if (expense.method == 'M') 
		{emethod = 'Μετρητά'}
	else
		{emethod = 'Κάρτα'};
	if (expense.type == 'E') 
		{etype = 'Έξοδο'}
	else
		{etype = 'Έσοδο'};
	$('#showamount').empty().append('Ποσό :' + expense.amount);
	$('#showcategory').empty().append('Κατηγορία :' + expense.elDescription);
	$('#showsubcategory').empty().append('Υποκατηγορία :' + expense.subcategory);
	$('#showdate').empty().append('Ημερομηνία :' + expense.dateOccured);
	$('#showmethod').empty().append('Τρόπος :' + emethod);
	$('#showtype').empty().append('Είδος :' + etype);
 }

 function deleteexpense() {
 //    location.href= '#deletedialog(' + getUrlVars()["id"] + ')';
    db.transaction(deleteExpense, transaction_error, populateDB_success);
}


 function deleteExpense(tx) {
	var sql;
	sql = "delete from expense where sn = " + expenseid + "";
	tx.executeSql(sql,[], deleteExpense_success, transaction_error);
 }

 function deleteExpense_success(tx, results) {
	$.mobile.changePage( "#information", {transition: "slideup"} );
 }
 
 function editexpense() {
//    $('#editExpenseform').show();
    db.transaction(editExpense, transaction_error, populateDB_success);
}

 function editExpense(tx) {
	var sql;
//	sql = "select amount, dateOccured, category, subcategory, method, type from expense where sn = " + expenseid + "";
	sql = "select x.sn, x.amount, x.dateOccured, y.elDescription, x.category, x.subcategory, x.method, x.type from expense x, category y where x.category = y.code and x.type=y.type and sn = " + expenseid + "";
	tx.executeSql(sql, [], editExpense_success, transaction_error);
 }
 
 function editExpense_success(tx, results) {
//	$('#expensedialog').hide();
//	$('#busy').hide();
    var len = results.rows.length;
    for (var i=0; i<len; i++)
    	{var expense = results.rows.item(i);};
    expenseamount = expense.amount;
	expensecategory = expense.category;
	expenseelDescription = expense.elDescription;
	expensemethod = expense.method;
    expensedate = expense.dateOccured.substring(8,10) + "/" + expense.dateOccured.substring(5,7) + "/" + expense.dateOccured.substring(0,4);
	$('#exp_amount').val(expenseamount);
//	$('#exp_category').remove();
//	a= "<option value='"+expensecategory+"'>"+expenseelDescription+"</option>";
//	$('#exp_category').children().remove();
//	$('#exp_category').empty();
//	$('#exp_category').append(a);
	$('#exp_category').prop("selectedIndex", expensecategory - 1);
	$('#exp_category').append('<option value="01">Super Market</option>');
	$('#exp_category').append('<option value="02">Εμφάνιση</option>');
	$('#exp_category').append('<option value="03">Σπίτι</option>');
	$('#exp_category').append('<option value="04">Οχήματα</option>');
	$('#exp_category').append('<option value="05">Οικογένεια</option>');
	$('#exp_category').append('<option value="06">Προσωπικά</option>');
	$('#exp_category').append('<option value="07">Διασκέδαση</option>');
	$('#exp_category').append('<option value="08">Ιατρικά</option>');
//	$("#exp_category option[value='05']").attr("selected", "selected");
//	$('#exp_category').val(expensecategory);
	$('#exp_category').val(expensecategory).attr('selected', true).siblings('option').removeAttr('selected');
	$('#exp_category').selectmenu("refresh", true);
	$('#exp_method').prop("selectedIndex", expensemethod - 1);
	$('#exp_method').append('<option value="M">Μετρητά</option>');
	$('#exp_method').append('<option value="C">Κάρτα</option>');
	$('#exp_method').val(expensemethod).attr('selected', true).siblings('option').removeAttr('selected');
	$('#exp_method').selectmenu("refresh", true);
	$('#exp_date').val(expensedate);
	
    
    $('#editExpenseform').show();
//	$.mobile.changePage( "#editExpense", { transition: "slideup"} );
//	$('#editamount').empty().append('<input type="number" id="expense_amount" class="amount" name="amount" value='+expense.amount+'>'); 
 }
 
  function editExpenseUpdate(tx) {
	expenseamount = $('#exp_amount').val();
 	if (expenseamount<1 || expenseamount>100000 || !(isNumber(expenseamount))) 
		{alert('Μη επιτρεπτό ποσό');}
	else
		{	
  	  	db.transaction(editExpenseUpdateFields, transaction_error, populateDB_success);
  		};
	$.mobile.changePage( "#information", {transition: "slideup"} );
  }
  
  function editExpenseUpdateFields(tx) {
    var originaldate = $('#exp_date').val();
    var date = originaldate.substring(6,10) + "/" + originaldate.substring(3,5) + "/" + originaldate.substring(0,2);
	var category = $('#exp_category').val();
	var method = $('#exp_method').val();
	$('#busy').show();
	var sql;
	sql = "update expense set amount ="+expenseamount+",dateOccured='"+date+"',category='"+category+"',method='"+method+"',commiteDateTime=DATETIME('NOW'),sync='' where sn="+expenseid+"";
    tx.executeSql(sql);
 }
 
 function getFields() {
 	var fields = [];
 	fields.push(expenseamount, expensecategory, expensemethod, expensedate);
 	return fields;
 }
 