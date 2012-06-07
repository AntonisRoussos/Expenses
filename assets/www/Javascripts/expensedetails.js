var expenseid;
var expenseamount;
var expensecategory;
var	expensemethod;
var	expensedate;
var expensesubcategoryCodeU;
var expensecodeU;

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
	//sql = "select x.amount, x.dateOccured, y.elDescription catDescr, z.elDescription subcatDescr, x.method, x.type from expense x, category y, subcategory z where x.sn = " + expenseid + " and x.category = y.code and x.subcategory = z.subcategoryCode and x.category = z.categoryCode and x.type=y.type";
	sql = "select x.amount, x.dateOccured, y.elDescription catDescr, z.elDescription subcatDescr, x.method, x.type from expense x LEFT JOIN category y ON x.category = y.code and x.type = y.type LEFT JOIN subcategory z ON x.category = z.categoryCode and x.subcategory = z.subcategorycode where x.sn = " + expenseid + "";
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
	$('#showcategory').empty().append('Κατηγορία :' + expense.catDescr);
	$('#showsubcategory').empty().append('Υποκατηγορία :' + expense.subcatDescr);
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
    	{var expense = results.rows.item(i);
    	expensecodeU = expense.category;
    	expensesubcategoryCodeU = expense.subcategory;
    	};
    db.transaction(fillCategoriesU, transaction_error, populateDB_success); 
    expenseamount = expense.amount;
	expensecategory = expense.category;
	expenseelDescription = expense.elDescription;
	expensemethod = expense.method;
    expensedate = expense.dateOccured.substring(8,10) + "/" + expense.dateOccured.substring(5,7) + "/" + expense.dateOccured.substring(0,4);
	$('#exp_amount').val(expenseamount);
//	$('#expense_category').remove();
//	a= "<option value='"+expensecategory+"'>"+expenseelDescription+"</option>";
//	$('#expense_category').children().remove();
//	$('#expense_category').empty();
//	$('#expense_category').append(a);
	$('#exp_method').empty();
	$('#exp_method').prop("selectedIndex", expensemethod - 1);
	$('#exp_method').append('<option value="M">Μετρητά</option>');
	$('#exp_method').append('<option value="C">Κάρτα</option>');
	$('#exp_method').val(expensemethod).attr('selected', true).siblings('option').removeAttr('selected');
	$('#exp_method').selectmenu("refresh", true);
	$('#exp_date').val(expensedate);
    $('#editExpenseform').show();
//	show_Expense_all();
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
	var category = $('#expense_categoryU').val();
	var subcategory = $('#expense_subcategoryU').val();
	if (subcategory == null) {subcategory = ''};
	var method = $('#exp_method').val();
	$('#busy').show();
	var sql;
	sql = "update expense set amount ="+expenseamount+",dateOccured='"+date+"',category='"+category+"',subcategory='"+subcategory+"',method='"+method+"',commiteDateTime=DATETIME('NOW'),sync=''  where sn="+expenseid+"";
    tx.executeSql(sql);
 }
 
 function getFields() {
 	var fields = [];
 	fields.push(expenseamount, expensecategory, expensemethod, expensedate);
 	return fields;
 }
 
  function fillCategoriesU(tx) {
	var sql = "SELECT * FROM category where type = 'E'";
 	tx.executeSql(sql, [], fillCategoriesU_success, transaction_error);
 }
 
function fillCategoriesU_success(tx, results) {
	$('#expense_categoryU').empty();
	$('#expense_categoryU').prop("selectedIndex", expensecodeU - 1);
	var len = results.rows.length;
	if (len > 0)
	{
    for (var i=0; i<len; i++){
	   	var category = results.rows.item(i);
		$('#expense_categoryU').append('<option value="' + category.code + '">' + category.elDescription + '</option>');
    };
	$('#expense_categoryU').val(expensecodeU).attr('selected', true).siblings('option').removeAttr('selected');
	$('#expense_categoryU').selectmenu("refresh", true);
	wcategoryCode = $('#expense_categoryU').val();
	$('#CategoryFieldU').show();
    db.transaction(fillSubCategoriesU, transaction_error, populateDB_success); 
	}
	else
	{
	alert('Καταχωρήστε κατηγορίες εξόδων στις ρυθμίσεις');
	$('#CategoryFieldU').hide();
	$('#subCategoryFieldU').hide();
	};
 }

 function fillSubCategoriesU(tx) {
	var sql = 'SELECT * FROM subcategory where type = "E" and categoryCode = "'+$('#expense_categoryU').val()+'"';
 	tx.executeSql(sql, [], fillSubCategoriesU_success, transaction_error);
 }
 
function fillSubCategoriesU_success(tx, results) {
	$('#expense_subcategoryU').empty();
	var selectedsubcategory;
	if (expensesubcategoryCodeU != '') {
		if ($('#expense_categoryU').val() == expensecodeU) { 
			selectedsubcategory = expensesubcategoryCodeU;
			$('#expense_subcategoryU').prop("selectedIndex", expensesubcategoryCodeU - 1)}
		else {
			selectedsubcategory = 1;
			$('#expense_subcategoryU').prop("selectedIndex", 0)};
		$('#subCategoryFieldU').show();
		}
	else {
		selectedsubcategory = 1;
		$('#expense_subcategoryU').prop("selectedIndex", 0);
		$('#subCategoryFieldU').hide();
		};
	var len = results.rows.length;
	if (len > 0)
	{
    for (var i=0; i<len; i++){
	   	var SubCategory = results.rows.item(i);
		$('#expense_subcategoryU').append('<option value="' + SubCategory.subcategoryCode + '">' + SubCategory.elDescription + '</option>');
    };
	$('#expense_subcategoryU').val(selectedsubcategory).attr('selected', true).siblings('option').removeAttr('selected');
	$('#expense_subcategoryU').selectmenu("refresh", true);
	$('#subCategoryFieldU').show();
	}
	else
	{$('#subCategoryFieldU').hide()};
 }
 
//function show_Expense_all() {
//} 