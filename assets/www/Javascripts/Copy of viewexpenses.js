var db;
var timePeriod; 
var timeperiod; 
var category;
var subcategory;
var now;
var today;
var YTDstart;
var MTDstart;
var WTDstart;

function transaction_error(tx, error) {
	$('#busy').hide();
    alert("Database Error: " + error);
}

function populateDB_success() {
	$('#busy').hide();
}

function viewExpenses(timePeriod, category) {
//	dateFormat();
	timeperiod = timePeriod;
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
  	switch (timeperiod)
	{
	case 'YTD':
		timeStr = 'dateOccured >="' + YTDstart + '" and dateOccured <= "' + today +'"';   
	  	break;
	case 'MTD':
		timeStr = 'dateOccured >="' + MTDstart + '" and dateOccured <= "' + today +'"';   
	  	break;
	case 'WTD':
		timeStr = 'dateOccured >="' + WTDstart + '" and dateOccured <= "' + today +'"';   
	  	break;
	}

 // 	var sql = "select category a, count(*) b from expense where category = "+category+" and " + timeStr + " group by category"; 
 	var sql = "select category a, sum(amount) b from expense where " + timeStr + " group by category"; 
	tx.executeSql(sql, [], getExpenses_success, transaction_error);
 }

 function getExpenses_success(tx, results) {
//	$('#busy').hide();
    var len = results.rows.length;
	console.log("expense table: " + len + " rows found.");
    for (var i=0; i<len; i++){
            console.log("Row = " + i + " ID = " + results.rows.item(i).id + " Data =  " + results.rows.item(i).a + ", " + results.rows.item(i).b);
            };
//	var categoryRenderer = function() {
    var dataA = [];
    var dataB= [];
    for (var i=0; i<len; i++) {
    	var categoryCount = results.rows.item(i);
	    dataA.push(categoryCount.a);
	    dataB.push(categoryCount.b);
    }
//    return data;
//	  };    	
	
//   	var plot1 = $.jqplot('chart1',[],{
//      title: 'Κατηγορίες Εξόδων',
//      dataRenderer: categoryRenderer,
//      seriesDefaults:{
//        renderer:$.jqplot.BarRenderer,
//        pointLabels: { show: true }
//    	}
//  });
  
  
    $.jqplot.config.enablePlugins = true;
    $('#form').hide();
    var plot1 = $.jqplot('chart1', [dataB], {
	    title: 'Κατηγορίες Εξόδων',
        seriesDefaults:{
            renderer:$.jqplot.BarRenderer,
            pointLabels: { show: true }
        },
        axes: {
            xaxis: {
                renderer: $.jqplot.CategoryAxisRenderer,
                ticks: dataA
            }
        },
        highlighter: { show: false }
    });
  
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