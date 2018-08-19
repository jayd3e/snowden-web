$(function () {
	var Modal = window.vex;

	var ModalView = Backbone.View.extend({
		initialize: function() {

		}
	})

	var modalTemplateEl = $('#address-modal-template');
	var modalTemplate = _.template(modalTemplateEl.html());
	var view = new ModalView({
		el: modalTemplate(),
	});
	var modalId = Modal.open({
			content: view.el
	});

})