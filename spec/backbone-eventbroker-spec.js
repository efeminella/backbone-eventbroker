
describe('EventBroker', function() {
    // cache a local reference to the EventBroker...
    var EventBroker = Backbone.EventBroker;

    // spec set-up ...
    beforeEach( function() {
        // add utility matcher for each expect call
        addMatchers({
            'toStrictlyEqual': function(expected) {
                return this.actual === expected;
            }
        });
    });
    afterEach(function(){
        EventBroker.destroy();
    });

    it ('should extend Backbone.Events', function() {
        _.forEach(Backbone.Events, function(method, name) {
            expect(EventBroker[name]).toBeTruthy();
        }, this);
    });

    describe('namespace', function() {
        it ('should default to an empty string', function() {
            expect(EventBroker.namespace).toEqual('');
        });
    });

    describe('namespaced instances', function() {
        it ('should resolve to their unique namespace', function() {
            expect(EventBroker.get('ns1').namespace).toEqual('ns1');
            expect(EventBroker.get('ns2').namespace).toEqual('ns2');
        });
        it ('should reference the same EventBroker instance for each unique namespace', function() {
            expect(EventBroker.get('ns1')).toStrictlyEqual(EventBroker.get('ns1'));
            expect(EventBroker.get('ns2')).toStrictlyEqual(EventBroker.get('ns2'));
        });
    });

    describe('get', function() {
        it ('should create brokers which implement the Backbone.Events API', function() {
            var broker = EventBroker.get('broker');
            _.forEach(Backbone.Events, function(method, name) {
                expect(broker[name]).toBeTruthy();
            }, this);
        });
        it ('should create a unique broker per namespace', function() {
            var ns1 = EventBroker.get('ns1')
              , ns2 = EventBroker.get('ns2');
            expect(ns1).not.toStrictlyEqual(ns2);
        });
        it ('should only create one unique broker per namespace', function() {
            var broker1 = EventBroker.get('someBroker')
              , broker2 = EventBroker.get('someBroker');
            expect(broker1).toStrictlyEqual(broker2);
        });
    });

    describe('has', function() {
        it ('should return false if a broker has not been created for the given namespace', function() {
            expect(EventBroker.has('ns1')).toBeFalsy();
        });
        it ('should return true if a broker has been created for the given namespace', function() {
            var broker1 = EventBroker.get('ns1');
            expect(EventBroker.has('ns1')).toBeTruthy();
        });
    });

    describe('destroy', function() {
        describe('when invoked with a specific namespace', function() {
            it ('should only delete the broker for the given namespace', function() {
                EventBroker.get('ns1');
                EventBroker.get('ns2');
                EventBroker.destroy('ns1');
                expect(EventBroker.has('ns1')).toBeFalsy();
                expect(EventBroker.has('ns2')).toBeTruthy();
            });
        });

        describe('when invoked with multiple namespaces', function() {
            it ('should only delete brokers for the given namespaces', function() {
                EventBroker.get('ns1');
                EventBroker.get('ns2');
                EventBroker.get('ns3');
                EventBroker.get('ns4');

                EventBroker.destroy('ns1').destroy('ns2').destroy('ns3');

                expect(EventBroker.has('ns1')).toBeFalsy();
                expect(EventBroker.has('ns2')).toBeFalsy();
                expect(EventBroker.has('ns3')).toBeFalsy();
                expect(EventBroker.has('ns4')).toBeTruthy();
            });
        });

        describe('when invoked with no arguments', function() {
            it ('should delete all brokers for all namespaces', function() {
                EventBroker.get('ns1');
                EventBroker.get('ns2');

                EventBroker.destroy();

                expect(EventBroker.has('ns1')).toBeFalsy();
                expect(EventBroker.has('ns2')).toBeFalsy();
            });
        });
    });

    describe('trigger override', function() {
        it ('should throw an error if called with undefined', function() {
            expect(function() {
                EventBroker.trigger();
            }).toThrow(new Error('Backbone.EventBroker.trigger invoked with null or undefined event'));
        });
        it ('should throw an error if called with null', function() {
            expect(function() {
                EventBroker.trigger(null);
            }).toThrow(new Error('Backbone.EventBroker.trigger invoked with null or undefined event'));
        });
        it ('should execute trigger if a non null, defined value is provided', function() {
            expect(EventBroker.trigger('test')).toBeTruthy();
        });
    });

    describe('when registering events via .on', function(){
        it ('should register an event for the given callback and context', function() {
            var client = {'test': function(){}};
            spyOn(client, 'test');
            EventBroker.on('some:event', client.test, client);
            EventBroker.trigger('some:event', 'test');
            expect(client.test).toHaveBeenCalledWith('test');
        });
    });

    describe('when unregistering events via .off', function(){
        it ('should unregister an event from the given callback and context', function() {
            var client = {'test': function(){}};
            spyOn(client, 'test');
            EventBroker.on('some:event', client.test, client);
            EventBroker.off('some:event', client.test, client);
            EventBroker.trigger('some:event', 'test');
            expect(client.test).not.toHaveBeenCalled();
        });
    });

    describe('interests', function() {
        var broker, interests, users, user;
        beforeEach(function() {
            broker = EventBroker;
            interests = {
                'users:add': 'add',
                'users:delete': 'remove'
            };
            user = {'id': '123'};
            users = {
                'users': {},
                'add': function(user) {
                    this.users[user.id] = user;
                },
                'remove': function(user) {
                    delete this.users[user.id];
                }
            };
        });

        afterEach(function(){
            broker.off('users:add', users.add, users.users);
            broker.off('users:delete', users.add, users.remove);
        });

        describe('when registering explicit interests', function() {
            it ('should register each event / callback mapping', function() {
                spyOn(users, 'remove');
                broker.register(interests, users);
                broker.trigger('users:delete', user);
                expect(users.remove).toHaveBeenCalled();
                expect(users.remove).toHaveBeenCalledWith(user);
                expect(users.users[user.id]).toBeUndefined();
            });
        });

        describe('when unregistering explicit interests', function() {
            it ('should unregister each event / callback mappings', function() {
                broker.unregister(interests, users);
                broker.trigger('users:add', user);
                expect(_.isEmpty(users.users)).toBeTruthy(user);
            });
        });

        describe('registering interests for undefined methods', function() {
            it ('should throw an exception if the given callback is not a function', function() {
                var interests = {'users:update':'update'}
                  , wrapper   = function(){EventBroker.register(interests, context)}
                  , context   = users;

                expect(wrapper).toThrow(new Error("method 'update' not found for event 'users:update'"));
                context.update = '';

                wrapper = function(){EventBroker.register(interests, context)};
                expect(wrapper).toThrow(new Error("method 'update' not found for event 'users:update'"));
            });
        });

        describe('registering implied interests', function() {
            it ('should register all event/callback mappings', function() {
                users.interests = interests;
                broker.register(users);

                broker.trigger('users:add', user);
                expect(users.users[user.id]).toEqual(user);

                broker.trigger('users:delete', user);
                expect(users.users[user.id]).toBeUndefined();
            });
        });

        describe('when unregistering implied interests', function() {
            it ('should unregister all event/callback mappings', function() {
                users.interests = interests;
                broker.register(users).unregister(users);

                broker.trigger('users:add', user);
                expect(_.isEmpty(users.users)).toBeTruthy(user);
            });
        });

        describe('when registering interests implemented as a function', function() {
            it ('should register each event / callback mapping', function() {
                spyOn(users, 'remove');
                interests = function(){
                    return {
                        'users:add': 'add',
                        'users:delete': 'remove'
                    }
                };
                broker.register(interests, users);
                broker.trigger('users:delete', user);
                expect(users.remove).toHaveBeenCalled();
                expect(users.remove).toHaveBeenCalledWith(user);
                expect(users.users[user.id]).toBeUndefined();
            });
        });
    });
});
