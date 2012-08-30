var db;
//var serviceURL = "http://rememberlist.heroku.com/expenses/";
//var serviceURL = "http://localhost:3000/expenses/";
var serviceURL = "http://10.0.2.2:3000/expenses/";
var mobiledata = [];
var categoryrows = [];
var subCategoryrows = [];
var mobiledata = [];
var webdata = [];
var CopiedData  = [];
var webreply = [];
var copyreply = [];
var webdataFormatted = [];
var CopiedExpensesFormatted = [];
var CopiedCategoriesFormatted = [];
var CopiedSubcategoriesFormatted = [];
var mobileinserteddata = [];
var mobIds = [];
var wcounter;
var counterOfDataAddedtoWeb;
var counterOfDataAddedCopiedfromWeb;
  var trxtype;
  var trxdatetime;
  var sn;
  var amount;
  var dateoccured;
  var category;
  var subcategory;
  var ttype;
  var trxmethod;
var categoryCode;
var categoryType;
var categoryenDesciption;
var categoryelDesciption;
var scategoryCode;
var subcategoryType;
var subcategoryenDesciption;
var subcategoryelDesciption;
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
var subcategoryid = '';

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

function copyFromWeb() {
	parm = 2;
    db.transaction(getUser, transaction_error, populateDB_success);
}

