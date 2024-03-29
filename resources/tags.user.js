// ==UserScript==
// @description Adds support for tagging posts in djpw.cz
// @name Tagovatko
// @namespace artique.cz
// @include http://diskuse.jakpsatweb.cz/?action=vthread*
// @version 1.0
// ==/UserScript==

var head = document.querySelector("head");

function addCSS(head, file) {
	var link = document.createElement('link');
	link.setAttribute('rel', 'stylesheet');
	link.setAttribute('href', file);
	head.appendChild(link);
}

function addJS(head, file) {
	var script = document.createElement('script');
	script.setAttribute('src', file);
	head.appendChild(script);
}

var prefix = 'http://juriad.github.com/DJPW-tags/resources/';
addCSS(head, prefix + 'tags.css');
addJS(head, prefix + 'combined.js');
