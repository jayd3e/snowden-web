$(function () {
	var Modal = window.vex;

	var pubnub = new PubNub({
		publishKey : 'pub-c-121bd49e-d8bc-4ca0-8a70-e86e447118e5',
		subscribeKey : 'sub-c-9a2966f0-a3cf-11e8-bb88-163ac01f2f4e'
	});

	const baseUrl = "https://snowden-api.herokuapp.com";

	var ConversationModel = Backbone.Model.extend();

	var ConversationsView = Backbone.View.extend({
		initialize: function() {
			_.bindAll(this, "createConversation");

			/* Elements */
			this.conversationTemplateEl = $("#conversation-template");
			this.conversationsListEl = this.$el.find(".js-conversations-list");
			this.conversationEls = this.conversationsListEl.children('li');
			this.createConversationButtonEl = this.$el.find(".js-create-conversation-button");

			_.each(this.conversationEls, function(el) {
				var model = new ConversationModel({
					id: $(el).data('id')
				});
				var conversationView = new ConversationItemView({
					el: el,
					model: model
				})
			}, this);

			this.$el.show();

			this.createConversationButtonEl.click(this.createConversation);
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
			_.bindAll(this, 'initialLoad', 'submit');

			/* Elements */
			this.messageTemplateEl = $("#message-template");
			this.messagesListEl = this.$el.find('.js-messages-list');
			this.messagesContentInputEl = this.$el.find('.js-messages-content-input');
			this.submitEl = this.$el.find('.js-submit');

			this.$el.show();

			$.ajax({
				url: baseUrl + "/index.php?type=conversations&id=" + options.id,
				contentType: "application/json",
				dataType: "json",
				success: this.initialLoad
			});

			this.submitEl.click(this.submit);
		},
		initialLoad: function(response) {
			this.model = new ConversationModel(response[0]);

			this.messagesListEl.empty();
			_.each(response[0].messages, function(message) {
				this.messageTemplate = _.template(this.messageTemplateEl.html());
				this.messagesListEl.append(this.messageTemplate(message));
			}, this);

			/* Elements */
			this.messageEls = this.messagesListEl.children('li');

			/* Events */
			this.messageEls.click(this.clickMessage);

			/* PubNub */
			pubnub.addListener({
				status: function(statusEvent) {
					console.log(statusEvent.category);
				},
				message: _.bind(function(msg) {
					$.ajax({
						url: baseUrl + "/index.php?type=conversations&id=" + this.model.id,
						contentType: "application/json",
						dataType: "json",
						success: this.initialLoad
					});
				}, this),
				presence: function() {

				}
			})
			pubnub.subscribe({
				channels: ['conversations:' + this.model.id]
			});
		},
		submit: function() {
			$.ajax({
				method: "POST",
				url: baseUrl + "/index.php?type=messages",
				contentType: "application/json",
				dataType: "json",
				data: JSON.stringify({
					"content": this.messagesContentInputEl.val(),
					"user_id": "1",
					"conversation_id": this.model.id
				})
			});

			return false;
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
			_.bindAll(this, 'submit', 'submitSuccess');

			/* Elements */
			this.submitEl = this.$el.find('.js-submit');

			this.$el.show();

			this.submitEl.click(this.submit);
		},
		submit: function() {
			$.ajax({
				method: "POST",
				url: baseUrl + "/index.php?type=conversations",
				contentType: "application/json",
				dataType: "json",
				data: JSON.stringify(this.model.toJSON()),
				success: this.submitSuccess
			});
		},
		submitSuccess: function() {
			SnowdenApp.proposeConversationAgreement(
				"0x00Fb52101bbcF2e88a66fDf35d08A9f235e5D4Ca",
				web3.toBigNumber(1000000000000000000),
				web3.toBigNumber(3000000000000000000),
				web3.toBigNumber(2000000000000000000),
				web3.toBigNumber(2000000000000000000),
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
			"conversations": "conversations",
			"conversation/create": "createConversation",
			"conversation/start": "startConversation",
			"conversation/complete": "completeConversation",
			"conversation/expiration": "expirationConversation",
			"conversation/:id": "conversation"
		},
		initialize: function() {

		},
		conversations: function() {
			$('.page').hide();
			var conversationsView = new ConversationsView({
				el: $('.js-conversations')
			});
		},
		conversation: function(id) {
			$('.page').hide();
			var conversationView = new ConversationView({
				el: $('.js-messages')	,
				id: id
			});
		},
		createConversation: function(id) {
			$('.page').hide();
			this.conversationModel = new ConversationModel();
			var createConversationView = new CreateConversationView({
				el: $('.js-create-conversation'),
				model: this.conversationModel
			});
		},
		startConversation: function(id) {
			$('.page').hide();
			var createConversationView = new StartConversationView({
				el: $('.js-create-conversation-start'),
				model: this.conversationModel
			});
		},
		completeConversation: function(id) {
			$('.page').hide();
			var completeConversationView = new CompleteConversationView({
				el: $('.js-create-conversation-complete'),
				model: this.conversationModel
			});
		},
		expirationConversation: function(id) {
			$('.page').hide();
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