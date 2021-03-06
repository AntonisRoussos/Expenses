var db;
var category;
var subcategory;
var now;
var today;
var view;
var toggleView;
var toggleViewStats;
var YTDstart;
var MTDstart;
var WTDstart;
var param = '';
var currentCategoryDescription;

// var scroll = new iScroll('wrapper', { vScrollbar: false, hScrollbar:false, hScroll: false });

function transaction_error(tx, error) {
	$('#busy').hide();
    alert("Database Error:" + error);
//    console.log("Database Error: " + error.message + "\nCode=" + error.code);
}

function populateDB_success() {
	$('#busy').hide();
}

function viewExpenses() {
//	dateFormat();
	$('#views').show();
	$('#toggleViewStats').hide();
	$('#toggleView').show();
	$('#viewoptions').show();
//	$('#newExpenseform').hide();
    now = new Date();
	today = now.format("yyyy/mm/dd").toString();
	var currentMonth = now.getMonth()+1;
	var currentMonthString;
	if (currentMonth < 10) {currentMonthString = '0' + currentMonth ;}
	else {currentMonthString = currentMonth;};
    MTDstart = now.getFullYear() + "/" + currentMonthString + "/01"; 
    YTDstart = now.getFullYear() + "/01/01";
	var fdw = getMonday(now).format("yyyy/mm/dd").toString();
    WTDstart = fdw; 
//    db = window.openDatabase("ExpensesDB", "1.0", "Personal Expenses", 1000000);
    db.transaction(getExpenses, transaction_error, populateDB_success);
}


