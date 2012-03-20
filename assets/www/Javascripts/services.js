var db;
//var serviceURL = "http://rememberlist.heroku.com/expenses/";
//var serviceURL = "http://localhost:3000/expenses/";
var serviceURL = "http://10.0.2.2:3000/expenses/";
var mobiledata = [];
var webdata = [];

function transaction_error(tx, error) {
	$('#busy').hide();
    alert("Database Error:" + error);
}

function populateDB_success() {
	$('#busy').hide();
}

function synchronizeWithWeb() {
	$('#busy').show();
//  Get EJ (logs) from file to update the web server 
    db.transaction(getExpensesEJ, transaction_error, populateDB_success);
//	synchronizeFromWeb();
}


function getExpensesEJ(tx) {
//  	$('#busy').show();
// select uncommited changes
	var sql = "select * from expenseej";
	tx.executeSql(sql, [], getExpensesEJ_success, transaction_error);
 }

 function getExpensesEJ_success(tx, results) {
    mobiledata = [];
//    mobiledata.push('grtramp@yahoo.gr');
    var len = results.rows.length;
    for (var i=0; i<len; i++) {
    	var expensemob = results.rows.item(i);
	    mobiledata.push(expensemob.trxtype, expensemob.trxdatetime, expensemob.sn, expensemob.amount, expensemob.dateOccured, expensemob.category, expensemob.subcategory, expensemob.type, expensemob.method);
	    }
//  Post results to web server
	 var request = $.ajax({
	  	url: serviceURL + "synchronize_with_mobile",
	  	type: 'POST',
	  	dataType: 'json',
	  	data: {user: 'grtramp@yahoo.gr', mobiledata: mobiledata},
//	    async: true,
//	  	headers: {'Content-Type': 'application/json'},
	beforeSend : function(xhr){
       xhr.setRequestHeader("Accept", "application/json")
     },
		success:function(responsedata) {
					console.log(responsedata);
					$(responsedata).each(function(i,web){
					    webdata.push([web.expense.trxtype, web.expense.trxdatetime, web.expense.sn, web.expense.amount, web.expense.dateOccured, web.expense.category, web.expense.subcategory, web.expense.type, web.expense.method]);
					});
				}
	 });
 	request.fail(function(jqXHR, textStatus) {
	  alert( "Request failed: " + textStatus );
	});
	console.log(mobiledata);
 }
  
