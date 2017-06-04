var AppView = Backbone.View.extend({
    el: '#content',
    initialize: function() {
        this.render();
    },
    render: function() {
        this.$el.html("Ciao ciao ciao");
    }
});

$(document).ready(function () {
    var view = new AppView();
});
