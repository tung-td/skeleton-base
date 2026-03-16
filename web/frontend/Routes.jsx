import { Routes as ReactRouterRoutes, Route } from 'react-router-dom';
import { useAppQuery } from './hooks';
import { useCallback, useContext, useEffect } from 'react';
import { setShopToken } from './utils/auth';
import { AppDataContext } from './context/AppDataContext';
import { AppConfigApi } from './apis';

/**
 * File-based routing.
 * @desc File-based routing that uses React Router under the hood.
 * To create a new route create a new .jsx file in `/pages` with a default export.
 *
 * Some examples:
 * * `/pages/index.jsx` matches `/`
 * * `/pages/blog/[id].jsx` matches `/blog/123`
 * * `/pages/[...catchAll].jsx` matches any URL not explicitly matched
 *
 * @param {object} pages value of import.meta.globEager(). See https://vitejs.dev/guide/features.html#glob-import
 *
 * @return {Routes} `<Routes/>` from React Router, with a `<Route/>` for each file in `pages`
 */
export default function Routes({ pages }) {
  const { data: session } = useAppQuery({ url: '/api/shopify-auth/session' });
  const { shop, refetchData } = useContext(AppDataContext);

  const showChat = useCallback((retry = 0) => {
    const chatContainer = document.querySelector('.zsiq_floatmain');
    // show chat if possible
    if (chatContainer) {
      chatContainer.classList.add('show');
    }
    // try again after 3s
    else if (retry < 5) {
      setTimeout(() => showChat(retry + 1), 3000);
    }
    // give up
    else {
      console.error('Chat container not found after 5 retries.');
    }
  }, []);

  const applyAppConfig = useCallback(async () => {
    try {
      const config = await AppConfigApi.get();
      if (config?.data?.support_enabled) showChat();
      //
    } catch (error) {
      console.error(error);
    }
  }, [showChat]);

  // assign shop data to chat
  useEffect(() => {
    const email = shop?.shopify_data?.email;
    const name = shop?.shopify_data?.name;

    if (email) {
      if (email.endsWith('@bsscommerce.com')) {
        window.top.location.href = 'https://apps.shopify.com/g-volume-discounts';
      }
    }

    if (name && email && window.$zoho) {
      window.$zoho?.salesiq?.visitor?.name(name);
      window.$zoho?.salesiq?.visitor?.email(email);
    }
  }, [shop?.shopify_data?.email, shop?.shopify_data?.name]);

  useEffect(() => {
    if (!session) return;
    if (session.token) {
      setShopToken(session.token);
      refetchData({
        shop: true,
        warning: true,
        locales: true,
        merchantConfig: true,
      });
      applyAppConfig();
    }
  }, [applyAppConfig, refetchData, session]);

  const routes = useRoutes(pages);
  const routeComponents = routes.map(({ path, component: Component }) => (
    <Route
      key={path}
      path={path}
      element={
        <>
          <Component />
          <div className="space-bottom"></div>
        </>
      }
    />
  ));

  const NotFound = routes.find(({ path }) => path === '/notFound').component;

  return (
    <ReactRouterRoutes>
      {routeComponents}
      <Route path="*" element={<NotFound />} />
    </ReactRouterRoutes>
  );
}

function useRoutes(pages) {
  const routes = Object.keys(pages)
    .filter((key) => {
      // Skip all files in "_components" folder
      return !key.includes('/_components/');
    })
    .map((key) => {
      let path = key
        .replace('./pages', '')
        .replace(/\.(t|j)sx?$/, '')
        /**
         * Replace /index with /
         */
        .replace(/\/index$/i, '/')
        /**
         * Only lowercase the first letter. This allows the developer to use camelCase
         * dynamic paths while ensuring their standard routes are normalized to lowercase.
         */
        .replace(/\b[A-Z]/, (firstLetter) => firstLetter.toLowerCase())
        /**
         * Convert /[handle].jsx and /[...handle].jsx to /:handle.jsx for react-router-dom
         */
        .replace(/\[(?:[.]{3})?(\w+?)\]/g, (_match, param) => `:${param}`);

      if (path.endsWith('/') && path !== '/') {
        path = path.substring(0, path.length - 1);
      }

      if (!pages[key].default) {
        // console.warn(`${key} doesn't export a default React component`);
      }

      return {
        path,
        component: pages[key].default,
      };
    })
    .filter((route) => route.component);

  return routes;
}

