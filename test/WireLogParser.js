var should = require('chai').should();
var heredoc = require('heredoc');

var parser = require('../src/js/WireLogParser.js');

describe('WireLogParser', function () {
    describe('#parse', function () {
        it('should parse the simple log rightly', function () {
            var logText = heredoc(function () {/*
17:25:27.278 [main] DEBUG org.apache.http.wire - http-outgoing-0 >> "GET /api/foo?bar=123&buz=456 HTTP/1.1[\r][\n]"
17:25:27.278 [main] DEBUG org.apache.http.wire - http-outgoing-0 >> "Host: 127.0.0.1:8080[\r][\n]"
17:25:27.278 [main] DEBUG org.apache.http.wire - http-outgoing-0 >> "Connection: Keep-Alive[\r][\n]"
17:25:27.278 [main] DEBUG org.apache.http.wire - http-outgoing-0 >> "User-Agent: Apache-HttpClient/4.3.5 (java 1.5)[\r][\n]"
17:25:27.278 [main] DEBUG org.apache.http.wire - http-outgoing-0 >> "Accept-Encoding: gzip,deflate[\r][\n]"
17:25:27.278 [main] DEBUG org.apache.http.wire - http-outgoing-0 >> "[\r][\n]"
17:25:58.116 [main] DEBUG org.apache.http.wire - http-outgoing-0 << "HTTP/1.1 200 OK[\r][\n]"
17:25:58.116 [main] DEBUG org.apache.http.wire - http-outgoing-0 << "Date: Mon, 20 Oct 2014 08:25:27 GMT[\r][\n]"
17:25:58.116 [main] DEBUG org.apache.http.wire - http-outgoing-0 << "Content-Type: application/json; charset=utf-8[\r][\n]"
17:25:58.116 [main] DEBUG org.apache.http.wire - http-outgoing-0 << "Content-Length: 87[\r][\n]"
17:25:58.116 [main] DEBUG org.apache.http.wire - http-outgoing-0 << "Server: Jetty(9.2.3.v20140905)[\r][\n]"
17:25:58.116 [main] DEBUG org.apache.http.wire - http-outgoing-0 << "[\r][\n]"
17:25:58.116 [main] DEBUG org.apache.http.wire - http-outgoing-0 << "{"code":200,"messages":[],"data":{"foo":[{"bar":123,"buz":456},{"bar":321,"buz":654}]}}"
            */});
            var p = new parser.WireLogParser();
            var parsed = p.parse(logText);
            parsed.requestLog.should.deep.equal([
                [
                    {
                        log: 'GET /api/foo?bar=123&buz=456 HTTP/1.1',
                        type: 'http-request'
                    },
                    {
                        log: 'Host: 127.0.0.1:8080',
                        type: 'header',
                        headerName: 'Host'
                    },
                    {
                        log: 'Connection: Keep-Alive',
                        type: 'header',
                        headerName: 'Connection'
                    },
                    {
                        log: 'User-Agent: Apache-HttpClient/4.3.5 (java 1.5)',
                        type: 'header',
                        headerName: 'User-Agent'
                    },
                    {
                        log: 'Accept-Encoding: gzip,deflate',
                        type: 'header',
                        headerName: 'Accept-Encoding'
                    },
                    {
                        log: '',
                        type: 'body'
                    }
                ]
            ]);

            parsed.responseLog.should.deep.equal([
                [
                    {
                        log: 'HTTP/1.1 200 OK',
                        type: 'http-response'
                    },
                    {
                        log: 'Date: Mon, 20 Oct 2014 08:25:27 GMT',
                        type: 'header',
                        headerName: 'Date'
                    },
                    {
                        log: 'Content-Type: application/json; charset=utf-8',
                        type: 'header',
                        headerName: 'Content-Type'
                    },
                    {
                        log: 'Content-Length: 87',
                        type: 'header',
                        headerName: 'Content-Length'
                    },
                    {
                        log: 'Server: Jetty(9.2.3.v20140905)',
                        type: 'header',
                        headerName: 'Server'
                    },
                    {
                        log: '',
                        type: 'body'
                    },
                    {
                        log: '{"code":200,"messages":[],"data":{"foo":[{"bar":123,"buz":456},{"bar":321,"buz":654}]}}',
                        type: 'body'
                    }
                ]
            ]);

            parsed.length.should.equal(1);
        });

        it('should parse the mixed log rightly', function () {
            var logText = heredoc(function () {/*
17:25:27.278 [main] DEBUG org.apache.http.wire - http-outgoing-0 >> "GET /api/foo?bar=123&buz=456 HTTP/1.1[\r][\n]"
17:25:27.278 [main] DEBUG org.apache.http.wire - http-outgoing-2 >> "GET /api/bar HTTP/1.1[\r][\n]"
17:25:27.278 [main] DEBUG org.apache.http.wire - http-outgoing-0 >> "Host: 127.0.0.1:8080[\r][\n]"
17:25:27.278 [main] DEBUG org.apache.http.wire - http-outgoing-2 >> "Host: 127.0.0.1:9292[\r][\n]"
17:25:27.278 [main] DEBUG org.apache.http.wire - http-outgoing-0 >> "Connection: Keep-Alive[\r][\n]"
17:25:27.278 [main] DEBUG org.apache.http.wire - http-outgoing-2 >> "User-Agent: Apache-HttpClient/4.3.5 (java 1.5)[\r][\n]"
17:25:27.278 [main] DEBUG org.apache.http.wire - http-outgoing-0 >> "User-Agent: Apache-HttpClient/4.3.5 (java 1.5)[\r][\n]"
17:25:27.278 [main] DEBUG org.apache.http.wire - http-outgoing-2 >> "[\r][\n]"
17:25:27.278 [main] DEBUG org.apache.http.wire - http-outgoing-0 >> "Accept-Encoding: gzip,deflate[\r][\n]"
17:25:27.278 [main] DEBUG org.apache.http.wire - http-outgoing-0 >> "[\r][\n]"
17:25:58.116 [main] DEBUG org.apache.http.wire - http-outgoing-2 << "HTTP/1.1 200 OK[\r][\n]"
17:25:58.116 [main] DEBUG org.apache.http.wire - http-outgoing-0 << "HTTP/1.1 200 OK[\r][\n]"
17:25:58.116 [main] DEBUG org.apache.http.wire - http-outgoing-2 << "Date: Tue, 21 Oct 2014 14:38:11 GMT[\r][\n]"
17:25:58.116 [main] DEBUG org.apache.http.wire - http-outgoing-0 << "Date: Mon, 20 Oct 2014 08:25:27 GMT[\r][\n]"
17:25:58.116 [main] DEBUG org.apache.http.wire - http-outgoing-2 << "Content-Type: application/json; charset=utf-8[\r][\n]"
17:25:58.116 [main] DEBUG org.apache.http.wire - http-outgoing-0 << "Content-Type: application/json; charset=utf-8[\r][\n]"
17:25:58.116 [main] DEBUG org.apache.http.wire - http-outgoing-2 << "Content-Length: 36[\r][\n]"
17:25:58.116 [main] DEBUG org.apache.http.wire - http-outgoing-0 << "Content-Length: 87[\r][\n]"
17:25:58.116 [main] DEBUG org.apache.http.wire - http-outgoing-2 << "Server: Jetty(9.2.3.v20140905)[\r][\n]"
17:25:58.116 [main] DEBUG org.apache.http.wire - http-outgoing-0 << "Server: Jetty(9.2.3.v20140905)[\r][\n]"
17:25:58.116 [main] DEBUG org.apache.http.wire - http-outgoing-2 << "[\r][\n]"
17:25:58.116 [main] DEBUG org.apache.http.wire - http-outgoing-0 << "[\r][\n]"
17:25:58.116 [main] DEBUG org.apache.http.wire - http-outgoing-2 << "{"code":200,"messages":[],"data":{}}"
17:25:58.116 [main] DEBUG org.apache.http.wire - http-outgoing-0 << "{"code":200,"messages":[],"data":{"foo":[{"bar":123,"buz":456},{"bar":321,"buz":654}]}}"
            */});
            var p = new parser.WireLogParser();
            var parsed = p.parse(logText);
            parsed.requestLog.should.deep.equal([
                [
                    {
                        log: 'GET /api/foo?bar=123&buz=456 HTTP/1.1',
                        type: 'http-request'
                    },
                    {
                        log: 'Host: 127.0.0.1:8080',
                        type: 'header',
                        headerName: 'Host'
                    },
                    {
                        log: 'Connection: Keep-Alive',
                        type: 'header',
                        headerName: 'Connection'
                    },
                    {
                        log: 'User-Agent: Apache-HttpClient/4.3.5 (java 1.5)',
                        type: 'header',
                        headerName: 'User-Agent'
                    },
                    {
                        log: 'Accept-Encoding: gzip,deflate',
                        type: 'header',
                        headerName: 'Accept-Encoding'
                    },
                    {
                        log: '',
                        type: 'body'
                    }
                ],
                , // having missing
                [
                    {
                        log: 'GET /api/bar HTTP/1.1',
                        type: 'http-request'
                    },
                    {
                        log: 'Host: 127.0.0.1:9292',
                        type: 'header',
                        headerName: 'Host'
                    },
                    {
                        log: 'User-Agent: Apache-HttpClient/4.3.5 (java 1.5)',
                        type: 'header',
                        headerName: 'User-Agent'
                    },
                    {
                        log: '',
                        type: 'body'
                    }
                ]
            ]);

            parsed.responseLog.should.deep.equal([
                [
                    {
                        log: 'HTTP/1.1 200 OK',
                        type: 'http-response'
                    },
                    {
                        log: 'Date: Mon, 20 Oct 2014 08:25:27 GMT',
                        type: 'header',
                        headerName: 'Date'
                    },
                    {
                        log: 'Content-Type: application/json; charset=utf-8',
                        type: 'header',
                        headerName: 'Content-Type'
                    },
                    {
                        log: 'Content-Length: 87',
                        type: 'header',
                        headerName: 'Content-Length'
                    },
                    {
                        log: 'Server: Jetty(9.2.3.v20140905)',
                        type: 'header',
                        headerName: 'Server'
                    },
                    {
                        log: '',
                        type: 'body'
                    },
                    {
                        log: '{"code":200,"messages":[],"data":{"foo":[{"bar":123,"buz":456},{"bar":321,"buz":654}]}}',
                        type: 'body'
                    }
                ],
                , // having missing
                [
                    {
                        log: 'HTTP/1.1 200 OK',
                        type: 'http-response'
                    },
                    {
                        log: 'Date: Tue, 21 Oct 2014 14:38:11 GMT',
                        type: 'header',
                        headerName: 'Date'
                    },
                    {
                        log: 'Content-Type: application/json; charset=utf-8',
                        type: 'header',
                        headerName: 'Content-Type'
                    },
                    {
                        log: 'Content-Length: 36',
                        type: 'header',
                        headerName: 'Content-Length'
                    },
                    {
                        log: 'Server: Jetty(9.2.3.v20140905)',
                        type: 'header',
                        headerName: 'Server'
                    },
                    {
                        log: '',
                        type: 'body'
                    },
                    {
                        log: '{"code":200,"messages":[],"data":{}}',
                        type: 'body'
                    }
                ]
            ]);

            parsed.length.should.equal(3);
        });
    });
});

