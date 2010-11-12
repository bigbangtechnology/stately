var MyView = Backbone.View.extend(Stately).extend({
  event_order_helper: [],
  
  states: {
    STATE_A: "state_a",
    STATE_B: "state_b",
    STATE_C: "state_c"
  },
  
  transitions: {
    state_b: {
      
    },
    
    state_c: {
      before_transition: function() {
       this.event_order_helper.push("before_transition");
      },
      
      after_transition: function() {
        this.event_order_helper.push("after_transition");
      }
    }
  },
  
  getState: function() {
    return this.nextState;
  },
  
  setState: function(state) {
    this.nextState = state;
    
    this.revalidateState(function() {
      this.event_order_helper.push("during_transition");
    });
  }
});

var ViewNoTransition = Backbone.View.extend(Stately).extend({
  setState: function(state) {
    this.nextState = state;
    
    this.revalidateState();
  },
  
  getState: function() {
    return this.nextState;
  }
});

var ViewWithPreviousClass = Backbone.View.extend(Stately).extend({
  className: "previousClass",
  
  setState: function(state) {
    this.nextState = state;
    
    this.revalidateState();
  },
  
  getState: function() {
    return this.nextState;
  }
});

var ViewWithBasicFunction = Backbone.View.extend(Stately).extend({
  transition_callback_helper: "",
  
  transitions: {
    state_a: function() {
      this.transition_callback_helper = "state_a";
    },
    
    state_b: function() {
      this.transition_callback_helper = "state_b";
    }
  },
  
  setState: function(state) {
    this.nextState = state;
    
    this.revalidateState();
  },
  
  getState: function() {
    return this.nextState;
  }
});

$(document).ready(function() {

  module("Core");

 test("should move into states that don't have transitions defined", function() {
   var view = new MyView({ model: new Backbone.Model() });
 
   equals(view.transitions[view.states.STATE_A], null, "should be no normal transitions defined");
 
   view.setState(view.states.STATE_A);
 
   equals(view.currentState, view.states.STATE_A, "should enter the state with no errors");
 });

 test("should move into states that have transitions defined but not all transitions", function(){
   var view = new MyView({ model: new Backbone.Model() });
 
   ok(view.transitions[view.states.STATE_B], "there should be transitions defined for state b");
 
   view.setState(view.states.STATE_B);
 
   equals(view.currentState, view.states.STATE_B, "should enter the state with no errors");    
 });

 test("should run through the transition life_cycle in order", function() {
   var view = new MyView({ model: new Backbone.Model() });
   view.event_order_helper = [];
 
   view.setState(view.states.STATE_C);
 
   var event_order = view.event_order_helper;
 
   equals(event_order[0], "before_transition");
   equals(event_order[1], "during_transition");
   equals(event_order[2], "after_transition");

 });

 test("should not fail if a view does not define any transitions", function() {
   var view = new ViewNoTransition({ model: new Backbone.Model() });
 
   view.setState("someState");
 
   equals(view.currentState, "someState", "should go into the state correctly");
 });
 
 test("should execute basic transision if its specified as a function", function() {
   var view = new ViewWithBasicFunction({ model: new Backbone.Model() });
   
   view.setState("state_a");
   
   equals(view.transition_callback_helper, "state_a");
   
   view.setState("state_b");
   
   equals(view.transition_callback_helper, "state_b");
 });
 
 module("CSS");
 
 test("should update the element to have the current state as a class", function() {
   var view = new MyView({ model: new Backbone.Model() });
 
   view.setState(view.states.STATE_A);
 
   ok($(view.el).hasClass(view.states.STATE_A), "should have the css class of the current state");
 });

 test("should remove old states from element when transitioning out of them", function() {
   var view = new MyView({ model: new Backbone.Model() });
 
   view.setState(view.states.STATE_A);
   view.setState(view.states.STATE_B);
 
   ok(!$(view.el).hasClass(view.states.STATE_A), "should not have the old state as a css class");
 });
 
 
 test("should not remove classNames assigned by Backbone.View or anything else", function() {
   var view = new ViewWithPreviousClass({ model: new Backbone.Model() });
   
   ok($(view.el).hasClass("previousClass"));
   
   view.setState("someState");
   
   ok($(view.el).hasClass("previousClass"), "should not remove previousClass");
 });

});
