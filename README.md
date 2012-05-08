# FeedHenry Backbone

This is a (really) early release of a backbone.localStorage based adapter for
the [FeedHenry](http://feedhenry.com/) mobile platform. The obligatory todo example app is also an
adaptation of TodoMVC for backbone.js, with a distinctly [Clear](http://www.realmacsoftware.com/clear/) twist on the UI,
just because I really like the style and want to see if something so smooth will
be possible through an HTML/CSS based mobile app. I'm optimistic that it will.

At the moment it's basic, and iffy... made over the course of 2 days as I learn
JavaScript (having previously used it mostly only through jQuery for simple
client side effects or ajax), in between work and a disgraceful amount of study
for upcoming college exams. After they're behind me, I plan on taking the
project back up and implementing more thorough backbone.sync replacements for
the FeedHenry local and cloud storage APIs, as well as developing a more robust
example application (or two) to show off what Backbone can make possible on the
platform.

---

## To Use

Basically the same as the localStorage backend, if you've ever used it. Just
give your models or collections an `fhStorage` property which refers to a new
`Store` object that you name sensibly. Like so:

```javascript
var TodoList = Backbone.Collection.extend({

    model: Todo,

    // Save all of the todo items under the 'todos-backbone' namespace.
    fhStorage: new Store("todos-backbone"),
````

And then carry on as usual... really is that simple. For the meantime this is
only local, but soon there'll be work underway on adapters for the FeedHenry
cloud database storage, and a cleanup of this one here.

Enjoy.

---

*Obligatory screenshot of early build... (ignore the ugly button at the bottom!)*

![FeedHenry Backbone TodoMVC - early days](http://dl.dropbox.com/u/200616/todowip.png)
