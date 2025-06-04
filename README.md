# EcoFinds - Thrift Shopping Web Application

EcoFinds is a web application for browsing and purchasing second-hand products. The application promotes sustainable shopping by giving pre-loved items a second life.

## Features

- Browse a catalog of second-hand products
- Filter products by category, condition, and price range
- View detailed product information
- Responsive design for mobile and desktop
- Contact form for inquiries

## Technologies Used

- **Frontend**: React, React Router, Axios
- **Backend**: Node.js, Express
- **Build Tools**: Webpack, Babel
- **Styling**: CSS

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Build the client-side application:
   ```
   npm run build
   ```
4. Start the server:
   ```
   npm start
   ```
5. The application will be available at http://localhost:12000

### Development

To run the application in development mode with hot reloading:

```
npm run dev
```
link- https://github.com/Yashkatiyar24/thrift-web 

## Project Structure

```
ecofinds/
├── dist/                  # Compiled client-side files
├── src/
│   ├── client/            # Frontend React application
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── styles/        # CSS styles
│   │   ├── App.js         # Main React component
│   │   └── index.js       # React entry point
│   └── server/            # Backend Node.js/Express server
│       ├── models/        # Data models
│       ├── routes/        # API routes
│       └── index.js       # Server entry point
├── package.json           # Project dependencies and scripts
└── webpack.config.js      # Webpack configuration
```

## API Endpoints

- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get a specific product by ID
- `POST /api/products` - Create a new product
- `PUT /api/products/:id` - Update a product
- `DELETE /api/products/:id` - Delete a product

## License

This project is licensed under the ISC License.
