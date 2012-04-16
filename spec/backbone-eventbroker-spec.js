
describe( "Backbone.EventBroker", function()
{
	beforeEach( function()
	{
		this.addMatchers({
			toStrictlyEqual: function( expected ) {
				return this.actual === expected;
			}
		});
		Backbone.EventBroker.destroy();
	});

	describe( "The Broker API", function()
	{
		it( "should implement the Backbone.Events API", function()
		{
			_.forEach( Backbone.Events, function( method, name ) {
				expect( Backbone.EventBroker[ name ] ).toBeTruthy();
			}, this );
		});
	});
	
	describe( "Backbone.EventBroker namespace", function()
	{
		it( "should default to an empty string", function()
		{
			expect( Backbone.EventBroker.namespace ).toEqual( '' );
		});
	});
	
	describe( "Namespaced EventBroker namespaces", function()
	{
		it( "should be equal their unique namespace", function()
		{
			expect( Backbone.EventBroker.get( 'ns1' ).namespace ).toEqual( 'ns1' );
			expect( Backbone.EventBroker.get( 'ns2' ).namespace ).toEqual( 'ns2' );
		});
	});
	
	describe( "the get method", function()
	{
		it( "should create brokers which implement the Backbone.Events API", function()
		{
			var broker = Backbone.EventBroker.get( 'broker' );
			
			_.forEach( Backbone.Events, function( method, name ) {
				expect( broker[ name ] ).toBeTruthy();
			}, this );
		});
		
		it( "should create a unique broker per namespace", function()
		{
			var broker1 = Backbone.EventBroker.get( 'ns1' ),
				broker2 = Backbone.EventBroker.get( 'ns2' );
			
			expect( broker2 ).not.toStrictlyEqual( broker1 );
		});
		
		it( "should only create one unique broker per namespace", function()
		{
			var broker1 = Backbone.EventBroker.get( 'someBroker' ),
				broker2 = Backbone.EventBroker.get( 'someBroker' );
			
			expect( broker2 ).toEqual( broker1 );
		});	
	});
	
	describe( "The has method", function()
	{
		it( "should return false if a broker has not been created for the given namespace", function()
		{
			expect( Backbone.EventBroker.has( 'ns1' ) ).toBeFalsy();
		});
		
		it( "should return true if a broker has been created for the given namespace", function()
		{
			var broker1 = Backbone.EventBroker.get( 'ns1' );
			
			expect( Backbone.EventBroker.has( 'ns1' ) ).toBeTruthy();
		});
	});
	
	describe( "The destroy method", function()
	{
		describe( "When invoked with a specific namespace", function()
		{
			it( "should only delete the broker for the given namespace", function()
			{
				Backbone.EventBroker.get( 'ns1' ),
				Backbone.EventBroker.get( 'ns2' );
				
				Backbone.EventBroker.destroy( 'ns1' );
				
				expect( Backbone.EventBroker.has( 'ns1' ) ).toBeFalsy();
				expect( Backbone.EventBroker.has( 'ns2' ) ).toBeTruthy();
			});
		});
		
		describe( "When invoked with a multiple namespaces", function()
		{
			it( "should only delete the broker for the given namespace", function()
			{
				var EventBroker = Backbone.EventBroker;
				EventBroker.get( 'ns1' );
				EventBroker.get( 'ns2' );
				EventBroker.get( 'ns3' );
				EventBroker.get( 'ns4' );
				
				EventBroker.destroy( 'ns1' ).destroy( 'ns2' ).destroy( 'ns3' );
				
				expect( EventBroker.has( 'ns1' ) ).toBeFalsy();
				expect( EventBroker.has( 'ns2' ) ).toBeFalsy();
				expect( EventBroker.has( 'ns3' ) ).toBeFalsy();
				expect( EventBroker.has( 'ns4' ) ).toBeTruthy();
			});
		});
		
		describe( "When invoked with no arguments", function()
		{
			it( "should delete all brokers for all namespaces", function()
			{
				Backbone.EventBroker.get( 'ns1' ),
				Backbone.EventBroker.get( 'ns2' );
				
				Backbone.EventBroker.destroy();
				
				expect( Backbone.EventBroker.has( 'ns1' ) ).toBeFalsy();
				expect( Backbone.EventBroker.has( 'ns2' ) ).toBeFalsy();
			});
		});
	});
	
	describe( "interests", function()
	{
		beforeEach( function()
		{
			this.broker = Backbone.EventBroker;

			this.interests = {
				'users:add'   : 'add',
				'users:delete': 'remove'
			};
			this.user  = {id: '123'};
			this.users = { 
				users: {},
				add: function( user ){
					this.users[user.id] = user;
				},
				remove: function( user ){
					delete this.users[user.id];
				}
			};
			this.broker.off( 'users:add',    this.users.add, this.users );
			this.broker.off( 'users:delete', this.users.add, this.remove );
		});
		
		describe( "When registering explicit interests", function()
		{
			it( "should register all event/callback mappings", function()
			{
				this.broker.register( this.interests, this.users );
				
				this.broker.trigger( 'users:add', this.user );
				expect( this.users.users[ this.user.id ] ).toEqual( this.user );
				
				this.broker.trigger( 'users:delete', this.user );
				expect( this.users.users[ this.user.id ] ).toBeUndefined();
			});
		});
		
		describe( "When unregistering explicit interests", function()
		{
			it( "should unregister all event/callback mappings", function()
			{
				this.broker.unregister( this.interests, this.users );
				
				this.broker.trigger( 'users:add', this.user );
				expect( _.isEmpty( this.users.users ) ).toBeTruthy( this.user );
			});
		});
		
		describe( "When registering implied interests", function()
		{
			it( "should register all event/callback mappings", function()
			{
				this.users.interests = this.interests;
				
				this.broker.register( this.users );
				
				this.broker.trigger( 'users:add', this.user );
				expect( this.users.users[ this.user.id ] ).toEqual( this.user );
				
				this.broker.trigger( 'users:delete', this.user );
				expect( this.users.users[ this.user.id ] ).toBeUndefined();
			});
		});
		
		describe( "When unregistering implied interests", function()
		{
			it( "should unregister all event/callback mappings", function()
			{
				this.users.interests = this.interests;
				this.broker.register( this.users ).unregister( this.users );
				
				this.broker.trigger( 'users:add', this.user );
				expect( _.isEmpty( this.users.users ) ).toBeTruthy( this.user );
			});
		});
	});
});