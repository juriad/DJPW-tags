/*
API used:
	Array.length
	Document.createElement
	Document.getElementById
	Document.body
	Element.addEventListener
	Element.appendChild
	Element.hasNextChildNodes
	Element.innnerHTML
	Element.lastChild
	Element.setAttribute
	Element.style
	Element.removeChild
	Event.preventDefault
	Event.target
	Event.stopPropagation
	String.toUpperCase
 */
function TagsDialog(db) {
	var html = '<div id="outerpopup"><div id="popup">\
		<span id="closebutton">zav&#345;&#237;t</span>\
		<h1>Seznam tag&#367;</h1>\
		<ul id="taglist"></ul>\
		<h2 id="tagname">---</h2>\
		<table id="tagpages">\
		<thead><tr><th width="15%">Kategorie</th>\
		<th width="50%">T&#233;ma</th>\
		<th width="15%">Autor</th>\
		<th width="15%">Datum</tr></thead>\
		<tbody id="tagpagesbody">\
		</tbody>\
		</table>\
		</div></div>';

	this.addDialog = function() {
		var dialog = document.createElement('div');
		dialog.setAttribute('id', 'tagsdialog');
		dialog.style.display = 'none';
		dialog.innerHTML = html;
		document.body.appendChild(dialog);

		var closeButton = document.getElementById('closebutton');

		var that = this;
		closeButton.addEventListener('click', function() {
			that.hide();
		}, true);
	};

	this.addDialog();

	this.showTags = function() {
		cleanList();
		cleanSelected();
		cleanTable();
		var taglist = document.getElementById('taglist');

		var allTags = db.getAllTags();
		allTags.sort(function(a, b) {
			if (a.toUpperCase() > b.toUpperCase())
				return 1;
			if (b.toUpperCase() > a.toUpperCase())
				return -1;
			return 0;
		});

		for ( var i = 0; i < allTags.length; i++) {
			var tagLi = document.createElement('li');
			tagLi.setAttribute('class', 'tag');
			tagLi.innerHTML = allTags[i];
			taglist.appendChild(tagLi);
			var that = this;
			tagLi.addEventListener('click', function(event) {
				var tagName = event.target.innerHTML;
				that.showTagPosts(trim(tagName));
			}, true);
		}
	};

	function trim(string) {
		return string.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
	}

	this.showTagPosts = function(tagName) {
		cleanTable();
		document.getElementById('tagname').innerHTML = tagName;
		var pagesForTags = db.getPostsForTag(tagName);

		var tableBody = document.getElementById("tagpagesbody");
		for ( var i = 0; i < pagesForTags.length; i++) {
			var post = pagesForTags[i];
			var postTr = document.createElement('tr');
			postTr.setAttribute('class', i % 2 == 0 ? 'tbCel1' : 'tbCel2');
			postTr.innerHTML = '<td>' + post.category + '</td><td><a href="'
					+ post.url + '">' + post.title + '</a></td><td>'
					+ post.author + '</td><td>' + post.date + '</td></tr>';
			tableBody.appendChild(postTr);
		}
	};

	function cleanTable() {
		var tableBody = document.getElementById("tagpagesbody");
		while (tableBody.hasChildNodes()) {
			tableBody.removeChild(tableBody.lastChild);
		}
	}

	function cleanSelected() {
		var text = '&#382;&#225;dn&#253; vybran&#253 tag';
		document.getElementById('tagname').innerHTML = text;
	}

	function cleanList() {
		var taglist = document.getElementById('taglist');
		while (taglist.hasChildNodes()) {
			taglist.removeChild(taglist.lastChild);
		}
	}
}

TagsDialog.prototype.show = function() {
	if (this.isShown()) {
		return;
	}
	document.getElementById('tagsdialog').style.display = 'block';
	this.showTags();
};

TagsDialog.prototype.hide = function() {
	document.getElementById('tagsdialog').style.display = 'none';
};

TagsDialog.prototype.isShown = function() {
	var style = document.getElementById('tagsdialog').style.display;
	if (style == 'none') {
		return false;
	} else {
		return true;
	}
};

TagsDialog.prototype.showTag = function(tagName) {
	this.show();
	this.showTagPosts(tagName);
};
