import React, { useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ModalProvider, NotificationManager } from 'skb_uikit';
import { PageLayout } from './components/PageLayout/PageLayout';
import { ItemsGrid } from './pages/ItemsGrid/ItemsGrid';
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
            <Route path={'/'} element={<ItemsGrid />} />
            <Route path={'/:id'} element={<Item />} />
          </Route>
          <Route path={'/*'} element={'Нет такой страницы'} />
        </Routes>
      </ModalProvider>
      <NotificationManager />
    </BrowserRouter>
  );
};
