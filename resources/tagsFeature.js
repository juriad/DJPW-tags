/*
API used:
	Array.push
	Document.createElement
	Document.createTextNode
	Document.getElementById
	Document.querySelector
	Element.addEventListener
	Element.appendChild
	Element.innnerHTML
	Element.insertBefore
	Element.setAttribute
	Event.preventDefault
	Event.target
	Event.stopPropagation
 */
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
		var that = this;
		prepareEachPost(db, function(tagName) {
			that.dialog.showTag(tagName);
		});
	};

	this.prepareFeature();
}

new TagsFeature();
