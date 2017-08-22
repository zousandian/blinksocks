jest.mock('fs');

import {Config} from '../config';

describe('Config#init', function () {

  // throws

  it('should throw when pass non-object', function () {
    expect(() => Config.init(null)).toThrow();
    expect(() => Config.init([])).toThrow();
  });

  it('should throw when host is not provided', function () {
    expect(() => Config.init({})).toThrow();
    expect(() => Config.init({host: ''})).toThrow();
  });

  it('should throw when port is not natural number', function () {
    expect(() => Config.init({host: 'localhost', port: -1})).toThrow();
  });

  it('should throw when servers(if provided) is invalid', function () {
    expect(() => Config.init({host: 'localhost', port: 1080, servers: ''})).toThrow();
    expect(() => Config.init({host: 'localhost', port: 1080, servers: []})).toThrow();
  });

  const baseConf = {
    host: 'localhost',
    port: 1080,
    servers: [{
      enabled: true,
      host: '127.0.0.1',
      port: 1082,
      key: 'abc',
      presets: [{
        name: 'ss-base'
      }]
    }]
  };

  it('should throw when timeout(if provided) is invalid', function () {
    expect(() => Config.init({...baseConf, timeout: '0'})).toThrow();
    expect(() => Config.init({...baseConf, timeout: 0})).toThrow();
    expect(() => Config.init({...baseConf, timeout: 1})).not.toThrow();
    expect(() => Config.init({...baseConf, timeout: 61})).not.toThrow();
  });

  it('should throw when behaviours(if provided) is invalid', function () {
    expect(() => Config.init({...baseConf, behaviours: null})).toThrow();
    expect(() => Config.init({...baseConf, behaviours: {}})).not.toThrow();
    expect(() => Config.init({...baseConf, behaviours: {'abc': {}}})).toThrow();
    expect(() => Config.init({...baseConf, behaviours: {'on-preset-failed': {}}})).toThrow();
    expect(() => Config.init({...baseConf, behaviours: {'on-preset-failed': {name: null}}})).toThrow();
    expect(() => Config.init({...baseConf, behaviours: {'on-preset-failed': {name: ''}}})).toThrow();
    expect(() => Config.init({
      ...baseConf,
      behaviours: {'on-preset-failed': {name: 'direct-close', params: []}}
    })).toThrow();
    expect(() => Config.init({
      ...baseConf,
      behaviours: {'on-preset-failed': {name: 'direct-close'}}
    })).not.toThrow();
    expect(() => Config.init({
      ...baseConf,
      behaviours: {'on-preset-failed': {name: 'direct-close', params: {}}}
    })).not.toThrow();
  });

  it('should throw when log_path(if provided) is invalid', function () {
    expect(() => Config.init({...baseConf, log_path: null})).toThrow();
    expect(() => Config.init({...baseConf, log_path: ''})).not.toThrow();
  });

  it('should throw when log_level(if provided) is invalid', function () {
    expect(() => Config.init({...baseConf, log_level: 'xxx'})).toThrow();
  });

  it('should throw when workers(if provided) is invalid', function () {
    expect(() => Config.init({...baseConf, workers: '0'})).toThrow();
    expect(() => Config.init({...baseConf, workers: -1})).toThrow();
    expect(() => Config.init({...baseConf, workers: 0})).not.toThrow();
    expect(() => Config.init({...baseConf, workers: 100})).not.toThrow();
  });

  it('should throw when dns(is provided) is invalid', function () {
    expect(() => Config.init({...baseConf, dns: null})).toThrow();
    expect(() => Config.init({...baseConf, dns: ['']})).toThrow();
    expect(() => Config.init({...baseConf, dns: ['localhost']})).toThrow();
    expect(() => Config.init({...baseConf, dns: []})).not.toThrow();
    expect(() => Config.init({...baseConf, dns: ['8.8.8.8']})).not.toThrow();
  });

  it('should throw when dns_expire(is provided) is invalid', function () {
    expect(() => Config.init({...baseConf, dns_expire: '0'})).toThrow();
    expect(() => Config.init({...baseConf, dns_expire: -1})).toThrow();
    expect(() => Config.init({...baseConf, dns_expire: 24 * 60 * 60})).not.toThrow();
    expect(() => Config.init({...baseConf, dns_expire: 24 * 60 * 60 + 1})).not.toThrow();
  });

  // others

  it('should __IS_SERVER__ set to true, if no servers provided', function () {
    Config.init({host: 'localhost', port: 1080, key: 'abc', presets: [{name: 'ss-base'}]});
    expect(__IS_SERVER__).toBe(true);
  });

  it('should __IS_CLIENT__ set to true, if servers provided', function () {
    Config.init(baseConf);
    expect(__IS_CLIENT__).toBe(true);
  });

  it('should __LOG_PATH__ endsWith blinksocks.log', function () {
    Config.init({...baseConf, log_path: 'blinksocks.log'});
    expect(__LOG_PATH__.endsWith('blinksocks.log')).toBe(true);
  });

  it('should __LOG_LEVEL__ set to warn', function () {
    Config.init({...baseConf, log_level: 'warn'});
    expect(__LOG_LEVEL__).toBe('warn');
  });

});

