var monthName = _.template("<% switch (month) {" +
    "case 1: print('Gennaio'); break;" +
    "case 2: print('Febbraio'); break;" +
    "case 3: print('Marzo'); break;" +
    "case 4: print('Aprile'); break;" +
    "case 5: print('Maggio'); break;" +
    "case 6: print('Giugno'); break;" +
    "case 7: print('Luglio'); break;" +
    "case 8: print('Agosto'); break;" +
    "case 9: print('Settembre'); break;" +
    "case 10: print('Ottobre'); break;" +
    "case 11: print('Novembre'); break;" +
    "case 12: print('Dicembre'); break;" +
"} %>");

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

    fillMonthSelectOptions: function() {
        var monthSelector = this.$el.find('#month');
        monthSelector.empty();
        this.collection.each(function(payroll) {
           monthSelector.prepend($('<option/>')
               .val(payroll.get('id'))
               .text(monthName({month: payroll.get('month')}) + ' ' + payroll.get('year')));
        });
    }
});

$(document).ready(function () {
    var main = new MainView({
        collection: new PayrollCollection()
    });
});
