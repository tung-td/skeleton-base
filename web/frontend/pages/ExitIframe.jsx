import { Redirect } from '@shopify/app-bridge/actions';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { createApp } from '@shopify/app-bridge';

export default function ExitIframe() {
  const { search } = useLocation();

  useEffect(() => {
    if (search) {
      const params = new URLSearchParams(search);
      const redirectUri = params.get('redirectUri');
      const url = new URL(decodeURIComponent(redirectUri));

      if (url.hostname === window.location.hostname) {
        const host = new URLSearchParams(window.location.search).get('host') || window.__SHOPIFY_DEV_HOST;
        const app = createApp({ host, apiKey: process.env.SHOPIFY_API_KEY });
        const redirect = Redirect.create(app);
        redirect.dispatch(Redirect.Action.REMOTE, decodeURIComponent(redirectUri));
      }
      //
      else {
        window.location.href = redirectUri;
      }
    }
  }, [search]);

  return '';
}

