## EventBroker API
Provides a general purpose [Backbone](http://documentcloud.github.com/backbone/ "Title") Event Broker implementation based on the Backbone [Events API](http://documentcloud.github.com/backbone/#Events "Title"). 

The `EventBroker` can be used directly to serve as a centralized event management mechanism for an entire application. Namespaced brokers can also be created in order to provide context specific brokers within an application.

### Basic Usage
The `EventBroker` can be used directly to publish and subscribe to events of interest:

``` javascript
var Users = Backbone.Collection.extend{{
    initialize: function(){
      // subscribe to an event ...
      Backbone.EventBroker.on('users:add', this.add, this);
    },
    add: function(user) {
      console.log(user.id);
    }
};

var UserEditor = Backbone.View.extend({
     el: '#editor',
     initialize: function(broker){
        this.$userId = this.$('#userId');
     },
     add: function() {
       // publish an event ...
       var user = new User({id: this.$userId().val()});
       Backbone.EventBroker.trigger('users:add', user);
    }
};
// ...
```

### Creating namespaced EventBrokers
The `EventBroker` API can be used to create and retrieve any number of specific namespaced `EventBrokers`. A namespaced `EventBroker` ensures that all events are published and subscribed against a specific namespace.

Namespaced `EventBrokers` are retrieved via `Backbone.EventBroker.get([namespace])`. If an `EventBroker` has not been created for the given namespace, it will be created and returned. All subsequent retrievals will return the same `EventBroker` instance for the specified namespace; i.e. only one unique `EventBroker` is created per namespace.

``` javascript
var Users = Backbone.Collection.extend{{
    // use the 'users' broker
    usersBroker: Backbone.EventBroker.get('users'),

    initialize: function(broker){
      this.usersBroker.on('add', this.add, this);
    },
    add: function(user) {
      console.log(user.id);
    }
};

var UserEditor = Backbone.View.extend({
    el: '#editor',
    // use the 'users' broker
    usersBroker: Backbone.EventBroker.get('users'),

    // also use the 'roles' broker
    rolesBroker : Backbone.EventBroker.get('roles'),

    initialize: function(broker){
      this.$userId = this.$('#userId');
    },
    add: function() {
      // publish an event
      var user = new User({id: this.$userId().val()});
      this.usersBroker.trigger('add', user);
    }
};
```

Since namespaced `EventBrokers` ensure events are only piped thru the `EventBroker` of the given namespace, it is not necessary to prefix event names with the specific namespace to which they belong. While this can simplify implementation code, you can still prefix event names to aid in readability if desired.

``` javascript
var Users = Backbone.Collection.extend{{
    // use the 'users' broker
    userBroker: Backbone.EventBroker.get('users'),

    initialize: function(broker){
      // prefix the namespace if desired
      this.userBroker.on('users:add', this.add, this);
    },
    add: function(user) {
      console.log(user.id);
    }
};

var UserEditor = Backbone.View.extend({
    el: '#editor',
    // use the 'users' broker
    usersBroker: Backbone.EventBroker.get('users'),

    // also use the unique 'roles' broker
    rolesBroker: Backbone.EventBroker.get('roles'),

    initialize: function(broker){
      this.$userId = this.$('#userId');
    },
    add: function() {
      // publish an event
      var user = new User({id: this.$userId().val()});
      // prefix the namespace if desired
      this.usersBroker.trigger('users:add', user);
    }
};
```

### Registering Interests
Modules can register events of interest with an `EventBroker` via the default '[on](http://documentcloud.github.com/backbone/#Events-on "Title")' method or the `register` method. The `register` method allows for registering multiple event/callback mappings for a given context in a manner similar to that of the [events hash](http://documentcloud.github.com/backbone/#View-extend "Title") in a Backbone.View.

``` javascript
// Register event/callbacks based on a hash and associated context
var Users = Backbone.Collection.extend({
    initialize: function() {
      Backbone.EventBroker.register({
        'user:select'   : 'select',
        'user:deselect' : 'deselect',
        'user:edit'     : 'edit',
        'user:update'   : 'update',
        'user:remove'   : 'remove'
      }, this );
    },
    select: function() { ... },
    deselect: function() { ... },
    edit: function() { ... },
    update: function() { ... },
    remove: function() { ... }
});
```

Alternately, Modules can simply define an "interests" property containing particular event/callback mappings of interests and register themselves with an `EventBroker`

``` javascript
// Register event/callbacks based on a hash and associated context
var Users = Backbone.Collection.extend({
    // defines events of interest and their corresponding callbacks
    this.interests: {
      'user:select'   : 'select',
      'user:deselect' : 'deselect',
      'user:edit'     : 'edit',
      'user:update'   : 'update',
      'user:remove'   : 'remove'
    },
    initialize: function() {
      // register this object with the EventBroker
      Backbone.EventBroker.register( this );
    },
    select: function() { ... },
    deselect: function() { ... },
    edit: function() { ... },
    update: function() { ... },
    remove: function() { ... }
});
```

Modules can use different namespaced `EventBrokers` for different things...

``` javascript
// Register event/callbacks with different EventBrokers...
var CartView = Backbone.View.extend({
    // Reference the 'items' EventBroker...
    itemsBroker: Backbone.EventBroker.get('items'),

    // Reference the 'inventory' EventBroker...
    inventoryBroker: Backbone.EventBroker.get('inventory'),

    initialize: function() {
      // register events/callbacks with 'items' EventBroker...
      this.itemsBroker.register({
        'add'      : 'add',
        'update'   : 'update',
        'remove'   : 'remove'
      }, this );
      // register events/callbacks with 'inventory' EventBroker...
      this.inventoryBroker.register({
        'select'   : 'select',
        'deselect' : 'deselect',
        'edit'     : 'edit'
      }, this );
    },
    add: function() { ... },
    update: function() { ... },
    remove: function() { ... },
    select: function() { ... },
    deselect: function() { ... },
    edit: function() { ... }
});
```

### Determining if an EventBroker has been created
To test if an `EventBroker` has been created for a given `namespace`, invoke the `has` method:

``` javascript
// determines if an event broker for the given namespace exists
var EventBroker = Backbone.EventBroker;
EventBroker.get('roles'); // returns the 'roles' EventBroker
EventBroker.has('roles'); //true
EventBroker.has('users'); //false
```


### Destroying an EventBroker
To destroy an existing `EventBroker` for a given `namespace`, invoke the `destroy` method:

``` javascript
// deletes the event broker for the given namespace
var EventBroker = Backbone.EventBroker;
EventBroker.get('permissions');
EventBroker.destroy('permissions'); // returns the 'permissions' EventBroker
EventBroker.has('permissions'); //false
```


### Destroying all EventBrokers
To destroy all existing `EventBrokers`, invoke the `destroy` method with no arguments:

``` javascript
// deletes the event broker for the given namespace
var EventBroker = Backbone.EventBroker;
EventBroker.get('permissions'); // returns the 'permissions' EventBroker
EventBroker.get('users'); // returns the 'users' EventBroker
EventBroker.get('roles'); // returns the 'roles' EventBroker
EventBroker.destroy();

EventBroker.has('permissions' ); //false
EventBroker.has('users'); //false
EventBroker.has('roles'); //false
```
