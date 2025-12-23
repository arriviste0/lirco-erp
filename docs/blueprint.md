# **App Name**: ERP-Lite Pilot

## Core Features:

- Masters Management: Manage items, parties, and BOMs using CRUD operations. Connects to the FastAPI backend.
- Inventory Management: Track inventory levels, GRNs, dispatches, and adjustments, displaying warehouse/item stock. Implements the Stock Ledger approach using the FastAPI backend.
- Quotation Management: Create, read, update, and delete quotations. Send quotations via email using the FastAPI backend.
- Production Management: Manage production orders, track RM issuance and FG receipt using the FastAPI backend.
- Mail Agent Inbox: Display emails from the inbox using data loaded from GET /mail/inbox?status= in the FastAPI backend.
- AI-Powered Email Processing: Leverage Ollama and LangChain for classifying, summarizing, and extracting structured JSON from emails using the Agent Service. The AI will act as a tool, intelligently classifying email based on RFQ, Follow-up, Complaint, Payment or General purposes.
- Draft Reply Generation: Use AI to draft email replies and suggest actions such as creating quotations or sending clarification emails using the Agent Service. Stores raw email data and metadata using the API endpoints.

## Style Guidelines:

- Primary color: Navy Blue (#2E3192) to convey trust, stability, and professionalism, suitable for an ERP system.
- Background color: Light Gray (#E6E7FF), a desaturated shade of navy blue for a calm and clean background that complements the primary color.
- Accent color: Electric White(#BE0AFF) as a vibrant complement to the navy, suggesting innovation, energy and digital focus.
- Headline font: 'Space Grotesk' sans-serif font for headings and titles, providing a modern, techy feel that aligns with an ERP application's efficiency.
- Body font: 'Inter' sans-serif font for body text to ensure readability and a clean user experience.
- Code font: 'Source Code Pro' for displaying code snippets or configurations.
- Consistent use of simple, line-based icons throughout the UI for quick recognition and a modern aesthetic.
- Use a clean, modular layout with a clear hierarchy. The sidebar and topbar should remain consistent across all pages. Employ responsive design to ensure a seamless experience across devices.
- Subtle animations and transitions (e.g., fade-in, slide-in) for UI elements to provide feedback and enhance the user experience without being distracting.