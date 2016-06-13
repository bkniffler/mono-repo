blueimp.Gallery.prototype.applicationFactory = function (obj, callback) {
	//var $element = $('<object>')
	//	.addClass('application-content');
	var $element = $('<embed>')
		.addClass('application-content');

	//$element.append($element2);
	$.get(obj.href)
		.done(function (result) {
			//$element.attr("type", "application/pdf");
			$element.attr("type", "application/pdf");
			//$element.attr("data", obj.href);
			$element.attr("src", obj.href);
			//$element.attr('src', obj.href);
			//$element.html(result);
			callback({
				type: 'load',
				target: $element[0]
			});
		})
		.fail(function () {
			callback({
				type: 'error',
				target: $element[0]
			});
		});
	return $element[0];
};