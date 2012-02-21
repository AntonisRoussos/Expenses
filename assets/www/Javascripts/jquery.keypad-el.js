/* http://keith-wood.name/keypad.html
   Italian initialisation for the jQuery keypad extension
   Written by Francesco Strappini (www.strx.it). */
(function($) { // hide the namespace
	$.keypad.regional['el'] = {
		buttonText: '...', buttonStatus: 'Εμφάνιση πληκτρολογίου',
		closeText: 'κοντά', closeStatus: 'Απόκρυψη πληκτρολογίου',
		clearText: 'Καθαρίστε', clearStatus: 'Διαγραφή κειμένου',
		backText: 'Del', backStatus: 'Διαγραφή τελευταίου χαρακτήρα',
		shiftText: 'Shift', shiftStatus: 'Κεφαλαία / Πεζά',
		spacebarText: '&nbsp;', spacebarStatus: '',
		enterText: 'Enter', enterStatus: '',
		tabText: '>', tabStatus: '',
		alphabeticLayout: $.keypad.qwertyAlphabetic,
		fullLayout: $.keypad.qwertyLayout,
		isAlphabetic: $.keypad.isAlphabetic,
		isNumeric: $.keypad.isNumeric,
		isRTL: false};
	$.keypad.setDefaults($.keypad.regional['el']);
})(jQuery);

