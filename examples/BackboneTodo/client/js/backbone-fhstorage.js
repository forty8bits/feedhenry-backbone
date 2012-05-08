/**
 * Backbone FeedHenry (local) Adapter
 * 
 * This is an adaptation of Backbone.localStorage, edited to work with the
 * asynchronous FeedHenry local data storage API.
 */
 
 
/* HELPER FUNCTIONS ----------------------------------------------------------*/

var data = []; // May be removed (originally uses this.data in localStorage)

function fhGet(theKey, callback) {
    $fh.data({
        key: theKey
    }, callback, function (msg, err) {
        $fh.log('ERROR: ' + msg);
    });
}

function fhPut(theKey, theVal, callback) {
    $fh.data({
        act: 'save',
        key: theKey,
        val: theVal
    }, callback, function (msg, err) {
        $fh.log('ERROR: ' + msg);
    });
}

// Generate four random hex digits (for GUIDs).
function S4() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
}

// Generate a pseudo-GUID by concatenating random hexadecimal.
function guid() {
    return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
}

/* Our Store is represented by a single JS object in FeedHenry's data store.
   Create it with a meaningful name, like the name you'd give a table. */
var Store = function (name) {
        this.name = name;
        fhGet(this.name, function (res) {
            // Really need to test whether this async method will cut it.
            data = (res.val && JSON.parse(res.val)) || {};
        });
        
        // This may not be necessary, test.
        // _.delay(function () {}, 1000);
    };

_.extend(Store.prototype, {

    // Save the current state of the Store to the FeedHenry local data store.
    save: function () {
        fhPut(this.name, JSON.stringify(data));
        
        // Same as above; may not be needed.
        // _.delay(function () {}, 1000);
    },

    /* Add a model, giving it a (hopefully) unique GUID, if it doesn't already
       have an id of it's own. */
    create: function (model) {
        if (!model.id) model.set(model.idAttribute, guid());
        data[model.id] = model;
        this.save();
        return model;
    },

    // Update a model by replacing its copy in`this.data`.
    update: function (model) {
        data[model.id] = model;
        this.save();
        return model;
    },

    // Retrieve a model from `this.data` by id.
    find: function (model) {
        return data[model.id];
    },

    // Return the array of all models currently in storage.
    findAll: function () {
        return _.values(data);
    },

    // Delete a model from `this.data`, returning it.
    destroy: function (model) {
        delete data[model.id];
        this.save();
        return model;
    }

});

/* Override Backbone.sync to use delegate to the model or collection's
   FeedHenry data store property, which should be an instance of Store. */
Backbone.sync = function (method, model, options) {

    var resp;
    var store = model.fhStorage || model.collection.fhStorage;

    switch (method) {
    case "read":
        resp = model.id ? store.find(model) : store.findAll();
        break;
    case "create":
        resp = store.create(model);
        break;
    case "update":
        resp = store.update(model);
        break;
    case "delete":
        resp = store.destroy(model);
        break;
    }

    if (resp) {
        options.success(resp);
    } else {
        options.error("Record not found");
    }
};
