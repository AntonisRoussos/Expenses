var db;
//var serviceURL = "http://rememberlist.heroku.com/expenses/";
//var serviceURL = "http://localhost:3000/expenses/";
var serviceURL = "http://10.0.2.2:3000/expenses/";
var mobiledata = [];
var webdata = [];
var webreply = [];
var webdataFormatted = [];
var mobileinserteddata = [];
var mobIds = [];
var wcounter;
var counterOfDataAddedtoWeb;
  var trxtype;
  var trxdatetime;
  var sn;
  var amount;
  var dateoccured;
  var category;
  var subcategory;
  var ttype;
  var trxmethod;
var webindex;
var mobid;
var webid;
var parm;
var userEmailFound = false; 
var usremail;
var usrpasswordemail;
// var currentwebid;
var lastCategoryCode;
var lastSubCategoryCode;
var categoryDescription;
var subcategoryDescription;
var categoryid = '';

function transaction_error(tx, error) {
	$('#busy').hide();
    alert("Database Error:" + error.message);
}

function populateDB_success() {
	$('#busy').hide();
}

function synchronizeWithWeb() {
//	$('#busy').show();
//  Get EJ (logs) from file to update the web server 
	parm = 0;
    db.transaction(getUser, transaction_error, populateDB_success);
//	synchronizeFromWeb();
//    if (mobileinserteddata !== []) {send_inserted_data_to_web();};
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
	  	data: {user: usremail, password: usrpassword, mobiledata: mobiledata},
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
					console.log("web");
					console.log(webdata);
					if (webdata.length > 1)
						{var responsecode = webdata.shift();}
					else
						{var responsecode = webdata};
				 	if (responsecode == 0)
					 	{
					 	webindex = jQuery.inArray("web", webdata);
					 	if (webindex != -1)
						 	{webreply = webdata.splice(0,webindex);
							update_from_web(webdata);}
						else
							{alert( "Ο συγχρονισμός τελείωσε με επιτυχία.")};
						clear_journal();
						}
					else
						{alert( "Ο χρήστης δεν πιστοποιήθηκε. Διορθώστε το email ή/και το password και ξαναπροσπαθήστε.")}
				}
	 	});
 	request.fail(function(jqXHR, textStatus) {
	  alert( "Ο συγχρονισμός απέτυχε. Ελέγξτε την σύνδεση σας στο Internet: " + textStatus );
	});
