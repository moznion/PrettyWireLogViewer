$(function () {
    /* global WireLogParser:false */
    'use strict';

    var vm = new Vue({
        el: '#main',
        data: {
            'logs': {},
            'Object': Object,
        },
        methods: {
            getPretty: function () {
                data.logs = {}; // Initialize

                var self = this;
                var data = self.$data;

                var wireLogParser = new WireLogParser();

                var logs = {};
                _(wireLogParser.parse(data.wireLog)).forEach(function (log, index) {
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

                    logs[index] = {
                        'requestLog': requestLog,
                        'responseLog': responseLog
                    };
                });
                data.logs = logs;
            }
        }
    });

    return vm;
});

