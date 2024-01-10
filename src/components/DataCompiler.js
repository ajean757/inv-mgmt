/*
import $ from "jquery";
var $ = jQuery = require('jquery');
require('./jquery.csv.js');

function pushDataToDatabase(dataFile) {
    $(document).ready(function() {
        $.ajax({
            type: "GET",
            url: dataFile,
            dataType: "text",
            success: function(data) {processData(data);}
         });
    });
}
function processData(datafile) {
    const data = $.csv.toObjects(datafile);
    console.log(data);
}

export default pushDataToDatabase;

*/