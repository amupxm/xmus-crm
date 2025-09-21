import clsx from 'clsx';
import { BrowserRouter as Router } from 'react-router-dom';
import './App.css';
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
        <AuthProvider>
          <Router>
            <AppRouter />
          </Router>
        </AuthProvider>
      </Providers>
    </div>
  );
}

export default App;
