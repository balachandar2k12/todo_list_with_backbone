
$(function(){

	var Todo = Backbone.Model.extend({
  
     // Default attributes for the todo item.
    	defaults: function() {
     	 return {
       	     title: "No Name item...",
        	   order: Todos.item_order(),
       	     done: false
      	 };
     	},
 
 
    	initialize: function() {
      		if (!this.get("title")) {
            this.set({"title": this.defaults().title});
            }
        },

    // Toggle the  state of this todo item.
    	toggle: function() {
          this.save({done: !this.get("done")});
        }

    });


    //collection
  var TodoList = Backbone.Collection.extend({
    	model: Todo,
    	localStorage: new Backbone.LocalStorage("todos-backbone"),

   // Filter the list
    	done: function() {
      		return this.filter(function(todo){ return todo.get('done'); });
   		 },

       	remaining: function() {
     		 return this.without.apply(this, this.done());
    	},

    
    	item_order: function() {
      		if (!this.length) return 1;
     		 return this.last().get('order') + 1;
    	}

    

    });
    

    var Todos = new TodoList;
   
   
   var TodoView = Backbone.View.extend({
   tagName:  "li",
    template: _.template($('#item-template').html()),

        events: {
      "click .toggle"   : "toggleDone",
      "click a.destroy" : "clear"     
    },
    initialize: function() {
      this.listenTo(this.model, 'change', this.render);//similar to on method in side the models
      this.listenTo(this.model, 'destroy', this.remove);
    },
    render: function() {
      this.$el.html(this.template(this.model.toJSON()));
      this.$el.toggleClass('done', this.model.get('done'));
      return this;
    },

    toggleDone: function() {
      this.model.toggle();
    },

  // Remove the item, destroy the model.
    clear: function() {
      this.model.destroy();
    }

  });
   
    

//  Application view
  
  var AppView = Backbone.View.extend({

    el: $("#todoapp"),
    list_status: _.template($('#stats-template').html()),
    events: {
      "keypress #new-todo":  "createOnEnter",
      "click #clear-completed": "clearCompleted",
      "click #toggle-all": "toggleAllComplete"
    },

    initialize: function() {

      this.input = this.$("#new-todo");
  
      this.listenTo(Todos, 'add', this.addOne);
      this.listenTo(Todos, 'reset', this.addAll);
      this.listenTo(Todos, 'all', this.render);

      this.footer = this.$('footer');
      this.main = $('#main');

      Todos.fetch();
    },

    // Re-rendering the App 
    
    render: function() {
      var done = Todos.done().length;
      var remaining = Todos.remaining().length;

      if (Todos.length) {
        this.main.show();
        this.footer.show();
        this.footer.html(this.list_status({done: done, remaining: remaining}));
      } 
      else 
      {
        this.main.hide();
        this.footer.hide();
      }

      
    },

   
    addOne: function(todo) {
      var view = new TodoView({model: todo});
      this.$("#todo-list").append(view.render().el);
    },

    
    addAll: function() {
      Todos.each(this.addOne);
    },

    createOnEnter: function(e) {
      if (e.keyCode != 13) return;
      if (!this.input.val()) return;

      Todos.create({title: this.input.val()});
      this.input.val('');
    },

    // Clear all done todo items and destroying their models.
    clearCompleted: function() {
      _.invoke(Todos.done(), 'destroy');
      return false;
    },

    toggleAllComplete: function () {
      var done = this.allCheckbox.checked;
      Todos.each(function (todo) { todo.save({'done': done}); });
    }

  });

  //application view
  var App = new AppView;

});    