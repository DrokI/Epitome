;(function(exports) {

	var Epitome = typeof require == 'function' ? require('epitome-template') : exports.Epitome;

	Epitome.View = new Class({

		Implements: [Options, Events],

		// a string or element to render to and bind events on
		element: null,

		// optional, a collection may be bound to the view
		collection: null,

		// optional, a model may be bound to the view
		model: null,

		// preset stuff like template and the event map
		options: {
			template: "",
			// the event map should be like `elementEvent`: `instanceEvent`
			// for example: '{click:relay(a.task-remove)': 'removeTask'}
			// will fire instance's onRemoveTask handler when a.task-remove is pressed within the element.
			events: {}
		},

		initialize: function(options) {
			// constructor like function.

			// deal with collection first to avoid reference errors with object.clone / merge for setOptions
			if (options && options.collection) {
				this.setCollection(options.collection);
				delete options.collection;
			}

			// now we can hopefully setOptions safely.
			this.setOptions(options);

			// define the element.
			if (this.options.element) {
				this.setElement(this.options.element, this.options.events);
				delete this.options.element;
			}

			// call the ready func if defined.
			this.ready && this.ready();

			// let the instance know
			return this.fireEvent('ready');
		},

		ready: function() {
			// set this in your own constructor to run after setup.
			return this;
		},

		setElement: function(el, events) {
			// set the element and clean-up old one
			this.element && this.detachEvents() && this.destroy();
			this.element = document.id(el);
			events && this.attachEvents(events);

			return this;
		},

		setCollection: function(collection) {
			// a collection should be a real collection.
			var self = this,
				eventProxy = function(type) {
					return function() {
						self.fireEvent(type + ':collection', arguments);
					}
				};

			if (instanceOf(collection, Epitome.Collection)) {
				this.collection = collection;
				// listen in for changes.
				this.collection.addEvents({
					'change': eventProxy('change'),
					'add': eventProxy('add'),
					'remove': eventProxy('remove')
				});
			}

			return this;
		},

		setModel: function(model) {
			// a model should be an Epitome model
			var self = this,
				eventProxy = function(type) {
					return function() {
						self.fireEvent(type + ':model', arguments);
					}
				};

			if (instanceOf(model, Epitome.Model)) {
				this.model = model;
				// listen in for changes.
				this.model.addEvents({
					'change': eventProxy('change'),
					'destroy': eventProxy('destroy'),
					'empty': eventProxy('empty')
				});
			}

			return this;
		},

		attachEvents: function(events) {
			// add events to main element.
			var self = this;
			Object.each(events, function(method, type) {
				self.element.addEvent(type, function(e) {
					self.fireEvent(method, arguments);
				});
			});

			this.element.store('attachedEvents', events);

			return this;
		},

		detachEvents: function() {
			// remove attached events from an element
			var events = this.element.retrieve('sttachedEvents');
			events && this.element.removeEvents(events).eliminate('attachedEvents');

			return this;
		},

		template: function(data) {
			// refactor this to work with any other template engine in your constructor
			return Epitome.Template.compile(this.options.template, data)
		},

		render: function() {
			// refactor this in your constructor object. for example:
			// this.element.set('html', this.template(this.options.data));
			// this.parent(); // fires the render event.
			return this.fireEvent('render');
		},

		empty: function(soft) {
			// with soft flag it does not destroy child elements but detaches from dom
			if (soft) {
				this.element.empty();
			}
			else {
				this.element.set('html', '');
			}

			return this.fireEvent('empty');
		},

		dispose: function() {
			// detach the element from the dom.
			this.element.dispose();

			return this.fireEvent('dispose');
		},

		destroy: function() {
			// remove element from dom and memory.
			this.element.destroy();

			return this.fireEvent('destroy');
		}

	});



	if (typeof define === 'function' && define.amd) {
		define('epitome-view', function() {
			return Epitome;
		});
	}
	else if (typeof module === 'object') {
		module.exports = Epitome;
	}
	else {
		exports.Epitome = Epitome;
	}
}(this));