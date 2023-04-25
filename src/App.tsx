import * as React from 'react';
import { Routes, Route } from 'react-router-dom';
import routers from '@/router';
import NotFound from '@/pages/not-found';
import Layout from './layout';

const App = () => {
  const indexRoute = routers[0];
  if (!indexRoute) return <NotFound />;

  return (
    <Routes>
      <Route element={<Layout />} path="/">
        {routers.map(({ Component, path }) => (
          <Route element={<Component />} key={path} path={path} />
        ))}
        <Route element={<NotFound />} path="*" />
      </Route>
    </Routes>
  );
};
export default App;
