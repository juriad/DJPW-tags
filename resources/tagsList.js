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
