import React, { act } from 'react';
import ReactDOM from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '../../contexts/ThemeContext';
import SearchOrders from './SearchOrders';
import { getOrders, getOrderById } from '../../services/api/ordersApi';

jest.mock('../../services/api/ordersApi', () => ({
  getOrders: jest.fn(),
  getOrderById: jest.fn(),
}));

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('SearchOrders', () => {
  let container;
  let root;

  beforeEach(() => {
    jest.clearAllMocks();
    container = document.createElement('div');
    document.body.appendChild(container);
    root = ReactDOM.createRoot(container);

    getOrders.mockResolvedValue({
      data: {
        data: [
          {
            id: 88,
            orderNo: '000088',
            customerName: 'Satish Sonker',
            phone: '+9719990614499',
            status: 'Active',
            orderDate: '2026-10-08T00:00:00',
            deliveryDate: '2026-10-28T00:00:00',
            totalInvoiced: 3150,
            advanceAmount: 400,
          },
        ],
      },
    });

    getOrderById.mockResolvedValue({
      data: {
        data: {
          id: 88,
          orderNo: '000088',
          customerName: 'Satish Sonker',
          phone: '+9719990614499',
          status: 1,
          orderDate: '2026-10-08T00:00:00',
          deliveryDate: '2026-10-28T00:00:00',
          totalAmount: 3150,
          advanceAmount: 400,
          balanceAmount: 2750,
          totalInvoiced: 3150,
          city: 'Noida',
          paymentMode: 'VISA',
          bookingType: 'Light',
          urgency: 'Urgent',
          orderDetails: [
            {
              id: 138,
              description: 'Custom jacket',
              crystalPackets: 6,
              workTypes: [{ name: 'Stitch' }],
              measurement: { notes: 'Standard fit' },
            },
          ],
        },
      },
    });
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
  });

  it('opens a details modal with fetched order data when the View button is clicked', async () => {
    await act(async () => {
      root.render(
        <ThemeProvider>
          <MemoryRouter>
            <SearchOrders />
          </MemoryRouter>
        </ThemeProvider>
      );
      await flushPromises();
    });

    const viewButton = Array.from(container.querySelectorAll('button')).find((btn) =>
      btn.textContent && btn.textContent.toLowerCase().includes('view')
    );

    expect(viewButton).not.toBeNull();

    await act(async () => {
      viewButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await flushPromises();
    });

    expect(getOrderById).toHaveBeenCalledWith(88);
    expect(document.body.textContent).toContain('Order Details');
    expect(document.body.textContent).toContain('Satish Sonker');
  });
});