function getExpenses(tx) {
//  	$('#busy').show();
  	var timeStr;
 		
  	view = $("#expense_view").val();
 	toggleView = $("#toggleView").val();
  	toggleViewStats = $("#toggleViewStats").val();
   	switch (view)
	{
	case '01':
		timeStr = 'dateOccured >= "1900/01/01" and dateOccured <= "' + today +'"';   
	  	break;
	case '02':
		timeStr = 'dateOccured >="' + YTDstart + '" and dateOccured <= "' + today +'"';   
	  	break;
	case '03':
		timeStr = 'dateOccured >="' + MTDstart + '" and dateOccured <= "' + today +'"';   
	  	break;
	case '04':
		timeStr = 'dateOccured >="' + WTDstart + '" and dateOccured <= "' + today +'"';   
	  	break;
	case '05':
		timeStr = 'dateOccured >= "1900/01/01" and dateOccured <= "' + today +'"';   
	  	break;
	case '06':
		timeStr = 'dateOccured >="' + YTDstart + '" and dateOccured <= "' + today +'"';   
	  	break;
	case '07':
		timeStr = 'dateOccured >="' + MTDstart + '" and dateOccured <= "' + today +'"';   
	  	break;
	case '08':
		timeStr = 'dateOccured >="' + WTDstart + '" and dateOccured <= "' + today +'"';   
	  	break;
	}

 // 	var sql = "select category a, count(*) b from expense where category = "+category+" and " + timeStr + " group by category"; 
// 	var sql = "select category a, sum(amount) b from expense where " + timeStr + " group by category"; 
	var sql;
	if (view > '04')
		{ 
		$('.type-index').hide();
	    $('#expenseList').hide();
	    $('#chart1').show();
 		$('#toggleView').hide();
 		$('#toggleViewStats').show();
		if (param == '') {
 			sql = "select y.elDescription a, sum(x.amount) b from expense x, category y where x.category = y.code and x.type=y.type and " + timeStr + " group by x.category"}
 		else {
 			sql = "select y.elDescription a, sum(x.amount) b from expense x, subcategory y where x.category = '"+ param +"' and x.category = y.categorycode and x.subcategory = y.subcategoryCode and x.type=y.type and " + timeStr + " group by x.category, x.subcategory"};
// 		alert(sql);
		tx.executeSql(sql, [], getExpensesStats_success, transaction_error);
		}
 	else {
		$('.type-index').show();
	    $('#expenseList').show();
	    $('#chart1').hide();
 		$('#toggleViewStats').hide();
 		$('#toggleView').show();
 		if (toggleView == "perDay") {
 			sql = "select x.sn, x.amount, x.dateOccured, y.elDescription, x.category, x.subcategory from expense x, category y where x.category = y.code and x.type=y.type and " + timeStr + "order by x.dateOccured desc, x.category";
			tx.executeSql(sql, [], getExpensesList_success, transaction_error)}
		else {
 			if (toggleView == "perCategory") {
				if (param == '') {
	 				sql = "select x.sn, x.amount, x.dateOccured, y.elDescription, x.category, x.subcategory from expense x, category y where x.category = y.code and x.type=y.type and " + timeStr + "order by x.category, x.dateOccured desc"}
	 			else {
	 				sql = "select x.sn, x.amount, x.dateOccured, y.elDescription, x.category, x.subcategory from expense x, subcategory y where x.category = '"+ param +"' and x.type=y.type and x.category = y.categorycode and x.subcategory = y.subcategoryCode and " + timeStr + "order by x.category, x.subcategory,x.dateOccured desc"};
//				alert(sql);
				tx.executeSql(sql, [], getExpensesList_success, transaction_error);
				};
		};
	};
 }

 function getExpensesStats_success(tx, results) {
    $('#views').show();
    $('.type-index').hide();
    $('#expenseList').hide();
    var len = results.rows.length;
    var data = [[]];
    var datastat = [[]];
    for (var i=0; i<len; i++) {
    	var categoryCount = results.rows.item(i);
	    data[0].push([categoryCount.b, categoryCount.a]);
	    datastat[0].push([categoryCount.a, categoryCount.b]);
    }
    $.jqplot.config.enablePlugins = true;
//    $('#newExpenseform').hide();
    $('#chart1').empty();
	if (len > 0) {
		if (toggleViewStats == "BarChart")
			{
			    /* Bar chart */
			    var plot1 = $.jqplot('chart1', data, {
				    title: 'Κατηγορίες Εξόδων',
			        seriesDefaults:{
			            renderer:$.jqplot.BarRenderer,
			            pointLabels: { show: true, location: 'e', edgeTolerance: -15 },
			            // Rotate the bar shadow as if bar is lit from top right.
			            shadowAngle: 135,
			            // Here's where we tell the chart it is oriented horizontally.
			            rendererOptions: {
			                barDirection: 'horizontal'
			            				}
			        },
			        axes: {
			            yaxis: {
			                renderer: $.jqplot.CategoryAxisRenderer,
			            		}
			        	},
			    });
			}
			else
			{
			    /* Pie chart */
			    var plot1 = jQuery.jqplot ('chart1', datastat, 
			    { 
			      seriesDefaults: {
			        // Make this a pie chart.
			        renderer: jQuery.jqplot.PieRenderer, 
			        rendererOptions: {
			          diameter: 200,
			          // Put data labels on the pie slices.
			          // By default, labels show the percentage of the slice.
			          showDataLabels: true
			        }
			      }, 
			      legend: { show:true, location: 'e' }
			    });
			}    
	}
 }

 function getExpensesList_success(tx, results) {
 
	$('#busy').hide();
//	$('#newExpenseform').hide();
    $('#views').show();
	$('#chart1').hide();
    $('.type-index').show();
    $('#expenseList').show();
//	$('#menu').hide();
	var wdateOccured = '9999/99/99';
	var wcategory = 99;
    var len = results.rows.length;
    $('#expenseList').empty();

	if (toggleView == "perDay") 
		 {listperDay(results, len);}
	else
	     {listperCategory(results, len);}
    $('#expenseList').listview('refresh');
//	db = null; 
 }

 function getMonday(d) {
  var day = d.getDay(),
      diff = d.getDate() - day + (day == 0 ? -6:1); // adjust when day is sunday
  return new Date(d.setDate(diff));
 }

 function showForm(type) {
    $('#views').hide();
	if (type == 'expense') {
		$('#newExpenseform').show();
		db.transaction(fillCategories, transaction_error, populateDB_success); 
		}
     	
    else
    	{$('#newIncomeform').show();}
 }

 function listperDay(results, len) {
 		 var wdateOccured = '9999/99/99';
 		 var subtotal = 0;
 		 var total = 0;
	     for (var i=0; i<len; i++)
	    	{
	    	var expense = results.rows.item(i);
	    	if (expense.dateOccured != wdateOccured)
	    		{
    			 var round_subtotal = Math.round(subtotal*100)/100;
		    	 if (wdateOccured != '9999/99/99') {$('#expenseList').append('<li> ' + round_subtotal + '€ : Σύνολο Ημέρας</li>'); $('#expenseList').listview('refresh');};
//		    	 if (wdateOccured != '9999/99/99') {$('#expenseList').append('<li>' + subtotal + '€ : Σύνολο Ημέρας</li>');};
		    	 subtotal = 0;
	    		 wdateOccured = expense.dateOccured;
	    	     var dateArray = expense.dateOccured.split("/");
				 var formattedDate = new Date(dateArray[0], dateArray[1]-1, dateArray[2]);
				 stringformattedDate = formattedDate.format("dddd, d mmmm, yyyy").toString();
	    		 $('#expenseList').append('<li data-role="list-divider">' + stringformattedDate + '</li>');
//				 $('#expenseList').listview('refresh');
	   			}
	    	$('#expenseList').append('<li><a href="javascript:expensedialog(' + expense.sn + ')" data-rel="dialog" data-transition="pop">' + expense.amount + '€    ' + expense.elDescription + '</a></li>');
//	    $('#expenseList').append('<li><a href="#expensedialog?id=' + expense.sn + '">' + expense.amount + '€    ' + expense.elDescription + '</a></li>');
    		subtotal = subtotal + expense.amount;
    		total = total + expense.amount;
    		if (i == len - 1) 
    			{
    			var round_subtotal = Math.round(subtotal*100)/100;
    			var round_total = Math.round(total*100)/100;
    			$('#expenseList').append('<li>' + round_subtotal + '€ : Σύνολο Ημέρας</li>');
    			$('#expenseList').append('<li>' + round_total + '€ : Γενικό Σύνολο</li>');
    			};
 	    	}
    	param = '';
	    $('#expenseList').listview('refresh');
 	    
 }
 
  function listperCategory(results, len) {
 	     var wcategory = 99;
 	     var wsubcategory = 99;
 		 var subtotal = 0;
 		 var total = 0;
//      	 if (param != '' && len>0) {$('#expenseList').append('<li data-icon="back" data-rel="back" data-theme="e"><a href="javascript:showCategoryInfo()">' + currentCategoryDescription + '</a></li>')};
      	 if (param != '') {$('#expenseList').append('<li data-icon="back" data-theme="e"><a href="javascript:showCategoryInfo()">' + currentCategoryDescription + '</a></li>')};
	     for (var i=0; i<len; i++) {
	    	var expense = results.rows.item(i);
			if (param == '') {
		    	if (expense.category != wcategory) {
			    	 if (wcategory != 99) {
	 	    			var round_subtotal = Math.round(subtotal*100)/100;
			    	 	$('#expenseList').append('<li>' + round_subtotal + '€ : Σύνολο Κατηγορίας</li>')};
			    	 subtotal = 0;
			    	 wcategory = expense.category;
	    	 		 var txt1 = "'";
					 var n1=txt1.concat(expense.category).concat(txt1);
		     		 var n2=txt1.concat(expense.elDescription).concat(txt1);
					 currentCategoryDescription = expense.elDescription;
		    		 $('#expenseList').append('<li data-theme="b"><a href="javascript:expensesbySubcategory(' + n1 +','+ n2 + ')" data-role="list-divider">' + expense.elDescription + '</li>');
			   		 param = '';
	   			}
	   		};
			if (param != '') {
		    	if (expense.subcategory != wsubcategory){
			    	 if (wsubcategory != 99) {
	 	    			var round_subtotal = Math.round(subtotal*100)/100;
			    	 	$('#expenseList').append('<li>' + round_subtotal + '€ : Σύνολο Υποκατηγορίας</li>');};
			    	 subtotal = 0;
			    	 wsubcategory = expense.subcategory;
		    		 $('#expenseList').append('<li data-role="list-divider">' + expense.elDescription + '</li>');
	   			}
	   		};
	   		
		    var dateArray = expense.dateOccured.split("/");
			var formattedDate = new Date(dateArray[0], dateArray[1]-1, dateArray[2]);
			stringformattedDate = formattedDate.format("dddd, d mmmm, yyyy").toString();
	    	$('#expenseList').append('<li><a href="javascript:expensedialog(' + expense.sn + ')" data-rel="dialog" data-transition="pop">' + expense.amount + '€    ' + stringformattedDate + '</a></li>');
//	    	$('#expenseList').append('<li><a href="#expensedialog?id=' + expense.sn + '" data-rel="dialog" data-transition="pop">' + expense.amount + '€    ' + stringformattedDate + ' </a></li>');
    		subtotal = subtotal + expense.amount;
    		total = total + expense.amount;
    		if (i == len - 1) {
    			var round_subtotal = Math.round(subtotal*100)/100;
    			var round_total = Math.round(total*100)/100;
				if (param == '') {$('#expenseList').append('<li>' + round_subtotal + '€ : Σύνολο Κατηγορίας</li>')}
				else {$('#expenseList').append('<li>' + round_subtotal + '€ : Σύνολο Υποκατηγορίας</li>')};
    			$('#expenseList').append('<li>' + round_total + '€ : Γενικό Σύνολο</li>');
			};
    	};
 	    $('#expenseList').listview('refresh');
  }
  
  function expensesbySubcategory(id, catDescr) {
	param = id;
    currentCategoryDescription = catDescr;
//	$.mobile.changePage( "#information", {transition: "slideup"} );
	viewExpenses();
 }
  
  function showCategoryInfo() {
	param = '';
	viewExpenses();
 }
  
  /* Commented out 2-live breakdown 

    for (var i=0; i<len; i++)
    	{
    	var expense = results.rows.item(i);
    	if (expense.dateOccured != wdateOccured)
    		{
    		 wdateOccured = expense.dateOccured;
	    	 wcategory = expense.category;
    		 $('#expenseList').append('<li data-role="list-divider">' + expense.dateOccured + '</li>');
			 $('#expenseList').listview('refresh');
   			 $('#expenseList').append('<li data-theme="e">' + expense.elDescription + '</li>');
			 $('#expenseList').listview('refresh');
   			}
   		else
	    	{if (expense.category != wcategory)
		    	 {
		    	 wcategory = expense.category;
    			 $('#expenseList').append('<li data-theme="e">' + expense.elDescription + '</li>');
				 $('#expenseList').listview('refresh');
    			 }
    		}
    	$('#expenseList').append('<li>' + expense.amount + '€</li>');
    	} 

*/ 

  