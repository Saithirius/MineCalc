import React, { useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Button, ModalProvider, NotificationManager } from 'skb_uikit';
import { PageLayout } from './components/PageLayout/PageLayout';
import { Items } from './pages/Items/Items';
import { Item } from './pages/Item/Item';

export const App: React.FC = () => {
  // Отключаем прокрутку колесиком на input type="number"
  useEffect(() => {
    document.addEventListener('wheel', function (event) {
      if (event.target instanceof HTMLInputElement && event.target.type === 'number') {
        event.target.blur();
      }
    });
  }, []);

  return (
    <BrowserRouter>
      <ModalProvider>
        <Routes>
          <Route element={<PageLayout />}>
            <Route path={'/'} element={<Items />} />
            <Route path={'/:id'} element={<Item />} />
          </Route>
          <Route
            path={'/*'}
            element={
              <div>
                <h1>Нет такой страницы</h1>
                <a href={'/'}>
                  <Button>На главную</Button>
                </a>
              </div>
            }
          />
        </Routes>
      </ModalProvider>
      <NotificationManager />
    </BrowserRouter>
  );
};