describe('Config#initServer', function () {

  it('should throw when server.host is invalid', function () {
    expect(() => Config.initServer({host: null})).toThrow();
    expect(() => Config.initServer({host: ''})).toThrow();
  });

  it('should throw when server.port is invalid', function () {
    expect(() => Config.initServer({host: 'abc', port: null})).toThrow();
  });

  it('should throw when server.key is invalid', function () {
    expect(() => Config.initServer({host: 'abc', port: 123, key: null})).toThrow();
    expect(() => Config.initServer({host: 'abc', port: 123, key: ''})).toThrow();
  });

  let baseConf = {host: 'abc', port: 123, key: 'secret'};

  it('should throw when server.presets is not an array', function () {
    expect(() => Config.initServer({...baseConf, presets: null})).toThrow();
  });

  it('should throw when server.presets is empty', function () {
    expect(() => Config.initServer({...baseConf, presets: []})).toThrow();
  });

  it('should throw when server.preset[].name is invalid', function () {
    expect(() => Config.initServer({...baseConf, presets: [{}]})).toThrow();
    expect(() => Config.initServer({...baseConf, presets: [{name: ''}]})).toThrow();
  });

  it('should not throw when server.preset[].params(if provided) is invalid', function () {
    expect(() => Config.initServer({...baseConf, presets: [{name: 'ss-base', params: ''}]})).toThrow();
    expect(() => Config.initServer({...baseConf, presets: [{name: 'ss-base', params: []}]})).toThrow();
    expect(() => Config.initServer({...baseConf, presets: [{name: 'ss-base', params: null}]})).toThrow();
    expect(() => Config.initServer({...baseConf, presets: [{name: 'ss-base', params: {}}]})).not.toThrow();
  });

  baseConf = {...baseConf, presets: [{name: 'ss-base'}]};

  it('should throw when server.transport(if provided) is invalid', function () {
    expect(() => Config.initServer({...baseConf, transport: null})).toThrow();
    expect(() => Config.initServer({...baseConf, transport: 'tcp'})).not.toThrow();
  });

  it('should throw when server.transport is set to "tls" but "tls_cert" is invalid', function () {
    expect(() => Config.initServer({...baseConf, transport: 'tls'})).toThrow();
    expect(() => Config.initServer({...baseConf, transport: 'tls', tls_cert: null})).toThrow();
    expect(() => Config.initServer({...baseConf, transport: 'tls', tls_cert: ''})).toThrow();
    expect(() => Config.initServer({...baseConf, transport: 'tls', tls_cert: 'abc'})).not.toThrow();
  });

  it('should __TRANSPORT__ set to tcp', function () {
    Config.init({...baseConf, transport: 'tcp'});
    expect(__TRANSPORT__).toBe('tcp');
  });

  it('should __IS_TLS__ set to true', function () {
    Config.init({...baseConf, transport: 'tls', tls_cert: 'abc', tls_key: 'def'});
    expect(__IS_TLS__).toBe(true);
  });

});
