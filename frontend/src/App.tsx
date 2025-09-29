import clsx from 'clsx';
import { BrowserRouter as Router } from 'react-router-dom';
import './App.css';
import { NotificationProvider } from './components/NotificationSystem';
import { UserDataProvider } from './components/UserDataProvider';
import { fontSans } from './config/fonts';
import { AuthProvider } from './contexts/AuthProvider';
import { Providers } from './providers';
import { AppRouter } from './router';

function App() {
  return (
    <div
      className={clsx(
        "min-h-screen text-foreground bg-background font-sans antialiased",
        fontSans.variable,
      )}
    >
      <Providers themeProps={{ attribute: "class", defaultTheme: "dark" }}>
        <Router>
          <AuthProvider>
            <UserDataProvider>
              <NotificationProvider>
                <AppRouter />
              </NotificationProvider>
            </UserDataProvider>
          </AuthProvider>
        </Router>
      </Providers>
    </div>
  );
}

export default App;
