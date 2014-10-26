(function () {
    /* global WireLogParser:false */
    'use strict';

    var vm = new Vue({
        el: '#main',
        data: {
            'logs': {}
        },
        methods: {
            getPretty: function () {
                var self = this;
                var data = self.$data;

                // Initialize to redraw when data.logs is changed
                _(Object.keys(data.logs)).forEach(function (key) {
                    data.logs.$delete(key);
                });

                var wireLogParser = new WireLogParser();

                var logs = {};
                _(wireLogParser.parse(data.wireLog)).forEach(function (log, key) {
                    if (log.isEmpty()) {
                        return;
                    }

                    var requestLog = '';
                    var responseLog = '';

                    if (!log.requestLog.isEmpty()) {
                        requestLog = log.requestLog.toString();
                    }

                    if (!log.responseLog.isEmpty()) {
                        responseLog = log.responseLog.toString();
                    }

                    data.logs.$add(key, {
                        'requestLog': requestLog,
                        'responseLog': responseLog
                    });
                });
            }
        }
    });

    return vm;
}());

