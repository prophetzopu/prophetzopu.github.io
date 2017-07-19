$(document).ready(function() {

  var j = 0;

  var SECOND = 1000;
  var MINUTE = SECOND * 60;

  var FADE_DELAY_MS = 2 * SECOND;
  var SHOW_DELAY_MS = 7 * SECOND;
  var HIDE_DELAY_MS = 3 * MINUTE - (SHOW_DELAY_MS + 2 * FADE_DELAY_MS);

  function cycleThrough() {
    var max = $("ul#list li").length - 1;
    $("ul#list li:eq(" + j + ")")
      .animate({"opacity" : "1"}, FADE_DELAY_MS)
      .animate({"opacity" : "1"}, SHOW_DELAY_MS)
      .animate({"opacity" : "0"}, FADE_DELAY_MS)
      .animate({"opacity" : "0"}, HIDE_DELAY_MS, function() {
        (j == max) ? j=0 : j++;
          cycleThrough();
      });
  };

  cycleThrough();

});
