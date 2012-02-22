var db;
var category;
var subcategory;
var now;
var today;
var view;
var YTDstart;
var MTDstart;
var WTDstart;

// var scroll = new iScroll('wrapper', { vScrollbar: false, hScrollbar:false, hScroll: false });

function transaction_error(tx, error) {
	$('#busy').hide();
    alert("Database Error: " + error);
}

function populateDB_success() {
	$('#busy').hide();
}

function viewExpenses() {
//	dateFormat();
	$('#viewoptions').show();
	$('#newExpenseform').hide();
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
    db = window.openDatabase("ExpensesDB", "1.0", "Personal Expenses", 1000000);
    db.transaction(getExpenses, transaction_error, populateDB_success);
}


function getExpenses(tx) {
//  	$('#busy').show();
    $('#expenseList').hide();
    $('#chart1').show();
  	var timeStr;
   	if ($('#statistics').hasClass('ui-btn-active')) 
  		{
  		if ($('#ALL').hasClass('ui-btn-active')) 
  			{view = '09'}
  		else
  			{
  			if ($('#YTD').hasClass('ui-btn-active')) 
  				{view = '10'}
  			else
	  			{
	  			if ($('#MTD').hasClass('ui-btn-active')) 
	  				{view = '11'}
	  			else
		  			{view = '09'}
				}
			}
		}	

  	if ($('#perday').hasClass('ui-btn-active')) 
  		{
  		if ($('#ALL').hasClass('ui-btn-active')) 
  			{view = '01'}
  		else
  			{
  			if ($('#YTD').hasClass('ui-btn-active')) 
  				{view = '02'}
  			else
	  			{
	  			if ($('#MTD').hasClass('ui-btn-active')) 
	  				{view = '03'}
	  			else
		  			{view = '04'}
				}
			}
		}	

 		
//  	view = $("#expense_view").val();
alert(view);
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
	case '09':
		timeStr = 'dateOccured >= "1900/01/01" and dateOccured <= "' + today +'"';   
	  	break;
	case '10':
		timeStr = 'dateOccured >="' + YTDstart + '" and dateOccured <= "' + today +'"';   
	  	break;
	case '11':
		timeStr = 'dateOccured >="' + MTDstart + '" and dateOccured <= "' + today +'"';   
	  	break;
	case '12':
		timeStr = 'dateOccured >="' + WTDstart + '" and dateOccured <= "' + today +'"';   
	  	break;
	}

 // 	var sql = "select category a, count(*) b from expense where category = "+category+" and " + timeStr + " group by category"; 
// 	var sql = "select category a, sum(amount) b from expense where " + timeStr + " group by category"; 
	var sql;
	if (view > '04') 
 		{sql = "select y.elDescription a, sum(x.amount) b from expense x, category y where x.category = y.code and " + timeStr + " group by x.category";
		tx.executeSql(sql, [], getExpensesStats_success, transaction_error);}
 	else
// 		{sql = "select sn, amount, dateOccured, category, subcategory from expense where " + timeStr + "order by dateOccured desc, category";
 		{sql = "select x.sn, x.amount, x.dateOccured, y.elDescription, x.category, x.subcategory from expense x, category y where x.category = y.code and " + timeStr + "order by x.dateOccured desc, x.category";
		tx.executeSql(sql, [], getExpensesList_success, transaction_error);}
 }

 function getExpensesStats_success(tx, results) {
    var len = results.rows.length;
    var data = [[]];
    for (var i=0; i<len; i++) {
    	var categoryCount = results.rows.item(i);
	    data[0].push([categoryCount.b, categoryCount.a]);
    }
    $.jqplot.config.enablePlugins = true;
    $('#newExpenseform').hide();
    $('#chart1').empty();
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


 function getExpensesList_success(tx, results) {
	$('#busy').hide();
	$('#newExpenseform').hide();
    $('#views').show();
	$('#chart1').hide();
    $('#expenseList').show();
//	$('#menu').hide();
	var wdateOccured = '9999/99/99';
	var wcategory = 99;
    var len = results.rows.length;
    $('#expenseList').empty();

/*

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

    for (var i=0; i<len; i++)
    	{
    	var expense = results.rows.item(i);
    	if (expense.dateOccured != wdateOccured)
    		{
    		 wdateOccured = expense.dateOccured;
    	     var dateArray = expense.dateOccured.split("/");
			 var formattedDate = new Date(dateArray[0], dateArray[1]-1, dateArray[2]);
			 stringformattedDate = formattedDate.format("dddd, d mmmm, yyyy").toString();
    		 $('#expenseList').append('<li data-role="list-divider">' + stringformattedDate + '</li>');
			 $('#expenseList').listview('refresh');
   			}
    	$('#expenseList').append('<li><a href="index.html">' + expense.amount + '€    ' + expense.elDescription + '</a></li>');
        $('#expenseList').listview('refresh');
    	} 
	db = null; 
 }


// function dateFormat() {
// } 

 function getMonday(d) {
  var day = d.getDay(),
      diff = d.getDate() - day + (day == 0 ? -6:1); // adjust when day is sunday
  return new Date(d.setDate(diff));
 }

 function showForm() {
     $('#newExpenseform').show();
 }