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
    db.transaction(editExpense, transaction_error, populateDB_success);
}

 function editExpense(tx) {
	var sql;
	sql = "select amount, dateOccured, category, subcategory, method, type from expense where sn = " + expenseid + "";
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
	expensemethod = expense.method;
    expensedate = expense.dateOccured.substring(8,10) + "/" + expense.dateOccured.substring(5,7) + "/" + expense.dateOccured.substring(0,4);
	$.mobile.changePage( "#editExpense", { transition: "slideup"} );
	$('#busy').hide();
//	$('#editamount').empty().append('<input type="number" id="expense_amount" class="amount" name="amount" value='+expense.amount+'>'); 
 }
 
  function editExpenseUpdate(tx) {
    var originaldate = $('input:[name*="date"]').val();
    date = originaldate.substring(6,10) + "/" + originaldate.substring(3,5) + "/" + originaldate.substring(0,2);
	category = $("#expense_category").val();
	method = $("#expense_method").val();
	$('#busy').show();
	var sql;
	sql = "update expense set amount ="+amount+",dateOccured="+date+",category="+category+",method="+method+"where sn="+expenseid+"";
	alert(sql);
    tx.executeSql(sql);
 }
 
 function getFields() {
 	var fields = [];
 	fields.push(expenseamount, expensecategory, expensemethod, expensedate);
 	return fields;
 }
 