import type { Email } from '@/lib/types';

export const emails: Email[] = [
  {
    id: '1',
    from: {
      name: 'Alice Johnson',
      email: 'alice.j@example.com',
      avatar: 'https://picsum.photos/seed/101/40/40',
    },
    to: 'sales@erp-lite.com',
    subject: 'Request for Quotation - Product Alpha',
    body: `Dear Sales Team,

We are interested in purchasing 500 units of Product Alpha. Could you please provide us with a detailed quotation including unit price, bulk discounts, and estimated delivery time to New York?

We require the products to be delivered by October 30th, 2024.

Thank you,
Alice Johnson
Procurement Manager
Innovate Inc.`,
    date: '2024-09-15T10:00:00Z',
    read: false,
  },
  {
    id: '2',
    from: {
      name: 'Bob Williams',
      email: 'bob.w@example.com',
      avatar: 'https://picsum.photos/seed/102/40/40',
    },
    to: 'sales@erp-lite.com',
    subject: 'Follow-up on Quotation #Q-12345',
    body: `Hi Team,

I am following up on the quotation #Q-12345 for Product Beta that was sent last week. We have reviewed it and would like to proceed with the order.

Please let me know the next steps to finalize the purchase.

Best regards,
Bob Williams`,
    date: '2024-09-14T14:30:00Z',
    read: true,
  },
  {
    id: '3',
    from: {
      name: 'Charlie Brown',
      email: 'charlie.b@example.com',
      avatar: 'https://picsum.photos/seed/103/40/40',
    },
    to: 'support@erp-lite.com',
    subject: 'Complaint: Damaged Goods in Order #ORD-54321',
    body: `To Whom It May Concern,

We received our order #ORD-54321 today and found that 20% of the items were damaged during transit. This is unacceptable and has caused a significant disruption to our operations.

Please see the attached photos of the damaged goods. We request an immediate replacement or a full refund for the damaged items.

Sincerely,
Charlie Brown
Warehouse Supervisor`,
    date: '2024-09-13T09:05:00Z',
    read: true,
  },
  {
    id: '4',
    from: {
      name: 'Diana Miller',
      email: 'diana.m@example.com',
      avatar: 'https://picsum.photos/seed/104/40/40',
    },
    to: 'accounts@erp-lite.com',
    subject: 'Payment Confirmation for Invoice #INV-09876',
    body: `Hello Accounts Team,

This email is to confirm that we have processed the payment for invoice #INV-09876 via wire transfer. The transaction ID is XXXXXXX.

Kindly confirm receipt of the payment.

Thanks,
Diana Miller`,
    date: '2024-09-12T11:45:00Z',
    read: true,
  },
    {
    id: '5',
    from: {
      name: 'Ethan Davis',
      email: 'ethan.d@example.com',
      avatar: 'https://picsum.photos/seed/105/40/40',
    },
    to: 'info@erp-lite.com',
    subject: 'General Inquiry about Partnership',
    body: `Dear ERP-Lite Team,

My name is Ethan Davis from Tech Solutions Ltd. We are exploring potential partnership opportunities with ERP providers and came across your platform.

We would be interested in learning more about your partner program. Could you please direct us to the right person to discuss this further?

Best,
Ethan Davis`,
    date: '2024-09-11T16:20:00Z',
    read: true,
  },
];

export const getEmails = () => emails;

export const getEmailById = (id: string) => emails.find(email => email.id === id);
