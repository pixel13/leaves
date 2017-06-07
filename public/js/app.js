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
        this.listenTo(this.collection, 'add', this.onAdd.bind(this));
        this.collection.fetch({success: this.checkIfNewPayrollMustBeGenerated.bind(this), reset: true});
    },

    onAdd: function() {
        this.collection.fetch({success: this.checkIfNewPayrollMustBeGenerated.bind(this), reset: true});
    },

    events: {
        'change #month': 'showMonthData',
        'click #generateNextMonth a': 'generateNewPayroll'
    },

    checkIfNewPayrollMustBeGenerated: function() {
        var monthName = _.template($('#monthName').html());
        var last = this.collection.at(-1);
        var month = last.get('month');
        var year = last.get('year');
        var next = this.followingMonth(month, year);
        if (!this.isMonthEnded(next.month, next.year))
            return;

        var nextMonthMessage = this.$el.find('#generateNextMonth');
        nextMonthMessage.find('#nextMonth').text(monthName({month: next.month}) + ' ' + next.year);
        nextMonthMessage.show();
    },

    showMonthData: function() {
        var monthSelector = this.$el.find('#month');
        var monthName = monthSelector.find('option:selected').text();
        var month = this.collection.get(monthSelector.val());

        this.$el.find('#monthTitle').text(monthName);
        this.$el.find('#monthVacations').text(month.get('vacations'));
        this.$el.find('#monthLeaves').text(month.get('leaves'));
        this.$el.find('#usedVacations').text(month.get('used_vacations'));
        this.$el.find('#usedLeaves').text(month.get('used_leaves'));
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
    },

    generateNewPayroll: function() {
        this.$el.find('#generateNextMonth').hide();

        var last = this.collection.at(-1);
        var month = last.get('month');
        var year = last.get('year');
        var next = this.followingMonth(month, year);

        console.log('Genero i dati della busta paga per il mese ' + next.month + '/' + next.year);

        var nextMonth = this.calculateNextMonth(month, year, last);
        nextMonth.month = next.month;
        nextMonth.year = next.year;

        this.collection.create(nextMonth);
    },

    // Leaves and vacations are calculated on the previous month, so we assume that month and year are referring to the previous month
    // Every month adds 8,67 hours of leaves and 14,67 hours of vacations (it's actually 8,66666... and 14,666666....),
    // So in December (i.e. when the previous month is 11) we should only add 8.63 or 14.63 to have the rounded total
    // Because in the whole year the total number of leaves must be 104 hours and the total number of vacations must be 176 hours
    calculateNextMonth: function(month, year, lastMonth) {
        var usedLeaves = this.getTotal('leaves', month, year);
        var usedVacations = this.getTotal('vacations', month, year);

        var remainingLeaves = lastMonth.get('leaves') - usedLeaves;
        var remainingVacations = lastMonth.get('vacations') - usedVacations;

        // La cialtronaggine di chi fa le buste paga!
        /*if (month == 11)
        {
            remainingLeaves += 8.63;
            remainingVacations += 14.63;
        }
        else
        {*/
            remainingLeaves += 8.67;
            remainingVacations += 14.67;
        //}

        return {
            leaves: remainingLeaves,
            vacations: remainingVacations,
            used_leaves: usedLeaves,
            used_vacations: usedVacations
        };
    },

    getTotal: function(what, month, year) {
        var isVacation = 0;
        if (what === 'vacations')
            isVacation = 1;

        var result = 0;
        var resultset = [];
        $.ajax({
            url: '/api/leaves/?month=' + month + '&year=' + year + '&vacation=' + isVacation,
            async: false,
            success: function(data) {
                resultset = data;
            }
        });

        for (let i = 0; i < resultset.length; i++)
        {
            result += resultset[i].hours;
        }

        return result;
    },

    isMonthEnded: function(month, year) {
        var following = this.followingMonth(month, year);
        var firstOfFollowing = new Date(following.year + '-' + following.month + '-1 00:00:00');

        return (firstOfFollowing.getTime() < new Date().getTime());
    },

    followingMonth: function(currentMonth, currentYear)
    {
        var year = currentYear;
        var month = currentMonth + 1;

        if (month > 12)
        {
            month = 1;
            year++;
        }

        return {
            month: month,
            year: year
        }
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
            day: parseInt(parts[0]),
            month: parseInt(parts[1]),
            year: parseInt(parts[2]),
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
        this.$el.find('#currentLeaves').text(this.leaves);
        this.$el.find('#currentVacations').text(this.vacations);
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
