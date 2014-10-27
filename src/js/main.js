(function () {
    /* global WireLogParser:false */
    'use strict';

    var vm = (function () {
        var getPretty = function () {
            var self = this;
            var data = self.$data;

            // Initialize to redraw when data.logs is changed
            _(Object.keys(data.logs)).forEach(function (key) {
                data.logs.$delete(key);
            });

            var wireLogParser = new WireLogParser({
                'doesRemoveNewLine': true,
                'bePrettyJSON': data.prettyJSON,
            });

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

                var logText = '>>>>>>>> REQUEST\n' + requestLog +
                              '<<<<<<<< RESPONSE\n' + responseLog;

                data.logs.$add(key, logText);
            });
        };

        return new Vue({
            el: '#main',
            data: {
                'logs': {},
                'prettyJSON': true
            },
            methods: {
                getPretty: getPretty
            },
            ready: getPretty
        });
    }());

    return vm;
}());

