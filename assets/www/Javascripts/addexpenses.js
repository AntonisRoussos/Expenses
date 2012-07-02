var db;
var dbCreated = false;
var amount;
var dateOccured; 
var category;
var method;
var lenCategory;
var subcategory;
var readystatus = null;
var nowtime;
var expenseCategory;
var wcategoryCode;
 
document.addEventListener("deviceready", onDeviceReady, false);

document.addEventListener("backbutton", function(e){
    if($.mobile.activePage.is('#homepage')){
        e.preventDefault();
        navigator.app.exitApp();
    }
    else {
        navigator.app.backHistory()
    }
}, false);

function onDeviceReady() {
	console.log("opening database");
    db = window.openDatabase("ExpensesDB", "1.0", "Personal Expenses", 1000000);
    if (dbCreated)
    	{}
    else
    	{db.transaction(populateDB, transaction_error, populateDB_success);
    	};
}


	$(document).ready(function () {
	    $(document).ajaxStart(function () { showProgress() }).ajaxStop(function () { hideProgress() });
	});
	function showProgress() {
		$.mobile.showPageLoadingMsg("f");	
	}
	function hideProgress() {
		$.mobile.hidePageLoadingMsg();	
	}
	jQuery.fn.center = function () {
	    this.css("position", "absolute");
	    this.css("top", ($(window).height() - this.height()) / 2 + $(window).scrollTop() + "px");
	    this.css("left", ($(window).width() - this.width()) / 2 + $(window).scrollLeft() + "px");
	    return this;
	}


function onBodyLoad(){
	readystatus = null;
	var now = new Date();
	var today = now.format("dd/mm/yyyy").toString();
	$('#busy').hide();
	$('#views').hide();
	$('#expense_date').trigger('datebox', {'method':'set', 'value':today});
//	$('#expense_amount').keypad();
//	$('#expense_amount').keypad('show');
//	$('.Selectview').change(function() {viewExpenses()}); 
	$('#expense_category').change(function() {db.transaction(fillSubCategories, transaction_error, populateDB_success);});
	$('#expense_categoryU').change(function() {db.transaction(fillSubCategoriesU, transaction_error, populateDB_success);});
	$('#expense_view').change(function() {$('#information').trigger('pageshow');});
//	$('.Selectview').change(function() {$('#info').trigger('click');});
/*	$("#information").on('pageshow',function(){
	   var myselect = $("select#view");
	   myselect[0].selectedIndex = 2;
	   myselect.selectmenu("refresh");
	});
*/
	$('#information').on('pageshow',function(event, ui){viewExpenses();});
	$('#homepage').on('pageshow',function(event, ui){showForm('expense');});
	$('#editExpense').on('pageshow',function(event, ui){editexpense();});
	$('#userProfile').on('pageshow',function(event, ui){registerUser();});
	$('#editCategory').on('pageshow',function(event, ui){editCategoryDescription();});
	$('#categories').on('pageshow',function(event, ui){listCategories();});
	$('#subCategories').on('pageshow',function(event, ui){listSubCategories();});
	$("#toggleViewStats").val('BarChart');
	$("#toggleViewStats").empty().append('<img src="./Stylesheets/images/chart-pie.png">');
	$('#toggleViewStats').toggle(
		function() {
		  $("#toggleViewStats").val('PieChart');
		  viewExpenses();
		  $("#toggleViewStats").empty().append('<img src="./Stylesheets/images/bar-chart.png">');
		}, 
		function() {
		  $("#toggleViewStats").val('BarChart');
		  viewExpenses();
		  $("#toggleViewStats").empty().append('<img src="./Stylesheets/images/chart-pie.png">');
		});
	$("#toggleView").val('perDay');
	$("#toggleView").empty().append('<img src="./Stylesheets/images/analysis.png">');
//	$("#toggleView").empty().append('Click για Έξοδα / Kατηγορία');
//	$("#toggleView").empty().append('<a href="#" data-icon="home" data-iconpos="notext" data-direction="reverse"></a>');
	$('#toggleView').toggle(
		function() {
		  $("#toggleView").val('perCategory');
		  viewExpenses();
		  $("#toggleView").empty().append('<img src="./Stylesheets/images/calendar.png">');
		}, 
		function() {
		  $("#toggleView").val('perDay');
		  viewExpenses();
		  $("#toggleView").empty().append('<img src="./Stylesheets/images/analysis.png">');
		});
/*		

// useful to pass data from previous page		
		$('#editExpense').on('pagebeforeshow',function(e,data){
			fields = getFields();
//			var amount = $('#expense_amount',data.prevPage).text();
			var eamount = fields[0];
			var ecategory =  fields[1];
			var emethod =  fields[2];
			var edate =  fields[3];
			$('#exp_amount').val(eamount);
			$('#exp_category').val(ecategory);
//			alert($('#exp_category').val());
//			$("#exp_category option[value='05']").attr("selected", "selected");
//			$("#exp_category").prop("selectedIndex", ecategory - 1);
			$('#exp_method').val(emethod);
			$('#exp_date').val(edate);
		 });
*/
}



