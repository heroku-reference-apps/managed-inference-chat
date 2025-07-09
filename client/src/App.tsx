import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import Layout from './components/Layout';
import Chat from './pages/Chat';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Chat />,
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
