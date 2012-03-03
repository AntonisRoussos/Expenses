var db;
var dbCreated = false;
var amount;
var dateOccured; 
var category;
var subcategory;
var readystatus = null;
var viewOption = null;

document.addEventListener("deviceready", onDeviceReady, false);


function onDeviceReady() {
	console.log("opening database");
    db = window.openDatabase("ExpensesDB", "1.0", "Personal Expenses", 1000000);
    if (dbCreated)
    	{}
    else
    	{db.transaction(populateDB, transaction_error, populateDB_success);
/*	     db.transaction(getCategories, transaction_error, populateDB_success); */
    	};
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
	if (viewOption == null) {viewOption = 'perDay';}; 
	$('.Selectview').change(function() {alert('1' + viewOption); viewExpenses(viewOption);});
//	$('.Selectview').change(function() {$('#information').trigger('pageshow');});
	$('#information').live('pageshow',function(event, ui){viewExpenses(viewOption);});
	$('#homepage').live('pageshow',function(event, ui){showForm('expense');});
	$("#toggleView").val('perDay');
	$("#toggleView").empty().append('Click για Έξοδα / Kατηγορία');
	$('#toggleView').toggle(
		function() {
//		  $("#toggleView").val('perCategory');
		  viewOption = 'perCategory';
		  viewExpenses(viewOption);
		  $("#toggleView").empty().append('Click για Έξοδα / Ημέρα');
		}, 
		function() {
//		  $("#toggleView").val('perDay');
		  viewOption = 'perDay';
		  viewExpenses(viewOption);
		  $("#toggleView").empty().append('Click για Έξοδα / Kατηγορία');
		});
	$("#toggleViewStats").val('BarChart');
	$("#toggleViewStats").empty().append('Click για Διάγραμμα πίτας');
	$('#toggleViewStats').toggle(
		function() {
//		  $("#toggleViewStats").val('PieChart');
		  viewOption = 'PieChart';
		  viewExpenses(viewOption);
		  $("#toggleViewStats").empty().append('Click για Ραβδόγραμμα');
		}, 
		function() {
//		  $("#toggleViewStats").val('BarChart');
		  viewOption = 'BarChart';
		  viewExpenses(viewOption);
		  $("#toggleViewStats").empty().append('Click για Διάγραμμα πίτας');
		});
	}

function transaction_error(tx, error) {
	$('#busy').hide();
    alert("Database Error: " + error);
}

function populateDB_success() {
	dbCreated = true;
	$('#busy').hide();
}

function populateDB(tx) {
//	tx.executeSql('DROP TABLE IF EXISTS expense');
//	$('#busy').show();
	var sql = 
		"CREATE TABLE IF NOT EXISTS expense ( "+
		"sn INTEGER PRIMARY KEY AUTOINCREMENT, " +
		"amount REAL, " +
		"dateOccured DATE, " +
		"category VARCHAR(2), " +
		"subcategory VARCHAR(2))"; 
    tx.executeSql(sql);
    
    tx.executeSql('DROP TABLE IF EXISTS category');
	var sql = 
		"CREATE TABLE IF NOT EXISTS category ( "+
		"code VARCHAR(2) PRIMARY KEY, " +
		"enDescription VARCHAR(15), " +
		"elDescription VARCHAR(15), " +
		"image VARCHAR(50))";
    tx.executeSql(sql);


    tx.executeSql("INSERT INTO category (code,enDescription, elDescription, image) VALUES ('01','Grocery','Super Market','.\Images\Super.jpg')");
    tx.executeSql("INSERT INTO category (code,enDescription, elDescription, image) VALUES ('02','Appearence','Εμφάνιση','.\Images\Clothing.jpg')");
    tx.executeSql("INSERT INTO category (code,enDescription, elDescription, image) VALUES ('03','House','Σπίτι','.\Images\House.jpg')");
    tx.executeSql("INSERT INTO category (code,enDescription, elDescription, image) VALUES ('04','Vehicles','Οχήματα','.\Images\Car.jpg')");
    tx.executeSql("INSERT INTO category (code,enDescription, elDescription, image) VALUES ('05','Family','Οικογένεια','.\Images\Kids.jpg')");
    tx.executeSql("INSERT INTO category (code,enDescription, elDescription, image) VALUES ('06','Personal','Προσωπικά','.\Images\Personal.jpg')");
    tx.executeSql("INSERT INTO category (code,enDescription, elDescription, image) VALUES ('07','Entertainment','Διασκέδαση','.\Images\Entertainment.jpg')");
    tx.executeSql("INSERT INTO category (code,enDescription, elDescription, image) VALUES ('08','Medical','Ιατρικά','.\Images\Entertainment.jpg')");
    
	tx.executeSql('DROP TABLE IF EXISTS subcategory');
	var sql = 
		"CREATE TABLE IF NOT EXISTS subcategory ( "+
		"code VARCHAR(4) PRIMARY KEY, " +
		"enDescription VARCHAR(15), " +
		"elDescription VARCHAR(15), " +
		"picture VARCHAR(50))";
    tx.executeSql(sql);
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
	$('#busy').show();
    tx.executeSql("INSERT INTO expense (amount, dateOccured, category, subcategory) VALUES ("+amount+",'"+date+"','"+category+"', '0101')");
 }
 
 function deleteExpensesAll() {
	db.transaction(deleteExpenseTable, transaction_error, populateDB_success);
 }
 
 function deleteExpenseTable(tx) {
 	tx.executeSql('DROP TABLE IF EXISTS expense');
 }
 
 function getCategories(tx) {
 	tx.executeSql('SELECT * FROM CATEGORY WHERE CODE<> "06"', [], getCategories_success, transaction_error);
 }
 
function getCategories_success(tx, results) {
    var len = results.rows.length;
	console.log("category table: " + len + " rows found.");
    for (var i=0; i<len; i++){
        console.log("Row = " + i + " code = " + results.rows.item(i).code + " category =  " + results.rows.item(i).elDescription);
	   	var category = results.rows.item(i);
		$('#expense_category').append('<option value="' + category.code + '">' + category.elDescription + '</option>');
    }
    readystatus = 'Y';
 }

 function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}