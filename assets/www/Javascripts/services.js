var db;
var serviceURL = "http://rememberlist.heroku.com/expenses/";
//var serviceURL = "http://localhost:3000/expenses/";
//var serviceURL = "http://10.0.2.2:3000/expenses/";
var mobiledata = [];
var webdata = [];
var webdataFormatted = [];

  var trxtype;
  var trxdatetime;
  var sn;
  var amount;
  var dateoccured;
  var category;
  var subcategory;
  var ttype;
  var trxmethod;



function transaction_error(tx, error) {
	$('#busy').hide();
    alert("Database Error:" + error.message);
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
    webdata = [];
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
//		success:function(responsedata) {
		success:function(webdata) {
//					$(responsedata).each(function(i,web){
//					$(webdata).each(function(i,web){
//					    webdata.push([web.expense.trxtype, web.expense.trxdatetime, web.expense.sn, web.expense.amount, web.expense.dateOccured, web.expense.category, web.expense.subcategory, web.expense.type, web.expense.method]);
//						webdata.push(web);
  //					});
//	console.log("web");
//	console.log(webdata);
	update_from_web(webdata);
	clear_journal();
				}
	 });
 	request.fail(function(jqXHR, textStatus) {
	  alert( "Request failed: " + textStatus );
	});
//	console.log(mobiledata);
 }
  
 function update_from_web(webdata){
	webdataFormatted=[];
	$.each(webdata, function(index, value) { 
	  var remainder = index % 9;
	  if (remainder == 0) {trxtype = value};
	  if (remainder == 1) {trxdatetime = value};
	  if (remainder == 2) {sn = value};
	  if (remainder == 3) {amount = value};
	  if (remainder == 4) {dateoccured = value};
	  if (remainder == 5) {category = value};
	  if (remainder == 6) {subcategory = value};
	  if (remainder == 7) {ttype = value};
	  if (remainder == 8) {trxmethod = value};
	  if (remainder == 8 && trxtype == 'A')
	        {webdataFormatted.push([trxtype, trxdatetime, sn, amount, dateoccured, category, subcategory, ttype, trxmethod])
//	        	console.log(webdataFormatted);
//	        	console.log(webdataFormatted[windex][2]);
	        };
	});
	$.each(webdata, function(index, value) { 
	  var remainder = index % 9;
	  if (remainder == 0) {trxtype = value};
	  if (remainder == 1) {trxdatetime = value};
	  if (remainder == 2) {sn = value};
	  if (remainder == 3) {amount = value};
	  if (remainder == 4) {dateoccured = value};
	  if (remainder == 5) {category = value};
	  if (remainder == 6) {subcategory = value};
	  if (remainder == 7) {ttype = value};
	  if (remainder == 8) {trxmethod = value};
	  if (remainder == 8 && trxtype == 'D')
	        {webdataFormatted.push([trxtype, trxdatetime, sn, amount, dateoccured, category, subcategory, ttype, trxmethod])
//	        	console.log(webdataFormatted);
	        };
	});
	$.each(webdata, function(index, value) { 
	  var remainder = index % 9;
	  if (remainder == 0) {trxtype = value};
	  if (remainder == 1) {trxdatetime = value};
	  if (remainder == 2) {sn = value};
	  if (remainder == 3) {amount = value};
	  if (remainder == 4) {dateoccured = value};
	  if (remainder == 5) {category = value};
	  if (remainder == 6) {subcategory = value};
	  if (remainder == 7) {ttype = value};
	  if (remainder == 8) {trxmethod = value};
	  if (remainder == 8 && trxtype == 'U')
	        {webdataFormatted.push([trxtype, trxdatetime, sn, amount, dateoccured, category, subcategory, ttype, trxmethod])
//	console.log(webdataFormatted);
	        };
	});
  	db.transaction(putExpensesEJ, transaction_error, populateDB_success);
 } 
 
 function putExpensesEJ(tx) {
//  	$('#busy').show();
// select uncommited changes
//	console.log(tx);
	$.each(webdataFormatted, function(index, value) { 
	if (webdataFormatted[index][0] == 'A')
		{var sql = "INSERT INTO expense (amount, dateOccured, category, subcategory, type, method, webid, commiteDateTime, sync) " + 
		"VALUES ("+webdataFormatted[index][3]+",'"+webdataFormatted[index][4]+"','"+webdataFormatted[index][5]+"', '"+webdataFormatted[index][6]+"', '"+webdataFormatted[index][7]+"', '"+webdataFormatted[index][8]+"', "+webdataFormatted[index][2]+", '"+webdataFormatted[index][1]+"','S')";};
	if (webdataFormatted[index][0] == 'D')
		{var sql = "DELETE FROM expense WHERE webid = " + webdataFormatted[index][2] + "";};
	if (webdataFormatted[index][0] == 'U')
		{var sql = "UPDATE expense SET amount ="+webdataFormatted[index][3]+",dateOccured='"+webdataFormatted[index][4]+"',category='"+webdataFormatted[index][5]+"', " +
		" subcategory='"+webdataFormatted[index][6]+"',method='"+webdataFormatted[index][8]+"',commiteDateTime='"+webdataFormatted[index][1]+"',sync='S' " +
		" WHERE webid = " + webdataFormatted[index][2] + " AND commiteDateTime < '"+webdataFormatted[index][1]+"'";};
	tx.executeSql(sql);	
	});
 }
 
 function clear_journal() {
   	db.transaction(clearExpensesEJ, transaction_error, populateDB_success);
 }

 function clearExpensesEJ(tx) {
	var sql = "DELETE FROM expenseej";
	tx.executeSql(sql);	
 } 