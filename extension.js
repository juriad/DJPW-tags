/*******************************************************************************
 * This is your Page Code. The appAPI.ready() code block will be executed on
 * every page load. For more information please visit our docs site:
 * http://docs.crossrider.com
 ******************************************************************************/

appAPI
		.ready(function($) {

			function showTags(into, tags) {
				for ( var i = 0; i < tags.length; i++) {
					into.append('<span class="tag">' + tags[i] + '</span>');
				}
				into.append('<span class="addtag">+</span>');
			}

			function getPostUrl(postId) {
				var url = window.location.href;
				var hash = window.location.hash;
				var index_of_hash = url.indexOf(hash) || url.length;
				var pageUrl = url.substr(0, index_of_hash);

				var kotva = $('#' + postId + ' .postinfo a.kotva').attr('href');
				return pageUrl + kotva;
			}

			function removePost(posts, postId) {
				var postUrl = getPostUrl(postId);
				for ( var i = 0; i < posts.length; i++) {
					if (posts[i].url == postUrl) {
						posts.splice(i, 1);
					}
				}
				return posts;
			}

			function removeTag(tag) {
				var postId = tag.parents('tr').attr('id');
				var tags = appAPI.db.get(postId);
				if (tags === null) {
					tags = [];
				}
				var tagName = $.trim(tag.text());
				var i1 = tags.indexOf(tagName);
				if (i1 >= 0) {
					tags.splice(i1, 1);
				}

				if (tags.length === 0) {
					appAPI.db.remove(postId);
				} else {
					appAPI.db.set(postId, tags);
				}

				var pagesForTags = appAPI.db.get(tagName);
				if (pagesForTags === null) {
					pagesForTags = [];
				}

				pagesForTags = removePost(pagesForTags, postId);
				if (pagesForTags.length === 0) {
					appAPI.db.remove(tagName);

					var allTags = appAPI.db.get('_all_tags');
					if (allTags === null) {
						allTags = [];
					}
					var i3 = allTags.indexOf(tagName);
					if (i3 >= 0) {
						allTags.splice(i3, 1);
					}
					if (allTags.length === 0) {
						appAPI.db.remove('_all_tags');
					} else {
						appAPI.db.set('_all_tags', allTags);
					}
				} else {
					appAPI.db.set(tagName, pagesForTags);
				}

				tag.remove();
			}

			function addTag(addtag) {
				addtag
						.replaceWith('<form><input type="text" id="addtaginput"></form>');
				var addTagInput = $('#addtaginput');
				addTagInput.blur(addTagDB);
				addTagInput.keypress(function(e) {
					if (e.which == 13) {
						addTagDB();
					}
				});
				addTagInput.focus();
			}

			function addTagDB() {
				var addTagInput = $('#addtaginput');
				var tagName = $.trim(addTagInput.val());
				if (tagName.length > 0) {
					var postId = addTagInput.parents('tr').attr('id');
					var tags = appAPI.db.get(postId);
					if (tags === null) {
						tags = [];
					}
					if (tags.indexOf(tagName) == -1) {
						tags.push(tagName);
						appAPI.db.set(postId, tags);
						addTagInput.parent().before(
								'<span class="tag">' + tagName + '</span>');

						var pagesForTags = appAPI.db.get(tagName);
						if (pagesForTags === null) {
							pagesForTags = [];
						}

						var postUrl = getPostUrl(postId);
						var title = $('#breadcrumb h1').text();
						var category = $('#breadcrumb span a').last().text();
						var author = $('#' + postId + ' td.names b').text();
						var post = {
							url : postUrl,
							category : category,
							title : title,
							author : author
						};

						pagesForTags.push(post);
						appAPI.db.set(tagName, pagesForTags);

						var allTags = appAPI.db.get('_all_tags');
						if (allTags === null) {
							allTags = [];
						}
						if (allTags.indexOf(tagName) == -1) {
							allTags.push(tagName);
							appAPI.db.set('_all_tags', allTags);
						}
					}
				}
				addTagInput.parent().replaceWith(
						'<span class="addtag">+</span>');
			}

			var html = '<div id="outerpopup"><div id="popup">\
<span id="closebutton">zav&#345;&#237;t&nbsp;</span>\
<h1>Seznam tag&#367;</h1>\
<ul id="taglist"></ul>\
<h2 id="tagname">---</h2>\
<table id="tagpages">\
<thead><tr><th width="15%">Kategorie</th>\
<th width="70%">T&#233;ma</th>\
<th width="15%">Autor</th></tr></thead>\
<tbody>\
</tbody>\
</table>\
</div></div>';

			function showTag(tag) {
				var tagName = $.trim(tag.text());
				$('#tagname').text(tagName);

				var pagesForTags = appAPI.db.get(tagName);
				if (pagesForTags === null) {
					pagesForTags = [];
				}

				var table = $("#tagpages tbody");
				table.empty();

				for ( var i = 0; i < pagesForTags.length; i++) {
					var post = pagesForTags[i];
					table.append('<tr class="'
							+ (i % 2 == 0 ? 'tbCel1' : 'tbCel2') + '"><td>'
							+ post.category + '</td><td><a href="' + post.url
							+ '">' + post.title + '</a></td><td>' + post.author
							+ '</td></tr>');
				}
			}

			function browseTags() {
				$('#menu .ui-width')
						.before(
								' <a href="" id="browseTags">Proch&#225;zet tagy</a> &middot;');
				$('#browseTags').click(
						function() {
							$('#outerpopup').remove();
							$('body').append(html);
							$('#outerpopup').show();
							$('#closebutton').click(function() {
								$('#outerpopup').remove();
							});

							var allTags = appAPI.db.get('_all_tags');
							if (allTags === null) {
								allTags = [];
							}

							var taglist = $('#taglist');
							for ( var i = 0; i < allTags.length; i++) {
								taglist.append('<li class="tag">' + allTags[i]
										+ '</li>');
							}
							taglist.click(function(e) {
								var target = $(e.target);
								var targetClass = target.attr('class');
								if (targetClass == 'tag') {
									showTag(target);
								}
							});

							return false;
						});
			}

			function addTagSupportForThread() {
				$('#prispevky tr').each(function() {
					var postId = $(this).attr('id');
					var into = $('.postinfo a.kotva', $(this)).parent();
					into.append('<span class="tags"></span>');
					var tags = appAPI.db.get(postId);
					if (tags === null) {
						tags = [];
					}
					showTags($('.tags', into), tags);
				});
				$('.tags').click(function(e) {
					var target = $(e.target);
					var targetClass = target.attr('class');
					if (targetClass == 'addtag') {
						addTag(target);
					} else if (targetClass == 'tag') {
						removeTag(target);
					}
				});
			}

			// Place your code here (you can also define new functions above
			// this scope)
			// The $ object is the extension's jQuery object

			if (!appAPI.isMatchPages("diskuse.jakpsatweb.cz/*"))
				return;

			if (appAPI.isMatchPages(/vthread/)) {
				addTagSupportForThread();
			} else {
				// nothing for topics
			}

			browseTags();

			appAPI.resources.includeCSS('tags.css');

		});
