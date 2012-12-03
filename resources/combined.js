/*
API used:
	Array.indexOf
	Array.length
	Array.push
	Array.splice
	JSON.parse
	JSON.stringify
	LocalStorage.clear
	LocalStorage.getItem
	LocalStorage.removeItem
	LocalStorage.setItem
 */
function TagsDB() {
	this.ALL_TAGS_KEY = '_all_tags';

	this.getAsArray = function(string) {
		if (string === null) {
			return [];
		}
		return JSON.parse(string);
	};

	this.getAsString = function(array) {
		if (array.length == 0) {
			return null;
		}
		return JSON.stringify(array);
	};

	this.saveOrRemove = function(key, value) {
		if (value === null) {
			localStorage.removeItem(key);
		} else {
			localStorage.setItem(key, value);
		}
	};

	this.saveAllTags = function(allTags) {
		this.saveOrRemove(this.ALL_TAGS_KEY, this.getAsString(allTags));
	};

	this.saveTagsForPost = function(postId, tagsForPost) {
		this.saveOrRemove(postId, this.getAsString(tagsForPost));
	};

	this.savePostsForTag = function(tag, postsForTag) {
		this.saveOrRemove(tag, this.getAsString(postsForTag));
	};
}

TagsDB.prototype.getAllTags = function getAllTags() {
	return this.getAsArray(localStorage.getItem(this.ALL_TAGS_KEY));
};

TagsDB.prototype.getTagsForPost = function(postId) {
	return this.getAsArray(localStorage.getItem(postId));
};

TagsDB.prototype.getPostsForTag = function(tag) {
	return this.getAsArray(localStorage.getItem(tag));
};

TagsDB.prototype.addTag = function(post, tag) {
	var postId = post.postId;
	{
		var tagsForPost = this.getTagsForPost(postId);
		if (tagsForPost.indexOf(tag) != -1) {
			return false;
		}

		tagsForPost.push(tag);
		this.saveTagsForPost(postId, tagsForPost);
	}

	{
		var postsForTag = this.getPostsForTag(tag);
		postsForTag.push(post);
		this.savePostsForTag(tag, postsForTag);
	}

	{
		var allTags = this.getAllTags();
		if (allTags.indexOf(tag) == -1) {
			allTags.push(tag);
			this.saveAllTags(allTags);
		}
	}
	return true;
};

TagsDB.prototype.removeTag = function(postId, tag) {
	function removePostFromPostsForTag(postsForTag, postId) {
		for ( var i = 0; i < postsForTag.length; i++) {
			if (postsForTag[i].postId == postId) {
				postsForTag.splice(i, 1);
				return;
			}
		}
	}

	{
		var tagsForPost = this.getTagsForPost(postId);
		var indexInTagsForPost = tagsForPost.indexOf(tag);
		if (indexInTagsForPost == -1) {
			return false;
		}
		tagsForPost.splice(indexInTagsForPost, 1);
		this.saveTagsForPost(postId, tagsForPost);
	}
	{
		var postsForTag = this.getPostsForTag(tag);
		removePostFromPostsForTag(postsForTag, postId);
		this.savePostsForTag(tag, postsForTag);

		if (postsForTag.length == 0) {
			var allTags = this.getAllTags();
			var indexInAllTags = allTags.indexOf(tag);
			if (indexInAllTags != -1) {
				allTags.splice(indexInAllTags, 1);
				this.saveAllTags(allTags);
			}
		}
	}
	return true;
};

TagsDB.prototype.clear = function() {
	localStorage.clear();
};

TagsDB.prototype.saveToJSON = function() {
	var result = [];
	var allTags = this.getAllTags();
	for ( var i = 0; i < allTags.length; i++) {
		var tag = allTags[i];
		var postsForTag = this.getPostsForTag(tag);
		result.push({
			tag : tag,
			posts : postsForTag
		});
	}
	return result;
};

