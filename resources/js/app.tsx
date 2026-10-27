import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';

const appName = import.meta.env.VITE_APP_NAME || 'Perkemi e-Dojo';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) => {
        const pages = import.meta.glob('./Pages/**/*.tsx');
        const target = `./Pages/${name}.tsx`;

        if (pages[target]) {
            return (pages[target] as () => Promise<any>)();
        }

        // Case-insensitive lookup fallback
        const lowerTarget = target.toLowerCase();
        const matchedKey = Object.keys(pages).find((k) => k.toLowerCase() === lowerTarget);

        if (matchedKey && pages[matchedKey]) {
            return (pages[matchedKey] as () => Promise<any>)();
        }

        return resolvePageComponent(target, pages) as Promise<any>;
    },
    setup({ el, App, props }) {
        if (!el) return;
        const root = createRoot(el);
        root.render(<App {...props} />);
    },
    progress: {
        color: '#DC2626',
        showSpinner: false,
    },
});
