(function () {
    /* global WireLogParser:false */
    'use strict';

    var l = Location.parse(document.location.href);

    var vm = (function () {
        var getPretty = function () {
            var self = this;
            var data = self.$data;

            // Initialize to redraw when data.logs is changed
            _(Object.keys(data.logs)).forEach(function (key) {
                data.logs.$delete(key);
            });

            var wireLogParser = new WireLogParser({
                'removeNewLine': true,
                'bePrettyJSON': data.prettyJSON,
                'decodeBytes': data.decodeBytes
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
                'prettyJSON': l.params('prettyJSON') === 'true' ? true : false,
                'decodeBytes': l.params('decodeBytes') === 'true' ? true : false
            },
            methods: {
                getPretty: getPretty,
                changeState: function (modelName) {
                    var kv;
                    var params = {};
                    var search = document.location.search;
                    if (search) {
                        _(search.substring(1).split('&')).forEach(function (query) {
                            kv = query.split('=');
                            params[kv[0]] = kv[1];
                        });
                    }

                    var data = this.$data;
                    var flag = data[modelName];
                    params[modelName] = flag;

                    var queries = [];
                    _(params).forEach(function (value, key) {
                        queries.push(key + '=' + value);
                    });

                    history.pushState(null,null, '?' + queries.join('&'));
                }
            },
            ready: getPretty
        });
    }());

    return vm;
}());

