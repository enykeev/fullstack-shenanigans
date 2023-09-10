import React from 'react';
import { useSelector, useDispatch } from 'react-redux'
import { setFilter } from './store/reducers/filter'
import { login } from './store/reducers/user'
import { setLocale } from './store/reducers/app'
import { useFeatureFlag } from '@feature-flag-service/sdk/react';

import './App.css';

const TIME_RANGES = [
  {
    label: "Today",
    value: 0,
  },
  {
    label: "Yesterday",
    value: 24 * 60 * 60 * 1000,
  },
  {
    label: "Last 7 days",
    value: 7 * 24 * 60 * 60 * 1000,
  },
  {
    label: "Last 30 days",
    value: 30 * 24 * 60 * 60 * 1000,
  },
  {
    label: "Last 90 days",
    value: 90 * 24 * 60 * 60 * 1000,
  },
  {
    label: "Last 365 days",
    value: 365 * 24 * 60 * 60 * 1000,
  },
  {
    label: "All time",
    value: Infinity,
  },
];

const LOCALES = {
  "en-GB": {
    flag: "🇬🇧",
  },
  "nl-NL": {
    flag: "🇳🇱",
  },
  "fr-FR": {
    flag: "🇫🇷",
  },
}

function TimeRangesDropdown({ onSelect, onCancel }) {
  return (
    <div className="TimeRangesDropdown">
      <div className="Backdrop" onClick={() => onCancel()} />
      {TIME_RANGES.map((range) => (
        <button key={range.label} className="TimeRangesDropdown__button" onClick={() => onSelect(range)}>{range.label}</button>
      ))}
    </div>
  );
}

function TimeRanges() {
  const [showDropdown, setShowDropdown] = React.useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = React.useState(TIME_RANGES[0]);
  const handleSelect = (timeRange) => {
    setSelectedTimeRange(timeRange);
    setShowDropdown(false);
  };
  const handleCancel = () => setShowDropdown(false);
  return (
    <div className="TimeRanges">
      <button className="SearchBar__button" onClick={() => setShowDropdown(true)} >{selectedTimeRange.label}</button>
      { showDropdown && <TimeRangesDropdown onSelect={handleSelect} onCancel={handleCancel} />}
    </div>
  );
}

function LogListItem({ content }) {
  return (
    <div className="LogListItem">
      <div className="LogListItem__content">{content}</div>
    </div>
  );
}

function LogList() {
  const events = useSelector((state) => state.logs.events);
  const filter = useSelector((state) => state.filter.filter)
  return (
    <div className="LogList">
      {
        events
          .filter((log) => log.msg.includes(filter))
          .map((log) => (
            <LogListItem key={log.id} content={log.msg} />
          ))
      }
    </div>
  );
}

function SearchBar() {
  const filter = useSelector((state) => state.filter.filter)
  const dispatch = useDispatch()
  return (
    <div className="SearchBar">
      <div className="SearchBar__input">
        <input type="text" placeholder="Search..." value={filter} onChange={(e) => dispatch(setFilter(e.target.value))}/>
      </div>
      <div className="SearchBar__actions">
        <TimeRanges />
      </div>
    </div>
  );
}

function LogViewer() {
  return (
    <div className="LogViewer">
      <SearchBar />
      <LogList />
    </div>
  );
}

