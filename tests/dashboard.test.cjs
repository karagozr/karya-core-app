const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const sass = require('sass-embedded');
const vm = require('node:vm');
const ts = require('typescript');
const React = require('react');

const root = path.join(__dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const lock = JSON.parse(fs.readFileSync(path.join(root, 'package-lock.json'), 'utf8'));

test('Dashboard, Analytics, DevExtreme and ThemeBuilder stay on one pinned version', () => {
  const version = manifest.dependencies['devexpress-dashboard'];
  assert.match(version, /^\d+\.\d+\.\d+$/);
  for (const name of [
    '@devexpress/analytics-core',
    'devexpress-dashboard',
    'devexpress-dashboard-react',
    'devextreme',
    'devextreme-react',
    'devextreme-themebuilder',
  ]) {
    assert.equal(manifest.dependencies[name] ?? manifest.devDependencies[name], version, name);
    assert.equal(lock.packages[`node_modules/${name}`].version, version, name);
  }
});

test('Dashboard compiles matching light and dark theme selectors', () => {
  const { css } = sass.compile(path.join(root, 'src', 'core', 'pages', 'dash-page.scss'));
  assert.ok(css.includes('body:has(.dx-dashboard-fullscreen-item-popup:not(.dx-state-invisible)) .side-nav-outer-toolbar .header-component'));
  for (const theme of ['light', 'dark']) {
    assert.ok(css.includes(`.dx-swatch-${theme} .dx-dashboard-viewer`), theme);
    assert.ok(css.includes(`.dx-swatch-${theme} .dashboard-page .dx-widget`), theme);
  }
});

test('Theme changes retain the memoized dashboard and refresh visualizations locally', () => {
  const calls = [];
  let theme = 'light';
  let previousTheme;
  const control = () => null;
  const layoutSettings = { layoutPaddings: 16 };
  const module = { exports: {} };
  const source = fs.readFileSync(path.join(root, 'src', 'core', 'pages', 'dash-page.tsx'), 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.React, esModuleInterop: true },
  });
  const mocks = {
    react: {
      ...React,
      useCallback: callback => callback,
      useContext: () => ({ theme }),
      useLayoutEffect: (effect, [nextTheme]) => {
        if (previousTheme !== nextTheme) {
          previousTheme = nextTheme;
          effect();
        }
      },
    },
    'devexpress-dashboard-react': control,
    'devexpress-dashboard/common/docking-layout/_docking-layout-settings': {
      DockingLayoutSettings: layoutSettings,
    },
    'devextreme/viz/themes': {
      currentTheme: value => calls.push(value),
      refreshTheme: () => calls.push('refresh'),
    },
    '../../theme': { ThemeContext: {} },
    './main-page': { BaseMainPage: () => null },
    '../services/dashboard': {
      dashboardEndpoint: 'https://dashboard.test/api',
      dashboardRemoteService: undefined,
    },
    './dash-page.scss': {},
  };
  vm.runInNewContext(outputText, {
    module, exports: module.exports,
    require: name => {
      assert.ok(Object.hasOwn(mocks, name), `Unexpected dependency: ${name}`);
      return mocks[name];
    },
  });
  const render = () => {
    const page = module.exports.DashPage({ caption: 'Dashboard' });
    assert.equal(page.props.className, 'dashboard-page');
    const host = page.props.children.props.children;
    assert.equal(host.props.className, 'dashboard-host');
    return host.props.children;
  };
  const firstView = render();
  for (const value of ['dark', 'light', 'light']) {
    theme = value;
    const view = render();
    assert.equal(view.type, firstView.type);
    assert.equal(view.key, null);
    assert.deepEqual(view.props, firstView.props);
  }
  const dashboard = firstView.type.type(firstView.props);
  dashboard.props.onBeforeRender();
  assert.equal(layoutSettings.layoutPaddings, 0);
  assert.equal(dashboard.type, control);
  assert.equal(dashboard.key, null);
  assert.equal(dashboard.props.initialDashboardState, undefined);
  assert.deepEqual(calls, ['material.blue.light', 'refresh', 'material.blue.dark', 'refresh', 'material.blue.light', 'refresh']);
});

test('Application base and navigation themes match Material Blue Compact dashboard styles', () => {
  for (const [file, theme] of [
    ['metadata.base.json', 'light'],
    ['metadata.base.dark.json', 'dark'],
    ['metadata.additional.json', 'light'],
    ['metadata.additional.dark.json', 'dark'],
  ]) {
    const metadata = JSON.parse(fs.readFileSync(path.join(root, 'src', 'themes', file), 'utf8'));
    assert.equal(metadata.baseTheme, `material.blue.${theme}.compact`, file);
  }
});

function loadDashboardService(endpoint) {
  let token = 'first-test-token';
  const notifications = [];
  const source = fs.readFileSync(path.join(root, 'src', 'core', 'services', 'dashboard.ts'), 'utf8')
    .replace('import.meta.env.VITE_DASHBOARD_API_URL', JSON.stringify(endpoint) ?? 'undefined');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  });
  const module = { exports: {} };
  const mocks = {
    './auth': { getSessionAccessToken: () => token },
    '../i18n': { coreI18n: { auth: { sessionExpired: 'Session expired' } } },
    '../utils/message-box': { showMessage: message => notifications.push(message) },
  };
  vm.runInNewContext(outputText, {
    module, exports: module.exports, Headers, URL,
    window: { location: { origin: 'https://app.test' } },
    require: name => {
      assert.ok(Object.hasOwn(mocks, name), `Unexpected dependency: ${name}`);
      return mocks[name];
    },
  });
  return { service: module.exports, notifications, setToken: value => { token = value; } };
}

test('Public dashboard demo has no authentication hook', () => {
  for (const endpoint of [undefined, '', '  ']) {
    const { service } = loadDashboardService(endpoint);
    assert.equal(service.dashboardEndpoint, 'https://demos.devexpress.com/services/dashboard/api');
    assert.equal(service.dashboardRemoteService, undefined);
  }
});

test('Dashboard requests read the latest token and preserve existing headers', () => {
  const { service, setToken, notifications } = loadDashboardService('https://dashboard.test/api');
  const send = () => {
    const settings = { headers: { 'Content-Type': 'application/json' } };
    service.dashboardRemoteService.beforeSend(settings);
    assert.equal(settings.headers.get('Content-Type'), 'application/json');
    return settings.headers.get('Authorization');
  };
  assert.equal(send(), 'Bearer first-test-token');
  setToken('rotated-test-token');
  assert.equal(send(), 'Bearer rotated-test-token');
  setToken('');
  assert.throws(send, /Session expired/);
  assert.equal(notifications.length, 1);
});

test('Explicit public demo configuration cannot receive an application token', () => {
  const { service } = loadDashboardService('https://demos.devexpress.com/services/dashboard/api');
  const settings = {};
  assert.throws(() => service.dashboardRemoteService.beforeSend(settings), /must not be sent/);
  assert.equal(settings.headers, undefined);
});
