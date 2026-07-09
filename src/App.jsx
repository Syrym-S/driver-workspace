import { RouterProvider } from 'react-router-dom';
import { router } from './app/router';
import { AppProvider } from './app/context';
// import { EmailVerificationWatcher } from './components/verification/ui/EmailVerificationWatcher';
import { SystemNotificationsColumn } from './components/notifications/ui/SystemNotificationsColumn';

function App() {
    return (
        <AppProvider>
            <RouterProvider router={router} />
            {/* <EmailVerificationWatcher /> */}
            <SystemNotificationsColumn />
        </AppProvider>
    );
}

export default App;