function transaction_error(tx, error) {
	$('#busy').hide();
    alert("Database Error:" + error);
}

function populateDB_success() {
	dbCreated = true;
	$('#busy').hide();
}

function populateDB(tx) {
//	tx.executeSql('DROP TABLE IF EXISTS user');
//	$('#busy').show();
	var sql = 
		"CREATE TABLE IF NOT EXISTS user ( "+
		"email VARCHAR(40)," +
		"password varchar(40))"; 
    tx.executeSql(sql);

	var sql = 
		"CREATE TABLE IF NOT EXISTS expense ( "+
		"sn INTEGER PRIMARY KEY AUTOINCREMENT, " +
		"amount REAL, " +
		"dateOccured DATE, " +
		"category VARCHAR(2), " +
		"subcategory VARCHAR(2)," +
		"type varchar(1), " +
		"method varchar(1), " +  
		"webid INTEGER DEFAULT NULL, " +
		"commiteDateTime DATETIME, " + 
		"sync varchar(1))"; 
    tx.executeSql(sql);

	var sql = 
		"CREATE TABLE IF NOT EXISTS expenseej ( "+
		"trxtype VARCHAR(1), " +
		"trxdatetime DATETIME, " +
		"sn INTEGER, " +
		"amount REAL, " +
		"dateOccured DATE, " +
		"category VARCHAR(2), " +
		"subcategory VARCHAR(2), " +
		"type varchar(1), " +
		"method varchar(1))"; 
    tx.executeSql(sql);

	var sql = 
		"CREATE UNIQUE INDEX IF NOT EXISTS uniqueqwebid on expense (webid)";
    tx.executeSql(sql);

// create log record for mobile only additions    

    tx.executeSql('DROP TRIGGER IF EXISTS insert_expense');
	var sql = 
     "CREATE TRIGGER IF NOT EXISTS insert_expense AFTER INSERT ON expense when new.webid is NULL " +
     "BEGIN " +
		"INSERT INTO expenseej (trxtype, trxdatetime, sn, amount, dateOccured, category, subcategory, type, method) VALUES ('A', DATETIME('NOW'), new.sn, new.amount, new.dateOccured, new.category, new.subcategory, new.type, new.method);" +
//      UPDATE t1 SET timeEnter = DATETIME('NOW')  WHERE rowid = new.rowid;
     " END; ";
    tx.executeSql(sql);
// create log record for mobile only deletions    
    tx.executeSql('DROP TRIGGER IF EXISTS delete_expense');
	var sql = 
     "CREATE TRIGGER IF NOT EXISTS delete_expense AFTER DELETE ON expense " +
     "BEGIN " +
		"INSERT INTO expenseej (trxtype, trxdatetime, sn, amount, dateOccured, category, subcategory, type, method) VALUES ('D', DATETIME('NOW'), old.sn, old.amount, old.dateOccured, old.category, old.subcategory, old.type, old.method);" +
     " END; ";
    tx.executeSql(sql);
// create log record for mobile only updates    
    tx.executeSql('DROP TRIGGER IF EXISTS update_expense');
	var sql = 
     "CREATE TRIGGER IF NOT EXISTS update_expense AFTER UPDATE ON expense when new.sync = '' " +
     "BEGIN " +
		"INSERT INTO expenseej (trxtype, trxdatetime, sn, amount, dateOccured, category, subcategory, type, method) VALUES ('U', DATETIME('NOW'), new.sn, new.amount, new.dateOccured, new.category, new.subcategory, new.type, new.method);" +
     " END; ";
    tx.executeSql(sql);

    
//	var sql = "SELECT name FROM sqlite_master WHERE type='table' AND name='category'";
//    tx.executeSql(sql, [], checkTableExists_success, transaction_error);
    
//    alert(lenCategory);
    
//    if (lenCategory == 0)
//    	{
//	    tx.executeSql('DROP TABLE IF EXISTS category');
		var sql = 
			"CREATE TABLE IF NOT EXISTS category ( "+
			"code VARCHAR(2), " +
			"type VARCHAR(1), " +
			"enDescription VARCHAR(30), " +
			"elDescription VARCHAR(30), " +
			"PRIMARY KEY (code, type))";
	    tx.executeSql(sql);
/*	
	    tx.executeSql("INSERT INTO category (code,type,enDescription, elDescription, image) VALUES ('01','E','Grocery','Super Market','.\Images\Super.jpg')");
	    tx.executeSql("INSERT INTO category (code,type,enDescription, elDescription, image) VALUES ('02','E','Appearence','Εμφάνιση','.\Images\Clothing.jpg')");
	    tx.executeSql("INSERT INTO category (code,type,enDescription, elDescription, image) VALUES ('03','E','House','Σπίτι','.\Images\House.jpg')");
	    tx.executeSql("INSERT INTO category (code,type,enDescription, elDescription, image) VALUES ('04','E','Vehicles','Οχήματα','.\Images\Car.jpg')");
	    tx.executeSql("INSERT INTO category (code,type,enDescription, elDescription, image) VALUES ('05','E','Family','Οικογένεια','.\Images\Kids.jpg')");
	    tx.executeSql("INSERT INTO category (code,type,enDescription, elDescription, image) VALUES ('06','E','Personal','Προσωπικά','.\Images\Personal.jpg')");
	    tx.executeSql("INSERT INTO category (code,type,enDescription, elDescription, image) VALUES ('07','E','Entertainment','Διασκέδαση','.\Images\Entertainment.jpg')");
	    tx.executeSql("INSERT INTO category (code,type,enDescription, elDescription, image) VALUES ('08','E','Medical','Ιατρικά','.\Images\Entertainment.jpg')");
*/
//	 	};
    
//	tx.executeSql('DROP TABLE IF EXISTS subcategory');
	var sql = 
		"CREATE TABLE IF NOT EXISTS subcategory ( "+
		"categoryCode VARCHAR(2), " +
		"subcategoryCode VARCHAR(2), " +
		"type VARCHAR(1), " +
		"enDescription VARCHAR(30), " +
		"elDescription VARCHAR(30), " +
		"PRIMARY KEY (categoryCode, subcategoryCode, type))";
    tx.executeSql(sql);

    db.transaction(fillCategories, transaction_error, populateDB_success); 
}

 function newExpense() {
	amount = $('input:[name*="amount"]').val();
 	if (amount<1 || amount>100000 || !(isNumber(amount))) 
		{alert('Μη επιτρεπτό ποσό');}
	else
		{	
	  	db.transaction(addExpense, transaction_error, populateDB_success);
  		};
//  	location.reload();
	$("#expense_amount").val("");
	showForm();
 }

 function addExpense(tx) {
    var originaldate = $('input:[name*="date"]').val();
    date = originaldate.substring(6,10) + "/" + originaldate.substring(3,5) + "/" + originaldate.substring(0,2);
	category = $("#expense_category").val();
	subCategory = $("#expense_subcategory").val();
	if (subCategory == null) {subCategory = ''};
	method = $("#expense_method").val();
	$('#busy').show();
//    tx.executeSql("INSERT INTO expense (amount, dateOccured, category, subcategory, type, method, webid, commiteDateTime, sync) VALUES ("+amount+",'"+date+"','"+category+"', '"+subCategory+"', 'E', '"+method+"', '', DATETIME('NOW'),'')");
    tx.executeSql("INSERT INTO expense (amount, dateOccured, category, subcategory, type, method, commiteDateTime, sync) VALUES ("+amount+",'"+date+"','"+category+"', '"+subCategory+"', 'E', '"+method+"', DATETIME('NOW'),'')");
 }
 
 function deleteExpensesAll() {
	db.transaction(deleteExpenseTable, transaction_error, populateDB_success);
 }
 
 function deleteExpenseTable(tx) {
 	tx.executeSql('DROP TABLE IF EXISTS expense');
 }
 
 function fillCategories(tx) {
	var sql = "SELECT * FROM category where type = 'E'";
 	tx.executeSql(sql, [], fillCategories_success, transaction_error);
 }
 
