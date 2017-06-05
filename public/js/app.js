var LeaveCollection = Backbone.Collection.extend({
    url: '/api/leaves'
});

var PayrollCollection = Backbone.Collection.extend({
    url: '/api/payrolls'
});

var MainView = Backbone.View.extend({
    el: '#main',

    initialize: function() {
        this.listenTo(this.collection, 'reset', this.fillMonthSelectOptions);
        this.collection.fetch({reset: true});

    },

    events: {
        'change #month': 'showMonthData'
    },

    showMonthData: function() {
        var monthSelector = this.$el.find('#month');
        var monthName = monthSelector.find('option:selected').text();
        var month = this.collection.get(monthSelector.val());

        this.$el.find('#monthTitle').text(monthName);
        this.$el.find('#monthVacations').text(month.get('vacations'));
        this.$el.find('#monthLeaves').text(month.get('leaves'));
    },

    fillMonthSelectOptions: function() {
        var monthName = _.template($('#monthName').html());
        var monthSelector = this.$el.find('#month');

        monthSelector.empty();
        this.collection.each(function(payroll) {
           monthSelector.prepend($('<option/>')
               .val(payroll.get('id'))
               .text(monthName({month: payroll.get('month')}) + ' ' + payroll.get('year')));
        });

        monthSelector.find('option').first().attr('selected', 'selected');
        monthSelector.change();
    }
});

var LastInsertedView = Backbone.View.extend({
    tagName: 'li',

    events: {
        'click .remove': 'removeItem'
    },

    removeItem: function() {
        this.model.destroy();
        this.remove();
    },

    render: function() {
        var template = _.template($('#lastInsertedItem').html());

        this.$el.html(template(this.model.toJSON()));
        return this;
    }
});

var SidebarView = Backbone.View.extend({
    el: '#sidebar',

    events: {
        'click #create': 'addLeave'
    },

    initialize: function(options) {
        this.maxLastInsertedItems = options.maxInsertedItems;
        if (this.maxLastInsertedItems === undefined)
            this.maxLastInsertedItems = 10;

        this.listenTo(this.collection, 'reset', this.renderElements);
        this.listenTo(this.collection, 'add', this.addElement);
        this.listenTo(this.collection, 'destroy', this.onElementRemoved);

        this.collection.fetch({reset: true});
    },

    renderElements: function() {
        var lastInserted = this.$el.find('#lastInserted ul');
        lastInserted.empty();

        var start = Math.max(0, this.collection.length - this.maxLastInsertedItems);
        for (let i = this.collection.length - 1; i >= start; i--)
        {
            var view = new LastInsertedView({model: this.collection.at(i)});
            lastInserted.append(view.render().el);
        }
    },

    onElementRemoved: function() {
        var lastInserted = this.$el.find('#lastInserted ul');
        if (lastInserted.find('li').length < this.maxLastInsertedItems + 1)
        {
            if (this.collection.length >= this.maxLastInsertedItems)
            {
                var view = new LastInsertedView({model: this.collection.at(this.collection.length - this.maxLastInsertedItems)});
                lastInserted.append(view.render().el);
            }
        }
    },

    addElement: function(leave) {
        var view = new LastInsertedView({model: leave});
        var lastInserted = this.$el.find('#lastInserted ul');

        lastInserted.prepend(view.render().el);
        var elements = lastInserted.find('li');
        if (elements.length > this.maxLastInsertedItems)
            elements.last().remove();
    },

    addLeave: function() {
        var wrongDateError = this.$el.find('#wrongDateFormat');
        var zeroHoursError = this.$el.find('#zeroHours');
        var date = this.$el.find('#date');
        var hours = this.$el.find('#hours');
        var parts = date.val().split('/');
        var duration = hours.val();

        wrongDateError.hide();
        zeroHoursError.hide();

        if (parts.length != 3)
        {
            wrongDateError.css('display', 'block');
            return;
        }

        if (duration == 0)
        {
            zeroHoursError.css('display', 'block');
            return;
        }

        date.val('');
        hours.val(0);

        this.collection.create({
            day: parts[0],
            month: parts[1],
            year: parts[2],
            hours: duration,
            vacation: this.$el.find('#type').val()
        });
    }
});

var HighlightView = Backbone.View.extend({
    el: '#highlight',

    initialize: function(options) {
        this.leaveCollection = options.leaveCollection;
        this.payrollCollection = options.payrollCollection;

        this.vacations = 0;
        this.leaves = 0;

        this.listenTo(this.payrollCollection, 'reset', this.update);

        this.render();
    },

    update: function() {
        var lastMonth = this.payrollCollection.at(-1);
        this.vacations = lastMonth.get('vacations');
        this.leaves = lastMonth.get('leaves');

        this.render();
    },

    render: function() {
        this.$el.find('#currentVacations').text(this.vacations);
        this.$el.find('#currentLeaves').text(this.leaves);
    }
});

$(document).ready(function () {
    var leaveCollection = new LeaveCollection();
    var payrollCollection = new PayrollCollection();

    var highlight = new HighlightView({
        leaveCollection: leaveCollection,
        payrollCollection: payrollCollection
    });

    var main = new MainView({
        collection: payrollCollection
    });

    var sidebar = new SidebarView({
        collection: leaveCollection,
        maxInsertedItems: 10
    });
});
