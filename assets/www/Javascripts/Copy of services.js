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
    mobiledata.push('grtramp@yahoo.gr');
    var len = results.rows.length;
    for (var i=0; i<len; i++) {
    	var expensemob = results.rows.item(i);
	    mobiledata.push(expensemob.trxtype, expensemob.trxdatetime, expensemob.sn, expensemob.amount, expensemob.dateOccured, expensemob.category, expensemob.subcategory, expensemob.type, expensemob.method);
//  Post results to web server
	 var request = $.ajax({
	 
	 statusCode: {
    400: function() {
      alert('400');
    },
    401: function() {
      alert('401');
    },
    402: function() {
      alert('402');
    },
    403: function() {
      alert('403');
    },
    404: function() {
      alert('404');
    },
    500: function() {
      alert('500');
    },
    501: function() {
      alert('501');
    },
    502: function() {
      alert('502');
    },
    503: function() {
      alert('503');
    },
    301: function() {
      alert('301');
    },
    302: function() {
      alert('302');
    },
    303: function() {
      alert('303');
    },
    304: function() {
      alert('304');
    }
  },
	  	url: serviceURL + "synchronize_with_mobile",
	  	type: 'POST',
	  	dataType: 'json',
	  	data: {mobiledata: mobiledata},
//	    async: true,
		success:function(responsedata) {
					console.log(responsedata);
					$(responsedata).each(function(i,web){
					    webdata.push([web.expense.trxtype, web.expense.trxdatetime, web.expense.sn, web.expense.amount, web.expense.dateOccured, web.expense.category, web.expense.subcategory, web.expense.type, web.expense.method]);
					});
				}
	 });
    };
	request.fail(function(jqXHR, textStatus) {
	  alert( "Request failed: " + textStatus );
	});
	console.log(mobiledata);
 }
  
