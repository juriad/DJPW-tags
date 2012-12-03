/*******************************************************************************
 * This is your Page Code. The appAPI.ready() code block will be executed on
 * every page load. For more information please visit our docs site:
 * http://docs.crossrider.com
 ******************************************************************************/

appAPI.ready(function($) {
	if (!appAPI.isMatchPages("diskuse.jakpsatweb.cz/*"))
		return;

	if (!appAPI.isMatchPages(/vthread/)) {
		return;
	}
	

	appAPI.resources.includeCSS('tags.css');

	appAPI.resources.includeJS('tagsDB.js');
	appAPI.resources.includeJS('tagsList.js');
	appAPI.resources.includeJS('tagsDialog.js');
	appAPI.resources.includeJS('tagsFeature.js');
});