function fillCategories_success(tx, results) {
	var len = results.rows.length;
	$('#expense_category').empty();
	if (len > 0)
	{
    for (var i=0; i<len; i++){
	   	var category = results.rows.item(i);
	   	if (i== 0) 
	   		{
	   		expenseCategory = category.code;
	   		$('#expense_category').prop("selectedIndex", expenseCategory - 1);
	   		};
		$('#expense_category').append('<option value="' + category.code + '">' + category.elDescription + '</option>');
    };
	$('#expense_category').val(expenseCategory).attr('selected', true).siblings('option').removeAttr('selected');
	$('#expense_category').selectmenu("refresh", true);
	wcategoryCode = $('#expense_category').val();
	$('#CategoryField').show();
    db.transaction(fillSubCategories, transaction_error, populateDB_success); 
	}
	else
	{
	alert('Καταχωρήστε κατηγορίες εξόδων στις ρυθμίσεις');
	$('#CategoryField').hide();
	$('#subCategoryField').hide();
	};
 }

 function fillSubCategories(tx) {
	var sql = 'SELECT * FROM subcategory where type = "E" and categoryCode = "'+$('#expense_category').val()+'"';
 	tx.executeSql(sql, [], fillSubCategories_success, transaction_error);
 }
 
function fillSubCategories_success(tx, results) {
	var len = results.rows.length;
	$('#expense_subcategory').empty();
	if (len > 0)
	{
	var expensesubCategory;
    for (var i=0; i<len; i++){
	   	var SubCategory = results.rows.item(i);
	   	if (i== 0) 
	   		{
	   		expensesubCategory = SubCategory.subcategoryCode;
	   		$('#expense_subcategory').prop("selectedIndex", expensesubCategory - 1);
	   		};
		$('#expense_subcategory').append('<option value="' + SubCategory.subcategoryCode + '">' + SubCategory.elDescription + '</option>');
    };
	$('#expense_subcategory').val(expensesubCategory).attr('selected', true).siblings('option').removeAttr('selected');
	$('#expense_subcategory').selectmenu("refresh", true);
	$('#subCategoryField').show();
	}
	else
	{$('#subCategoryField').hide()};
 }

 function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

 