function getDataFromMobile(tx) {
//  	$('#busy').show();
	var sql = "select * from category where synched is null";
	tx.executeSql(sql, [], retrieveCategories_success, transaction_error);
 }


  function retrieveCategories_success(tx, results) {
    categoryrows = [];
//    webdata = [];
    var len = results.rows.length;
    for (var i=0; i<len; i++) {
    	var categorymob = results.rows.item(i);
	    categoryrows.push(categorymob.code, categorymob.type, categorymob.enDescription, categorymob.elDescription);
	    };
	var sql = "select * from subcategory where synched is null";
	tx.executeSql(sql, [], retrieveSubCategories_success, transaction_error);
 }

  function retrieveSubCategories_success(tx, results) {
    subCategoryrows = [];
//    webdata = [];
    var len = results.rows.length;
    for (var i=0; i<len; i++) {
    	var subCategorymob = results.rows.item(i);
	    subCategoryrows.push(subCategorymob.categoryCode, subCategorymob.subcategoryCode, subCategorymob.type, subCategorymob.enDescription, subCategorymob.elDescription);
	    };
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
	  	data: {user: usremail, password: usrpassword, categoryrows: categoryrows, subCategoryrows: subCategoryrows, mobiledata: mobiledata},
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
//	var sql = "update category set flag = 'Y'";
//	tx.executeSql(sql);};
//	var sql = "update subcategory set flag = 'Y'";
//	tx.executeSql(sql);};
	tx.executeSql(sql, [], getSubCategories_success, transaction_error);
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
	var sql = "UPDATE category set synched = 'N'";
	tx.executeSql(sql);	
	var sql = "UPDATE subcategory set synched = 'N'";
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
		if (userEmailFound) {
			if (parm == 0) {db.transaction(getDataFromMobile, transaction_error, populateDB_success)};
			if (parm == 2) {db.transaction(clearDB, transaction_error, copyExpenses)};
			}
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
//	alert(sql);
	tx.executeSql(sql, [], getSubCategories_success, transaction_error);
 }
 
  function getSubCategories_success(tx, results) {
 
    var len = results.rows.length;
    $('#subCategoryList').empty();
    $('#subCategoryList').listview('refresh');

	     for (var i=0; i<len; i++)
	    	{
	    	var subcategory = results.rows.item(i);
			var txt1 = "'";
			var n1=txt1.concat(subcategory.subcategoryCode).concat(txt1);
			var n2=txt1.concat(subcategory.elDescription).concat(txt1);
	    	var a = '<li><a href="javascript:subcategoryEdit('+ n1 +','+ n2 + ')">' + subcategory.elDescription + '</a></li>';
	    	$('#subCategoryList').append('<li><a href="javascript:subcategoryEdit('+ n1 +','+ n2 + ')">' + subcategory.elDescription + '</a></li>');
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
    tx.executeSql(sql);
    listSubCategories();
 }
 
  function editCategoryDescription() {
    db.transaction(getCategoryDescription, transaction_error, populateDB_success);
 }

 function getCategoryDescription(tx) {
	var sql = "select * from category where code = '"+ categoryid +"'";
	tx.executeSql(sql, [], getCategoryDescription_success, transaction_error);
 }
 
  function getCategoryDescription_success(tx, results) {
    var len = results.rows.length;
	for (var i=0; i<len; i++) {
    	 var category = results.rows.item(i);
		 $('#category_description_edit').val(category.elDescription);
	};
	$('#editcategoryDesc').show();
 }
 
 function updateCategoryDescription() {
  	var CategoryDescription = $('#category_description_edit').val();
 	if (CategoryDescription == '') 
		{alert('Κενή περγραφή κατηγορίας');}
	else
		{	
  	  	db.transaction(editCategoryDescriptionField, transaction_error, populateDB_success);
  		};
  }
 
   function editCategoryDescriptionField(tx) {
  	var CategoryDescription = $('#category_description_edit').val();
	$('#busy').show();
	var sql = "update category set elDescription ='"+CategoryDescription+"' where code = '"+ categoryid +"'";
    tx.executeSql(sql);
    $.mobile.changePage( "#categories", {transition: "slideup"} );
 }

 function subcategoryEdit(subcategoryCode, subcategoryelDescription) {
	subcategoryid = subcategoryCode;
	$('#subcategory_description_edit').val(subcategoryelDescription);
	$.mobile.changePage( "#editSubCategory", {transition: "slideup"} );
 }

 function updateSubCategoryDescription() {
  	var SubCategoryDescription = $('#subcategory_description_edit').val();
 	if (SubCategoryDescription == '') 
		{alert('Κενή περγραφή υποκατηγορίας');}
	else
		{	
  	  	db.transaction(editSubCategoryDescriptionField, transaction_error, populateDB_success);
  		};
  }
 
 function editSubCategoryDescriptionField(tx) {
  	var SubCategoryDescription = $('#subcategory_description_edit').val();
	$('#busy').show();
	var sql = "update subcategory set elDescription ='"+SubCategoryDescription+"' where categoryCode = '"+ categoryid +"' and subcategorycode = '"+ subcategoryid +"'";
    tx.executeSql(sql);
    $.mobile.changePage( "#subCategories", {transition: "slideup"} );
 }
 
 function copyExpenses() {
	 db.transaction(copyExpensesFromWeb, transaction_error, populateDB_success);
 }
 
 function copyExpensesFromWeb(tx) {
    CopiedData = [];
//  Request data from web server
	 var request = $.ajax({
	  	url: serviceURL + "copy_to_mobile",
	  	type: 'POST',
	  	dataType: 'json',
	  	data: {user: usremail, password: usrpassword},
	beforeSend : function(xhr){
       xhr.setRequestHeader("Accept", "application/json")
     },
		success:function(CopiedData) {
					var expensesreply = [];
					var categoriesreply = [];
					var subcategoriesreply = [];
					console.log("Copied from web");
					console.log(CopiedData);
					var originalData = CopiedData;
					if (CopiedData.length > 1)
						{var responsecode = CopiedData.shift();}
					else
						{var responsecode = CopiedData};
				 	if (responsecode == 0) { 
					 	webindex = jQuery.inArray("expenses", CopiedData);
					 	if (webindex != -1) {
						 	var expensesreply = CopiedData.splice(0,webindex);
						 };
					 	webindex = jQuery.inArray("categories", CopiedData);
					 	if (webindex != -1) {
						 	expensesreply = CopiedData.splice(0,webindex);
						 	categoriesreply = CopiedData;
						};
					 	webindex = jQuery.inArray("subcategories", CopiedData);
					 	if (webindex != -1) {
						 	categoriesreply = CopiedData.splice(0,webindex);
						 	subcategoriesreply = CopiedData;
					 	};
						copy_from_web_expenses(expensesreply);
						copy_from_web_categories(categoriesreply);
						copy_from_web_subcategories(subcategoriesreply);
// 						alert( "Ο συγχρονισμός τελείωσε με επιτυχία.");
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
 
  function copy_from_web_expenses(expensesreply){
	expensesreply.shift();
	CopiedExpensesFormatted=[];
	counterOfDataAddedCopiedfromWeb = 0;
  	console.log(expensesreply);
	$.each(expensesreply, function(index, value) { 
	  var remainder = index % 8;
	  if (remainder == 0) {sn = value};
	  if (remainder == 1) {amount = value};
	  if (remainder == 2) {dateoccured = value};
	  if (remainder == 3) {category = value};
	  if (remainder == 4) {subcategory = value};
	  if (remainder == 5) {ttype = value};
	  if (remainder == 6) {trxmethod = value};
	  if (remainder == 7) {trxdatetime = value};
	  if (remainder == 7)
	        {CopiedExpensesFormatted.push([sn, amount, dateoccured, category, subcategory, ttype, trxmethod, trxdatetime]);
			counterOfDataAddedCopiedfromWeb++;
//	        	console.log(CopiedExpensesFormatted);
	        };
	});
  	db.transaction(copyAllExpenses, transaction_error, clear_journal);
 } 
   
  function copyAllExpenses(tx) {
  	console.log(CopiedExpensesFormatted);
	wcounter = 0;
	counterOfDataAddedtoWeb = 0;
	mobIds = [];
	mobileinserteddata = [];
	$.each(CopiedExpensesFormatted, function(index, value) { 
		var sql = "INSERT INTO expense (amount, dateOccured, category, subcategory, type, method, webid, commiteDateTime, sync) "+ 
		"VALUES ('"+CopiedExpensesFormatted[index][1]+"','"+CopiedExpensesFormatted[index][2]+"','"+CopiedExpensesFormatted[index][3]+"', '"+CopiedExpensesFormatted[index][4]+"', '"+CopiedExpensesFormatted[index][5]+"', '"+CopiedExpensesFormatted[index][6]+"', "+CopiedExpensesFormatted[index][0]+", '"+CopiedExpensesFormatted[index][7]+"','S')";
//	    tx.executeSql(sql);
		wcounter = 0;
		counterOfDataAddedtoWeb++;
		tx.executeSql(sql, [], fillArrayWithIds, transaction_error);	
	});
 }

 function fillArrayWithIds(tx, results) {
 // check push only on additions and only one final call send_inserted ......
// 	alert(results.insertId);
    mobIds.push(results.insertId); 
    wcounter++;
//    console.log(wcounter);
//    console.log(mobIds);
 	if (wcounter == counterOfDataAddedtoWeb) 
 		{
		$.each(mobIds, function(index, value) { 
				mobileinserteddata.push(CopiedExpensesFormatted[index][0], mobIds [index]);
		});
	    console.log(mobileinserteddata);
		send_inserted_data_to_web();
	};
}

  function copy_from_web_categories(categoriesreply){
	categoriesreply.shift();
	CopiedCategoriesFormatted=[];
	counterOfDataAddedCopiedfromWeb = 0;
  	console.log(CopiedData);
	$.each(categoriesreply, function(index, value) { 
	  var remainder = index % 4;
	  if (remainder == 0) {categoryCode = value};
	  if (remainder == 1) {categoryType = value};
	  if (remainder == 2) {categoryenDescription = value};
	  if (remainder == 3) {categoryelDescription = value};
	  if (remainder == 3)
	        {CopiedCategoriesFormatted.push([categoryCode, categoryType, categoryenDescription, categoryelDescription]);
			counterOfDataAddedCopiedfromWeb++;
	        };
	});
  	db.transaction(copyAllCategories, transaction_error, populateDB_success);
 } 
   
  function copyAllCategories(tx) {
   	console.log(CopiedCategoriesFormatted);
	$.each(CopiedCategoriesFormatted, function(index, value) { 
		var sql = "INSERT INTO category (code, type, enDescription, elDescription) "+ 
		"VALUES ('"+CopiedCategoriesFormatted[index][0]+"','"+CopiedCategoriesFormatted[index][1]+"','"+CopiedCategoriesFormatted[index][2]+"','"+CopiedCategoriesFormatted[index][3]+"')";
	    tx.executeSql(sql);
	});
 }
 
   function copy_from_web_subcategories(subcategoriesreply){
	subcategoriesreply.shift();
	CopiedSubcategoriesFormatted=[];
	counterOfDataAddedCopiedfromWeb = 0;
//   	console.log(CopiedData);
	$.each(subcategoriesreply, function(index, value) { 
	  var remainder = index % 5;
	  if (remainder == 0) {scategoryCode = value};
	  if (remainder == 1) {subcategoryCode = value};
	  if (remainder == 2) {subcategoryType = value};
	  if (remainder == 3) {subcategoryenDescription = value};
	  if (remainder == 4) {subcategoryelDescription = value};
	  if (remainder == 4)
	        {CopiedSubcategoriesFormatted.push([scategoryCode, subcategoryCode, subcategoryType, subcategoryenDescription, subcategoryelDescription]);
			counterOfDataAddedCopiedfromWeb++;
//	//        	console.log(CopiedSubcategoriesFormatted);
	        };
	});
  	db.transaction(copyAllSubcategories, transaction_error, populateDB_success);
 } 
   
  function copyAllSubcategories(tx) {
   	console.log(CopiedSubcategoriesFormatted);
	$.each(CopiedSubcategoriesFormatted, function(index, value) { 
		var sql = "INSERT INTO subcategory (categoryCode, subcategoryCode, type, enDescription, elDescription) "+ 
		"VALUES ('"+CopiedSubcategoriesFormatted[index][0]+"','"+CopiedSubcategoriesFormatted[index][1]+"','"+CopiedSubcategoriesFormatted[index][2]+"', '"+CopiedSubcategoriesFormatted[index][3]+"','"+CopiedSubcategoriesFormatted[index][4]+"')";
	    tx.executeSql(sql);
	});
 }
 
  function clearDB() {
   	db.transaction(clear_DB, transaction_error, populateDB_success);
 }

 function clear_DB(tx) {
	var sql = "DELETE FROM expenseej";
	tx.executeSql(sql);	
	var sql = "DELETE FROM expense";
	tx.executeSql(sql);	
	var sql = "DELETE FROM category";
	tx.executeSql(sql);	
	var sql = "DELETE FROM subcategory";
	tx.executeSql(sql);	
 } 
 