var utf8 = utf8; // import from external

var WireLogParser = (function () {
    'use strict';

    function WireLogParser(arg) {
        var removeNewLine = arg.removeNewLine,
            bePrettyJSON = arg.bePrettyJSON,
            decodeBytes = arg.decodeBytes;

        if (removeNewLine !== true) {
            removeNewLine = false;
        }

        if (bePrettyJSON !== true) {
            bePrettyJSON = false;
        }

        if (decodeBytes !== true) {
            decodeBytes = false;
        }

        this.removeNewLine = removeNewLine;
        this.bePrettyJSON = bePrettyJSON;
        this.decodeBytes = decodeBytes;
    }

    var WireLogUnit = (function () {
        function WireLogUnit(arg) {
            this.logs = [];

            this.bePrettyJSON = true;
            if (arg.bePrettyJSON !== true) {
                this.bePrettyJSON = false;
            }

            this.decodeBytes = true;
            if (arg.decodeBytes !== true) {
                this.decodeBytes = false;
            }

            this.isContentTypeJSON = false;

            this.httpMethod = '';
            this.endPoint = '';
            this.host = '';
            this.postParameter = '';
        }

        WireLogUnit.prototype.add = function (arg) {
            var log = {
                'log': arg.log,
                'type': arg.type,
                'direction': arg.direction
            };
            var matches;

            if (log.type === 'header') {
                log.headerName = arg.headerName;

                if (
                    log.headerName.match(/^content-type$/i) &&
                    arg.log.match(/application\/json/i)
                ) {
                    this.isContentTypeJSON = true;
                }

                if (log.headerName === 'Host' || log.headerName === 'host') {
                    this.host = log.log;
                }
            }
            else if (log.type === 'http-request') {
                matches = log.log.match(/^(\S+) (\S+)/);
                if (matches) {
                    this.httpMethod = matches[1];
                    this.endPoint = matches[2];
                }
            }
            else if (log.direction === 'request' && log.type === 'body') {
                // extract post parameters from request body
                if (this.httpMethod === 'POST') {
                    this.postParameter += log.log.replace(/"/g, "\\\"");
                }
            }

            this.logs.push(log);
        };

        WireLogUnit.prototype.toString = function () {
            var str = '';
            var logsLength = this.logs.length;
            var i, line;

            var reEncodedBytes = /(?:\[0x[0-9a-f]{2}\])+/g;

            var decode = function (str) {
                var i, matches, matchesLen, byteString;
                var reBytes = /0x[0-9a-f]{2}/g;
                try {
                    matches = str.match(reBytes);
                    matchesLen = matches.length;
                    byteString = '';
                    for (i = 0; i < matchesLen; i++) {
                        byteString += String.fromCharCode(parseInt(matches[i], 16));
                    }

                    return utf8.decode(byteString);
                } catch (e) {
                    return str;
                }
            };

            var log;
            for (i = 0; i < logsLength; i++) {
                log = this.logs[i];
                line = log.log;

                if (typeof log.headerName !== 'undefined') {
                    line = log.headerName + ': ' + line;
                }

                if (this.bePrettyJSON && this.isContentTypeJSON && log.type === 'body') {
                    try {
                        line = JSON.stringify(JSON.parse(line), null, '    '); // 4 spaces indentation
                    } catch (e) {
                        // NOP
                    }
                }

                if (this.decodeBytes) {
                    // decode byte string to utf-8
                    line = line.replace(reEncodedBytes, decode);
                }

                str += line + '\n';
            }

            return str;
        };

        WireLogUnit.prototype.isEmpty = function () {
            return this.logs.length === 0;
        };

        return WireLogUnit;
    }());

    var WireLog = (function () {
        function WireLog(arg) {
            var requestLog = arg.requestLog,
                responseLog = arg.responseLog;

            if (
                typeof requestLog === 'undefined' ||
                !(requestLog instanceof WireLogUnit)
            ) {
                requestLog = new WireLogUnit({});
            }

            if (
                typeof responseLog === 'undefined' ||
                !(responseLog instanceof WireLogUnit)
            ) {
                responseLog = new WireLogUnit({});
            }

            this.requestLog = requestLog;
            this.responseLog = responseLog;
        }

        WireLog.prototype.isEmpty = function () {
            return this.requestLog.isEmpty() && this.responseLog.isEmpty();
        };

        /**
         * Returns reproducible command which runs on curl
         */
        WireLog.prototype.getCurlCmd = function () {
            var reqLog = this.requestLog;

            var url = 'curl ';
            url += reqLog.host + reqLog.endPoint + ' ';
            url += '-X ' + reqLog.httpMethod + ' ';

            if (reqLog.postParameter) {
                url += '-d "' + reqLog.postParameter + '"';
            }

            return url;
        };

        return WireLog;
    }());

    var extractHeaderName = function (log) {
        var found = log.match(/^([^:]+?):/);
        if (found) {
            return found[1];
        }

        return undefined;
    };

    var removeNewLine = function (log) {
        return log.replace(/(\[\\r\])?\[\\n\]/, ''); // remove string like so "[\r][\n]"
    };

    WireLogParser.prototype.parse = function (logText) {
        if (!logText) {
            // nothing here to process
            return {};
        }

        var self = this;

        var assembleLogObj = function (args) {
            var log = args.log,
                group = args.group,
                logContainer = args.logContainer,
                direction = args.direction;

            var type = 'body';

            // init (at the 1st line of request or response)
            if (typeof logContainer[group] === 'undefined') {
                logContainer[group] = new WireLogUnit({
                    'bePrettyJSON': self.bePrettyJSON,
                    'decodeBytes': self.decodeBytes
                });
                type = 'http-' + direction;
            }


            // To set 'body' into `type` when log is beyond the blank line
            var headerName = extractHeaderName(log);
            var logBlock = logContainer[group].logs;
            var lastLogItem = logBlock[logBlock.length - 1];
            if (typeof lastLogItem !== 'undefined' && lastLogItem.type === 'body') {
                type = 'body';
                headerName = undefined;
            }
            else if (typeof headerName !== 'undefined') {
                log = log.replace(/^[^:]+:\s+/, '');
                type = 'header';
            }

            logContainer[group].add({
                'log': log,
                'type': type,
                'headerName': headerName,
                'direction': direction
            });
        };

        var requestLogByGroup = {};
        var responseLogByGroup = {};

        var line, lineNum, found;
        var lines = logText.split(/\r?\n/);

        var numOfLines = lines.length;

        var group, connection, entity;

        var usedConnections = {};
        var connection2group = {};

        for (lineNum = 0; lineNum < numOfLines; lineNum++) {
            line = lines[lineNum];

            // ignore not wire log
            if (!line.match(/org\.apache\.http\.wire/)) {
                continue;
            }

            // for request
            found = line.match(/.*http-outgoing-([0-9]+) >> ("?)(.*)\2/);
            if (found) {
                connection = found[1];
                entity = found[3];

                if (this.removeNewLine === true) {
                    entity = removeNewLine(entity);
                }

                if (
                    typeof usedConnections[connection] === 'undefined' || // when using connection for first time
                    usedConnections[connection] === true                  // when reusing connection
                ) {
                    group = entity;
                    usedConnections[connection] = false;
                    connection2group[connection] = group;

                    // initialize
                    requestLogByGroup[group] = undefined;
                    responseLogByGroup[group] = undefined;
                }

                assembleLogObj({
                    'log': entity,
                    'group': connection2group[connection],
                    'logContainer': requestLogByGroup,
                    'direction': 'request'
                });
                continue;
            }

            // for response
            found = line.match(/.*http-outgoing-([0-9]+) << ("?)(.*)\2/);
            if (found) {
                connection = found[1];
                entity = found[3];

                if (this.removeNewLine === true) {
                    entity = removeNewLine(entity);
                }

                // to support to reuse connection
                usedConnections[connection] = true;

                assembleLogObj({
                    'log': entity,
                    'group': connection2group[connection],
                    'logContainer': responseLogByGroup,
                    'direction': 'response'
                });
                continue;
            }
        }

        var keysOfLog = Object.keys(requestLogByGroup);
        var numOfKeys = keysOfLog.length;

        var i, key;
        var logs = {};
        for (i = 0; i < numOfKeys; i++) {
            key = keysOfLog[i];
            logs[key] = new WireLog({
                'requestLog': requestLogByGroup[key],
                'responseLog': responseLogByGroup[key]
            });
        }

        return logs;
    };

    return WireLogParser;
}());

// for testing
if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'test') {
    exports.WireLogParser = WireLogParser;
    utf8 = require('utf8');
}
