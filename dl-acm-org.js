// ==UserScript==
// @name        Auto-bibtex for dl.acm.org
// @namespace   matt.might.net
// @description Automatically generates bibtex for DL entries
// @include     http://dl.acm.org/*
// @version     1
// @grant       none
// ==/UserScript==


// A global object for the active bibitem:
var item = {};

// The main div:
var mainbox = document.getElementById('divmain');

// Add a pre element to hold bibtex data:
var bibtex = document.createElement("pre");
bibtex.innerHTML = "";
bibtex.style["margin-left"] = "10px";
mainbox.appendChild(bibtex);


// emit emits a bibtex item into the specified element:
function emit(item,element) {
  if (!item.type) 
    return ; // No title info found; nothing to emit.
  
  var entry = "" ;
  
  // extract first author's last name:
  var authors = item["author"] ;
  var lastName = authors.match(/^([^,]+),/)[1] ;
  var firstAuthor = lastName.replace(/\W/g,"") ;
      
  // extract the year:
  var year = item["year"] ;

  var key = firstAuthor + ":" + item["year"] ;
  
  entry += "@" + item.type + "{"+key+",\n";
  for (k in item) {
    if (k == "type") continue ;
    if (k == "month") {
      entry += "  " + k + " = " + item[k] + " ,\n"
      continue ;
    }
    entry += "  " + k + " = { " + item[k]+ " },\n" ;
  }
  entry += "}\n\n" ;
  
  element.innerHTML += entry ;  
}

var months = {
  "01": "jan",
  "02": "feb",
  "03": "mar",
  "04": "apr",
  "05": "may",
  "06": "jun",
  "07": "jul",
  "08": "aug",
  "09": "sep",
  "10": "oct",
  "11": "nov",
  "12": "dec"
}

// processTag pulls citation data from meta tags:
function processTag(meta_tag) {
  var name = meta_tag.name ;
  var value = meta_tag.content ;
  name = name.substring(9) ;
  
  switch (name) {
    case "conference": 
      emit(item,bibtex) ;
      item = {};
      item["type"] = "inproceedings" ;
      item["booktitle"] = value ;
      break;
      
    case "journal_title": 
      emit(item,bibtex) ;
      item = {};
      item["type"] = "article" ;
      item["journal"] = value ;
      break;
      
    case "authors":
      item["author"] = value.replace(/; /g," and ") ;
      break ;

    case "lastpage":
      item["pages"] = item["firstpage"] + "--" + value ;
      delete item["firstpage"];
      break ;

    case "date":
      var dateparts = value.match (/(\d+)\/(\d+)\/(\d+)/);
      var year = dateparts[3];
      var month = dateparts[1].trim() ;
      var day = dateparts[2];
      item["year"] = year ;
      item["month"] = months[month];
      item["day"] = day ;
      break ;
      
    case "volume":
    case "issue":
    case "firstpage":
    case "publisher":
    case "title":
    case "doi":
    case "keywords":
    case "isbn":
    case "issn":
      item[name] = value ;
      
  }
  
}

// Loop over all meta tags:
var metas = document.getElementsByTagName("meta");

for (var i = 0; i < metas.length; ++i) {
  if (metas[i].name.startsWith("citation")) {
    processTag(metas[i]) ;
  }
}

// Emit the last item:
emit(item,bibtex);




