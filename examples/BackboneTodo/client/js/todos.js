/**
 * An implementation of the famous TodoMVC app on the FeedHenry platform, using
 * Backbone.js as well as a FeedHenry specific local storage override of
 * backbone.sync, based on Backbone.localStorage.
 */

$fh.ready(function() {
  
  var bigDeleteButton = $('#clear-complete');
  
  bigDeleteButton.on('touchstart', function() {
    $(this).addClass('touching');
  });
  
  bigDeleteButton.on('touchend', function() {
    $(this).removeClass('touching');
  })

  /* MODELS ------------------------------------------------------------------*/

  // Our basic Todo model has title, order, and done attributes.
  var Todo = Backbone.Model.extend({
    defaults: function() {
      return {
        title: "empty todo...",
        order: Todos.nextOrder(),
        done: false
      };
    },

    // Ensure that each todo created has a title.
    initialize: function() {
      if (!this.get("title")) {
        this.set({"title": this.defaults().title});
      }
    },

    // Toggle the `done` state of this todo item.
    toggle: function() {
      this.save({done: !this.get("done")});
    },

    // Remove this Todo from storage and delete its view.
    clear: function() {
      this.destroy();
    }
  });

  /* COLLECTIONS -------------------------------------------------------------*/

  var TodoList = Backbone.Collection.extend({

    model: Todo,

    // Save all of the todo items under the 'todos-backbone' namespace.
    fhStorage: new Store("todos-backbone"),

    // Filter down the list of all todo items that are finished.
    done: function() {
      return this.filter(function(todo){ return todo.get('done'); });
    },

    // Filter down the list to only todo items that are still not finished.
    remaining: function() {
      return this.without.apply(this, this.done());
    },

    // We keep the Todos in sequential order, despite being saved by unordered
    // GUID in the database. This generates the next order number for new items.
    nextOrder: function() {
      if (!this.length) return 1;
      return this.last().get('order') + 1;
    },

    // Todos are sorted by their original insertion order.
    comparator: function(todo) {
      return todo.get('order');
    }

  });

  // Create our global collection of todos.
  var Todos = new TodoList;

  /* VIEWS -------------------------------------------------------------------*/

  // The DOM element for a todo item...
  var TodoView = Backbone.View.extend({

    //... is a list tag. We also add a class to each list item.
    tagName:  "li",
    className: 'todo-item',

    // Cache the template function for a single item.
    template: _.template($('#todo-tpl').html()),

    // The DOM events specific to an item.
    events: {
      'click .todo-label': 'toggleDone'
    },

    /* The TodoView listens for changes to its model, re-rendering. Since
       there's a one-to-one correspondence between a Todo and a TodoView in this
       app, we set a direct reference on the model for convenience. */
    initialize: function() {
      this.model.bind('change', this.render, this);
      this.model.bind('destroy', this.remove, this);
    },

    // Re-render the titles of the todo item.
    render: function() {
      this.$el.html(this.template(this.model.toJSON()));
      this.$el.toggleClass('done', this.model.get('done'));
      return this;
    },

    // Toggle the done state of the model.
    toggleDone: function() {
      this.model.toggle();
    },

    // Remove the item, destroy the model.
    clear: function() {
      this.model.clear();
    }

  });

  /* THE APP ITSELF ----------------------------------------------------------*/

  // Our overall AppView is the top-level piece of UI.
  var AppView = Backbone.View.extend({

    // Instead of generating a new element, bind to the existing HTML.
    el: $("#main-container"),

    // Delegated events for creating new items, and clearing completed ones.
    events: {
      "keypress #new-todo":  "createOnEnter",
      "click #clear-complete": "clearCompleted"
    },

    // At initialization we bind to the relevant events on the Todos collection.
    initialize: function() {

      this.input = this.$("#new-todo");

      Todos.bind('add', this.addOne, this);
      Todos.bind('reset', this.addAll, this);
      Todos.bind('all', this.render, this);

      // Kick things off by loading any preexisting todos.
      Todos.fetch();
    },

    render: function() {
      var done = Todos.done().length;
      
      // Only show the red delete button if there's something to delete.
      var deleteButton = $('#clear-complete');
      if (done) deleteButton.css('opacity', 1);
      else deleteButton.css('opacity', 0);
    },

    // We prepend here instead of append, for the mobile interface.
    addOne: function(todo) {
      var view = new TodoView({model: todo});
      this.$("#todo-list").prepend(view.render().el);
    },

    // Add all items in the Todos collection at once.
    addAll: function() {
      Todos.each(this.addOne);
    },

    // If you hit return in the input field, create new Todo model.
    createOnEnter: function(e) {
      if (e.keyCode != 13) return;
      if (!this.input.val()) return;
      
      Todos.create({title: this.input.val()});
      this.input.val('');
    },

    // Clear all done todo items, destroying their models.
    clearCompleted: function() {
      _.each(Todos.done(), function(todo){ todo.clear(); });
      return false;
    }
  });

  // Finally, we kick things off by creating the App.
  var App = new AppView;
});
