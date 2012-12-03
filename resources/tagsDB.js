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