TagsDB.prototype.restoreFromJSON = function(tags) {
	this.clear();
	for ( var i = 0; i < tags.length; i++) {
		var tag = tags[i].tag;
		var posts = tags[i].posts;
		for ( var j = 0; j < posts.length; j++) {
			this.addTag(posts[j], tag);
		}
	}
};
/*
API used:
	Array.indexOf
	Array.length
	Array.push
	Array.sort
	Array.splice
	Document.createElement
	Document.getElementById
	Document.querySelector
	Document.querySelectorAll
	Element.addEventListener
	Element.appendChild
	Element.focus
	Element.getAttribute
	Element.hasAtribute
	Element.innerHTML
	Element.parentNode
	Element.removeChild
	Element.setAttribute
	Event.preventDefault
	Event.target
	Event.stopPropagation
	Node.nodeType
	NodeList.length
	NodeList.item
	String.indexOf
	String.length
	String.match
	String.substr
	String.replace
	String.toUpperCase
	Window.location.href
	Window.location.hash
 */
function TagsList(list, db, tagLeftClicked) {
	function getTr(list2) {
		var tr2 = list2;
		while (tr2.tagName != 'TR') {
			var parent = tr2.parentNode;
			if (parent && parent.nodeType == 1) {
				tr2 = parent;
			} else {
				return null;
			}
		}
		return tr2;
	}

	var tr = getTr(list);

	function getPostId(tr2) {
		if (tr2.hasAttribute('id')) {
			return tr2.getAttribute('id');
		}
		return null;
	}

	this.postId = getPostId(tr);

	function getTags(postId2) {
		var tagsForPost = db.getTagsForPost(postId2);
		tagsForPost.sort(function(a, b) {
			if (a.toUpperCase() > b.toUpperCase())
				return 1;
			if (b.toUpperCase() > a.toUpperCase())
				return -1;
			return 0;
		});
		return tagsForPost;
	}

	this.tags = getTags(this.postId);

	function trim(string) {
		return string.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
	}

	this.tagRightClicked = function(event) {
		var tag = event.target;
		list.removeChild(tag);

		var tagName = trim(tag.innerHTML);
		db.removeTag(this.postId, tagName);

		var index = this.tags.indexOf(tagName);
		if (index >= 0) {
			this.tags.splice(index, 1);
		}
	};

	this.showTag = function(tagName) {
		var tagLi = document.createElement('li');
		tagLi.innerHTML = tagName;
		tagLi.setAttribute('class', 'tag');
		list.appendChild(tagLi);
		var that = this;
		tagLi.addEventListener('click', function(event) {
			var tagName2 = trim(event.target.innerHTML);
			tagLeftClicked(tagName2);
		}, true);
		tagLi.addEventListener('contextmenu', function(event) {
			that.tagRightClicked(event);
			event.stopPropagation();
			event.preventDefault();
		}, true);
	};

	for ( var i = 0; i < this.tags.length; i++) {
		this.showTag(this.tags[i]);
	}

	function getPostUrl(context) {
		var url = window.location.href;
		var hash = window.location.hash;
		var index_of_hash = url.indexOf(hash) || url.length;
		var pageUrl = url.substr(0, index_of_hash);

		var kotva = document.querySelector(context + '.postinfo a.kotva')
				.getAttribute('href');
		return pageUrl + kotva;
	}

	function getPost(postId2) {
		var context = '#' + postId2 + ' ';
		var authorEl = document.querySelector(context + '.names b');
		var author;
		if (authorEl == null) {
			author = '---';
		} else {
			author = authorEl.innerHTML;
		}
		var dateEl = document.querySelector(context + '.postinfo span');
		var date;
		if (dateEl == null) {
			date = '---';
		} else {
			date = dateEl.getAttribute('title');
		}
		var timeEl = document.querySelector(context + '.postinfo');
		var time;
		if (timeEl == null) {
			time = '---';
		} else {
			var timeMatch = timeEl.innerHTML
					.match(/[0-9][0-9]:[0-9][0-9]:[0-9][0-9]/);
			if (timeMatch == null) {
				time = '---';
			} else {
				time = timeMatch[0];
			}
		}
		var url = getPostUrl(context);
		var titleEl = document.querySelector('#breadcrumb h1');
		var title;
		if (titleEl == null) {
			title = '---';
		} else {
			title = titleEl.innerHTML;
		}
		var categoryList = document.querySelectorAll('#breadcrumb span a');
		var category;
		if (categoryList.length == 0) {
			category = '---';
		} else {
			category = categoryList.item(categoryList.length - 1).innerHTML;
		}

		return {
			postId : postId2,
			author : author,
			date : date + ", " + time,
			url : url,
			title : title,
			category : category
		};
	}

	this.post = getPost(this.postId);

	this.addTag = function(tagName) {
		if (tagName.length > 0) {
			var index = this.tags.indexOf(tagName);
			if (index == -1) {
				this.tags.push(tagName);
				db.addTag(this.post, tagName);
				this.showTag(tagName);
			}
		}
		var addtagform = document.getElementById('addtagform');
		if (addtagform != null) {
			list.removeChild(addtagform);
		}
		this.showNewTag();
	};

	this.showNewTag = function() {
		var tagLi = document.createElement('li');
		tagLi.innerHTML = '+';
		tagLi.setAttribute('class', 'tag addtag');
		list.appendChild(tagLi);
		var that = this;
		tagLi.addEventListener('click', function() {
			list.removeChild(tagLi);
			var formInput = document.createElement('form');
			formInput.setAttribute('id', 'addtagform');
			list.appendChild(formInput);
			formInput.addEventListener('submit', function(event) {
				event.stopPropagation();
				event.preventDefault();
			}, true);

			var input = document.createElement('input');
			input.setAttribute('type', 'text');
			input.setAttribute('id', 'addtaginput');
			formInput.appendChild(input);
			input.addEventListener('blur', function() {
				var tagName = trim(input.value);
				that.addTag(tagName);
			}, true);
			input.focus();
		}, true);
	};

	this.showNewTag();
}
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
function TagsFeature() {
	var tagsLists = [];
	this.dialog;

	this.prepareDialog = function(db) {
		var menu = document.getElementById('menu');
		var uiWidth = document.querySelector('#menu .ui-width');

		var space1 = document.createTextNode(' ');
		menu.insertBefore(space1, uiWidth);

		var browseTags = document.createElement('a');
		browseTags.setAttribute('href', '');
		browseTags.setAttribute('id', 'browsetags');
		browseTags.innerHTML = 'Proch&#225;zet tagy';
		menu.insertBefore(browseTags, uiWidth);

		function entity(ent) {
			var e = document.createElement("div");
			e.innerHTML = '&' + ent + ';';
			return e.innerHTML;
		}

		var space2 = document.createTextNode(' ' + entity('middot'));
		menu.insertBefore(space2, uiWidth);

		var dial = new TagsDialog(db);
		var that = this;
		browseTags.addEventListener('click', function(event) {
			that.dialog.show();
			event.stopPropagation();
			event.preventDefault();
		}, true);
		return dial;
	};

	function prepareEachPost(db, callback) {
		var posts = document.querySelectorAll('#prispevky tr ');
		for ( var i = 0; i < posts.length; i++) {
			var post = posts[i];
			var postId = post.hasAttribute('id') ? post.getAttribute('id')
					: null;
			if (postId == null) {
				continue;
			}

			var postInfo = document.querySelector('#' + postId + ' .postinfo');
			if (postInfo == null) {
				// should not happen
				continue;
			}
			var tagsUl = document.createElement('ul');
			tagsUl.setAttribute('class', 'tags');
			postInfo.appendChild(tagsUl);

			var tagsList = new TagsList(tagsUl, db, callback);
			tagsLists.push(tagsList);
		}
	}

	this.prepareFeature = function() {
		var db = new TagsDB();
		this.dialog = this.prepareDialog(db);

		prepareEachPost(db, function(tagName) {
			this.dialog.showTag(tagName);
		});
	};
	
	this.prepareFeature();
}

new TagsFeature();