//	console.log(mobiledata);
 }
  
 function update_from_web(webdata){
//	console.log(webreply);
	db.transaction(updateExpenseFromMobile, transaction_error, populateDB_success);
	webdata.shift();
	webdataFormatted=[];
	counterOfDataAddedtoWeb = 0;
//   	console.log(webdata);
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
//    	console.log(remainder);
//    	console.log(trxtype);
	  if (remainder == 8 && trxtype == 'A')
	        {webdataFormatted.push([trxtype, trxdatetime, sn, amount, dateoccured, category, subcategory, ttype, trxmethod]);
			counterOfDataAddedtoWeb++;
//			alert(counterOfDataAddedtoWeb);
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
 
 function updateExpenseFromMobile(tx) {
	$.each(webreply, function(index, value) { 
	  var remainder = index % 2;
	  if (remainder == 0) {mobid = value};
	  if (remainder == 1) 
	  	{webid = value;
		var sql = "UPDATE expense SET webid ="+webid+",sync='S' WHERE sn = " + mobid + "";
//		alert(sql);
		tx.executeSql(sql);};
	});
 }

 function putExpensesEJ(tx) {
//  	$('#busy').show();
// select uncommited changes
//	console.log(tx);
	mobileinserteddata.length = 0;
	mobIds.length = 0;
	$.each(webdataFormatted, function(index, value) { 
	if (webdataFormatted[index][0] == 'A')
		{
//		currentwebid = webdataFormatted[index][2];
		var sql = "INSERT INTO expense (amount, dateOccured, category, subcategory, type, method, webid, commiteDateTime, sync) " + 
		"VALUES ("+webdataFormatted[index][3]+",'"+webdataFormatted[index][4]+"','"+webdataFormatted[index][5]+"', '"+webdataFormatted[index][6]+"', '"+webdataFormatted[index][7]+"', '"+webdataFormatted[index][8]+"', "+webdataFormatted[index][2]+", '"+webdataFormatted[index][1]+"','S')";};
	if (webdataFormatted[index][0] == 'D')
		{var sql = "DELETE FROM expense WHERE webid = " + webdataFormatted[index][2] + "";};
	if (webdataFormatted[index][0] == 'U')
		{var sql = "UPDATE expense SET amount ="+webdataFormatted[index][3]+",dateOccured='"+webdataFormatted[index][4]+"',category='"+webdataFormatted[index][5]+"', " +
		" subcategory='"+webdataFormatted[index][6]+"',method='"+webdataFormatted[index][8]+"',commiteDateTime='"+webdataFormatted[index][1]+"',sync='S' " +
		" WHERE webid = " + webdataFormatted[index][2] + " AND commiteDateTime < '"+webdataFormatted[index][1]+"'";
//		alert(sql);
		};
//	tx.executeSql(sql);
	wcounter = 0;
	tx.executeSql(sql, [], querySuccess, transaction_error);	
	});
 }
 
 function querySuccess(tx, results) {
 // check push only on additions and only one final call send_inserted ......
// 	alert(results.insertId);
    mobIds.push(results.insertId);
// 	mobileinserteddata.push(expense.webid, results.insertId );
    wcounter++;
    console.log(wcounter);
    console.log(mobIds);
 	if (wcounter == counterOfDataAddedtoWeb) 
 		{
		$.each(mobIds, function(index, value) { 
				mobileinserteddata.push(webdataFormatted[index][2], mobIds [index]);
		});
	    console.log(mobileinserteddata);
		send_inserted_data_to_web();
//		alert( "Ο συγχρονισμός τελείωσε με επιτυχία.");
	};
}
 
 function clear_journal() {
   	db.transaction(clearExpensesEJ, transaction_error, populateDB_success);
 }

 function clearExpensesEJ(tx) {
	var sql = "DELETE FROM expenseej";
	tx.executeSql(sql);	
 } 
 
 function send_inserted_data_to_web() {
// alert(mobileinserteddata);
	 var request = $.ajax({
	  	url: serviceURL + "synchronize_with_mobile_second_step",
	  	type: 'POST',
	  	dataType: 'json',
	  	data: {user: 'grtramp@yahoo.gr', mobileinserteddata: mobileinserteddata},
	beforeSend : function(xhr){
       xhr.setRequestHeader("Accept", "application/json")
     },
		success:function(webdata) {alert( "Ο συγχρονισμός τελείωσε με επιτυχία.");}
	 	});
 	request.fail(function(jqXHR, textStatus) {alert( "Ο συγχρονισμός απέτυχε. Ελέγξτε την σύνδεση σας στο Internet: " + textStatus );});
//	console.log(mobiledata);
 
 };
 
 function registerUser() {
	parm = 1;
    db.transaction(getUser, transaction_error, populateDB_success);
 }

 function getUser(tx) {
	var sql = "select * from user";
	tx.executeSql(sql, [], getUser_success, transaction_error);
 }
 
  function getUser_success(tx, results) {
    var len = results.rows.length;
    $('#user_id').val('');
    userEmailFound = false;
    if (len > 0)
      {
      userEmailFound = true;
      for (var i=0; i<len; i++) {
    	 var user = results.rows.item(i);
		 $('#user_id').val(user.email);
		 usremail=user.email;
		 usrpassword=user.password;
	     }
	  };
	if (parm == 1)
		{$('#editUserProfile').show()}
	else
		if (userEmailFound)
			{db.transaction(getExpensesEJ, transaction_error, populateDB_success);}
		else
			{alert( "Παρακαλώ κάντε καταχώρηση χρήστη στο web.")}
 }

 function updateWebUser() {
  	var useremail = $('#user_id').val();
  	var userpassword = $('#user_password').val();
 	if (useremail == '' || userpassword == '') 
		{alert('Κενό email ή password');}
	else
		{	
  	  	db.transaction(editUserUpdateFields, transaction_error, populateDB_success);
  		};
  		
  		//  Post results to web server
	
  		
	$.mobile.changePage( "#settings", {transition: "slideup"} );
  }
 
   function editUserUpdateFields(tx) {
  	var useremail = $('#user_id').val();
  	var userpassword = $('#user_password').val();
	$('#busy').show();
	var sql;
	if (userEmailFound == true)
		{sql = "update user set email ='"+useremail+"',password='"+userpassword+"'"}
	else
		{sql = "insert into user (email, password) values ('"+useremail+"','"+userpassword+"')"};
    tx.executeSql(sql);
    AuthenticateUserOnWeb(useremail, userpassword);
 }
 
   function AuthenticateUserOnWeb(usermail, userpassword) {
 	var request = $.ajax({
	  	url: serviceURL + "authenticate_mobile_user",
	  	type: 'POST',
	  	dataType: 'json',
	  	data: {user: usermail, password: userpassword},
	beforeSend : function(xhr){
       xhr.setRequestHeader("Accept", "application/json")
     },
	success:function(webdata) {
					console.log(webdata);
				 	if (webdata == 1)
						{alert( "Ο χρήστης δεν πιστοποιήθηκε. Διορθώστε το email ή/και το password και ξαναπροσπαθήστε.")}
					else
					 	if (webdata == 2)
							{alert( "Ο χρήστης δεν είναι ενεργός. Ενεργοποιήστε τον από το email σας.")}
						else
							{alert( "Ο χρήστης πιστοποιήθηκε με επιτυχία.")};
	}
	});
 	request.fail(function(jqXHR, textStatus) {
	  alert( "Η πιστοποίηση χρήστη απέτυχε. Ελέγξτε την σύνδεση σας στο Internet: " + textStatus );
	});
 }  		
 
  function listCategories() {
  	$('#category_description').val('');
    db.transaction(getCategories, transaction_error, populateDB_success);
 }

 function getCategories(tx) {
	var sql = "select * from category where type = 'E'";
	tx.executeSql(sql, [], getCategories_success, transaction_error);
 }
 
  function getCategories_success(tx, results) {
 
    var len = results.rows.length;
    $('#categoryList').empty();
    $('#categoryList').listview('refresh');

	     for (var i=0; i<len; i++)
	    	{
	    	var category = results.rows.item(i);
//	    	alert('category.code ' + category.code);
	    	$('#categoryList').append('<li><a href="javascript:categorydialog(' + category.code + ')" data-rel="dialog" data-transition="pop">' + category.elDescription + '</a></li>');
	    	}
 	     $('#categoryList').listview('refresh');
 	    
 }
 
  function newExpenseCategory() {
  	categoryDescription = $('#category_description').val();
  	if (categoryDescription == '') 
		{alert('Δώστε περιγραφή της κατηγορίας');}
	else
  		{db.transaction(addExpenseCategory, transaction_error, populateDB_success);};
//	showForm();
 }

 function addExpenseCategory(tx) {
	$('#busy').show();
	getLastCategory();
 }
 
 function getLastCategory() {
    db.transaction(getlastCategories, transaction_error, populateDB_success);
 }
 
 function getlastCategories(tx) {
	var sql = "SELECT code FROM category  where type = 'E' ORDER BY code DESC LIMIT 1";
	tx.executeSql(sql, [], getlastCategories_success, transaction_error);
 }
 
  function getlastCategories_success(tx, results) {
    var len = results.rows.length;
	if (len == 0)
		{lastCategoryCode = '00'}
	else
		{
	     for (var i=0; i<len; i++)
	    	{
	    	var lastcategory = results.rows.item(i);
	    	lastCategoryCode = lastcategory.code;
	    	}
 	    }

	var lastCategoryCodeN = parseInt(lastCategoryCode,10);
	var newCategoryCodeN = lastCategoryCodeN + 1;
	var newCategoryCode = newCategoryCodeN.toString();
//	alert(newCategoryCode);
	if (lastCategoryCodeN < 9) {newCategoryCode = '0' + newCategoryCode};
    tx.executeSql("INSERT INTO category (code,type,enDescription, elDescription) VALUES ('"+newCategoryCode+"','E','','"+categoryDescription+"')");
//    $.mobile.changePage( "#categories", { transition: "slideup"} );
    listCategories();
 }
 
 function categorydialog(catid) {
	categoryid = catid;
	if (categoryid < 10) {categoryid = '0' + categoryid};
	$.mobile.changePage( "#categorydialog", { role: 'dialog', transition: "slideup"} );
 }

  function listSubCategories() {
  	$('#subCategory_description').val('');
    db.transaction(getSubCategories, transaction_error, populateDB_success);
 }

 function getSubCategories(tx) {
	var sql = "select * from subcategory where type = 'E' and categorycode = '"+ categoryid +"'";
	alert(sql);
	tx.executeSql(sql, [], getSubCategories_success, transaction_error);
 }
 
  function getSubCategories_success(tx, results) {
 
    var len = results.rows.length;
    $('#subCategoryList').empty();
    $('#subCategoryList').listview('refresh');

	     for (var i=0; i<len; i++)
	    	{
	    	var subcategory = results.rows.item(i);
	    	$('#subCategoryList').append('<li><a href="#index" data-rel="dialog" data-transition="pop">' + subcategory.elDescription + '</a></li>');
	    	}
 	     $('#subCategoryList').listview('refresh');
 	    
 }
 
  function newExpenseSubCategory() {
  	subcategoryDescription = $('#subCategory_description').val();
  	if (subcategoryDescription == '') 
		{alert('Δώστε περιγραφή της υποκατηγορίας');}
	else
  		{db.transaction(addExpenseSubCategory, transaction_error, populateDB_success);};
//	showForm();
 }

 function addExpenseSubCategory(tx) {
	$('#busy').show();
	getLastSubCategory();
 }
 
 function getLastSubCategory() {
    db.transaction(getlastSubCategories, transaction_error, populateDB_success);
 }
 
 function getlastSubCategories(tx) {
	var sql = "SELECT subcategoryCode FROM subcategory  where type = 'E' and  categorycode = '"+ categoryid +"' ORDER BY subcategoryCode DESC LIMIT 1";
//	alert(sql);
	tx.executeSql(sql, [], getlastSubCategories_success, transaction_error);
 }
 
  function getlastSubCategories_success(tx, results) {
    var len = results.rows.length;
	if (len == 0)
		{lastSubCategoryCode = '00'}
	else
		{
	     for (var i=0; i<len; i++)
	    	{
	    	var lastsubcategory = results.rows.item(i);
	    	lastSubCategoryCode = lastsubcategory.subcategoryCode;
	    	}
 	    }

	var lastSubCategoryCodeN = parseInt(lastSubCategoryCode,10);
	var newSubCategoryCodeN = lastSubCategoryCodeN + 1;
	var newSubCategoryCode = newSubCategoryCodeN.toString();
	if (lastSubCategoryCodeN < 9) {newSubCategoryCode = '0' + newSubCategoryCode};
	var sql = "INSERT INTO subcategory (categoryCode,subcategoryCode, type,enDescription, elDescription) VALUES ('"+categoryid+"', '"+newSubCategoryCode+"','E','','"+subcategoryDescription+"')";
//	alert(sql);
    tx.executeSql(sql);
    listSubCategories();
 }
 