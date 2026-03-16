# BantayKalusugan-Frontend

### 1. All pages are inside Frontend/src folder
I had put all the pages inside the src folder, para isang main.jsx nalang for routing. 

### 2. Basic Javascript Validation
nilagyan ko ng Basic Javascript validation yung login.jsx para makita nya if staff/admin ang nag lologin. if ang domain nya is ***bantaykalusugan.com*** i reredirect sya sa admin dashboard else redirect sya sa user dashboard.

### 3. Major styling changes
I had changed the styling of the pages to use CSS Modules instead of global CSS. 

Sa global CSS kasi na imported sa main.jsx na `import './landing_page.css';`, yung landing_page css designs ang ginagamit sa ***lahat*** ng pages. ngayong CSS modules na gamit, iniimport na yung design na parang class kaya directly sa .jsx file na mismo iimport yung styling. example:

si **landing_page.css** gagamitin lang kay **landing_page.jsx** para mangyari yun and hindi maapektuhan yung ibang pages, si **landing_page.css** ay irerename as **landing_page.module.css**, 

then directly sa **landing_page.jsx** mo na sya i iimport. as `import styles from './landing_page.module.css';`. tapos medyo maiiba yung pag call kay css styling nakalagay naman sa ***MAJOR_STYLING_CHANGES.md*** yung how to galing nga lang kay gemini😅😅😅.
