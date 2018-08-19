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
			_.bindAll(this, 'submit');

			/* Elements */
			this.messageTemplateEl = $("#message-template");
			this.messagesListEl = this.$el.find('.js-messages-list');
			this.messagesContentInputEl = this.$el.find('.js-messages-content-input');
			this.submitEl = this.$el.find('.js-submit');
			this.backEl = this.$el.find('.js-messages-back');

			/* Elements */
			this.messageEls = this.messagesListEl.children('li');

			this.$el.find('.messages-list-33, .messages-list-default').hide();
			this.$el.find('.messages-banner-participants-33, .messages-banner-participants-default').hide();

			if (options.id === "33") {
				this.$el.find('.messages-list-33').show();
				this.$el.find('.messages-banner-participants-33').show();
			} else {
				this.$el.find('.messages-list-default').show();
				this.$el.find('.messages-banner-participants-default').show();
			}

			this.$el.show();

			this.submitEl.click(this.submit);
		},
		submit: function() {
			var template = _.template(this.messageTemplateEl.html());

			SnowdenApp.postMessage(
				"0xaefc93cf58b368455ba610cf24485ff98caac517db2bf12b3d558dfab6db39f3",   // from toshi to 00fb
				web3.sha3("The NSA is spying on American citizens")
			   )

			this.messagesListEl.append(template({
				"content": this.messagesContentInputEl.val(),
				"orientation": "right"
			}))
			this.messagesContentInputEl.val("");

			this.messageEls = this.messagesListEl.children('li');

			var messageEl = this.messageEls.first();
			var messageMenuIconEl = messageEl.find('.js-message-menu-icon');
			var messageMenuEl = messageEl.find('.js-message-menu');
			var dropEl = Drop({
			  target: messageMenuIconEl[0],
			  content: "<ol class=\"message-menu menu js-message-menu\"><li><a href=\"#\">Report</a></li></ol>",
			  position: 'top center',
			  openOn: 'click'
			});

			_.delay(_.bind(function() {
				this.messagesListEl.append(template({
					"content": "Wow! Wait till the public hears about this!",
					"orientation": "left"
				}));
			}, this), 1000);

			$('body').delegate('.js-message-menu li', 'click', function() {

				SnowdenApp.reportConversationAgreement(
					"0xaefc93cf58b368455ba610cf24485ff98caac517db2bf12b3d558dfab6db39f3",
					web3.sha3("The NSA is spying on American citizens"),
					"The NSA is spying on American citizens"
				); 


				messageEl.find('.message-content').css('background-color', '#D83949');
				dropEl.close();
				return false;
			});
		},
		back: function() {
			router.navigate("#conversations", {trigger: true});
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
				web3.toBigNumber(1000000000000000000),
				web3.toBigNumber(3000000000000000000),
				web3.toBigNumber(2000000000000000000),
				web3.toBigNumber(2000000000000000000),
				9420882
			);

			router.navigate("conversation/33", {trigger: true});

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

	var sliderEls = $('.range-slider');

	sliderEls.each(function(){

		$(this).children('.range-slider-range').on('input', function(event){
			event.preventDefault();
			var value = $(this).parent('.range-slider').children('.range-slider-value');
			value.html(this.value + "%");
		});
	});

})