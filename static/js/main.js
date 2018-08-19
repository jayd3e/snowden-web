$(function () {
	var Modal = window.vex;

	const baseUrl = "https://snowden-api.herokuapp.com";

	var ConversationModel = Backbone.Model.extend();

	var ConversationsView = Backbone.View.extend({
		initialize: function() {
			_.bindAll(this, "initialLoad", "createConversation");

			/* Elements */
			this.conversationTemplateEl = $("#conversation-template");
			this.conversationsListEl = this.$el.find(".js-conversations-list");
			this.createConversationButtonEl = this.$el.find(".js-create-conversation-button");

			$.ajax({
				url: baseUrl + "/web/index.php?type=conversations",
				dataType: "json",
				success: this.initialLoad
			})

			this.createConversationButtonEl.click(this.createConversation);
		},
		initialLoad: function(response) {
			_.each(response, function(conversation) {
				this.conversationTemplate = _.template(this.conversationTemplateEl.html());

				var conversationView = new ConversationItemView({
					el: this.conversationTemplate(),
					model: new ConversationModel(conversation)
				})

				this.conversationsListEl.append(conversationView.el);
			}, this);

			/* Elements */
			this.conversationEls = this.conversationsListEl.children('li');
		},
		createConversation: function() {
			router.navigate("conversation/create", {trigger: true});
		}
	});

	var ConversationItemView = Backbone.View.extend({
		initialize: function() {
			_.bindAll(this, 'clickConversation');

			/* Events */
			this.$el.click(this.clickConversation);
		},
		clickConversation: function() {
			router.navigate("conversation/" + this.model.id, {trigger: true});
		}
	});

	var ConversationView = Backbone.View.extend({
		initialize: function(options) {
			_.bindAll(this, 'initialLoad');

			/* Elements */
			this.messageTemplateEl = $("#message-template");
			this.messagesListEl = this.$el.find('.js-messages-list');

			this.$el.show();

			$.ajax({
				url: baseUrl + "/web/index.php?type=conversations&id=" + options.id,
				dataType: "json",
				success: this.initialLoad
			})
		},
		initialLoad: function(response) {
			_.each(response[0].messages, function(message) {
				this.messageTemplate = _.template(this.messageTemplateEl.html());
				this.messagesListEl.append(this.messageTemplate(message));
			}, this);

			/* Elements */
			this.messageEls = this.messagesListEl.children('li');

			/* Events */
			this.messageEls.click(this.clickMessage);
		}
	});

	var CreateConversationView = Backbone.View.extend({
		initialize: function() {
			_.bindAll(this, 'submit');

			/* Elements */
			this.submitEl = this.$el.find('.js-submit');
			this.conversationNameEl = this.$el.find('.js-conversation-name');

			this.$el.show();

			this.submitEl.click(this.submit);
		},
		submit: function() {
			this.model.set('name', this.conversationNameEl.val());

			router.navigate("conversation/start", {trigger: true});

			this.$el.hide();
		}
	});

	var StartConversationView = Backbone.View.extend({
		initialize: function() {
			_.bindAll(this, 'submit');

			/* Elements */
			this.submitEl = this.$el.find('.js-submit');

			this.$el.show();

			this.submitEl.click(this.submit);
		},
		submit: function() {
			router.navigate("conversation/complete", {trigger: true});

			this.$el.hide();
		}
	});

	var CompleteConversationView = Backbone.View.extend({
		initialize: function() {
			_.bindAll(this, 'submit');

			/* Elements */
			this.submitEl = this.$el.find('.js-submit');

			this.$el.show();

			this.submitEl.click(this.submit);
		},
		submit: function() {
			router.navigate("conversation/expiration", {trigger: true});

			this.$el.hide();
		}
	});

	var ExpirationConversationView = Backbone.View.extend({
		initialize: function() {
			_.bindAll(this, 'submit');

			/* Elements */
			this.submitEl = this.$el.find('.js-submit');

			this.$el.show();

			this.submitEl.click(this.submit);
		},
		submit: function() {
			SnowdenApp.proposeConversationAgreement(
				"0x00Fb52101bbcF2e88a66fDf35d08A9f235e5D4Ca",
				web3.toBigNumber(2000000000000000000),
				web3.toBigNumber(2000000000000000000),
				web3.toBigNumber(1000000000000000000),
				web3.toBigNumber(3000000000000000000),
				9420882		  
			);

			router.navigate("conversations", {trigger: true});

			this.$el.hide();
		}
	});

	// Router
	var Router = Backbone.Router.extend({
		routes : {
			"": "conversations",
			"conversation/create": "createConversation",
			"conversation/start": "startConversation",
			"conversation/complete": "completeConversation",
			"conversation/expiration": "expirationConversation",
			"conversation/:id": "conversation"
		},
		initialize: function() {

		},
		conversations: function() {
			var conversationsView = new ConversationsView({
			  el: $('.js-conversations')
			});
		},
		conversation: function(id) {
			var conversationView = new ConversationView({
			  el: $('.js-messages'),
			  id: id
			});
		},
		createConversation: function(id) {
			this.conversationModel = new ConversationModel();
			var createConversationView = new CreateConversationView({
			  el: $('.js-create-conversation'),
			  model: this.conversationModel
			});
		},
		startConversation: function(id) {
			var createConversationView = new StartConversationView({
			  el: $('.js-create-conversation-start'),
			  model: this.conversationModel
			});
		},
		completeConversation: function(id) {
			var completeConversationView = new CompleteConversationView({
			  el: $('.js-create-conversation-complete'),
			  model: this.conversationModel
			});
		},
		expirationConversation: function(id) {
			var expirationConversationView = new ExpirationConversationView({
			  el: $('.js-create-conversation-expiration'),
			  model: this.conversationModel
			});
		}
	});
	var router = new Router();

	// Start history when our application is ready
	Backbone.history.start({
			root: '/'
	});

})