function LoginModal({ onSubmit, onCancel }) {
  // Lets put some hardcoded value to simplify the demo
  const [username, setUsername] = React.useState('james@qa.local');
  const [password, setPassword] = React.useState('12345');
  return (
    <div className="Backdrop" onClick={() => onCancel()}>
      <div className="LoginModal">
        <div className="LoginModal__content" onClick={e => e.stopPropagation()}>
          <form onSubmit={e => { e.preventDefault(); onSubmit({ username, password }) }}>
            <div className="LoginModal__header">
              <div className="LoginModal__title">Login</div>
              <div className="LoginModal__spacer" />
              <div className="LoginModal__close" onClick={() => onCancel()} >X</div>
            </div>
            <div className="LoginModal__body">
              <div className="LoginModal__input">
                <label>Username</label>
                <input type="text" value={username} onChange={e => setUsername(e.target.value)} required />
              </div>
              <div className="LoginModal__input">
                <label>Password</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
              </div>
            </div>
            <div className="LoginModal__footer">
              <input type="submit" className="LoginModal__button" value="Login" />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function LocaleDropdown({ onSelect, onCancel }) {
  return (
    <div className="LocaleDropdown">
      <div className="Backdrop" onClick={() => onCancel()} />
      {Object.keys(LOCALES).map((key) => (
        <button key={key} className="LocaleDropdown__button" onClick={() => onSelect(key)}>{LOCALES[key].flag}</button>
      ))}
    </div>
  );
}

function Header() {
  const [showLoginModal, setShowLoginModal] = React.useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = React.useState(false);
  const username = useSelector((state) => state.user.username);
  const locale = useSelector((state) => state.app.locale);
  const dispatch = useDispatch();

  const handleLoginSubmit = (credentials) => {
    dispatch(login(credentials.username));
    setShowLoginModal(false);
  };
  const handleLoginCancel = () => setShowLoginModal(false);

  const handleLocaleSelect = (locale) => {
    dispatch(setLocale(locale));
    setShowLanguageDropdown(false);
  };
  const handleLocaleCancel = () => setShowLanguageDropdown(false);

  return (
    <div className="Header">
      <div className="Header__logo" alt="logo">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 841.9 595.3">
          <g>
            <path d="M666.3 296.5c0-32.5-40.7-63.3-103.1-82.4 14.4-63.6 8-114.2-20.2-130.4-6.5-3.8-14.1-5.6-22.4-5.6v22.3c4.6 0 8.3.9 11.4 2.6 13.6 7.8 19.5 37.5 14.9 75.7-1.1 9.4-2.9 19.3-5.1 29.4-19.6-4.8-41-8.5-63.5-10.9-13.5-18.5-27.5-35.3-41.6-50 32.6-30.3 63.2-46.9 84-46.9V78c-27.5 0-63.5 19.6-99.9 53.6-36.4-33.8-72.4-53.2-99.9-53.2v22.3c20.7 0 51.4 16.5 84 46.6-14 14.7-28 31.4-41.3 49.9-22.6 2.4-44 6.1-63.6 11-2.3-10-4-19.7-5.2-29-4.7-38.2 1.1-67.9 14.6-75.8 3-1.8 6.9-2.6 11.5-2.6V78.5c-8.4 0-16 1.8-22.6 5.6-28.1 16.2-34.4 66.7-19.9 130.1-62.2 19.2-102.7 49.9-102.7 82.3 0 32.5 40.7 63.3 103.1 82.4-14.4 63.6-8 114.2 20.2 130.4 6.5 3.8 14.1 5.6 22.5 5.6 27.5 0 63.5-19.6 99.9-53.6 36.4 33.8 72.4 53.2 99.9 53.2 8.4 0 16-1.8 22.6-5.6 28.1-16.2 34.4-66.7 19.9-130.1 62-19.1 102.5-49.9 102.5-82.3zm-130.2-66.7c-3.7 12.9-8.3 26.2-13.5 39.5-4.1-8-8.4-16-13.1-24-4.6-8-9.5-15.8-14.4-23.4 14.2 2.1 27.9 4.7 41 7.9zm-45.8 106.5c-7.8 13.5-15.8 26.3-24.1 38.2-14.9 1.3-30 2-45.2 2-15.1 0-30.2-.7-45-1.9-8.3-11.9-16.4-24.6-24.2-38-7.6-13.1-14.5-26.4-20.8-39.8 6.2-13.4 13.2-26.8 20.7-39.9 7.8-13.5 15.8-26.3 24.1-38.2 14.9-1.3 30-2 45.2-2 15.1 0 30.2.7 45 1.9 8.3 11.9 16.4 24.6 24.2 38 7.6 13.1 14.5 26.4 20.8 39.8-6.3 13.4-13.2 26.8-20.7 39.9zm32.3-13c5.4 13.4 10 26.8 13.8 39.8-13.1 3.2-26.9 5.9-41.2 8 4.9-7.7 9.8-15.6 14.4-23.7 4.6-8 8.9-16.1 13-24.1zM421.2 430c-9.3-9.6-18.6-20.3-27.8-32 9 .4 18.2.7 27.5.7 9.4 0 18.7-.2 27.8-.7-9 11.7-18.3 22.4-27.5 32zm-74.4-58.9c-14.2-2.1-27.9-4.7-41-7.9 3.7-12.9 8.3-26.2 13.5-39.5 4.1 8 8.4 16 13.1 24 4.7 8 9.5 15.8 14.4 23.4zM420.7 163c9.3 9.6 18.6 20.3 27.8 32-9-.4-18.2-.7-27.5-.7-9.4 0-18.7.2-27.8.7 9-11.7 18.3-22.4 27.5-32zm-74 58.9c-4.9 7.7-9.8 15.6-14.4 23.7-4.6 8-8.9 16-13 24-5.4-13.4-10-26.8-13.8-39.8 13.1-3.1 26.9-5.8 41.2-7.9zm-90.5 125.2c-35.4-15.1-58.3-34.9-58.3-50.6 0-15.7 22.9-35.6 58.3-50.6 8.6-3.7 18-7 27.7-10.1 5.7 19.6 13.2 40 22.5 60.9-9.2 20.8-16.6 41.1-22.2 60.6-9.9-3.1-19.3-6.5-28-10.2zM310 490c-13.6-7.8-19.5-37.5-14.9-75.7 1.1-9.4 2.9-19.3 5.1-29.4 19.6 4.8 41 8.5 63.5 10.9 13.5 18.5 27.5 35.3 41.6 50-32.6 30.3-63.2 46.9-84 46.9-4.5-.1-8.3-1-11.3-2.7zm237.2-76.2c4.7 38.2-1.1 67.9-14.6 75.8-3 1.8-6.9 2.6-11.5 2.6-20.7 0-51.4-16.5-84-46.6 14-14.7 28-31.4 41.3-49.9 22.6-2.4 44-6.1 63.6-11 2.3 10.1 4.1 19.8 5.2 29.1zm38.5-66.7c-8.6 3.7-18 7-27.7 10.1-5.7-19.6-13.2-40-22.5-60.9 9.2-20.8 16.6-41.1 22.2-60.6 9.9 3.1 19.3 6.5 28.1 10.2 35.4 15.1 58.3 34.9 58.3 50.6-.1 15.7-23 35.6-58.4 50.6zM320.8 78.4z"/>
            <circle cx="420.9" cy="296.5" r="45.7"/>
            <path d="M520.5 78.1z"/>
          </g>
        </svg>
      </div>
      <div className="Header__spacer" />
      <button className="Header__button" onClick={() => setShowLoginModal(true)}>{username ?? 'Login'}</button>
      <button className="Header__button" onClick={() => setShowLanguageDropdown(true)}>{LOCALES[locale].flag}</button>
      { showLoginModal && <LoginModal onSubmit={handleLoginSubmit} onCancel={handleLoginCancel} /> }
      { showLanguageDropdown && <LocaleDropdown onSelect={handleLocaleSelect} onCancel={handleLocaleCancel} />}
    </div>
  );
}

function App() {
  const theme = useSelector((state) => state.app.theme);
  const locale = useSelector((state) => state.app.locale);
  const username = useSelector((state) => state.app.username);
  const context = { user: { email: username, locale } };
  const kingsDayFlag = useFeatureFlag('holiday-nl-1', { context, live: true });
  return (
    <div className="App" id={kingsDayFlag?.value ? 'KingsDayTheme' : theme}>
      <Header />
      <div className="App__body">
        <LogViewer />
      </div>
    </div>
  );
}

export default App;
