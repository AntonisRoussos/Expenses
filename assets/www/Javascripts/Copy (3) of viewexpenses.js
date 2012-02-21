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
  	$('#busy').show();
  	var timeStr;
  	view = $("#expense_view").val();
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
 		{sql = "select y.elDescription a, sum(x.amount) b from expense x, category y where x.category = y.code and " + timeStr + " group by x.category";
		tx.executeSql(sql, [], getExpensesStats_success, transaction_error);}
 	else
 		{sql = "select sn, amount, dateOccured, category, subcategory from expense where " + timeStr;
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
    $('#form').hide();
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
	$('#form').hide();
	$('#chart1').hide();
	$('#menu').hide();
    var len = results.rows.length;
    $('#expenseList').empty();
    for (var i=0; i<len; i++)
    	{
    	var expense = results.rows.item(i);
		$('#expenseList').append('<li><p>' + expense.amount + ' ' + expense.dateOccured + ' ' + expense.category + '</p></li>'); 
    	}
	setTimeout(function(){
		scroll.refresh();
	},100);
    	
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
     $('#form').show();
 }