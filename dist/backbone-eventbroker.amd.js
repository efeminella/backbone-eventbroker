/*
 * Backbone Eventbroker v1.1.0
 *
 * This version is for use with RequireJS
 * If using regular <script> tags to include your files, use backbone-memory.min.js
 *
 * Copyright (c) 2012  - 2013 Eric Feminella, Sven Lito
 * License and more information at: http://code.ericfeminella.com/license/LICENSE.txt
 *
 */
define( function($, Backbone, _) {
    var _ = require('underscore')
      , $ = require('jquery')
      , Backbone = require('backbone')

    "use strict";

    /*
     * The Backbone.EventBroker adds a general purpose Event Broker implementation
     * to Backbone based on the Backbone Events API.
     *
     * Backbone.EventBroker can be used directly to serve as a centralized event
     * management mechanism within an application. Additional, context specific,
     * namespaced brokers can also be created in order to provide unique brokers
     * within a particular part of an application.
     */
    Backbone.EventBroker = Backbone.EventBroker || (function() {
        // Define a reference to Backbone.Events.trigger method
        var _trigger = Backbone.Events.trigger;

        // Define the cache which contains each namespaced EventBroker instance
        var _brokers = {};

        /*
         * Implements the registering and unregistering of event/callback mappings
         * for specific objects registered with an EventBroker.
         */
        var _registration = function(interests, context, broker, method) {
            var events;
            if (!context && interests.interests) {
                context   = interests;
                interests = interests.interests;
            }
            events = _.isFunction(interests) ? interests() : interests;
            _.each( events, function(callback, event){
                var cb = context[callback]
                if ( _.isFunction(cb) ) {
                    broker[method](event, cb, context);
                } else {
                    throw new Error("method '" + interests[event] + "' not found for event '" + event + "'");
                }
            });
            return broker;
        };

        /*
         * Defines an Event registry which allows for registering and unregistering
         * multiple events/callbacks. This API is similar to Backbone.Events.on in
         * that it maps events to callbacks as well as a context. The main difference
         * is that mutliple event / callback mappings can be created as one-to-one
         * mappings for a given context.
         */
        var EventRegistry = {
            /*
             * Provides a convenience method which is similar to Backbone.Events.on
             * in that this method binds events to callbacks. The main difference is
             * that this method allows for binding multiple events / callbacks which
             * have a single context.
             *
             * This method can be invoked with two arguments, the first being an object
             * of event types as keys, whose values are the callbacks to which the events
             * are bound (as described above), and the second argument is the context
             * object typically (this) which specifies the context against which the
             * events and callbacks are to be invoked.
             *
             * This method can also be invoked with a single object which defines an
             * 'interests' property which defines a hash containing event types as
             * keys, and callbacks as values.
             *
             * <pre>
             *
             * // Register event/callbacks based on a hash and associated context
             * var Users = Backbone.Collection.extend( {
             *     // define a reference to the Backbone.EventBroker
             *     broker: Backbone.EventBroker,
             *
             *     initialize: function() {
             *         this.broker.register({
             *             'user:select'   : 'select',
             *             'user:deselect' : 'deselect',
             *             'user:edit'     : 'edit',
             *             'user:update'   : 'update',
             *             'user:remove'   : 'remove'
             *         }, this );
             *     },
             *     select: function() { ... },
             *     deselect: function() { ... },
             *     edit: function() { ... },
             *     update: function() { ... },
             *     remove: function() { ... }
             * });
             * </pre>
             *
             * <pre>
             *
             * // Register event/callbacks based on an object's "interest" property.
             * var User = Backbone.Model.extend({
             *     broker: Backbone.EventBroker,
             *
             *     interests : {
             *         'user:select'   : 'select'
             *       , 'user:deselect' : 'deselect'
             *       , 'user:edit'     : 'edit'
             *       , 'user:update'   : 'update'
             *       , 'user:remove'   : 'remove'
             *     },
             *     initialize: function() {
             *         this.broker.register(this);
             *     },
             *     select: function() { ... },
             *     deselect: function() { ... },
             *     edit: function() { ... },
             *     update: function() { ... },
             *     remove: function() { ... }
             * });
             * </pre>
             *
             */
            register: function(interests, context) {
                return interests || context ? _registration(interests, context, this, 'on') : this;
            },

            /*
             * Provides a convenience method which is similar to Backbone.Events.off
             * in that this method unbinds events from callbacks. The main difference
             * is this method allows for unbinding multiple events / callbacks.
             *
             * This method can also be invoked with a single object which provides an
             * 'interests' property which defines a hash containing event types as keys,
             * and the callbacks to which the events were previosuly bound as values.
             *
             * This method can also be invoked with two arguments, the first being an
             * object of event types as keys, whose values are the callbacks to which
             * the events are bound (as described above), and the second argument is
             * context object typically (this) which specifies the context to which the
             * events and callbacks were bound.
             *
             * <pre>
             *
             * var UserView = Backbone.View.extend({
             *     broker: Backbone.EventBroker,
             *     interests: {
             *         'user:select'   : 'select'
             *       , 'user:deselect' : 'deselect'
             *     },
             *     initialize: function() {
             *         this.broker.register( this );
             *     },
             *     remove: function() {
             *         this.broker.unregister( this );
             *     },
             *     select: function() { ... },
             *     deselect: function() { ... }
             * });
             *
             * </pre>
             *
             */
            unregister: function(interests, context) {
                return interests || context ? _registration(interests, context, this, 'off') : this;
            }
        };

        // creates and returns the EventBroker ...
        return _.extend({
            /*
             * Defines the default EventBroker namespace - an empty string. Specific
             * EventBrokers created via EventBroker.get( namespace ) will be created
             * and have their namespace property assigned the value of the namespace
             * specified.
             */
            namespace: '',

            /*
             * Retrieves the broker for the given namespace. If a broker has yet to
             * have been created, it will be created for the namespace and returned.
             * Subsequent retrievals for the broker of the same namespace will return
             * a reference to the same broker; that is, only one unique broker will
             * be created per namespace.
             */
            get: function(namespace) {
                if (!this.has(namespace)) {
                    _brokers[namespace] = _.extend({'namespace': namespace}, Backbone.Events, EventRegistry);
                }
                return _brokers[namespace];
            },

            /*
             * Determines if the specified broker has been created for the given
             * namespace.
             *
             */
            has: function(namespace) {
                return typeof _brokers[namespace] !== 'undefined';
            },

            /*
             * Destroys the broker for the given namespace, or multiple brokers for
             * a space delimited string of namespaces. To destroy all brokers that
             * have been created under any namespace, simply invoke this method with
             * no arguments.
             *
             */
            destroy: function(namespace) {
                if (!namespace) {
                    _.each(_brokers, function(broker, ns){
                        this.destroy(ns);
                    }, this );
                } else if (this.has(namespace)) {
                    _brokers[namespace].off();
                    delete _brokers[namespace];
                }
                return this;
            }
        }, Backbone.Events, EventRegistry, {
            /*
             * Override Backbone.Events.Trigger to ensure an event name is provided,
             * if so, forward arguments to native implementation, otherwise, throw
             * an error.
             */
            trigger: function(name) {
                if (name !== null && name !== void 0) {
                    return _trigger.apply(this, [].slice.call(arguments));
                }
                throw new Error('Backbone.EventBroker.trigger invoked with null or undefined event');
            },
        });
    }());
    // exports
    return Backbone.EventBroker;
});
